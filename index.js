import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!VOICE_ID || !API_KEY) {
  console.error("❌ Missing VOICE_ID or API_KEY in environment variables.");
  process.exit(1);
}

async function fetchAudio(text) {
  console.log("📤 Pošiljam tekst:", text);

  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.75
        }
      },
      responseType: 'stream'
    });

    const writer = fs.createWriteStream('output.mp3');
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log('✅ Audio saved to output.mp3');
    });

    writer.on('error', (err) => {
      console.error('❌ Error writing audio file:', err);
    });

  } catch (error) {
    console.error('❌ API request failed:', error.message);
  }
}

// 👇 Call it here
fetchAudio("Zdravo! Kako ti lahko pomagam?");
