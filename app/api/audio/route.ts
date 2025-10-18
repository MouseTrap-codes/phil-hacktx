import { ElevenLabsClient } from "elevenlabs";
import { NextRequest } from "next/server";

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return new Response(JSON.stringify({ error: 'no text provided'}), {
                status: 400,
                headers: {'Content-Type': 'application.json'}
            });
        }

        // generate audio with a calm, philosophical voice
        const audio = await elevenlabs.generate({
            voice: "pNInz6obpgDQGcFmaJgB",
            text: text,
            model_id: "elevenlabs_monolingual_v1"
        });

        // collect audio chunks
        const chunks: Uint8Array[] = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }

        // create blob
        const audioBuffer = Buffer.concat(chunks);

        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio.mpeg',
                'Content-Length': audioBuffer.length.toString()
            }
        });
    } catch (error) {
        console.error('Audio API error', error);
        return new Response(JSON.stringify({ error: 'failed to generate audio'}), {
            status: 500,
            headers: { 'Content-Type': 'application/json'}
        });
    }
}