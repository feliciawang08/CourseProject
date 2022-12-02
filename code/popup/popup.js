// Functions used in popup will go here

// function handleSubmit(event) {
//     event.preventDefault();
//     document.getElementById("output1").textContent = document.getElementById("query").value[0];
//     document.getElementById("output2").textContent = document.getElementById("query").value.slice(1);
// }


function sendQuery(event) {
    event.preventDefault();
    var query = document.getElementById("query").value;
    chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: getParagraphs
            }, (resp) => {
                let paragraphs = resp[0].result;
                console.log(query);
                chrome.tabs.sendMessage(tabs[0].id, { "query": query, "tabs": tabs, "paragraphs": paragraphs }, function (response) {
                    console.log(response.scores);

                    var idxs = Array.from(Array(response.scores.length).keys())
                        .sort((a, b) => response.scores[a] < response.scores[b] ? -1 : (response.scores[b] < response.scores[a]) | 0).reverse();

                    console.log(idxs);
                    document.getElementById("output1").textContent = paragraphs[idxs[0]];
                    document.getElementById('output1').addEventListener('click', function () {
                        scrollOnPage(idxs[0]);
                    });

                    document.getElementById("output2").textContent = paragraphs[idxs[1]];
                });
            });
        }
    )
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitButton").addEventListener("click", sendQuery);
})

function scrollOnPage(idx) {
    chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: scrollToElement,
                args: [idx],
            });
        }
    );
}

/**
 * Each paragraph is a document. (M total documents, each document is 'd')
 */
function getParagraphs() {
    console.log("getParagraphs");
    let paraCount = document.getElementsByTagName("p").length;
    let paragraphs = []

    for (let i = 0; i < paraCount; i++) {
        paragraphs.push(document.getElementsByTagName("p")[i].innerText)
    }

    return paragraphs;
}

var index = 90909;

function scrollToElement(idx) {
    let pageElement = document.getElementsByTagName("p")[idx]
    var y = pageElement.getBoundingClientRect().top + window.scrollY;
    window.scroll({
        top: y,
        behavior: 'smooth'
    });
}

