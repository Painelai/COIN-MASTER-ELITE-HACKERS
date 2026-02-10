
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, ChevronDown, Lock, Crown, Play, Pause, Loader2 } from 'lucide-react';
import { TerminalBackground } from './TerminalBackground';
import { useCore } from '../core/CoreContext';
import { UI_TRANSLATIONS } from '../core/translations';

// FONTES DE ÁUDIO HOMOLOGADAS
const AUDIO_PATHS = {
    ELI: '/assets/Eli.mp3',
    OLGA: '/assets/Olga.mp3',
    JOAO: '/assets/Joao.mp3'
};

interface HeroProps {
  onNavigate: (id: string) => void;
  onOpenCheckout?: () => void;
  onOpenServerStatus: () => void;
  onOpenLogin?: () => void; 
  paused?: boolean;
}

const CompactAudioPlayer: React.FC<any> = ({ id, image, user, audioUrl, activeAudioId, onToggleActive, pausedMode }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const contextRef = useRef<AudioContext | null>(null);
    const bufferRef = useRef<AudioBuffer | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        if (activeAudioId !== id && isPlaying) {
            stopAudio();
        }
    }, [activeAudioId, id]);

    const stopAudio = () => {
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
                sourceRef.current.disconnect();
            } catch (e) {}
            sourceRef.current = null;
        }
        setIsPlaying(false);
    };

    const togglePlay = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (pausedMode) return;

        try {
            if (isPlaying) {
                stopAudio();
                onToggleActive(null);
                return;
            }

            setLoading(true);
            onToggleActive(id);

            if (!contextRef.current) {
                const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
                contextRef.current = new AudioContextClass();
                
                const response = await fetch(audioUrl);
                if (!response.ok) throw new Error(`Falha ao carregar áudio: ${audioUrl}`);
                const arrayBuffer = await response.arrayBuffer();
                bufferRef.current = await contextRef.current.decodeAudioData(arrayBuffer);
            }

            const source = contextRef.current.createBufferSource();
            source.buffer = bufferRef.current;
            source.connect(contextRef.current.destination);
            
            source.onended = () => {
                setIsPlaying(false);
                if (activeAudioId === id) onToggleActive(null);
            };

            source.start(0);
            sourceRef.current = source;
            setIsPlaying(true);

        } catch (err) {
            console.error(`Falha na reprodução Elite:`, err);
            onToggleActive(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            stopAudio();
            if (contextRef.current?.state !== 'closed') {
                contextRef.current?.close();
            }
        };
    }, []);

    return (
        <div 
            onClick={togglePlay}
            className="flex flex-col items-center gap-1.5 group cursor-pointer touch-none select-none transition-transform active:scale-95"
        >
            <div className={`relative w-[44px] sm:w-[48px] md:w-[52px] h-[44px] sm:h-[48px] md:h-[52px] rounded-full overflow-hidden border-2 transition-all duration-500 shadow-lg ${
                isPlaying 
                ? 'bg-brand-500 border-white shadow-neon scale-110' 
                : 'bg-slate-900 border-brand-500/20 group-hover:border-brand-500/50'
            }`}>
                <img 
                    src={image} 
                    alt={user} 
                    className={`w-full h-full object-cover transition-all duration-500 ${isPlaying ? 'opacity-20 scale-125' : 'grayscale-[0.2] group-hover:grayscale-0'}`} 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="w-4 h-4 text-black fill-current" />
                    ) : (
                        <div className="bg-black/40 absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                    )}
                </div>
            </div>
            <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-[0.1em] transition-colors ${isPlaying ? 'text-brand-400' : 'text-slate-500'}`}>
                {user.split(' ')[0]}
            </span>
        </div>
    );
};

export const Hero: React.FC<HeroProps> = ({ onNavigate, onOpenCheckout, onOpenServerStatus, paused = false }) => {
  const { content, locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  const [activeAudioId, setActiveAudioId] = useState<number | null>(null);
  
  const handleVipClick = () => onOpenCheckout ? onOpenCheckout() : onNavigate('products');

  const audioTestimonials = [
      { id: 1, user: "Carlos Pereira", img: "https://randomuser.me/api/portraits/men/75.jpg", audioUrl: AUDIO_PATHS.ELI },
      { id: 2, user: "Olga Silva", img: "https://randomuser.me/api/portraits/women/68.jpg", audioUrl: AUDIO_PATHS.OLGA },
      { id: 3, user: "João Pablo", img: "https://randomuser.me/api/portraits/men/85.jpg", audioUrl: AUDIO_PATHS.JOAO }
  ];

  return (
    <div className="relative pt-24 pb-12 sm:pt-40 sm:pb-32 overflow-hidden min-h-[75vh] md:min-h-[90vh] flex flex-col justify-center bg-page">
      <div className="perf-low:hidden"><TerminalBackground paused={paused} /></div>
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-brand-500/10 rounded-full blur-[80px] md:blur-[120px] transition-all" />
        <div className="absolute inset-0 bg-gradient-to-b from-page/80 via-transparent to-page/90"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center">
        <div>
          <button onClick={onOpenServerStatus} className="group inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-brand-950/60 border border-brand-500/30 text-brand-400 text-[8px] sm:text-xs md:text-sm font-bold mb-4 md:mb-8 animate-fade-in-up backdrop-blur-md shadow-neon hover:bg-brand-950/80 transition-all cursor-pointer whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="tracking-widest font-mono border-r border-brand-500/30 pr-2 uppercase">{t.hero_badge_bypass}</span>
            <span className="flex items-center gap-1 text-brand-300 font-mono uppercase">
                {t.hero_badge_stealth}
            </span>
          </button>

          <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-white mb-4 md:mb-6 uppercase leading-[1.1] sm:leading-[0.9]">
            {content.hero.titleLine1}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-100 to-brand-500 animate-shine bg-[length:200%_auto] drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">
              {content.hero.titleLine2}
            </span>
          </h1>

          <p className="mt-2 md:mt-6 max-w-2xl mx-auto text-xs sm:text-xl text-secondary mb-6 md:mb-10 font-light leading-relaxed px-2 sm:px-0">
            {content.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 md:mb-12 px-2 sm:px-0">
            <button onClick={handleVipClick} className="inline-flex justify-center items-center px-8 md:px-10 py-4 md:py-5 text-sm md:text-lg font-display font-bold tracking-wide rounded-full text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-neon hover:-translate-y-1 cursor-pointer w-full sm:w-auto uppercase gap-3 group">
              <Crown className="w-4 h-4 md:w-5 md:h-5 text-brand-50 fill-brand-50" />
              {t.hero_cta}
              <ArrowRight className="ml-1 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-muted text-[7px] sm:text-xs font-medium font-mono uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-secondary" /><span>Jarvis Security</span></div>
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-brand-500" /><span>Cloud Node Sync</span></div>
            </div>

            <div className="flex flex-row justify-center items-center gap-3 sm:gap-8 md:gap-14 animate-fade-in mt-1 md:mt-2 px-2">
                {audioTestimonials.map(audio => (
                    <CompactAudioPlayer 
                        key={audio.id}
                        id={audio.id}
                        image={audio.img}
                        user={audio.user}
                        pausedMode={paused}
                        audioUrl={audio.audioUrl}
                        activeAudioId={activeAudioId}
                        onToggleActive={setActiveAudioId}
                    />
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 animate-bounce text-muted/30 flex flex-col items-center gap-1 cursor-pointer hover:text-brand-400 transition-colors" onClick={() => onNavigate('products')}>
        <ChevronDown className="w-5 h-5" />
      </div>
    </div>
  );
};
