import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔑 API Key loaded:', apiKey ? 'Yes' : 'No');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }
  
  console.log('🔑 API Key preview:', apiKey.substring(0, 15) + '...');
  console.log('\n📋 Testing Gemini models with billing...\n');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTry = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-exp-1206',
    'gemini-2.0-flash-thinking-exp-1219'
  ];
  
  let foundWorkingModel = false;
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`⏳ Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in 3 words');
      const text = result.response.text();
      
      console.log(`✅ ${modelName} WORKS!`);
      console.log(`   Response: ${text}`);
      console.log(`   ✨ Billing is active!\n`);
      
      foundWorkingModel = true;
      break; // Stop after first working model
      
    } catch (e: any) {
      if (e.status === 429) {
        console.log(`❌ ${modelName} - Rate limit (429)`);
        console.log(`   Error: ${e.message.substring(0, 100)}...`);
        
        // Check if it's quota or rate limit
        if (e.message.includes('quota')) {
          console.log(`   ⚠️  Still on free tier quota!`);
          console.log(`   Action needed: Create NEW API key in billing-enabled project\n`);
        } else {
          console.log(`   ⚠️  Rate limited - try again in a moment\n`);
        }
      } else if (e.status === 400) {
        console.log(`❌ ${modelName} - Invalid request (400)`);
        console.log(`   This model might not exist or isn't available\n`);
      } else if (e.status === 403) {
        console.log(`❌ ${modelName} - Access denied (403)`);
        console.log(`   API might not be enabled in your project\n`);
      } else {
        console.log(`❌ ${modelName} - Error: ${e.message.substring(0, 100)}\n`);
      }
    }
  }
  
  if (!foundWorkingModel) {
    console.log('\n❌ No working models found!');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Go to https://console.cloud.google.com/billing');
    console.log('2. Ensure your project has billing enabled');
    console.log('3. Go to https://aistudio.google.com/app/apikey');
    console.log('4. Create a NEW API key in your billing-enabled project');
    console.log('5. Replace GEMINI_API_KEY in .env.local with the new key');
    console.log('6. Wait 5-10 minutes for changes to propagate');
    console.log('7. Run this test again');
  } else {
    console.log('\n🎉 Success! Your Gemini API with billing is working correctly!');
  }
}

test();