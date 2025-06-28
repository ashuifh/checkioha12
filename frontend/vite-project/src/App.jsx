import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiUpload, FiCamera, FiInfo, FiSend } from 'react-icons/fi';

const App = () => {
  const fileInputRef = useRef(null);
  const [photoname, setphotoname] = useState('');
  const [file, setfile] = useState('');
  const [inputvalue, setinputvalue] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [meals, setMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  

const DAILY_CALORIE_LIMIT = 1000;
const [showLimitPopup, setShowLimitPopup] = useState(false);

  const animatedCalories = useMotionValue(0);
  const springCalories = useSpring(animatedCalories, { duration: 0.6 });
  const displayCalories = useTransform(springCalories, latest => Math.floor(latest));
useEffect(() => {
  if (totalCalories > DAILY_CALORIE_LIMIT) {
    setShowLimitPopup(true);
  } else {
    setShowLimitPopup(false);
  }
}, [totalCalories]);
  const fetchMeals = async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await axios.get(`http://localhost:5000/calories/${today}`);
      setMeals(res.data.meals);
      setTotalCalories(res.data.totalCalories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

useEffect(() => {
  animatedCalories.set(totalCalories);
}, [totalCalories, animatedCalories]);

const dailyTotals = meals.reduce(
  (totals, meal) => ({
    calories: totals.calories + (meal.calorieValue || 0),
    protein: totals.protein + (meal.protein || 0),
    carbs: totals.carbs + (meal.carbs || 0),
    fiber: totals.fiber + (meal.fiber || 0),
    fat: totals.fat + (meal.fat || 0),
  }),
  { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 }
);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setphotoname(file.name);
      setfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const highlightCalories = (text) => {
    const calorieRegex = /(\d+)\s*( calories|kcal)/gi;
    return text.split('\n').map((line, i) => {
      if (!line) return null;
      const parts = line.split(calorieRegex);
      return (
        <p key={i} className="mb-2 text-gray-700">
          {parts.map((part, index) => {
            if (calorieRegex.test(part)) {
              calorieRegex.lastIndex = 0;
              return (
                <span key={index} className="bg-yellow-100 text-yellow-800 font-bold px-1 py-0.5 rounded">
                  {part}
                </span>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  const handleSubmit = async () => {
    if (!file || !inputvalue) {
      alert("Please select a photo and enter a description.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('description', inputvalue);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setResult(response.data.calories);
        setphotoname('');
        setfile('');
        setinputvalue('');
        setPreview(null);
        fetchMeals(); // refresh list
      } else {
        alert("Failed to upload photo.");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("An error occurred while uploading the photo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto overflow-hidden bg-white shadow-md rounded-xl md:max-w-2xl"
      >
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-indigo-600">Calorie Analyzer</h1>
            <p className="mt-2 text-gray-600">Upload your food photo to get calorie information</p>
          </div>

          <div className="space-y-6">
            <div
              onClick={handlePhotoClick}
              className={`group relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all 
                ${preview ? 'border-indigo-300' : 'border-gray-300 hover:border-indigo-400'}`}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="object-cover h-48 mx-auto rounded-lg shadow-sm"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-20">
                    <FiCamera className="text-2xl text-white transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 rounded-full bg-indigo-50">
                    <FiUpload className="text-2xl text-indigo-500" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {photoname || 'Click to upload food photo'}
                  </p>
                  <p className="text-xs text-gray-400">JPEG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiInfo className="text-gray-400" />
              </div>
              <input
                type="text"
                value={inputvalue}
                onChange={(e) => setinputvalue(e.target.value)}
                placeholder="Describe your meal (e.g., 'Cheeseburger with fries')"
                className="w-full py-3 pl-10 pr-4 transition-all border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white font-medium 
                ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} transition-all`}
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <FiSend />
                  <span>Get Calorie Count</span>
                </>
              )}
            </motion.button>
            {showLimitPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="p-8 text-center bg-white shadow-lg rounded-xl">
      <h2 className="mb-2 text-2xl font-bold text-red-600">Calorie Limit Exceeded!</h2>
      <p className="mb-4">You have exceeded your daily limit of {DAILY_CALORIE_LIMIT} calories.</p>
      <button
        className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
        onClick={() => setShowLimitPopup(false)}
      >
        OK
      </button>
    </div>
  </div>
)}
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="p-6 mt-6 border border-indigo-100 bg-indigo-50 rounded-xl"
              >
                <h3 className="mb-3 text-lg font-semibold text-indigo-700">Calorie Analysis</h3>
                <div className="prose prose-indigo">{highlightCalories(result)}</div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Meal section */}
      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="mb-2 text-xl font-bold">Today's Meals</h2>
        <div>
          Total Calories:{' '}
          <motion.span className="text-lg font-bold text-indigo-600">
            {displayCalories}
          </motion.span>
        </div>

        <div className="mt-4 space-y-4">
          {meals.map((meal) => (
            <motion.div
              key={meal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-4 bg-white border shadow rounded-xl"
            >
              <img
                src={`http://localhost:5000/${meal.photoPath}`}
                alt=""
                className="h-24 mb-2 rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="font-semibold">{meal.description}</div>
              <div className="text-indigo-700">{meal.calories}</div>
              <div className="text-xs text-gray-400">{new Date(meal.date).toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;