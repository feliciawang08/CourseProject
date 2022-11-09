let value = "";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message.method);
  if (message.method == "set") {
    value = message.value;
    sendResponse({value: null});
  } else if (message.method == "get") {
    sendAfterSet();
  }
  
  return true;

  async function sendAfterSet(){
    for (let i = 0; i < 10; i++){
      if (value != ""){
        sendResponse({value: value})
        return;
      }
      console.log("Start Sleep 1s.");
      await new Promise(s => setTimeout(s, 1000));
      console.log("End Sleep 1s.");
    }
    value = "Error: Document information could not be obtained.";
  }
});