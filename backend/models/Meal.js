import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  photoPath: String,
  description: String,
  calories: String,      // Full AI response
  calorieValue: Number,  // Only the number
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Meal', mealSchema);