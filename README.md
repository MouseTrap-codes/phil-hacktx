# Phil - AI-Powered Stoic Philosopher 🏛️

Your personal Stoic philosopher for student mental health. Phil combines ancient wisdom with modern AI to provide personalized guidance through stress, anxiety, and life's challenges.

Built for HackTX 2025

## Features

- **RAG-Powered Responses** - Retrieves from 1000+ embedded Stoic texts via Pinecone
- **Multi-Modal Input** - Text, voice, and vision analysis
- **Natural Voice Output** - ElevenLabs text-to-speech
- **Dual Themes** - Ancient Greek & Cosmic Space aesthetics
- **Real-Time Streaming** - Responses appear as they're generated
- **Privacy-First** - No login, no tracking, local storage only

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI Services**: Google Gemini (Text, Vision, Embeddings), ElevenLabs (TTS)
- **Vector DB**: Pinecone Serverless
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- API Keys:
  - [Google AI Studio](https://makersuite.google.com/app/apikey) (Gemini)
  - [Pinecone](https://www.pinecone.io/) (Vector DB)
  - [ElevenLabs](https://elevenlabs.io/) (Voice)

### Installation
```bash
# Clone the repository
git clone https://github.com/[your-username]/phil-stoic-ai.git
cd phil-stoic-ai

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Add your API keys to .env.local
```

### Environment Variables
```env
GEMINI_API_KEY=your_google_ai_studio_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure
```
phil-stoic-ai/
├── app/
│   ├── api/
│   │   ├── chat/              # RAG-powered chat endpoint
│   │   ├── analyze-image/     # Gemini Vision analysis
│   │   ├── audio/             # Text-to-speech
│   │   └── speech-to-text/    # Voice transcription
│   ├── page.tsx               # Main chat interface
│   └── layout.tsx
├── public/
└── package.json
```

## 🎯 How It Works

1. **User Input** - Text, voice, or image
2. **Embedding Generation** - Convert query to 768-dim vector
3. **Vector Search** - Find top 3 relevant Stoic passages (Pinecone)
4. **Context Injection** - Add passages to Gemini prompt
5. **Response Generation** - Stream personalized Stoic wisdom
6. **Voice Output** -  ElevenLabs TTS

## Awards & Recognition

- HackTX 2025 Submission

## 📝 License

MIT

## 🙏 Acknowledgments

- Google for Gemini API
- Pinecone for vector database
- ElevenLabs for voice synthesis
- Marcus Aurelius, Epictetus, and Seneca for the wisdom

---

**Live Demo**: phil-hacktx2025.vercel.app 
**DevPost**: https://devpost.com/software/phil-x3erld
**Demo Video**: https://youtu.be/G8_7mKYN03U 

Live demo will be disabled after hackathon.

Built by Pranav Battini.
