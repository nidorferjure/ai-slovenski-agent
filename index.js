import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  try {
    // 1. Get GPT response
    const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Odgovarjaj kot prijazen AI asistent v slovenščini." },
          { role: "user", content: prompt }
        ]
      })
    });

    const gptData = await gptResponse.json();
    const reply = gptData.choices[0].message.content;

    // 2. Get MP3 from ElevenLabs
    const audioResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: reply,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.7
        }
      })
    });

    if (!audioResponse.ok) {
      const error = await audioResponse.text();
      throw new Error("Audio fetch failed: " + error);
    }

    res.setHeader("Content-Type", "audio/mpeg");
    audioResponse.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Napaka pri generiranju odgovora.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Slovenski AI agent posluša na http://localhost:${PORT}`);
});
