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
    const { prompt } = req.body;

    // 1. OpenAI odgovor
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: false,
      messages: [
        { role: "system", content: "Odgovarjaj kot prijazen, profesionalen AI asistent v popolni slovenščini." },
        { role: "user", content: prompt }
      ]
    });

    const fullText = completion.choices[0]?.message?.content || "";
    console.log("🧠 GPT odgovor:", fullText);

    // 2. Pretvorba teksta v glas
    const audio = await eleven.textToSpeech.convert({
      voiceId: process.env.VOICE_ID,
      modelId: "eleven_multilingual_v2",
      text: fullText,
      voiceSettings: {
        stability: 0.4,
        similarity_boost: 0.7
      }
    });

    // 3. Pošlji MP3 kot odgovor
    res.setHeader("Content-Type", "audio/mpeg");
    audio.pipe(res);
  } catch (error) {
    console.error("❌ Napaka:", error);
    res.status(500).send("Napaka pri obdelavi zahteve.");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Slovenian AI agent running at http://localhost:${port}`);
});
