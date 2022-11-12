// BM25 code will go here
console.log("This page runs");

class BM25 {
    constructor() {
        // instance variables for class will go in here
        this.allPageText = ""
        this.cleanedText = ""
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
        // stopwords obtained from https://gist.github.com/sebleier/554280 (NLTK's list of english stopwords)
        stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];
        chrome.runtime.sendMessage({method: "get"}, (response) => {
          BM25.allPageText = response.value;
          console.log("one para text:", BM25.allPageText);
          BM25.cleanedText = BM25.allPageText.toLowerCase()
                                            .replace(/[^\w\s]/g, "") // remove punctuation
                                            .replace(/^\s+|\s+$|\s+(?=\s)/g, "") // remove whitespace
                                            .trim() // remove space from beginning and end
                                            .split(" ");
          
          // remove stopwords
          console.log(BM25.cleanedText);
          BM25.cleanedText = BM25.cleanedText.filter(word => !stopwords.includes(word));
          console.log(BM25.cleanedText);
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