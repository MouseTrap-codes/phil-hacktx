import { NextRequest } from 'next/server';

// Clean text for speech - convert markdown emphasis to natural speech emphasis
function cleanTextForSpeech(text: string): string {
  return text
    // Convert *word* to UPPERCASE for natural emphasis
    .replace(/\*([^*]+)\*/g, (match, word) => word.toUpperCase())
    // Remove any remaining asterisks
    .replace(/\*/g, '')
    // Remove brackets but keep content
    .replace(/\[([^\]]+)\]/g, '$1')
    // Remove markdown headers
    .replace(/#{1,6}\s/g, '')
    // Remove backticks
    .replace(/`/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Clean the text for speech
    const cleanedText = cleanTextForSpeech(text);
    
    // Call ElevenLabs API directly with Antoni voice
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/ErXwobaYiN019PkySvjV`, // Antoni
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!
        },
        body: JSON.stringify({
          text: cleanedText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return new Response(JSON.stringify({ error: 'Audio generation failed' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const audioBuffer = await response.arrayBuffer();
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      }
    });
    
  } catch (error) {
    console.error('Audio API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate audio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}