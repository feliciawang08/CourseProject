// BM25 code will go here
console.log("This page runs");

class BM25 {
  constructor() {
    // instance variables for class will go in here
    this.paragraphs = [];
    this.cleanedParagraphs = [];

    this.vocabulary = [];
    this.docFrequency = [];

    this.bm25Scores = []; // for each paragraph

    this.initialized = false;
  }

  /**
   * One function that will call all necessary functions to fill above parameters
   */
  processParagraphs() {
    bm25_ranker.setupBM25DocInfo();
    bm25_ranker.getVocabulary();
    console.log("vocabulary:", bm25_ranker.vocabulary);
    bm25_ranker.getDocFrequency();
    console.log("doc frequency:", bm25_ranker.docFrequency);
    bm25_ranker.getTermDocFrequency();
    console.log("term doc frequency:", bm25_ranker.termDocFrequency);
  }

  /**
   * Filters out stopwords and stems resulting list from Wikipedia article paragraphs String
   * @param {Array containing strings of all Wikipedia article paragraphs} paras 
   */
  cleanText(paras) {
    // stopwords obtained from https://gist.github.com/sebleier/554280 (NLTK's list of english stopwords)
    var stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'];
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
  stemmer = (function () {
    var step2list = {
      "ational": "ate",
      "tional": "tion",
      "enci": "ence",
      "anci": "ance",
      "izer": "ize",
      "bli": "ble",
      "alli": "al",
      "entli": "ent",
      "eli": "e",
      "ousli": "ous",
      "ization": "ize",
      "ation": "ate",
      "ator": "ate",
      "alism": "al",
      "iveness": "ive",
      "fulness": "ful",
      "ousness": "ous",
      "aliti": "al",
      "iviti": "ive",
      "biliti": "ble",
      "logi": "log"
    },

      step3list = {
        "icate": "ic",
        "ative": "",
        "alize": "al",
        "iciti": "ic",
        "ical": "ic",
        "ful": "",
        "ness": ""
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
      var stem,
        suffix,
        firstch,
        re,
        re2,
        re3,
        re4,
        origword = w;

      if (w.length < 3) { return w; }

      firstch = w.substr(0, 1);
      if (firstch == "y") {
        w = firstch.toUpperCase() + w.substr(1);
      }

      // Step 1a
      re = /^(.+?)(ss|i)es$/;
      re2 = /^(.+?)([^s])s$/;

      if (re.test(w)) { w = w.replace(re, "$1$2"); }
      else if (re2.test(w)) { w = w.replace(re2, "$1$2"); }

      // Step 1b
      re = /^(.+?)eed$/;
      re2 = /^(.+?)(ed|ing)$/;
      if (re.test(w)) {
        var fp = re.exec(w);
        re = new RegExp(mgr0);
        if (re.test(fp[1])) {
          re = /.$/;
          w = w.replace(re, "");
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
          if (re2.test(w)) { w = w + "e"; }
          else if (re3.test(w)) { re = /.$/; w = w.replace(re, ""); }
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
        w = w.replace(re, "");
      }

      // and turn initial Y back to y

      if (firstch == "y") {
        w = firstch.toLowerCase() + w.substr(1);
      }

      return w;
    }
  })();

  /**
   * Sets M: numDocs
   * Sets avgdl: averageDocLength based on all the docs' lengths
   */
  setupBM25DocInfo() {
    this.numDocs = this.cleanedParagraphs.length;

    var docLengths = [];
    this.cleanedParagraphs.forEach(doc => {
      docLengths.push(doc.length);
    })

    this.avgDocLength = docLengths.reduce((a, b) => a + b) / docLengths.length;
  }

  /**
   * vocabulary is set of all unique words in all paragraphs
   */
  getVocabulary() {
    var vocabSet = new Set();
    this.cleanedParagraphs.forEach(doc => {
      doc.forEach(word => {
        vocabSet.add(word);
      })
    });
    this.vocabulary = Array.from(vocabSet);
  }

  /**
   * To find c(w,d), do BM25.docFrequency[docIndex][wordIndex from vocabulary]
   * c(w,d) is count of that word in the current document
   */
  getDocFrequency() {
    var tmp = [];
    this.cleanedParagraphs.forEach(doc => {
      var freq = []
      this.vocabulary.forEach(term => {
        var count = 0;
        doc.forEach(word => {
          if (term == word) count++;
        })
        freq.push(count);
      })
      tmp.push(freq);
    });
    this.docFrequency = tmp;
  }

  /**
   * For every word in vocab, we have the count of documents that word occurs in
   * df(w): termDocFrequency[vocabIndex]
   */
  getTermDocFrequency() {
    var tmp = [];
    var docFreq = this.docFrequency;
    for (let i = 0; i < this.vocabulary.length; i++) {
      var termDocFreq = 0;
      for (let j = 0; j < this.numDocs; j++) {
        termDocFreq += docFreq[j][i];
      }
      tmp.push(termDocFreq);
    }
    this.termDocFrequency = tmp;
  }

  /**
   * This calculates c(w,q), to be used in BM25
   * Count of word in the query
   */
  getQueryTermFrequency(term, query) {
    var freq = 0;
    let queryWords = query.split(' ');
    queryWords.forEach(word => {
      if (word == term) freq++;
    })
    return freq;
  }

  /**
   * This computes BM25 score for a given paragraph based on the query
   * @param {User entered search} query 
   * @param {Paragraph to assign score for} doc 
   * @param {*} b 
   * @param {*} k1 
   * @param {*} k3 
   */
  getBM25ForDocument(query, doc, b, k, idx) {
    var queryWords = query.split(' ');
    var bm25Score = 0;
    var docLen = doc.length;
    var avgdl = this.avgDocLength;
    console.log("doc len: ", docLen);
    for (let i = 0; i < docLen; i++) {
      for (let j = 0; j < queryWords.length; j++) {
        if (doc[i] == queryWords[j]) {
          var wordVocabIndex = this.vocabulary.indexOf(doc[i]);
          var countWordQuery = this.getQueryTermFrequency(doc[i], query); // c(w,q)
          var countWordDoc = this.docFrequency[idx][wordVocabIndex]; // c(w,d)
          var dfw = this.termDocFrequency[wordVocabIndex]; // df(w)
          bm25Score += countWordQuery * (((k + 1) * countWordDoc) / (countWordDoc + (k * (1 - b + ((b * docLen) / avgdl))))) * Math.log2((this.numDocs + 1) / dfw); // f(q,d)
        }
      }
    }
    // console.log(bm25Score);
    return bm25Score;
  }

  /**
   * Main function that runs the bm25 algorithm
   * @param {User entered search} query 
   * @param {*} b 
   * @param {*} k 
   */
  doBM25(query, b, k) {
    var tmp = [];
    console.log(query);
    console.log(this.cleanedParagraphs[0]);
    var idx = 0;
    this.cleanedParagraphs.forEach(doc => {
      tmp.push(this.getBM25ForDocument(query, doc, b, k, idx));
      idx++;
    })
    console.log("doBM25 called");
    this.bm25Scores = tmp;
  }
}

let bm25_ranker = new BM25();

/**
 * Listen for search button press from popup with query
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(msg);

  console.log("the url is", msg.tabs[0].url)
  if (msg.tabs[0].url.indexOf("wiki") == -1) {
    document.getElementById("id_text").value = "This extension can only be run on Wikipedia articles.";
  } else {
    if (!bm25_ranker.initialized) {
      bm25_ranker.paragraphs = msg.paragraphs;
      console.log("paragraphs:", bm25_ranker.paragraphs);
      bm25_ranker.cleanText(bm25_ranker.paragraphs);
      bm25_ranker.processParagraphs();
      bm25_ranker.initialized = true;
    }

    // Now calculate the bm25 for the text
    bm25_ranker.doBM25(msg.query, 0.75, 1.0);
    console.log(bm25_ranker.bm25Scores);
    sendResponse({ "scores": bm25_ranker.bm25Scores });
    return true;
  }
  return true;
})
<<<<<<< HEAD
=======

>>>>>>> 415c226175781dc912bc54b5a21d726caa62c398
