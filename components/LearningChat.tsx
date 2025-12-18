
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Languages, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

const LearningChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "¡Hola! Soy tu tutor de español nivel A2. ¿En qué te puedo ayudar hoy? \n\n(Hi! I'm your A2 level Spanish tutor. How can I help you today?)",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are a Spanish A2 level tutor. 
      - If the user asks "how to say [phrase] in Spanish", provide: 
        1. Spanish phrase (A2 level suitable)
        2. English meaning
        3. Brief English explanation about the usage/grammar
        4. Spanish pronunciation guide in brackets [].
      - For general conversation, respond primarily in Spanish (A2 level), followed by an English translation in brackets. 
      - Keep responses encouraging and simple.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: { systemInstruction }
      });

      const modelText = response.text || "Lo siento, tuve un problema. ¿Puedes repetir?";
      setMessages(prev => [...prev, { role: 'model', text: modelText, timestamp: Date.now() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Hubo un error de conexión.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[600px]">
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <Languages className="w-5 h-5" />
          <h2 className="font-semibold">Tutor Interactivo</h2>
        </div>
        <div className="flex items-center gap-1 text-white/80 text-xs bg-white/10 px-2 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>Powered by Gemini 3 Pro</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-rose-500 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-rose-200 transition-all">
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 outline-none"
            placeholder="Escribe 'how to say [word] in spanish'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors shadow-md shadow-rose-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Info className="w-3 h-3" />
          <span>Ask about grammar, phrases, or just practice conversation.</span>
        </div>
      </div>
    </div>
  );
};

export default LearningChat;
