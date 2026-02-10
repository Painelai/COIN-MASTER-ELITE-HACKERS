
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ShieldCheck, Globe2 } from 'lucide-react'; 
import { UI_TRANSLATIONS, getStatusMessages } from '../core/translations';
import { Locale } from '../core/types';

interface LoadingScreenProps {
  onFinish: (lang: string) => void;
  isSiteReady: boolean;
}

const LANGUAGES = [
  { id: 'pt', label: 'Português', flag: '🇧🇷' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'es', label: 'Español', flag: '🇪🇸' }
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish, isSiteReady }) => {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [selectedLang, setSelectedLang] = useState<Locale | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coinsRef = useRef<any[]>([]);
  const requestRef = useRef<number>(null);

  const t = selectedLang ? UI_TRANSLATIONS[selectedLang] : UI_TRANSLATIONS['pt'];
  const currentMessages = useMemo(() => getStatusMessages(selectedLang || 'pt'), [selectedLang]);

  // BLOQUEIO DE SCROLL DO BODY
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    const update = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (Math.random() > 0.95 && coinsRef.current.length < 50) {
        coinsRef.current.push({
          x: Math.random() * canvas.width,
          y: -50,
          speed: 2 + Math.random() * 4,
          spinSpeed: (Math.random() - 0.5) * 0.15,
          size: 8 + Math.random() * 12,
          opacity: 1,
          phase: Math.random() * Math.PI
        });
      }

      for (let i = coinsRef.current.length - 1; i >= 0; i--) {
        const coin = coinsRef.current[i];
        coin.y += coin.speed;
        coin.phase += coin.spinSpeed;
        
        if (coin.y > canvas.height - 100) coin.opacity -= 0.03;

        if (coin.opacity <= 0 || coin.y > canvas.height + 20) {
          coinsRef.current.splice(i, 1);
          continue;
        }

        const currentWidth = Math.cos(coin.phase) * coin.size;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, coin.opacity);
        ctx.translate(coin.x, coin.y);
        
        const grad = ctx.createLinearGradient(-coin.size, -coin.size, coin.size, coin.size);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#eab308');
        grad.addColorStop(1, '#854d0e');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.abs(currentWidth), coin.size, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (Math.abs(currentWidth) > 6) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.font = `bold ${coin.size * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
        }
        ctx.restore();
      }
      
      requestRef.current = requestAnimationFrame(update);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedLang) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (isSiteReady ? 2.5 : 0.8);
      });
    }, 100);

    const msgTimer = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % currentMessages.length);
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, [selectedLang, isSiteReady, currentMessages]);

  useEffect(() => {
    if (progress >= 100 && selectedLang && isSiteReady && !isExiting) {
        setIsExiting(true);
        setTimeout(() => onFinish(selectedLang), 600);
    }
  }, [progress, selectedLang, isSiteReady, isExiting, onFinish]);

  return (
    <div className={`fixed inset-0 z-[4000] bg-[#020617] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 touch-none ${isExiting ? 'opacity-0 scale-110' : 'opacity-100'}`}>
      <style>{`
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shine {
          animation: shine 3s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />
      
      <div className="relative z-10 w-full max-w-5xl px-4 md:px-6 flex flex-col items-center justify-center min-h-screen">
        
        {/* Welcome Text Container - Altura estável para evitar saltos */}
        <div className="min-h-[40px] md:min-h-[100px] flex items-center justify-center w-full mb-2 md:mb-4">
            <h3 className="text-brand-500 font-display text-xl sm:text-2xl md:text-6xl lg:text-7xl tracking-[0.1em] uppercase animate-pulse font-black text-center drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                {t.welcome}
            </h3>
        </div>

        {/* Logo - Estabilizado com dimensão e key para evitar re-render agressivo */}
        <div className="mb-2 md:mb-6 animate-float relative z-20 w-full flex justify-center h-auto">
            <img 
                key="loading-logo"
                src="https://i.imgur.com/Yp5kB1F.png" 
                alt="Elite Protocol Logo" 
                className="w-auto h-auto max-w-[180px] sm:max-w-[220px] md:max-w-[420px] lg:max-w-[550px] object-contain drop-shadow-[0_0_50px_rgba(234,179,8,0.4)] filter brightness-110 px-4"
                fetchPriority="high"
                loading="eager"
            />
        </div>

        {/* Nome do Sistema */}
        <div className="mb-6 md:mb-12 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter flex items-center gap-2 md:gap-8">
                <span className="text-blue-600 drop-shadow-[0_0_30px_rgba(37,99,235,0.8)] filter brightness-125">CM</span>
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#854d0e] animate-shine bg-[length:200%_auto] drop-shadow-[0_4px_15px_rgba(0,0,0,1)] filter brightness-110">
                    ELITE
                </span>
            </h1>
            <div className="mt-1 md:mt-2 h-0.5 md:h-1 w-24 md:w-64 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
        </div>

        {/* Dynamic Section Wrapper - Container de altura estável para evitar re-layout vertical centralizado */}
        <div className="w-full flex flex-col items-center justify-start min-h-[180px] md:min-h-[350px]">
            {!selectedLang ? (
                <>
                    <div className="w-full flex flex-row flex-wrap justify-center gap-2 sm:gap-4 mb-4 md:mb-8 animate-fade-in">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.id}
                                onClick={() => setSelectedLang(lang.id as Locale)}
                                className="group relative flex flex-col items-center gap-1.5 md:gap-3 bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 sm:p-5 md:px-10 md:py-8 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] transition-all duration-300 hover:border-brand-500/50 hover:bg-brand-500/5 hover:-translate-y-1 shadow-xl ring-1 ring-white/5 overflow-hidden min-w-[90px] sm:min-w-[120px] md:min-w-[180px]"
                            >
                                <span className="text-2xl sm:text-3xl md:text-5xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">{lang.flag}</span>
                                <span className="text-[7px] sm:text-[9px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
                                    {lang.label}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                        ))}
                    </div>
                    <div className="text-center animate-pulse">
                        <p className="text-[7px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                            <Globe2 size={10} /> SELECT SYSTEM LOCALE
                        </p>
                    </div>
                </>
            ) : (
                <div className={`w-full max-w-sm md:max-w-lg space-y-3 md:space-y-4 bg-black/70 p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl animate-fade-in`}>
                    <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[7px] sm:text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.syncing}</span>
                        <span className="text-xs sm:text-base font-mono font-bold text-brand-500">{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-1.5 md:h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 via-brand-500 to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="h-4 flex items-center justify-center overflow-hidden">
                        <p className="text-[7px] sm:text-[9px] md:text-[10px] font-mono font-bold text-emerald-500 uppercase text-center opacity-80" key={statusIdx + (selectedLang || 'none')}>
                            <span className="text-slate-600 mr-1 md:mr-2">{'>>>'}</span> {currentMessages[statusIdx]}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
        
        const grad = ctx.createLinearGradient(-coin.size, -coin.size, coin.size, coin.size);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#eab308');
        grad.addColorStop(1, '#854d0e');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.abs(currentWidth), coin.size, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (Math.abs(currentWidth) > 6) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.font = `bold ${coin.size * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
        }
        ctx.restore();
      }
      
      requestRef.current = requestAnimationFrame(update);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedLang) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (isSiteReady ? 2.5 : 0.8);
      });
    }, 100);

    const msgTimer = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % currentMessages.length);
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, [selectedLang, isSiteReady, currentMessages]);

  useEffect(() => {
    if (progress >= 100 && selectedLang && isSiteReady && !isExiting) {
        setIsExiting(true);
        setTimeout(() => onFinish(selectedLang), 600);
    }
  }, [progress, selectedLang, isSiteReady, isExiting, onFinish]);

  return (
    <div className={`fixed inset-0 z-[4000] bg-[#020617] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 touch-none ${isExiting ? 'opacity-0 scale-110' : 'opacity-100'}`}>
      <style>{`
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shine {
          animation: shine 3s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />
      
      <div className="relative z-10 w-full max-w-5xl px-4 md:px-6 flex flex-col items-center justify-center min-h-screen">
        
        {/* Welcome Text Container - Altura estável para evitar saltos */}
        <div className="min-h-[40px] md:min-h-[100px] flex items-center justify-center w-full mb-2 md:mb-4">
            <h3 className="text-brand-500 font-display text-xl sm:text-2xl md:text-6xl lg:text-7xl tracking-[0.1em] uppercase animate-pulse font-black text-center drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                {t.welcome}
            </h3>
        </div>

        {/* Logo - Estabilizado com dimensão e key para evitar re-render agressivo */}
        <div className="mb-2 md:mb-6 animate-float relative z-20 w-full flex justify-center h-auto">
            <img 
                key="loading-logo"
                src="https://i.imgur.com/Yp5kB1F.png" 
                alt="Elite Protocol Logo" 
                className="w-auto h-auto max-w-[180px] sm:max-w-[220px] md:max-w-[420px] lg:max-w-[550px] object-contain drop-shadow-[0_0_50px_rgba(234,179,8,0.4)] filter brightness-110 px-4"
                fetchPriority="high"
                loading="eager"
            />
        </div>

        {/* Nome do Sistema */}
        <div className="mb-6 md:mb-12 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter flex items-center gap-2 md:gap-8">
                <span className="text-blue-600 drop-shadow-[0_0_30px_rgba(37,99,235,0.8)] filter brightness-125">CM</span>
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#854d0e] animate-shine bg-[length:200%_auto] drop-shadow-[0_4px_15px_rgba(0,0,0,1)] filter brightness-110">
                    ELITE
                </span>
            </h1>
            <div className="mt-1 md:mt-2 h-0.5 md:h-1 w-24 md:w-64 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
        </div>

        {/* Dynamic Section Wrapper - Container de altura estável para evitar re-layout vertical centralizado */}
        <div className="w-full flex flex-col items-center justify-start min-h-[180px] md:min-h-[350px]">
            {!selectedLang ? (
                <>
                    <div className="w-full flex flex-row flex-wrap justify-center gap-2 sm:gap-4 mb-4 md:mb-8 animate-fade-in">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.id}
                                onClick={() => setSelectedLang(lang.id as Locale)}
                                className="group relative flex flex-col items-center gap-1.5 md:gap-3 bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 sm:p-5 md:px-10 md:py-8 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] transition-all duration-300 hover:border-brand-500/50 hover:bg-brand-500/5 hover:-translate-y-1 shadow-xl ring-1 ring-white/5 overflow-hidden min-w-[90px] sm:min-w-[120px] md:min-w-[180px]"
                            >
                                <span className="text-2xl sm:text-3xl md:text-5xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">{lang.flag}</span>
                                <span className="text-[7px] sm:text-[9px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
                                    {lang.label}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                        ))}
                    </div>
                    <div className="text-center animate-pulse">
                        <p className="text-[7px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                            <Globe2 size={10} /> SELECT SYSTEM LOCALE
                        </p>
                    </div>
                </>
            ) : (
                <div className={`w-full max-w-sm md:max-w-lg space-y-3 md:space-y-4 bg-black/70 p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl animate-fade-in`}>
                    <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[7px] sm:text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.syncing}</span>
                        <span className="text-xs sm:text-base font-mono font-bold text-brand-500">{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-1.5 md:h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 via-brand-500 to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="h-4 flex items-center justify-center overflow-hidden">
                        <p className="text-[7px] sm:text-[9px] md:text-[10px] font-mono font-bold text-emerald-500 uppercase text-center opacity-80" key={statusIdx + (selectedLang || 'none')}>
                            <span className="text-slate-600 mr-1 md:mr-2">>>></span> {currentMessages[statusIdx]}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
