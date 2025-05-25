import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/analyze-food', async (req, res) => {
  try {
    const { image, description } = req.body;

    // Remove the data:image/[type];base64, prefix
    const base64Image = image.split(',')[1];
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const result = await model.generateContent([
      "Analyze this food image and provide the estimated calorie count. Be concise.",
      {
        inlineData: {
          mimeType: "image/jpeg",
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});