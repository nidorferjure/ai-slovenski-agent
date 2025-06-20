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
  const { prompt } = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: false,
    messages: [
      { role: "system", content: "Odgovarjaj kot prijazen, profesionalen AI asistent v popolni slovenščini." },
      { role: "user", content: prompt }
    ]
  });

  let fullText = "";
  for await (const chunk of completion) {
    const part = chunk.choices?.[0]?.delta?.content || "";
    fullText += part;
    process.stdout.write(part);
  }

  const audio = await eleven.textToSpeech.convert({
    voiceId: process.env.VOICE_ID,
    modelId: "eleven_multilingual_v2",
    text: fullText,
    voiceSettings: { stability: 0.4, similarity_boost: 0.7 }
  });

  res.setHeader("Content-Type", "audio/mpeg");
  audio.pipe(res);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Slovenian AI agent running at http://localhost:${port}`);
});

