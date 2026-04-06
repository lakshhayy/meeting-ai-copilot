const btn = document.getElementById("toggleRecordBtn");
const workspaceInput = document.getElementById("workspaceId");

// Load the cached Workspace ID from previous sessions
chrome.storage.local.get(["workspaceId", "isRecording"], (data) => {
  if (data.workspaceId) {
    workspaceInput.value = data.workspaceId;
  }
  
  if (data.isRecording) {
    btn.classList.add("recording");
    btn.textContent = "Recording... (Click to Stop)";
  }
});

btn.addEventListener("click", () => {
  const wsId = workspaceInput.value.trim();
  if (!wsId) {
    alert("Please enter a Workspace ID first!");
    return;
  }

  // Save the Workspace ID so they never have to type it again
  chrome.storage.local.set({ workspaceId: wsId });

  if (btn.classList.contains("recording")) {
    // STOP LOGIC
    btn.classList.remove("recording");
    btn.textContent = "Start Recording Tab";
    chrome.storage.local.set({ isRecording: false });
    chrome.runtime.sendMessage({ action: "stop_recording" });
  } else {
    // START LOGIC
    btn.classList.add("recording");
    btn.textContent = "Recording... (Click to Stop)";
    chrome.storage.local.set({ isRecording: true });
    
    // We fetch the "Active Tab" that the user is currently looking at (e.g., the Google Meet tab)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      
      // Capture the internal audio stream of the tab!
      chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
        chrome.runtime.sendMessage({
          action: "start_recording",
          streamId: streamId,
          workspaceId: wsId
        });
      });
    });
  }
});
