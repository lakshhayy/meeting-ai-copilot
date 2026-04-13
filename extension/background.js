chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "start_recording") {
    console.log("Initializing offscreen environment...");
    
    // 1. Check if an offscreen document already exists
    const hasOffscreen = await chrome.offscreen.hasDocument();
    if (hasOffscreen) {
      await chrome.offscreen.closeDocument();
    }
    
    // 2. Create the invisible offscreen document to host the MediaRecorder natively
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "Recording meeting tab audio for AI transcription backend"
    });

    // 3. Immediately pass the unique streamId + mic preference to the new offscreen document
    // We delay slightly to ensure the document initialized
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: "capture_audio",
        streamId: message.streamId,
        workspaceId: message.workspaceId,
        includeMic: message.includeMic
      });
    }, 500);
  }

  if (message.action === "stop_recording") {
    chrome.runtime.sendMessage({ action: "stop_capture" });
    // IMPORTANT: Wait 3 seconds to let offscreen.js upload the final audio chunk and signal /stream-end
    setTimeout(async () => {
      await chrome.offscreen.closeDocument();
    }, 3000); 
  }
});
