// Functions used in popup will go here
console.log("popup.js runs");

function handleSubmit(event) {
    event.preventDefault();
    document.getElementById("output1").textContent = document.getElementById("query").value[0];
    document.getElementById("output2").textContent = document.getElementById("query").value.slice(1);
}

document.getElementById('form').addEventListener('submit', handleSubmit);