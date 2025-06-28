import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import Meal from './models/Meal.js';
mongoose.connect('mongodb://localhost:27017/mealTracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
  
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

    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = imageBuffer.toString('base64');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      `Analyze this food image and description: "${description}". Provide the estimated calorie count, protein (g), carbs (g), fiber (g), and fat (g) in a clear, labeled format.`,
      {
        inlineData: {
          mimeType: file.mimetype,
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const calories = response.text();
    console.log('Gemini response:', calories);

  const getNutrient = (label) => {
  const match = calories.match(new RegExp(`${label}\\s*:?\\s*([\\d\\.]+)\\s*g?`, 'i'));
  return match ? parseFloat(match[1]) : 0;
};

const protein = getNutrient('protein');
const carbs = getNutrient('carbs');
const fiber = getNutrient('fiber');
const fat = getNutrient('fat');
let calorieValue = 0;
const calorieRegex = /(\d+)\s*(?:calories?|kcal)|(?:calories?|kcal)\s*[:\-]?\s*(\d+)/i;
const match = calories.match(calorieRegex);
if (match) {
  calorieValue = parseInt(match[1] || match[2], 10);
}

    const meal = new Meal({
     photoPath: file.path,
  description,
  calories,
  calorieValue,
  protein,
  carbs,
  fiber,
  fat,
  date: new Date()
    });
    await meal.save();

    res.json({ calories });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze food' });
  }
});

app.get('/calories/:date', async (req, res) => {
  const date = new Date(req.params.date);
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + 1);

  const meals = await Meal.find({
    date: { $gte: date, $lt: nextDate }
  });

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calorieValue || 0), 0);
  res.json({ totalCalories, meals });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});