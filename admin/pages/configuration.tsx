
import React, { useState, useEffect, useRef } from 'react';
import { useStore, AppMode } from '../store';
import { Briefcase, Activity, Volume2, VolumeX, Sparkles, LayoutDashboard, ShieldCheck, Lock } from 'lucide-react';

const AUDIO_SYSTEM_ENABLED = false;

export const ConfigurationPage: React.FC = () => {
  const login = useStore(state => state.login);
  const setAppMode = useStore(state => state.setAppMode);
  const theme = useStore(state => state.theme);
  const [isMuted, setIsMuted] = useState(true);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  
  // PRE-FILLED CREDENTIALS FOR ONE-CLICK ACCESS
  const [email, setEmail] = useState('admin');
  const [pass, setPass] = useState('admin');
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const initAudio = () => {
    if (!AUDIO_SYSTEM_ENABLED || isAudioInitialized) return;
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    setIsAudioInitialized(true);
  };

  const handleSelectZone = (mode: AppMode) => {
    if (AUDIO_SYSTEM_ENABLED) initAudio();
    login(); 
    setAppMode(mode); 
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20 flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans select-none transition-colors duration-500" onClick={initAudio}>
      
      {/* Background Blobs - Suavizados */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-3xl relative z-20">
        
        <div className="text-center mb-10 md:mb-14 animate-fade-in">
            <div className="flex justify-center mb-4">
               <div className="relative group">
                  <div className="absolute -inset-4 bg-white dark:bg-blue-500 rounded-full blur-xl opacity-60 dark:opacity-10"></div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-blue-100 dark:border-slate-800 shadow-md relative z-10 transition-colors">
                     <ShieldCheck size={32} className="text-blue-600 dark:text-blue-400 md:w-10 md:h-10" />
                  </div>
               </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Chernobyl Engine</h1>
            <p className="text-blue-600 dark:text-blue-400 font-black text-[10px] md:text-xs tracking-[0.4em] uppercase mt-3">Selecione o Terminal de Acesso</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-fade-in-up">
            
            {/* CARD OPERAÇÕES */}
            <button 
                onClick={() => handleSelectZone('orchestration')}
                className="group relative text-left outline-none w-full"
            >
                <div className="absolute -inset-1 bg-blue-400 dark:bg-blue-600 rounded-[2rem] blur opacity-0 group-hover:opacity-10 transition duration-700"></div>
                <div className="relative flex flex-col items-center p-6 md:p-10 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-[2rem] shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 overflow-hidden transition-colors">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4 md:mb-6 border border-blue-100 dark:border-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-slate-700 transition-all">
                        <Activity size={28} className="text-blue-600 dark:text-blue-400 md:w-9 md:h-9" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight text-center uppercase">Orchestrator</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] md:text-xs text-center leading-relaxed max-w-[200px] font-medium mb-6">
                        Gestão de enxame de bots, salas de chat e fluxos de prova social.
                    </p>
                    <div className="px-6 py-2 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-md shadow-blue-100 dark:shadow-none transition-all group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        Acessar Terminal
                    </div>
                </div>
            </button>

            {/* CARD ADMIN */}
            <button 
                onClick={() => handleSelectZone('admin')}
                className="group relative text-left outline-none w-full"
            >
                <div className="absolute -inset-1 bg-indigo-400 dark:bg-indigo-600 rounded-[2rem] blur opacity-0 group-hover:opacity-10 transition duration-700"></div>
                <div className="relative flex flex-col items-center p-6 md:p-10 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-[2rem] shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 overflow-hidden transition-colors">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-indigo-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4 md:mb-6 border border-indigo-100 dark:border-indigo-700 group-hover:bg-indigo-100 dark:group-hover:bg-slate-700 transition-all">
                        <Briefcase size={28} className="text-indigo-600 dark:text-indigo-400 md:w-9 md:h-9" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight text-center uppercase">System Admin</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] md:text-xs text-center leading-relaxed max-w-[200px] font-medium mb-6">
                        Configuração de faturamento, controle de equipe e auditoria master.
                    </p>
                    <div className="px-6 py-2 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-md shadow-indigo-100 dark:shadow-none transition-all group-hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                        Acesso Master
                    </div>
                </div>
            </button>
        </div>

        {/* INFO CREDENCIAIS */}
        <div className="mt-8 flex flex-col items-center animate-fade-in opacity-80">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">
                <Lock size={12} /> Master Credentials Sync
            </div>
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-blue-100 dark:border-slate-800 flex gap-8">
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Universal User</span>
                    <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{email}</span>
                </div>
                <div className="w-px h-8 bg-blue-100 dark:bg-slate-800 self-center"></div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Universal Pass</span>
                    <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{pass}</span>
                </div>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Basta selecionar a zona para entrar</p>
        </div>

        <div className="mt-12 md:mt-16 opacity-40 flex justify-center items-center gap-4 animate-fade-in font-mono transition-colors">
          <div className="h-px w-10 bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-600">Core Engine v4.7.0</span>
          <div className="h-px w-10 bg-slate-200 dark:bg-slate-800"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-pulse-slow {
          animation: pulse 10s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}} />
    </div>
  );
};
