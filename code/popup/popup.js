// Functions used in popup will go here

function handleSubmit(event) {
    event.preventDefault();
    document.getElementById("output1").textContent = document.getElementById("query").value[0];
    document.getElementById("output2").textContent = document.getElementById("query").value.slice(1);
}

document.getElementById('form').addEventListener('submit', handleSubmit);

const submitButton = document.getElementById("submitButton");
submitButton.onclick = async function(e) {
    let queryOptions = {active: true, currentWindow: true};
    let tabs = await chrome.tabs.query(queryOptions);

    chrome.tabs.sendMessage(
        tabs[0].id,
        {query: document.getElementById("query").value}
    )
    console.log("Clicked");
}
