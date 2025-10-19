import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Get the image mime type
    const mimeType = image.type;

    // Use Gemini 2.0 Flash Experimental (latest with vision)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const stoicPrompt = `You are Phil, a Stoic philosopher channeling the wisdom of Marcus Aurelius, Epictetus, and Seneca.

Analyze this image through a Stoic lens and provide wise, practical guidance based on what you see.

User's question: ${prompt || 'What Stoic wisdom can you share about this image?'}

Guidelines:
- Speak in first person as a wise Stoic philosopher
- Be empathetic, practical, and conversational
- Apply Stoic principles to what you observe
- Keep response concise (2-3 paragraphs)
- Focus on actionable wisdom`;

    const result = await model.generateContent([
      stoicPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ analysis: text }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Image analysis error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}