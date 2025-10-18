import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { createEmbedding } from '@/lib/embeddings';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('phil');

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    
    // Get relevant philosophical passages using RAG
    const queryEmbedding = await createEmbedding(lastMessage);
    const results = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true
    });
    
    // build context from retrieved passages
    const context = results.matches
      .map(m => `[${m.metadata?.philosopher}]: ${m.metadata?.text}`)
      .join('\n\n');
    
    // build conversation history
    type Message = {
        role: string,
        content: string
    };

    const conversationHistory = messages.slice(0, -1)
      .map((m: Message) => `${m.role === 'user' ? 'User' : 'Phil'}: ${m.content}`)
      .join('\n');
    
    // create the full prompt with system instructions
    const fullPrompt = `You are Phil, a thoughtful AI companion trained in ancient Stoic philosophy. You help people reflect on their challenges using philosophical wisdom.

Key principles:
- Ask Socratic questions to help users discover insights themselves
- Reference the philosophical passages naturally (mention which philosopher when relevant)
- Maintain a calm, thoughtful, non-judgmental tone
- Focus on what's within their control (a core Stoic principle)
- Avoid giving direct advice; guide reflection instead
- Keep responses concise (2-4 sentences max) - this is a conversation, not a lecture

Relevant philosophical wisdom:
${context}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ''}
User: ${lastMessage}

Phil:`;

    // Generate response with Gemini
    const result = await model.generateContentStream(fullPrompt);
    
    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}