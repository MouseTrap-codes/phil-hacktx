import { OpenAI } from 'openai';

// initialize OpenAI
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// split text into chunks for embedding
export function chunkText(text: string, chunkSize: number = 500): string[] {
  // clsean up the text first
  const cleaned = text
    .replace(/[\r\n]+/g, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .trim();
  
  // split into sentences
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if ((currentChunk + trimmedSentence).length < chunkSize) {
      currentChunk += trimmedSentence + '. ';
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence + '. ';
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  
  return chunks;
}

// create embedding vector from text
export async function createEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI(); // Initialize here instead of at module level
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  
  return response.data[0].embedding;
}