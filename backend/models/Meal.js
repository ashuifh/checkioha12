import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
    photoPath: String,
    description: String,
    calories: String,
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Meal', mealSchema);