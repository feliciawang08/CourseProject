// BM25 code will go here
console.log("This page runs");

class BM25 {
  constructor() {
      // instance variables for class will go in here
      this.paragraphs = [];
      this.cleanedParagraphs = [];

      this.vocabulary = [];
      this.docFrequency = [];
  }

  /**
   * Filters out stopwords and stems resulting list from Wikipedia article paragraphs String
   * @param {Array containing strings of all Wikipedia article paragraphs} paras 
   */
  cleanText(paras) {
    // stopwords obtained from https://gist.github.com/sebleier/554280 (NLTK's list of english stopwords)
    var stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];
    paras.forEach((paragraph, index) => {
      paras[index] = paragraph.toLowerCase()
                    .replace(/[\[0-9\]']+/g, "") // remove [#]
                    .replace(/[^\w\s]/g, "") // remove punctuation
                    .replace(/^\s+|\s+$|\s+(?=\s)/g, "") // remove whitespace
                    .trim() // remove space from beginning and end
                    .split(" ");
    })
            
    // remove stopwords
    paras.forEach((paragraph, index) => {
      paras[index] = paragraph.filter(word => !stopwords.includes(word));
    })
  
    // stem all filtered words
    paras.forEach((paragraph, pIndex) => {
      paragraph.forEach((word, wIndex) => {
        paras[pIndex[wIndex]] = this.stemmer(word);
      })
    })
    this.cleanedParagraphs = paras;
    console.log("We have the cleaned paragraphs");
    console.log("CP len:", this.cleanedParagraphs);
  }
  
  /**
   * JavaScript implementation of the Porter Stemmer, to be used in our BM25 algorithm.
   * Code is taken from https://tartarus.org/martin/PorterStemmer/js.txt, which follows along with the original paper:
   * Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14, no. 3, pp 130-137,
   * Credit to authors in above link
   */
  stemmer = (function(){
    var step2list = {
            "ational" : "ate",
            "tional" : "tion",
            "enci" : "ence",
            "anci" : "ance",
            "izer" : "ize",
            "bli" : "ble",
            "alli" : "al",
            "entli" : "ent",
            "eli" : "e",
            "ousli" : "ous",
            "ization" : "ize",
            "ation" : "ate",
            "ator" : "ate",
            "alism" : "al",
            "iveness" : "ive",
            "fulness" : "ful",
            "ousness" : "ous",
            "aliti" : "al",
            "iviti" : "ive",
            "biliti" : "ble",
            "logi" : "log"
        },
    
        step3list = {
            "icate" : "ic",
            "ative" : "",
            "alize" : "al",
            "iciti" : "ic",
            "ical" : "ic",
            "ful" : "",
            "ness" : ""
        },
    
        c = "[^aeiou]",          // consonant
        v = "[aeiouy]",          // vowel
        C = c + "[^aeiouy]*",    // consonant sequence
        V = v + "[aeiou]*",      // vowel sequence
    
        mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
        meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
        mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
        s_v = "^(" + C + ")?" + v;                   // vowel in stem
    
    return function (w) {
        var     stem,
            suffix,
            firstch,
            re,
            re2,
            re3,
            re4,
            origword = w;
    
        if (w.length < 3) { return w; }
    
        firstch = w.substr(0,1);
        if (firstch == "y") {
            w = firstch.toUpperCase() + w.substr(1);
        }
    
        // Step 1a
        re = /^(.+?)(ss|i)es$/;
        re2 = /^(.+?)([^s])s$/;
    
        if (re.test(w)) { w = w.replace(re,"$1$2"); }
        else if (re2.test(w)) { w = w.replace(re2,"$1$2"); }
    
        // Step 1b
        re = /^(.+?)eed$/;
        re2 = /^(.+?)(ed|ing)$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            re = new RegExp(mgr0);
            if (re.test(fp[1])) {
                re = /.$/;
                w = w.replace(re,"");
            }
        } else if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1];
            re2 = new RegExp(s_v);
            if (re2.test(stem)) {
                w = stem;
                re2 = /(at|bl|iz)$/;
                re3 = new RegExp("([^aeiouylsz])\\1$");
                re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
                if (re2.test(w)) {  w = w + "e"; }
                else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
                else if (re4.test(w)) { w = w + "e"; }
            }
        }
    
        // Step 1c
        re = /^(.+?)y$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            re = new RegExp(s_v);
            if (re.test(stem)) { w = stem + "i"; }
        }
    
