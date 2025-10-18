'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: string;
  content: string;
};

type Theme = 'space' | 'ancient';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [theme, setTheme] = useState<Theme>('space');
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAudio = async (text: string) => {
    if (!audioEnabled || !text) return;
    
    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!res.ok) throw new Error('Audio generation failed');
      
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });
      
      if (!res.ok) throw new Error('Failed to get response');
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiMessage = '';
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        aiMessage += decoder.decode(value);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = aiMessage;
          return newMessages;
        });
      }
      
      setLoading(false);
      
      if (audioEnabled && aiMessage) {
        await playAudio(aiMessage);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
  };

  const examplePrompts = [
    "I'm feeling overwhelmed with work",
    "How do I deal with anxiety?",
    "I'm struggling with a difficult decision",
    "How can I be more resilient?"
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-700 ${
      theme === 'space' 
        ? 'bg-[#0a0118]'
        : 'bg-[#faf6f0]'
    }`}>
      
      {/* Background Decorative Elements */}
      {theme === 'space' ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
          {/* Starfield */}
          {[...Array(100)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute bg-white rounded-full animate-twinkle"
              suppressHydrationWarning
              style={{
                width: Math.random() > 0.8 ? Math.random() * 3 + 2 + 'px' : Math.random() * 2 + 1 + 'px',
                height: Math.random() > 0.8 ? Math.random() * 3 + 2 + 'px' : Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                animationDuration: Math.random() * 3 + 2 + 's',
                opacity: Math.random() * 0.7 + 0.3,
                boxShadow: Math.random() > 0.7 ? '0 0 4px rgba(255,255,255,0.8)' : 'none'
              }}
            />
          ))}
          
          {/* Nebula clouds */}
          <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-purple-600 opacity-20 blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600 opacity-15 blur-[150px] animate-float-delayed" />
          <div className="absolute top-1/2 right-1/3 w-80 h-80 rounded-full bg-pink-600 opacity-10 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-indigo-600 opacity-15 blur-[90px] animate-float" />
          
          {/* Distant planets */}
          <div className="absolute top-32 right-20 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-70 shadow-2xl animate-float-slow" 
               style={{boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)'}} />
          <div className="absolute bottom-40 left-32 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-60 shadow-2xl animate-float" 
               style={{boxShadow: '0 0 30px rgba(96, 165, 250, 0.4)'}} />
          <div className="absolute top-1/3 left-1/4 w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 opacity-50 shadow-xl animate-float-delayed" 
               style={{boxShadow: '0 0 25px rgba(244, 114, 182, 0.3)'}} />
          
          {/* Ring around planet */}
          <div className="absolute top-32 right-20 w-32 h-32 rounded-full border-2 border-purple-400 opacity-30 animate-spin-slow" 
               style={{transform: 'rotateX(75deg) rotateZ(20deg)'}} />
          
          {/* Orbital paths */}
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full border border-white opacity-5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full border border-white opacity-3 -translate-x-1/2 -translate-y-1/2" />
          
          {/* Distant galaxies */}
          <div className="absolute top-1/4 left-1/3 w-8 h-8 rounded-full bg-white opacity-20 blur-sm animate-float-slow" />
          <div className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-white opacity-15 blur-sm animate-float" />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Elegant Greek columns - properly structured */}
          {/* Left colonnade */}
          <div className="absolute bottom-0 left-8 flex flex-col items-center opacity-25">
            <div className="w-12 h-8 bg-gradient-to-b from-[#e8d4bf] to-[#d4c0ab] rounded-t-xl shadow-md" />
            <div className="w-9 h-[28rem] bg-gradient-to-r from-[#ede2d3] via-[#f5e6d3] to-[#ede2d3] shadow-xl" 
                 style={{
                   background: 'linear-gradient(90deg, #ede2d3 0%, #f5e6d3 15%, #faf0e6 50%, #f5e6d3 85%, #ede2d3 100%)',
                   boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
                 }} />
            <div className="w-14 h-8 bg-gradient-to-t from-[#d4c0ab] to-[#e8d4bf] shadow-md" style={{clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)'}} />
          </div>
          
          {/* Right colonnade */}
          <div className="absolute bottom-0 right-8 flex flex-col items-center opacity-25">
            <div className="w-12 h-8 bg-gradient-to-b from-[#e8d4bf] to-[#d4c0ab] rounded-t-xl shadow-md" />
            <div className="w-9 h-[28rem] bg-gradient-to-r from-[#ede2d3] via-[#f5e6d3] to-[#ede2d3] shadow-xl" 
                 style={{
                   background: 'linear-gradient(90deg, #ede2d3 0%, #f5e6d3 15%, #faf0e6 50%, #f5e6d3 85%, #ede2d3 100%)',
                   boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
                 }} />
            <div className="w-14 h-8 bg-gradient-to-t from-[#d4c0ab] to-[#e8d4bf] shadow-md" style={{clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)'}} />
          </div>
          
          {/* Pediment (triangular roof element) at top center */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 opacity-20">
            <div className="w-full h-24 bg-gradient-to-b from-[#e8d4bf] to-transparent" 
                 style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
          </div>
          
          {/* Horizontal frieze (decorative band) */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-4 bg-gradient-to-r from-transparent via-[#e8d4bf] to-transparent opacity-15" />
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-2"
               style={{
                 backgroundImage: 'repeating-linear-gradient(90deg, #d4a574 0px, #d4a574 20px, transparent 20px, transparent 40px)',
                 opacity: 0.15
               }} />
          
          {/* Greek meander (key pattern) borders - refined */}
          <div className="absolute top-1/4 left-16 opacity-15 animate-float-slow">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <path d="M 10 10 L 70 10 L 70 30 L 30 30 L 30 50 L 70 50 L 70 70 L 10 70 L 10 50 L 50 50 L 50 30 L 10 30 Z" 
                    fill="none" stroke="#c89860" strokeWidth="3" />
            </svg>
          </div>
          
          <div className="absolute bottom-1/4 right-16 opacity-12 animate-float">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <path d="M 10 10 L 70 10 L 70 30 L 30 30 L 30 50 L 70 50 L 70 70 L 10 70 L 10 50 L 50 50 L 50 30 L 10 30 Z" 
                    fill="none" stroke="#d4a574" strokeWidth="3" />
            </svg>
          </div>
          
          {/* Olive/Laurel wreaths - symbols of victory and wisdom */}
          <div className="absolute top-20 right-1/4 opacity-20 animate-spin-slow">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#8b9f6f" strokeWidth="6" strokeDasharray="8 4" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#a8b88d" strokeWidth="3" strokeDasharray="6 3" />
            </svg>
          </div>
          
          <div className="absolute bottom-1/3 left-1/4 opacity-15 animate-spin-slower">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="28" fill="none" stroke="#8b9f6f" strokeWidth="5" strokeDasharray="6 3" />
              <circle cx="40" cy="40" r="35" fill="none" stroke="#a8b88d" strokeWidth="2" strokeDasharray="5 2" />
            </svg>
          </div>
          
          {/* Classical Greek pottery silhouettes - properly proportioned */}
          <div className="absolute top-1/3 right-24 opacity-18 animate-float">
            <svg width="60" height="100" viewBox="0 0 60 100">
              {/* Amphora */}
              <ellipse cx="30" cy="12" rx="15" ry="5" fill="#c89860"/>
              <path d="M 15 12 Q 12 25, 20 50 L 20 75 Q 20 85, 30 85 Q 40 85, 40 75 L 40 50 Q 48 25, 45 12" 
                    fill="#d4a574" stroke="#b8805f" strokeWidth="1.5"/>
              <ellipse cx="30" cy="85" rx="10" ry="4" fill="#b8805f"/>
              {/* Handles */}
              <path d="M 20 25 Q 10 30, 15 40" fill="none" stroke="#c89860" strokeWidth="3"/>
              <path d="M 40 25 Q 50 30, 45 40" fill="none" stroke="#c89860" strokeWidth="3"/>
            </svg>
          </div>
          
          <div className="absolute bottom-1/4 left-20 opacity-15 animate-float-delayed">
            <svg width="50" height="80" viewBox="0 0 50 80">
              {/* Smaller vase */}
              <ellipse cx="25" cy="10" rx="12" ry="4" fill="#c89860"/>
              <path d="M 13 10 Q 10 20, 15 40 L 15 60 Q 15 68, 25 68 Q 35 68, 35 60 L 35 40 Q 40 20, 37 10" 
                    fill="#d4a574" stroke="#b8805f" strokeWidth="1.5"/>
              <ellipse cx="25" cy="68" rx="8" ry="3" fill="#b8805f"/>
            </svg>
          </div>
          
          {/* Ionic capital detail - architectural flourish */}
          <div className="absolute top-40 left-1/3 opacity-12 rotate-12 animate-float-slow">
            <svg width="80" height="40" viewBox="0 0 80 40">
              <path d="M 10 20 Q 20 5, 40 20 Q 60 5, 70 20" fill="none" stroke="#e8d4bf" strokeWidth="4"/>
              <circle cx="15" cy="20" r="8" fill="none" stroke="#d4c0ab" strokeWidth="2"/>
              <circle cx="65" cy="20" r="8" fill="none" stroke="#d4c0ab" strokeWidth="2"/>
            </svg>
          </div>
          
          {/* Soft Mediterranean atmospheric effects */}
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-[#b8d4e8] opacity-8 blur-[120px] animate-float" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-[#c8dce8] opacity-6 blur-[140px] animate-float-delayed" />
          
          {/* Golden hour lighting - warm marble glow */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-[#f4e4c1] opacity-6 blur-[130px] animate-float-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#faebd7] opacity-5 blur-[150px] animate-float" />
          
          {/* Subtle marble blocks/steps */}
          <div className="absolute bottom-12 left-1/4 w-40 h-3 bg-gradient-to-r from-transparent via-[#e8d4bf] to-transparent opacity-20" />
          <div className="absolute bottom-16 left-[22%] w-48 h-3 bg-gradient-to-r from-transparent via-[#e8d4bf] to-transparent opacity-15" />
          
          <div className="absolute bottom-12 right-1/4 w-40 h-3 bg-gradient-to-r from-transparent via-[#e8d4bf] to-transparent opacity-20" />
          <div className="absolute bottom-16 right-[22%] w-48 h-3 bg-gradient-to-r from-transparent via-[#e8d4bf] to-transparent opacity-15" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className={`text-6xl md:text-7xl font-bold mb-2 tracking-tight ${
              theme === 'space' ? 'text-white' : 'text-[#8b6f47]'
            }`}>
              Phil
            </h1>
            <p className={`text-sm md:text-base font-medium ${
              theme === 'space' ? 'text-purple-300' : 'text-[#a8805f]'
            }`}>
              Stoic Wisdom Through The Ages
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setTheme(theme === 'space' ? 'ancient' : 'space')}
              className={`px-6 py-3 rounded-2xl transition font-semibold shadow-lg hover:scale-105 ${
                theme === 'space'
                  ? 'bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white/20'
                  : 'bg-white/70 text-[#8b6f47] hover:bg-white/90 border border-[#e8d4bf]'
              }`}
            >
              {theme === 'space' ? 'Ancient' : 'Cosmic'}
            </button>
            
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`px-6 py-3 rounded-2xl transition font-semibold shadow-lg hover:scale-105 ${
                theme === 'space'
                  ? 'bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white/20'
                  : 'bg-white/70 text-[#8b6f47] hover:bg-white/90 border border-[#e8d4bf]'
              }`}
            >
              {audioEnabled ? 'Audio On' : 'Muted'}
            </button>
          </div>
        </div>
        
        {/* Welcome */}
        {messages.length === 0 && (
          <div className={`rounded-3xl p-8 mb-6 shadow-xl backdrop-blur-md border ${
            theme === 'space'
              ? 'bg-white/5 border-white/10'
              : 'bg-white/70 border-[#e8d4bf]'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === 'space' ? 'text-white' : 'text-[#8b6f47]'
            }`}>
              Welcome
            </h2>
            <p className={`mb-6 leading-relaxed font-medium ${
              theme === 'space' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              I channel the wisdom of Marcus Aurelius, Epictetus, and Seneca to guide you through life&apos;s challenges with Stoic philosophy.
            </p>
            <p className={`text-sm mb-4 font-semibold ${
              theme === 'space' ? 'text-gray-300' : 'text-gray-600'
            }`}>Ask me about:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className={`text-left p-4 rounded-2xl transition text-sm font-medium shadow-md hover:scale-105 hover:shadow-lg ${
                    theme === 'space'
                      ? 'bg-white/10 backdrop-blur-xl text-gray-200 hover:bg-white/20 border border-white/10'
                      : 'bg-white/70 text-gray-700 hover:bg-[#f5e6d3] border-2 border-[#e8d4bf]'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat */}
        <div className={`rounded-3xl p-6 mb-4 h-[50vh] md:h-[60vh] overflow-y-auto shadow-xl backdrop-blur-md border ${
          theme === 'space'
            ? 'bg-white/5 border-white/10'
            : 'bg-white/60 border-[#e8d4bf]'
        }`}>
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'} animate-fade-in`}
            >
              <div className={`inline-block p-5 rounded-2xl max-w-[85%] md:max-w-[80%] shadow-lg backdrop-blur-md ${
                msg.role === 'user' 
                  ? theme === 'space'
                    ? 'bg-purple-500/80 text-white border border-purple-400/50'
                    : 'bg-[#8b6f47] text-white border border-[#a8805f]'
                  : theme === 'space'
                  ? 'bg-white/90 text-gray-800 border border-white/20'
                  : 'bg-white/95 text-gray-800 border-2 border-[#d4a574]'
              }`}>
                <div className="whitespace-pre-wrap break-words font-medium leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full animate-bounce ${
                theme === 'space' ? 'bg-purple-400' : 'bg-[#c89860]'
              }`} style={{animationDelay: '0ms'}}></div>
              <div className={`w-3 h-3 rounded-full animate-bounce ${
                theme === 'space' ? 'bg-purple-400' : 'bg-[#c89860]'
              }`} style={{animationDelay: '150ms'}}></div>
              <div className={`w-3 h-3 rounded-full animate-bounce ${
                theme === 'space' ? 'bg-purple-400' : 'bg-[#c89860]'
              }`} style={{animationDelay: '300ms'}}></div>
            </div>
          )}
          
          {isPlayingAudio && (
            <div className={`text-sm italic flex items-center gap-2 ${
              theme === 'space' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                theme === 'space' ? 'bg-purple-400' : 'bg-[#c89860]'
              }`}></div>
              Phil is speaking...
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        {/* Input */}
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Share what's on your mind..."
            className={`flex-1 p-5 rounded-2xl backdrop-blur-md outline-none shadow-lg font-medium transition border ${
              theme === 'space'
                ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-purple-400'
                : 'bg-white/70 text-gray-800 placeholder-gray-500 border-[#e8d4bf] focus:border-[#d4a574]'
            }`}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`px-10 py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-xl hover:scale-105 ${
              theme === 'space'
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-[#c89860] hover:bg-[#b8805f] text-white'
            }`}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        
        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6 font-medium">
          Powered by Gemini AI • ElevenLabs • Pinecone
        </p>
        
        <audio 
          ref={audioRef} 
          className="hidden"
          onEnded={() => setIsPlayingAudio(false)}
          onError={() => setIsPlayingAudio(false)}
        />
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-25px) translateX(15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slower {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-twinkle {
          animation: twinkle 4s ease-in-out infinite;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 40s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}