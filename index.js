import express from "express";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { ElevenLabsClient } from "elevenlabs";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const eleven = new ElevenLabsClient({ apiKey: process.env.ELEVEN_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Odgovarjaj kot prijazen, profesionalen AI asistent v popolni slovenščini." },
        { role: "user", content: prompt }
      ]
    });

    const reply = completion.choices[0].message.content;

    const audioStream = await eleven.textToSpeech.convert({
      voiceId: process.env.VOICE_ID,
      modelId: "eleven_multilingual_v2",
      text: reply,
      voiceSettings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    });

    res.setHeader("Content-Type", "audio/mpeg");
    audioStream.pipe(res);
  } catch (err) {
    console.error("❌ Napaka pri generiranju:", err);
    res.status(500).json({ error: "Napaka pri generiranju glasu." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Slovenian AI agent listening at http://localhost:${port}`);
});
