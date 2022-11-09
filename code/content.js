// BM25 code will go here
console.log("This page runs");

class BM25 {
    constructor() {
        // instance variables for class will go in here
    }
}

chrome.runtime.sendMessage({method: "set"}, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: getPageText
      },()=>{
        console.log("the url is", tabs[0].url)
        if (tabs[0].url.indexOf("wiki") == -1) {
          console.log("In here where im suppoed to be");
          document.getElementById("id_text").value = "This extension can only be run on Wikipedia articles.";
        } else {
          chrome.runtime.sendMessage({method: "get"}, (response) => {
            document.getElementById("id_text").value = response.value;
          });
        }
      });
    });
  });
  
  function getPageText(){
    let title = document.title;
    let pCount = document.getElementsByTagName("p").length;
    let firstPara = document.getElementsByTagName("p")[2].innerText;
  
    let message = "title=" + title + "\n" +
                  "pCount=" + pCount + "\n" +
                  firstPara + "\n";
  
    console.log("hey this is a tester meee");
  
    chrome.runtime.sendMessage({method: "set", value: message}, () => {
    });
  }