
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, Waves, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

const LiveConversation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopConversation = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (sessionRef.current) {
      sessionRef.current.close?.();
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const startConversation = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), ctx, OUTPUT_SAMPLE_RATE, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setError("Error en la conexión de audio.");
            stopConversation();
          },
          onclose: () => {
            stopConversation();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: "You are a friendly Spanish tutor for A2 level students. Speak clearly, at a slightly slower pace than normal native speech. Correct user errors gently in Spanish."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setError("No se pudo acceder al micrófono.");
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Práctica de Voz Real-time</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Habla con nuestra IA en español (Nivel A2). Es como una llamada telefónica para mejorar tu fluidez.
        </p>
      </div>

      <div className="relative">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 ${
          isActive ? 'bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)] scale-110' : 'bg-slate-200'
        }`}>
          {isActive ? (
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-2 bg-white rounded-full animate-bounce" style={{ height: `${20 + i * 10}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : (
            <Mic className="w-16 h-16 text-slate-400" />
          )}
        </div>

        {isActive && (
          <div className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full animate-pulse">
            <Volume2 className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        {error && (
          <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!isActive ? (
          <button
            onClick={startConversation}
            disabled={isConnecting}
            className="group flex items-center gap-3 bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-rose-200 active:scale-95 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Iniciar Práctica</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopConversation}
            className="flex items-center gap-3 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <PhoneOff className="w-6 h-6" />
            <span>Finalizar Llamada</span>
          </button>
        )}
      </div>

      <div className="mt-8 flex gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Baja latencia (2.5 Flash Native)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>A2 Level Curriculum</span>
        </div>
      </div>
    </div>
  );
};

export default LiveConversation;
