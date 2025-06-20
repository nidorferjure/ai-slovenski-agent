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

  const text = completion.choices[0].message.content;

  const audio = await eleven.textToSpeech.convert({
    voiceId: process.env.VOICE_ID,
    modelId: "eleven_multilingual_v2",
    text: text,
    optimize_streaming_latency: 0,
      outputFormat: "mp3_44100_64"

  });

  res.setHeader("Content-Type", "audio/mpeg");
  audio.pipe(res);
});
