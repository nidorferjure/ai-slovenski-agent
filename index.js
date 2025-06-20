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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Odgovarjaj kot prijazen, profesionalen AI asistent v popolni slovenščini.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      console.error("Prazno besedilo iz OpenAI.");
      return res.status(500).send("Napaka: prazno besedilo iz OpenAI.");
    }

    const audio = await eleven.textToSpeech.convert({
      voiceId: process.env.VOICE_ID,
      modelId: "eleven_multilingual_v2",
      text,
      outputFormat: "mp3_44100_64",
      optimizeStreamingLatency: 0,
    });

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audio));
  } catch (error) {
    console.error("Napaka:", error);
    res.status(500).send("Napaka pri generiranju odgovora.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
