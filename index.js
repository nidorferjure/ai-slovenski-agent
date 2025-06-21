import express from 'express';
import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.VOICE_ID;

app.post('/synthesize', async (req, res) => {
  const text = req.body.text || "Pozdravljeni, kako vam lahko pomagam?";
  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      data: {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8
        }
      },
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (error) {
    console.error('Error generating audio:', error.message);
    res.status(500).send('Error generating audio');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
