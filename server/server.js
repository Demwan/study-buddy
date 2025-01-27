import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Groq } from "groq-sdk";
import fs from "fs/promises";
import promt from "./promt.js";
dotenv.config();

// Initialize express and configurations
const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const port = 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(path.resolve(), "public")));

// Serve index.html at root route
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

// Chat state management
let chatHistory = [];
let subjectContext = "";

// AI response handler
async function getGroqChatCompletion(messages) {
  try {
    const response = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
    });
    return response.choices[0]?.message?.content || "No response received.";
  } catch (error) {
    console.error("Error fetching response:", error);
    return "Error retrieving response: " + error;
  }
}

// Load subject content from files
async function getSubjectContent(subject) {
  try {
    const filePath = path.join(path.resolve(), "server", "uploads", `${subject}.txt`);
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading ${subject} file:`, error);
    return null;
  }
}

// Chat endpoint handler
app.post("/chat", async (req, res) => {
  const { subject, message } = req.body;

  if (!message || !subject) {
    return res.status(400).json({ response: "Message or subject missing." });
  }

  // Reset context if subject changes
  if (subject !== subjectContext) {
    subjectContext = subject;
    const subjectContent = await getSubjectContent(subject);
    
    // Create system message with subject content
    const systemMessage = `You want to help students with the subject: ${subject}. 
    Use the following subject content as a basis for your answers:\n${subjectContent}
    ${promt}`;

    // Reset chat history with new context
    chatHistory = [
      {
        role: "system",
        content: systemMessage,
      },
    ];
  }

  // Update chat history with user message
  chatHistory.push({ role: "user", content: message });

  // Get AI response and update chat history
  const aiResponse = await getGroqChatCompletion(chatHistory);
  chatHistory.push({ role: "assistant", content: aiResponse });

  return res.json({ response: aiResponse });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
