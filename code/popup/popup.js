// Functions used in popup will go here

function handleSubmit(event) {
    event.preventDefault();
    document.getElementById("output1").textContent = document.getElementById("query").value[0];
    document.getElementById("output2").textContent = document.getElementById("query").value.slice(1);
}

// document.getElementById('form').addEventListener('submit', handleSubmit);

function sendQuery(event) {
    event.preventDefault();
    var query = document.getElementById("query").value;
    chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: getParagraphs
            }, (para) => {
                console.log(query);
                chrome.tabs.sendMessage(tabs[0].id, { "query": query, "tabs": tabs, "paragraphs": para[0].result }, function (response) {
                    console.log(response.scores[0]);
                    document.getElementById("output1").textContent = response.scores[0];
                });
            });
        }
    )
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitButton").addEventListener("click", sendQuery);
})


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