        // Step 2
        re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re = new RegExp(mgr0);
            if (re.test(stem)) {
                w = stem + step2list[suffix];
            }
        }
    
        // Step 3
        re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re = new RegExp(mgr0);
            if (re.test(stem)) {
                w = stem + step3list[suffix];
            }
        }
    
        // Step 4
        re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
        re2 = /^(.+?)(s|t)(ion)$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            re = new RegExp(mgr1);
            if (re.test(stem)) {
                w = stem;
            }
        } else if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1] + fp[2];
            re2 = new RegExp(mgr1);
            if (re2.test(stem)) {
                w = stem;
            }
        }
    
        // Step 5
        re = /^(.+?)e$/;
        if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            re = new RegExp(mgr1);
            re2 = new RegExp(meq1);
            re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
            if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                w = stem;
            }
        }
    
        re = /ll$/;
        re2 = new RegExp(mgr1);
        if (re.test(w) && re2.test(w)) {
            re = /.$/;
            w = w.replace(re,"");
        }
    
        // and turn initial Y back to y
    
        if (firstch == "y") {
            w = firstch.toLowerCase() + w.substr(1);
        }
    
        return w;
    }
    })();
}

let bm25_ranker = new BM25();

chrome.runtime.sendMessage({method: "set"}, () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: getParagraphs
    }, () => {
      console.log("the url is", tabs[0].url)
      if (tabs[0].url.indexOf("wiki") == -1) {
        document.getElementById("id_text").value = "This extension can only be run on Wikipedia articles.";
      } else {
        chrome.runtime.sendMessage({ method: "get" }, (response) => {
          bm25_ranker.paragraphs = response.value;
          console.log("paragraphs:", bm25_ranker.paragraphs);
          bm25_ranker.cleanText(bm25_ranker.paragraphs);
          setupBM25DocInfo();

          getVocabulary();
          console.log("vocabulary:", bm25_ranker.vocabulary);
          getDocFrequency();
          console.log("doc frequency:", bm25_ranker.docFrequency);
          getTermDocFrequency();
          console.log("term doc frequency:", bm25_ranker.termDocFrequency);
        });
      }
    });
  });
});

function getParagraphs() {
  let paraCount = document.getElementsByTagName("p").length;
  let paragraphs = []

  for (let i = 0; i < paraCount; i++) {
    paragraphs.push(document.getElementsByTagName("p")[i].innerText)
  }

  chrome.runtime.sendMessage({ method: "set", value: paragraphs }, () => {
  });
}

function setupBM25DocInfo() {
  bm25_ranker.numDocs = bm25_ranker.cleanedParagraphs.length;

  var docLengths = [];
  bm25_ranker.cleanedParagraphs.forEach(doc => {
    docLengths.push(doc.length);
  })

  bm25_ranker.avgDocLength = mean(docLengths);
}

function getVocabulary() {
  var vocabSet = new Set();
  bm25_ranker.cleanedParagraphs.forEach(doc => {
    doc.forEach(word => {
      vocabSet.add(word);
    })
  });
  bm25_ranker.vocabulary = Array.from(vocabSet);
}

/**
 * To find c(w,d), do BM25.docFrequency[docIndex][wordIndex from vocabulary]
 */
function getDocFrequency() {
  var tmp = [];
  bm25_ranker.cleanedParagraphs.forEach(doc => {
    var freq = []
    bm25_ranker.vocabulary.forEach(term => {
      var count = 0;
      doc.forEach(word => {
        if (term == word) count++;
      })
      freq.push(count);
    })
    tmp.push(freq);
  });
  bm25_ranker.docFrequency = tmp;
}

/**
 * This calculates c(w,q), to be used in BM25
 */
function getQueryTermFrequency(term, query) {
  var freq = 0;
  queryWords = query.split(' ');
  queryWords.forEach(word => {
    if (word == term) freq++;
  })
  return freq;
}

function getTermDocFrequency() {
  var tmp = [];
  docFreq = bm25_ranker.docFrequency;
  for (let i = 0; i < bm25_ranker.vocabulary.length; i++) {
    var termDocFreq = 0;
    for (let j = 0; j < bm25_ranker.numDocs; j++) {
      termDocFreq += docFreq[j][i];
    }
    tmp.push(termDocFreq);
  }
  bm25_ranker.termDocFrequency = tmp;
}