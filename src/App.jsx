import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage || !description) {
      alert('Please select an image and add a description');
      return;
    }

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI('YOUR_GEMINI_API_KEY');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      const prompt = `Analyze this food image and tell me the approximate calorie content. Description provided: ${description}`;
      
      const result = await model.generateContent([prompt, selectedImage]);
      const response = await result.response;
      setCalories(response.text());
    } catch (error) {
      console.error('Error:', error);
      alert('Error analyzing the image');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">Food Calorie Detector</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Food Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-md"
              />
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected food"
                  className="mt-4 max-h-64 mx-auto rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="Describe the food..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Analyzing...' : 'Get Calorie Information'}
            </button>

            {calories && (
              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <h2 className="text-lg font-semibold text-green-800">Analysis Result:</h2>
                <p className="text-green-700">{calories}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;