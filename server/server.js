import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Groq } from "groq-sdk";
import fs from "fs/promises";
import promt from "./promt.js";
dotenv.config();

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const port = 3000;

// Body parser om JSON-data te verwerken
app.use(bodyParser.json());

// Stel statische bestanden in (bijv. HTML, CSS, JS)
app.use(express.static(path.join(path.resolve(), "public")));

// Root route die het index.html bestand serveert
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

// Chatgeschiedenis bijhouden
let chatHistory = [];
let subjectContext = "";

async function getGroqChatCompletion(messages) {
  try {
    const response = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile", // Het Groq-model dat je gebruikt (pas dit aan indien nodig)
    });
    return response.choices[0]?.message?.content || "Geen antwoord ontvangen.";
  } catch (error) {
    console.error("Fout bij het ophalen van antwoord:", error);
    return "Er ging iets mis bij het ophalen van het antwoord.";
  }
}

async function getSubjectContent(subject) {
  try {
    const filePath = path.join(path.resolve(), "server", "uploads", `${subject}.txt`);
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Fout bij het lezen van ${subject} bestand:`, error);
    return null;
  }
}

app.post("/chat", async (req, res) => {
  const { subject, message } = req.body;

  if (!message || !subject) {
    return res.status(400).json({ response: "Bericht of vak ontbreekt." });
  }

  // Update de subjectcontext indien nodig
  if (subject !== subjectContext) {
    subjectContext = subject;
    
    // Lees de vakinhoud
    const subjectContent = await getSubjectContent(subject);
    
    // Maak het systeem bericht met de vakinhoud
    const systemMessage = `Jij wilt studenten helpen met het vak: ${subject}. 
    ${subjectContent ? `\n\nGebruik de volgende vakinhoud als basis voor je antwoorden:\n${subjectContent}` : ''}
    \n${promt}`;

    // Reset chatgeschiedenis met nieuwe context
    chatHistory = [
      {
        role: "system",
        content: systemMessage,
      },
    ];
  }

  // Voeg het bericht van de gebruiker toe aan de chatgeschiedenis
  chatHistory.push({ role: "user", content: message });

  // Stuur de chatgeschiedenis door naar de AI
  const aiResponse = await getGroqChatCompletion(chatHistory);

  // Voeg de reactie van de bot toe aan de chatgeschiedenis
  chatHistory.push({ role: "assistant", content: aiResponse });

  // Stuur de reactie terug naar de frontend
  return res.json({ response: aiResponse });
});

app.listen(port, () => {
  console.log(`Server draait op port: ${port}`);
});
