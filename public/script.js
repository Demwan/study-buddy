document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send-button");
  const chatSendButton = document.getElementById("chat-send-button");
  const userInput = document.getElementById("user-input");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const starterScreen = document.getElementById("starter-screen");
  const chatScreen = document.getElementById("chat-screen");
  const selectedSubjectHeader = document.getElementById("selected-subject");

  let selectedSubject = "";
  let currenSubject = "";

  // Selecteer een vak
  document.querySelectorAll(".Vakken-Button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSubject = button.getAttribute("data-subject");
      document.getElementById("Helpen-Met").innerHTML =
        `<h1>Hey, hoe kan ik je vandaag helpen met <span style="color: var(--${selectedSubject}-color);">${selectedSubject}</span>?</h1>`;
      if (currenSubject != "") {
        document.getElementById(currenSubject + "-Button").style.color =
          "#000000";
        document.getElementById(
          currenSubject + "-Button",
        ).style.backgroundColor = "";
        chatMessages.innerHTML += `<div class="system-message" style="background-color: var(--${selectedSubject}-background)">Je hebt ${selectedSubject} geselecteerd.</div>`;
      }
      document.getElementById(selectedSubject + "-Button").style.color =
        `var(--${selectedSubject}-color)`;
      document.getElementById(
        selectedSubject + "-Button",
      ).style.backgroundColor = `var(--${selectedSubject}-background)`;
      document.querySelectorAll(".search-button").forEach((button) => {
        button.style.color = `var(--${selectedSubject}-color)`;
      });
      document
        .querySelectorAll(".search-button-background")
        .forEach((button) => {
          button.style.backgroundColor = `var(--${selectedSubject}-background)`;
        });
      selectedSubjectHeader.innerHTML = selectedSubject;
      selectedSubjectHeader.style.color = `var(--${selectedSubject}-color)`;
      

      
      
      currenSubject = selectedSubject;
    });
  });

  document.getElementById("send-button").addEventListener("click", () => {
    console.log("chat");
    if (selectedSubject != "") {
      transitionToChatScreen(selectedSubject);
      console.log("transintion");
    } else {
      console.log(" niks geslectererd");
    }
  });

  // Transitie naar chat scherm
  function transitionToChatScreen(subject) {
    
    selectedSubjectHeader.textContent = subject;
    starterScreen.style.display = "none";
    chatScreen.classList.add("active");
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Functie om tekstdecoratie toe te voegen (vet, schuin, lijsten, nieuwe regels)
  function formatText(text) {
    // Voeg een nieuwe regel toe voor elk \n in de tekst
    text = text.replace(/\n/g, "<br />");

    // Vervang **tekst** door <strong>tekst</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Vervang *tekst* door <em>tekst</em>
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Verwerk ongeordende lijsten (begint met een '-' gevolgd door een spatie)
    text = text.replace(/^- (.*?)(?=\n|$)/gm, "<ul><li>$1</li></ul>");

    // Verwerk geordende lijsten (begint met een nummer gevolgd door een punt)
    text = text.replace(/^\d+\. (.*?)(?=\n|$)/gm, "<ol><li>$1</li></ol>");

    // Zorg ervoor dat meerdere li's in een lijst correct worden ingesloten in de lijsttags
    text = text.replace(/(<ul><li>.*?<\/li><\/ul>)/g, function (match) {
      return `<ul>${match.replace(/<\/li><\/ul>/g, "</li>").replace(/<ul>/g, "")}</ul>`;
    });

    text = text.replace(/(<ol><li>.*?<\/li><\/ol>)/g, function (match) {
      return `<ol>${match.replace(/<\/li><\/ol>/g, "</li>").replace(/<ol>/g, "")}</ol>`;
    });

    return text;
  }

  // Stuur bericht naar de server (oude methode)
  function sendMessageToServer(subject, message) {
    if (!message || !subject) {
      alert("Selecteer een vak en typ een bericht.");
      return;
    }

    // Voeg het bericht van de gebruiker toe aan de chat
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Stuur het bericht naar de server
    fetch(window.location.href + "chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: subject,
        message: message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Verwerk de botreactie en pas tekstdecoratie toe
        const formattedResponse = formatText(data.response);
        chatMessages.innerHTML += `<div class="bot-message" style="background-color: var(--${selectedSubject}-background)">${formattedResponse}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch((error) => {
        console.error("Fout:", error);
        chatMessages.innerHTML += `<div class="bot-message">Er ging iets mis. Probeer het later opnieuw.</div>`;
      });
  }

  // Event listener voor versturen van bericht vanaf starter scherm
  sendButton.addEventListener("click", () => {
    const message = userInput.value;
    if (!selectedSubject) {
      // Als er nog geen vak is geselecteerd, gebruik de eerste beschikbare knop
      const firstSubjectButton = document.querySelector(".Vakken-Button");
      if (firstSubjectButton) {
        selectedSubject = firstSubjectButton.getAttribute("data-subject");
        transitionToChatScreen(selectedSubject);
      }
    }
    sendMessageToServer(selectedSubject, message);
    userInput.value = "";
  });

  // Event listener voor versturen van bericht vanuit chat scherm
  chatSendButton.addEventListener("click", () => {
    const message = chatInput.value;
    sendMessageToServer(selectedSubject, message);
    chatInput.value = "";
  });
});
