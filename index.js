import dotenv from "dotenv";
dotenv.config(); // mora biti čisto na vrhu

import express from "express";
import { OpenAI } from "openai";
import { ElevenLabsClient } from "elevenlabs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const eleven = new ElevenLabsClient({ apiKey: process.env.ELEVEN_API_KEY });

// Debug izpisi za preverjanje ključev
console.log("🔑 OpenAI:", process.env.OPENAI_API_KEY?.slice(0, 10));
console.log("🔊 ElevenLabs:", process.env.ELEVEN_API_KEY?.slice(0, 10));
console.log("🎤 Voice ID:", process.env.VOICE_ID);

app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    // 1. Ustvari odgovor z OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: false,
      messages: [
        { role: "system", content: "Odgovarjaj kot prijazen, profesionalen AI asistent v popolni slovenščini." },
        { role: "user", content: prompt }
      ]
    });

    const fullText = completion.choices[0].message.content;
    console.log("🧠 GPT odgovor:", fullText);

    // 2. Pretvori besedilo v govor z ElevenLabs
    const audioStream = await eleven.textToSpeech.convert({
      voiceId: process.env.VOICE_ID,
      modelId: "eleven_multilingual_v2",
      text: fullText,
      voiceSettings: {
        stability: 0.4,
        similarity_boost: 0.7
      }
    });

    // 3. Pretvori stream v enoten buffer
    const buffers = [];
    for await (const chunk of audioStream) {
      buffers.push(chunk);
    }
    const mp3Buffer = Buffer.concat(buffers);

    // 4. Pošlji mp3 kot odgovor
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(mp3Buffer);
  } catch (error) {
    console.error("❌ Napaka:", error);
    res.status(500).send("Napaka pri generiranju odgovora.");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Slovenian AI agent running at http://localhost:${port}`);
});
