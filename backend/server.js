import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const description = req.body.description;
    const file = req.file;

    if (!file || !description) {
      return res.status(400).json({ error: 'Photo and description are required.' });
    }

    // Read the image file as base64
    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = imageBuffer.toString('base64');

   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      `Analyze this food image and description: "${description}". Provide the estimated calorie count and tell me about this fruit. Be concise.`,
      {
        inlineData: {
          mimeType: file.mimetype,
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const calories = response.text();

    res.json({ calories });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze food' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});