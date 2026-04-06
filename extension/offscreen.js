let stream = null;
let workspaceId = null;
let isRecording = false;
let chunkInterval = null;
let sessionId = null;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "capture_audio") {
    const streamId = message.streamId;
    workspaceId = message.workspaceId;

    try {
      // 1. Consume the streamId to gain access to the active Tab's audio
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: streamId
          }
        }
      });

      // 2. VERY IMPORTANT: Route the audio back to the user's speakers!
      // If we don't do this, capturing the tab audio will mute the meeting for the user
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(audioCtx.destination);

      isRecording = true;
      sessionId = "live-" + Date.now();
      console.log("Stream captured. Starting chunk loop with session ID:", sessionId);

      // 3. THE FIX: Instead of using timeslice (which produces headerless continuation chunks),
      //    we START a fresh recorder, let it run for 10s, then STOP it completely.
      //    This guarantees every chunk is a complete, standalone WebM file with proper headers.
      recordNextChunk();

    } catch (err) {
      console.error("Failed to start tab recording:", err);
    }
  }

  if (message.action === "stop_capture") {
    isRecording = false;
    if (chunkInterval) {
      clearTimeout(chunkInterval);
      chunkInterval = null;
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    console.log("Recording officially stopped.");

    // Trigger AI compilation for the live meeting
    if (sessionId) {
      try {
        fetch(`http://localhost:5000/api/meetings/workspace/${workspaceId}/stream-end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });
        console.log("Sent stream-end signal successfully.");
      } catch (err) {
        console.error("Failed to signal stream-end:", err);
      }
    }
  }
});

function recordNextChunk() {
  if (!isRecording || !stream) return;

  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = async () => {
    if (chunks.length > 0) {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      console.log("Complete WebM chunk:", blob.size, "bytes.");

      // IMPORTANT FIX: If the Tab is silent (no one is talking), Chrome creates a tiny ~200 byte WebM file
      // that consists purey of empty container headers. Groq's ffmpeg fails to decode this and throws the error.
      // We skip uploading chunks smaller than 2,000 bytes (2 KB).
      if (blob.size > 2000) {
        const formData = new FormData();
        formData.append("audio", blob, `chunk-${Date.now()}.webm`);
        formData.append("sessionId", sessionId);

        try {
          await fetch(`http://localhost:5000/api/meetings/workspace/${workspaceId}/stream-chunk`, {
            method: "POST",
            body: formData
          });
        } catch (err) {
          console.error("Failed to push chunk to server:", err);
        }
      } else {
        console.log("Chunk is silent (too small). Skipping upload.");
      }
    }

    // Schedule next chunk (only if still recording)
    if (isRecording) {
      chunkInterval = setTimeout(recordNextChunk, 500); // tiny gap between recordings
    }
  };

  // Record for exactly 10 seconds, then stop (which triggers onstop above)
  recorder.start();
  setTimeout(() => {
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }, 10000);
}
