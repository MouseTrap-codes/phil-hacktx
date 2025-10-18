import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  console.log('\n📋 Listing available models...\n');
  
  // Try different model names
  const modelsToTry = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-exp-1206',
    'gemini-2.0-flash-thinking-exp-1219'
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in 3 words');
      console.log(`✅ ${modelName} WORKS!`);
      console.log(`   Response: ${result.response.text()}\n`);
      break; // Stop after first working model
    } catch (e: any) {
      console.log(`❌ ${modelName} failed\n`);
    }
  }
}

test();