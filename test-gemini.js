// test-gemini.js - Test script to check available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env.local' });

async function testGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
    return;
  }

  console.log('API Key found:', apiKey.substring(0, 10) + '...');
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // List of models to test
  const modelsToTest = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro", 
    "gemini-pro",
    "gemini-1.0-pro"
  ];

  console.log('Testing available Gemini models...\n');

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("Test prompt: Say 'Hello'");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} - SUCCESS`);
      console.log(`   Response: ${text.substring(0, 50)}...\n`);
      break; // Use the first working model
    } catch (error) {
      console.log(`❌ ${modelName} - FAILED`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
}

// Run the test
testGeminiModels().catch(console.error);
