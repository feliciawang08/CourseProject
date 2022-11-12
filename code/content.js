// BM25 code will go here
console.log("This page runs");

class BM25 {
  constructor() {
    // instance variables for class will go in here
    var allPageText = ""
    var paragraphs = [];
    var vocabulary = [];
    var docFrequency = [];
  }
}

chrome.runtime.sendMessage({ method: "set" }, () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      // function: getPageText
      function: getParagraphs
    }, () => {
      console.log("the url is", tabs[0].url)
      if (tabs[0].url.indexOf("wiki") == -1) {
        document.getElementById("id_text").value = "This extension can only be run on Wikipedia articles.";
      } else {
        chrome.runtime.sendMessage({ method: "get" }, (response) => {
          // BM25.allPageText = response.value;
          BM25.paragraphs = response.value;
          // console.log("one para text:", BM25.allPageText);
          console.log(BM25.paragraphs)
          getVocabulary();
          console.log(BM25.vocabulary);
          getDocFrequency();
          console.log(BM25.docFrequency);
        });
      }
    });
  });
});

function getPageText() {
  let paraCount = document.getElementsByTagName("p").length;
  let allParagraphs = ""
  let currPara = ""

  for (let i = 0; i < paraCount; i++) {
    currPara = document.getElementsByTagName("p")[i].innerText;
    allParagraphs += currPara + "\n";
  }

  chrome.runtime.sendMessage({ method: "set", value: allParagraphs }, () => {
  });
}

function getParagraphs() {
  let paraCount = document.getElementsByTagName("p").length;
  let paragraphs = []

  for (let i = 0; i < paraCount; i++) {
    paragraphs.push(document.getElementsByTagName("p")[i].innerText)
  }

  chrome.runtime.sendMessage({ method: "set", value: paragraphs }, () => {
  });
}

function getVocabulary() {
  var vocabSet = new Set();
  BM25.paragraphs.forEach(doc => {
    doc.split(' ').forEach(word => {
      vocabSet.add(word);
    })
  });
  BM25.vocabulary = Array.from(vocabSet);
}

function getDocFrequency() {
  var tmp = [];
  BM25.paragraphs.forEach(doc => {
    var freq = []
    BM25.vocabulary.forEach(term => {
      var count = 0;
      doc.split(' ').forEach(word => {
        if (term == word) count++;
      })
      freq.push(count);
    })
    tmp.push(freq);
  });
  BM25.docFrequency = tmp;
}