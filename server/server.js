import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";

dotenv.config();

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Use import.meta.url to get the current directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Define the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Your chat route
app.post("/chat", async (req, res) => {
  const { subject, message } = req.body; // Now this should work correctly

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Je bent een AI die studenten helpt met ${subject}.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama3-8b-8192", // Adjust the model if needed
    });

    const botResponse = response.choices[0]?.message?.content || "Geen antwoord.";
    res.json({ response: botResponse });
  } catch (error) {
    console.error("Error with Groq API:", error);
    res.status(500).json({ response: "Er ging iets mis met de AI." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
