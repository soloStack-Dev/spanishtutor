
import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Bookmark, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { SearchResult } from '../types';

const SUGGESTIONS = [
  "Mejores destinos en España nivel A2",
  "Diferencia entre por y para",
  "Tradiciones de México para estudiantes",
  "Cómo usar el pretérito perfecto"
];

const SearchGrounding: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim() || isSearching) return;

    setQuery(finalQuery);
    setIsSearching(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am a Spanish learner at A2 level. Help me understand: ${finalQuery}. Please respond in a mix of simple Spanish and English explanations.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setResult({
        text: response.text || "No se encontró información.",
        chunks: chunks
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Buscador Cultural</h2>
        <p className="text-sm text-slate-500 mb-6">Aprende sobre gramática, cultura y actualidad con datos reales de la web.</p>
        
        <div className="relative group">
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all"
            placeholder="Ej: Festivales en España en marzo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
          <button 
            onClick={() => handleSearch(query)}
            disabled={isSearching}
            className="absolute right-2 top-2 bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-900 disabled:opacity-50"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSearch(s)}
              className="text-[11px] font-medium bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100 hover:bg-rose-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isSearching ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-32 bg-slate-50 rounded-2xl" />
          </div>
        ) : result ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="prose prose-slate prose-sm max-w-none mb-8">
              <div className="flex items-center gap-2 text-rose-500 mb-3">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Resumen de IA</span>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {result.text}
              </p>
            </div>

            {result.chunks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Fuentes consultadas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.chunks.map((chunk, i) => chunk.web && (
                    <a
                      key={i}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-rose-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-rose-50 transition-colors">
                          <Bookmark className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 truncate">
                          {chunk.web.title || 'Ver fuente'}
                        </span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-rose-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-sm font-medium">Empieza buscando algo sobre la cultura hispana</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchGrounding;
