document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
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
  let storedMessage = ""; // Store message while selecting subject on mobile

  // Subject selection handlers
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

  // Screen transition functions
  function transitionToChatScreen(subject) {
    selectedSubjectHeader.textContent = subject;
    starterScreen.style.display = "none";
    chatScreen.classList.add("active");
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function transitionToStarterScreen() {
    starterScreen.style.display = "flex";
    chatScreen.classList.remove("active");
    chatMessages.innerHTML = ""; // Clear chat messages
    selectedSubjectHeader.innerHTML = ""; // Clear selected subject
  }

  // Mobile menu handlers
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const nav = document.querySelector("nav");
  const overlay = document.querySelector(".overlay");

  hamburgerMenu.addEventListener("click", () => {
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

  // Text formatting function for chat messages
  function formatText(text) {
    // Add a new line for each \n in the text
    text = text.replace(/\n/g, "<br />");

    // Replace **text** with <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Replace *text* with <em>text</em>
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Process unordered lists (starts with a '-' followed by a space)
    text = text.replace(/^- (.*?)(?=\n|$)/gm, "<ul><li>$1</li></ul>");

    // Process ordered lists (starts with a number followed by a dot)
    text = text.replace(/^\d+\. (.*?)(?=\n|$)/gm, "<ol><li>$1</li></ol>");

    // Ensure multiple li's in a list are correctly enclosed in list tags
    text = text.replace(/(<ul><li>.*?<\/li><\/ul>)/g, function (match) {
      return `<ul>${match.replace(/<\/li><\/ul>/g, "</li>").replace(/<ul>/g, "")}</ul>`;
    });

    text = text.replace(/(<ol><li>.*?<\/li><\/ol>)/g, function (match) {
      return `<ol>${match.replace(/<\/li><\/ol>/g, "</li>").replace(/<ol>/g, "")}</ol>`;
    });

    return text;
  }

  // Error handling display
  function showError(element, message) {
    element.textContent = message;
    element.classList.add("visible");
    setTimeout(() => {
      element.classList.remove("visible");
    }, 3000);
  }

  // Main message sending function
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

    // Add the user's message to the chat
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show loading indicator
    chatMessages.innerHTML += 
      `<div class="bot-message loading-message" style="background-color: var(--${selectedSubject}-background)">
         <div class="spinner"></div>
       </div>`;

    // Send the message to the server
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
        // Remove loading indicator
        const loadingEl = chatMessages.querySelector(".loading-message");
        if (loadingEl) loadingEl.remove();
        // Process the bot response and apply text formatting
        const formattedResponse = formatText(data.response);
        chatMessages.innerHTML += `<div class="bot-message" style="background-color: var(--${selectedSubject}-background)">${formattedResponse}</div>`;
      })
      .catch((error) => {
        const loadingEl = chatMessages.querySelector(".loading-message");
        if (loadingEl) loadingEl.remove();
        console.error("Fout:", error);
        chatMessages.innerHTML += `<div class="bot-message" style="background-color: var(--${selectedSubject}-background)">Er ging iets mis. Probeer het later opnieuw.</div>`;
      });
  }

  // Event listener for sending message from starter screen
  sendButton.addEventListener("click", () => {
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

    sendMessageToServer(selectedSubject, message);
    userInput.value = "";
    transitionToChatScreen(selectedSubject);
  });

  // Event listener for sending message from chat screen
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

  // Message input handlers
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

  // Update the sendButton click handler
  sendButton.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (!selectedSubject) {
      if (window.innerWidth < 769) {
        storedMessage = message;
        userInput.blur(); // Add this to remove focus
        nav.classList.add("nav-visible");
        hamburgerMenu.classList.add("active");
        overlay.classList.add("active");
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

    // Add the user's message to the chat
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show loading indicator
    chatMessages.innerHTML += 
      `<div class="bot-message loading-message" style="background-color: var(--${selectedSubject}-background)">
         <div class="spinner"></div>
       </div>`;

    // Send the message to the server
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
        // Remove loading indicator
        const loadingEl = chatMessages.querySelector(".loading-message");
        if (loadingEl) loadingEl.remove();
        // Process the bot response and apply text formatting
        const formattedResponse = formatText(data.response);
        chatMessages.innerHTML += `<div class="bot-message" style="background-color: var(--${selectedSubject}-background)">${formattedResponse}</div>`;
        // chatMessages.scrollTop = chatMessages.scrollHeight; // Disable auto-scroll here
      })
      .catch((error) => {
        const loadingEl = chatMessages.querySelector(".loading-message");
        if (loadingEl) loadingEl.remove();
        console.error("Fout:", error);
        chatMessages.innerHTML += `<div class="bot-message" style="background-color: var(--${selectedSubject}-background)">Er ging iets mis. Probeer het later opnieuw.</div>`;
      });
  }

  // Text area auto-resize functionality
  function autoResize(element) {
    element.style.height = 'auto';
    const scrollHeight = element.scrollHeight;
    const maxHeight = parseInt(window.getComputedStyle(element).maxHeight);
    element.style.height = Math.min(scrollHeight, maxHeight) + 'px';

    // Only manage overflow
    element.style.overflowY = scrollHeight >= maxHeight ? 'auto' : 'hidden';
    // Remove dynamic padding

    if (!element.dataset.isMaxHeight && scrollHeight >= maxHeight) {
      element.dataset.isMaxHeight = "true";
    } else if (element.dataset.isMaxHeight === "true" && scrollHeight < maxHeight) {
      element.dataset.isMaxHeight = "";
    }
  }

  // Initialize auto-resize for text inputs
  [userInput, chatInput].forEach(input => {
    input.style.overflowY = 'hidden';
    
    input.addEventListener('input', (e) => {
      autoResize(e.target);
    });
  });

  // Handle Enter and Shift+Enter in text inputs
  [userInput, chatInput].forEach(input => {
    input.addEventListener('keydown', (event) => {
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