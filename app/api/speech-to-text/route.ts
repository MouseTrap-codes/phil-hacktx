import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return new Response(JSON.stringify({ error: 'no audio file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json'}
            });
        }

        // convert audio to base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');

        // use Gemini to transcribe
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp'});

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: audioFile.type,
                    data: base64Audio
                }
            },
            'Transcribe this audio to text. Only return the transcription, nothing else.'
        ]);

        const transcription = result.response.text();

        return new Response(JSON.stringify({transcription}),{
            headers: {'Content-Type': 'application/json'}
        });
    } catch (error) {
        console.error('Speech-to-text error:', error);
        return new Response(JSON.stringify({ error: 'Failed the transcribe audio'}),
        {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}