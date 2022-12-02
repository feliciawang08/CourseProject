let value = "";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message.method);
  if (message.method == "set") {
    value = message.value;
    sendResponse({value: null});
  } else if (message.method == "get") {
    sendResponse({value: value})
  }

  return true;
});