const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files (index.html) from the project root
app.use(express.static(__dirname));

// Rewrite endpoint
app.post("/api/rewrite", async (req, res) => {
  try {
    const { message, tone, style, userStyle } = req.body;

    if (!message || !tone) {
      return res.status(400).json({ error: "message and tone are required" });
    }

    const styleText =
      style && style !== "Default"
        ? `The user also wants this rewrite style: "${style}".`
        : "Keep the length and strength similar to the original unless a style is specified.";

    const personalStyleText =
      userStyle && userStyle.trim().length > 0
        ? `Here are samples of how the user naturally writes. Match this writing style closely (vocabulary, rhythm, and formality level):\n\n${userStyle}`
        : "";

    const instructions = `
You are an assistant that rewrites the user's message in a different style and tone.

Tone:
"${tone}"

Rewrite style preference:
${styleText}

Personal writing style (if provided):
${personalStyleText}

Rules:
- Keep the original meaning.
- Do NOT add new facts or details that weren't implied.
- Make the output feel natural and human.
- Return EXACTLY 3 different phrasings, numbered "1.", "2.", and "3." on separate lines.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions,
      input: message,
    });

    const fullText = response.output_text;
    res.json({ result: fullText });
  } catch (err) {
    console.error("Rewrite error:", err);
    res
      .status(500)
      .json({ error: "Failed to rewrite message. Please try again." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`RealTalk API running on port ${port}`);
});