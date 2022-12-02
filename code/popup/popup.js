// Functions used in popup will go here

function handleSubmit(event) {
    event.preventDefault();
    document.getElementById("output1").textContent = document.getElementById("query").value[0];
    document.getElementById("output2").textContent = document.getElementById("query").value.slice(1);
}

document.getElementById('form').addEventListener('submit', handleSubmit);

function sendQuery() {
    var query = document.getElementById("query").vaue;
    chrome.tabs.query(
        {currentWindow: true, active: true},
        function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {query: query});
        }
    )
}

document.getElementById("submitButton").addEventListener("click", sendQuery);