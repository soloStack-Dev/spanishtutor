
import React, { useState } from 'react';
import { ImageIcon, Download, Loader2, Sparkles, Wand2, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const checkApiKey = async () => {
    // Check if the Studio-selected API key is available
    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        return true; // Proceed assuming success per requirements
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      await checkApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `A vibrant, high-quality visual representation for a Spanish language learner: ${prompt}. Educational and friendly style.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('Requested entity was not found')) {
        setNeedsApiKey(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[600px]">
      <div className="w-full md:w-80 border-r border-slate-100 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Visual Tutor</h2>
          <p className="text-xs text-slate-500">Genera imágenes para visualizar conceptos, palabras o situaciones culturales.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prompt creativo</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none transition-all h-32 resize-none"
              placeholder="Ej: Un mercado tradicional en Barcelona con frutas frescas..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calidad de imagen</label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    size === s ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-200 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generar Visual</span>
              </>
            )}
          </button>

          {needsApiKey && (
            <button
              onClick={() => { setNeedsApiKey(false); window.aistudio.openSelectKey(); }}
              className="w-full py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold uppercase tracking-tighter"
            >
              Re-seleccionar API Key (Requerido)
            </button>
          )}
        </div>

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3">
          <Info className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-[10px] text-orange-700 leading-relaxed">
            Las ayudas visuales mejoran la retención del vocabulario en un 60%. ¡Pruébalo con verbos de acción!
          </p>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 p-6 flex items-center justify-center">
        {isGenerating ? (
          <div className="text-center space-y-4">
            <div className="w-64 h-64 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-dashed border-slate-200 animate-pulse">
              <ImageIcon className="w-12 h-12 text-slate-200" />
            </div>
            <p className="text-sm font-medium text-slate-500 italic">Pintando tu concepto...</p>
          </div>
        ) : generatedImageUrl ? (
          <div className="relative group max-w-lg w-full">
            <img 
              src={generatedImageUrl} 
              alt="Generated" 
              className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white animate-in zoom-in duration-500" 
            />
            <a 
              href={generatedImageUrl} 
              download="hola-amigo-visual.png"
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold text-slate-800"
            >
              <Download className="w-4 h-4" />
              <span>Guardar Imagen</span>
            </a>
            <div className="absolute top-4 left-4 flex gap-1">
               <div className="bg-rose-500/80 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                 <Sparkles className="w-3 h-3" />
                 <span>AI Generated</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 max-w-xs opacity-50">
            <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Describe una escena en español para visualizarla con IA</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
