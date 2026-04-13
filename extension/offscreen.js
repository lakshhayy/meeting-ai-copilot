let combinedStream = null;  // The final mixed stream we record from
let tabStream = null;       // Raw tab audio stream
let micStream = null;       // Raw microphone stream
let audioCtx = null;        // Web Audio API context for mixing
let workspaceId = null;
let isRecording = false;
let chunkInterval = null;
let sessionId = null;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "capture_audio") {
    const streamId = message.streamId;
    workspaceId = message.workspaceId;
    const includeMic = message.includeMic;

    try {
      // 1. Capture the Tab's audio stream
      tabStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: streamId
          }
        }
      });

      // 2. Create the Web Audio mixing context
      audioCtx = new AudioContext();
      const tabSource = audioCtx.createMediaStreamSource(tabStream);

      // IMPORTANT: Route tab audio back to speakers so user can still hear the meeting
      tabSource.connect(audioCtx.destination);

      // 3. Create a mixing destination — this is where we merge all audio sources
      const mixDest = audioCtx.createMediaStreamDestination();
      tabSource.connect(mixDest);

      // 4. If mic is enabled, capture it and mix it in
      if (includeMic) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const micSource = audioCtx.createMediaStreamSource(micStream);
          micSource.connect(mixDest);
          console.log("✅ Microphone audio mixed in successfully.");
        } catch (micErr) {
          console.warn("⚠️ Could not access microphone (permission denied or unavailable). Recording tab audio only.", micErr);
        }
      }

      // 5. The combined stream is what we record
      combinedStream = mixDest.stream;

      isRecording = true;
      sessionId = "live-" + Date.now();
      console.log("Stream captured. Starting chunk loop with session ID:", sessionId, "| Mic included:", !!micStream);

      // 6. Start the chunk recording loop
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
    // Stop all streams
    if (tabStream) {
      tabStream.getTracks().forEach(t => t.stop());
      tabStream = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    combinedStream = null;
    console.log("Recording officially stopped.");

    // Trigger AI compilation for the live meeting
    if (sessionId) {
      try {
        await fetch(`http://localhost:5000/api/meetings/workspace/${workspaceId}/stream-end`, {
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
  if (!isRecording || !combinedStream) return;

  const recorder = new MediaRecorder(combinedStream, { mimeType: 'audio/webm' });
  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = async () => {
    if (chunks.length > 0) {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      console.log("Complete WebM chunk:", blob.size, "bytes.");

      // Skip silent/empty chunks under 2KB
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
      chunkInterval = setTimeout(recordNextChunk, 500);
    }
  };

  // Record for exactly 10 seconds, then stop
  recorder.start();
  setTimeout(() => {
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }, 10000);
}
