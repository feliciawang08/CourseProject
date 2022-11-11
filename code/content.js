// BM25 code will go here
console.log("This page runs");

class BM25 {
    constructor() {
        // instance variables for class will go in here
        var allPageText = ""
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
        document.getElementById("id_text").value = "This extension can only be run on Wikipedia articles.";
      } else {
        chrome.runtime.sendMessage({method: "get"}, (response) => {
          BM25.allPageText = response.value;
          console.log("one para text:", BM25.allPageText);
        });
      }
    });
  });
});
  
function getPageText(){
  let paraCount = document.getElementsByTagName("p").length;
  let allParagraphs = ""
  let currPara = ""

  for (let i = 0; i < paraCount; i++) {
    currPara = document.getElementsByTagName("p")[i].innerText;
    allParagraphs += currPara + "\n";
  }

  chrome.runtime.sendMessage({method: "set", value: allParagraphs}, () => {
  });
}