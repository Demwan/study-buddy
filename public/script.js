document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatMessages = document.getElementById("chat-messages");
  let selectedSubject = "";

  // Select a subject!
  document.querySelectorAll(".sidebar ul li").forEach(item => {
    item.addEventListener("click", () => {
      selectedSubject = item.getAttribute("data-subject");
      chatMessages.innerHTML += `<div class="bot-message">Je hebt ${selectedSubject} geselecteerd.</div>`;
    });
  });

  // Send message to the server
  sendButton.addEventListener("click", () => {
    const message = userInput.value;
    if (!message || !selectedSubject) {
      alert("Selecteer een vak en typ een bericht.");
      return;
    }

    // Add user's message to the chat
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    userInput.value = "";

    // Send the message to the server
    fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: selectedSubject,
        message: message,
      }),
    })
      .then(response => response.json())
      .then(data => {
        chatMessages.innerHTML += `<div class="bot-message">${data.response}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch(error => {
        console.error("Error:", error);
        chatMessages.innerHTML += `<div class="bot-message">Er ging iets mis. Probeer het later opnieuw.</div>`;
      });
  });
});
