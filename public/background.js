const HISTORY_KEY = "selectionHistory";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.storage.local.set({ [HISTORY_KEY]: [] });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "Pending" || msg.type === "Done") {
    chrome.storage.local.get(HISTORY_KEY, (data) => {
      const history = data[HISTORY_KEY] || [];
      if (msg.type === "Pending") {
        history.push({ text: msg.text, done: false, result: msg.result });
      } else {
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i].text === msg.text && history[i].done === false) {
            history[i].done = true;
            history[i].result = msg.result;
            break;
          }
        }
      }
      chrome.storage.local.set({ [HISTORY_KEY]: history });
    });
    sendResponse({ status: "OK" });
  }
});
