function showModal(message) {
    document.getElementById("modalMessage").textContent = message;
    document.getElementById("customModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}
