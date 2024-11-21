document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatMessages = document.getElementById("chat-messages");
  let selectedSubject = "";

  // Selecteer een vak
  document.querySelectorAll(".sidebar ul li").forEach(item => {
    item.addEventListener("click", () => {
      selectedSubject = item.getAttribute("data-subject");
      chatMessages.innerHTML += `<div class="bot-message">Je hebt ${selectedSubject} geselecteerd.</div>`;
      chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll naar beneden
    });
  });

  // Stuur bericht naar de server
  sendButton.addEventListener("click", () => {
    const message = userInput.value;
    if (!message || !selectedSubject) {
      alert("Selecteer een vak en typ een bericht.");
      return;
    }

    // Voeg het bericht van de gebruiker toe aan de chat
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    userInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll naar beneden

    // Stuur het bericht naar de server
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
        // Verwerk de botreactie en pas tekstdecoratie toe
        const formattedResponse = formatText(data.response);
        chatMessages.innerHTML += `<div class="bot-message">${formattedResponse}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll naar beneden
      })
      .catch(error => {
        console.error("Fout:", error);
        chatMessages.innerHTML += `<div class="bot-message">Er ging iets mis. Probeer het later opnieuw.</div>`;
      });
  });

  // Functie om tekstdecoratie toe te voegen (vet, schuin, lijsten, nieuwe regels)
  function formatText(text) {
    // Voeg een nieuwe regel toe voor elk \n in de tekst
    text = text.replace(/\n/g, '<br />');

    // Vervang **tekst** door <strong>tekst</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Vervang *tekst* door <em>tekst</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Verwerk ongeordende lijsten (begint met een '-' gevolgd door een spatie)
    text = text.replace(/^- (.*?)(?=\n|$)/g, '<ul><li>$1</li></ul>');

    // Verwerk geordende lijsten (begint met een nummer gevolgd door een punt)
    text = text.replace(/^\d+\. (.*?)(?=\n|$)/g, '<ol><li>$1</li></ol>');

    // Zorg ervoor dat meerdere li's in een lijst correct worden ingesloten in de lijsttags
    text = text.replace(/(<ul><li>.*?<\/li><\/ul>)/g, function(match) {
      return `<ul>${match.replace(/<\/li><\/ul>/g, "</li>").replace(/<ul>/g, "")}</ul>`;
    });

    text = text.replace(/(<ol><li>.*?<\/li><\/ol>)/g, function(match) {
      return `<ol>${match.replace(/<\/li><\/ol>/g, "</li>").replace(/<ol>/g, "")}</ol>`;
    });

    return text;
  }
});
