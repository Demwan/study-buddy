document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send-button");
  const chatSendButton = document.getElementById("chat-send-button");
  const userInput = document.getElementById("user-input");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const starterScreen = document.getElementById("starter-screen");
  const chatScreen = document.getElementById("chat-screen");
  const selectedSubjectHeader = document.getElementById("selected-subject");
  const starterError = document.getElementById("starter-error");
  const chatError = document.getElementById("chat-error");

  let selectedSubject = "";
  let currenSubject = "";
  let storedMessage = ""; // Add this variable to store the message

  // Selecteer een vak
  document.querySelectorAll(".Vakken-Button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSubject = button.getAttribute("data-subject");
      
      // Close sidebar if on mobile and handle stored message
      if (window.innerWidth < 769) {
        nav.classList.remove("nav-visible");
        hamburgerMenu.classList.remove("active");
        overlay.classList.remove("active");
        
        // If there's a stored message, use it and send
        if (storedMessage) {
          userInput.value = storedMessage;
          sendMessageToServer(selectedSubject, storedMessage);
          transitionToChatScreen(selectedSubject);
          storedMessage = ""; // Clear stored message
          userInput.value = ""; // Clear input
        }
      }

      document.getElementById("Helpen-Met").innerHTML =
        `<h1>Hey, hoe kan ik je vandaag helpen met <span style="color: var(--${selectedSubject}-color);">${selectedSubject}</span>?</h1>`;
      if (currenSubject != "") {
        document.getElementById(currenSubject + "-Button").style.color =
          "#000000";
        document.getElementById(
          currenSubject + "-Button",
        ).style.backgroundColor = "";
      }
      document.getElementById(selectedSubject + "-Button").style.color =
        `var(--${selectedSubject}-color)`;
      document.getElementById(
        selectedSubject + "-Button",
      ).style.backgroundColor = `var(--${selectedSubject}-background)`;
      document.querySelectorAll(".search-button").forEach((button) => {
        button.style.color = `var(--${selectedSubject}-color)`;
      document
        .querySelectorAll(".search-button-background")
        .forEach((button) => {
          button.style.backgroundColor = `var(--${selectedSubject}-background)`;
        });
      selectedSubjectHeader.innerHTML = selectedSubject;
        selectedSubjectHeader.style.color = `var(--${selectedSubject}-color)`;
      });


      // Transition to chat screen if a different subject is selected
      if (currenSubject != "" && selectedSubject !== currenSubject) {
        transitionToStarterScreen();
      }

      currenSubject = selectedSubject;


    });
  });

  document.getElementById("send-button").addEventListener("click", () => {
    const message = userInput.value.trim();
    if (!selectedSubject) {
      if (window.innerWidth < 769) {
        storedMessage = message; // Store the message
        document.querySelector(".hamburger-menu").click();
      } else {
        showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
      }
      return;
    }
    
    if (!message) {
      showError(starterError, "Je moet een bericht typen om te verzenden.");
      return;
    }

    transitionToChatScreen(selectedSubject);
  });

  // Transitie naar chat scherm
  function transitionToChatScreen(subject) {
    selectedSubjectHeader.textContent = subject;
    starterScreen.style.display = "none";
    chatScreen.classList.add("active");
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Transitie naar start scherm
  function transitionToStarterScreen() {
    starterScreen.style.display = "flex";
    chatScreen.classList.remove("active");
    chatMessages.innerHTML = ""; // Clear chat messages
    selectedSubjectHeader.innerHTML = ""; // Clear selected subject
  }

  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const nav = document.querySelector("nav");
  const overlay = document.querySelector(".overlay");

  hamburgerMenu.addEventListener("click", () => {
    console.log("clicked");
    nav.classList.toggle("nav-visible");
    hamburgerMenu.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    nav.classList.remove("nav-visible");
    hamburgerMenu.classList.remove("active");
    overlay.classList.remove("active");
  });

  // Ensure the sidebar is displayed when resizing to a desktop view
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 769) {
      nav.classList.add("nav-visible");
      overlay.classList.remove("active");
    } else {
      nav.classList.remove("nav-visible");
    }
  });

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

  function showError(element, message) {
    element.textContent = message;
    element.classList.add("visible");
    setTimeout(() => {
      element.classList.remove("visible");
    }, 3000);
  }

  // Stuur bericht naar de server (oude methode)
  function sendMessageToServer(subject, message) {
    if (!subject) {
      if (window.innerWidth < 769) {
        handleMobileSubjectSelection(message);
      } else {
        showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
      }
      return;
    }
    if (!message || message.trim() === "") {
      if (chatScreen.classList.contains("active")) {
        showError(chatError, "Je moet een bericht typen om te verzenden.");
      } else {
        showError(starterError, "Je moet een bericht typen om te verzenden.");
      }
      return;
    }
    if (!subject) {
      if (window.screen.width < 769) {
        document.querySelector(".hamburger-menu").click();
      } else {
        showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
      }
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
        // chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch((error) => {
        console.error("Fout:", error);
        chatMessages.innerHTML += `<div class="bot-message" style="background-color: var(--${selectedSubject}-background)">Er ging iets mis. Probeer het later opnieuw.</div>`;
      });
  }

  // Event listener voor versturen van bericht vanaf starter scherm
  sendButton.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (!selectedSubject) {
      if (window.innerWidth < 769) {
        storedMessage = message; // Store the message
        console.log(storedMessage);
        document.querySelector(".hamburger-menu").click();
      } else {
        showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
      }
      return;
    }
    
    if (!message) {
      showError(starterError, "Je moet een bericht typen om te verzenden.");
      return;
    }

    sendMessageToServer(selectedSubject, message);
    userInput.value = "";
    transitionToChatScreen(selectedSubject);
  });

  // Event listener voor versturen van bericht vanuit chat scherm
  chatSendButton.addEventListener("click", () => {
    const message = chatInput.value;
    sendMessageToServer(selectedSubject, message);
    chatInput.value = "";
  });

  // Add event listeners for enter key press
  userInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const message = userInput.value.trim();
      if (!selectedSubject) {
        if (window.innerWidth < 769) {
          handleMobileSubjectSelection(message);
        } else {
          showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
        }
        return;
      }

      if (!message) {
        showError(starterError, "Je moet een bericht typen om te verzenden.");
        return;
      }

      sendMessageToServer(selectedSubject, message);
      userInput.value = "";
      transitionToChatScreen(selectedSubject);
    }
  });

  chatInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const message = chatInput.value;
      sendMessageToServer(selectedSubject, message);
      chatInput.value = "";
    }
  });

  function handleMobileSubjectSelection(message) {
    if (window.innerWidth < 769 && !nav.classList.contains('nav-visible')) {
      storedMessage = message;
      nav.classList.add("nav-visible");
      hamburgerMenu.classList.add("active");
      overlay.classList.add("active");
    }
  }

  // Single send button event listener
  sendButton.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (!selectedSubject) {
      if (window.innerWidth < 769) {
        handleMobileSubjectSelection(message);
      } else {
        showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
      }
      return;
    }
    
    if (!message) {
      showError(starterError, "Je moet een bericht typen om te verzenden.");
      return;
    }

    sendMessageToServer(selectedSubject, message);
    userInput.value = "";
    transitionToChatScreen(selectedSubject);
  });



  // Modify sendMessageToServer function
  function sendMessageToServer(subject, message) {
    if (!subject) {
      if (window.innerWidth < 769) {
        handleMobileSubjectSelection(message);
      } else {
        showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
      }
      return;
    }
    if (!message || message.trim() === "") {
      if (chatScreen.classList.contains("active")) {
        showError(chatError, "Je moet een bericht typen om te verzenden.");
      } else {
        showError(starterError, "Je moet een bericht typen om te verzenden.");
      }
      return;
    }
    if (!subject) {
      if (window.screen.width < 769) {
        document.querySelector(".hamburger-menu").click();
      } else {
        showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
      }
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
        chatMessages.innerHTML += `<div class="bot-message" style="background-color: var(--${selectedSubject}-background)">Er ging iets mis. Probeer het later opnieuw.</div>`;
      });
  }

  // Add auto-resize functionality for text inputs
  function autoResize(element) {
    element.style.height = 'auto';
    const scrollHeight = element.scrollHeight;
    const maxHeight = parseInt(window.getComputedStyle(element).maxHeight);
    element.style.height = Math.min(scrollHeight, maxHeight) + 'px';

    // Only manage overflow
    element.style.overflowY = scrollHeight >= maxHeight ? 'auto' : 'hidden';
    // Remove dynamic padding

    if (!element.dataset.isMaxHeight && scrollHeight >= maxHeight) {
      console.log("Reached max height");
      // document.querySelector(".search-input").style.margin = "0";
      // document.querySelector(".search-bar").style.margin = "10px 0 10px 15px";
      element.dataset.isMaxHeight = "true";
    } else if (element.dataset.isMaxHeight === "true" && scrollHeight < maxHeight) {
      console.log("No longer at max height");
      // document.querySelector(".search-input").style.margin = "10px 15px 10px 15px";
      // document.querySelector(".search-bar").style.margin = "0";
      element.dataset.isMaxHeight = "";
    }
  }

  // Apply auto-resize to both inputs
  [userInput, chatInput].forEach(input => {
    input.style.overflowY = 'hidden';
    
    input.addEventListener('input', (e) => {
      autoResize(e.target);
    });
  });

  // Add keydown event listeners to prevent line breaks on Enter without Shift
  [userInput, chatInput].forEach(input => {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.shiftKey) { 
        console.log("Shift + Enter pressed");
        return;
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        // Call your send function depending on which input is used
        if (input === userInput) {
          const message = userInput.value.trim();
          if (!selectedSubject) {
            if (window.innerWidth < 769) {
              handleMobileSubjectSelection(message);
            } else {
              showError(starterError, "Kies eerst een vak om een bericht te verzenden.");
            }
            return;
          }

          if (!message) {
            showError(starterError, "Je moet een bericht typen om te verzenden.");
            return;
          }

          sendMessageToServer(selectedSubject, message);
          userInput.value = "";
          transitionToChatScreen(selectedSubject);
        } else {
          const message = chatInput.value.trim();
          sendMessageToServer(selectedSubject, message);
          chatInput.value = "";
        }
      }
    });
  });
});