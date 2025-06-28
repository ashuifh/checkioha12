import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  photoPath: String,
  description: String,
  calories: String,
  calorieValue: Number,
  protein: Number,
  carbs: Number,
  fiber: Number,
  fat: Number,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Meal', mealSchema);