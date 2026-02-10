
import React, { useState, useEffect } from 'react';
import { Ghost, ShieldAlert, Cpu, EyeOff, Globe, Lock, Terminal, Activity, Zap, RefreshCw, Server, AlertCircle, Settings, ShieldCheck, Monitor } from 'lucide-react';
import { useCore } from '../core/CoreContext';
import { UI_TRANSLATIONS } from '../core/translations';

export const GhostModeDemo: React.FC = () => {
  const { locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState("REAL_DEVICE_ID_7721X");
  const [stealthLevel, setStealthLevel] = useState(0);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 8));
  };

  const startSpoofing = () => {
    if (isActive) return;
    setIsActive(true);
    setProgress(0);
    setStealthLevel(10);
    addLog(t.stealth_init);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          addLog(t.stealth_success);
          return 100;
        }
        
        if (prev === 20) addLog(t.stealth_intercept);
        if (prev === 45) addLog(t.stealth_hash);
        if (prev === 70) addLog(t.stealth_mask);
        if (prev === 90) addLog(t.stealth_encrypt);
        
        if (prev % 10 === 0) {
            setCurrentId(`STEALTH_7_${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
            setStealthLevel(s => Math.min(100, s + 10));
        }
        
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-brand-500/10 rounded-2xl border border-brand-500/20 mb-4">
          <Ghost className="w-10 h-10 text-brand-500 animate-pulse" />
        </div>
        <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">{t.stealth_title.split(' ')[0]} <span className="text-brand-500">{t.stealth_title.split(' ')[1]}</span></h2>
        <p className="text-secondary mt-2">{t.stealth_subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border-dim rounded-2xl p-6 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> {t.stealth_config}
            </h3>

            <div className="space-y-6">
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">{t.stealth_identity}</span>
                    <code className="text-brand-400 font-mono font-bold text-lg break-all">{currentId}</code>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500">{t.stealth_level}</span>
                        <span className={stealthLevel > 80 ? "text-emerald-500" : "text-brand-500"}>{stealthLevel}%</span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${stealthLevel}%` }}></div>
                    </div>
                </div>

                <button 
                    onClick={startSpoofing}
                    disabled={isActive}
                    className={`w-full py-4 rounded-xl font-display font-black text-lg uppercase tracking-widest transition-all shadow-neon flex items-center justify-center gap-3 ${isActive ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 cursor-default' : 'bg-brand-600 hover:bg-brand-500 text-white active:scale-95'}`}
                >
                    {isActive ? (
                        <><ShieldCheck className="w-6 h-6" /> {t.stealth_btn_active}</>
                    ) : (
                        <><EyeOff className="w-6 h-6" /> {t.stealth_btn_start}</>
                    )}
                </button>
            </div>
          </div>
        </div>

        <div className="bg-black rounded-2xl border border-border-dim shadow-2xl flex flex-col h-[520px] md:h-auto font-mono overflow-hidden">
            <div className="bg-surface-highlight px-4 py-2 border-b border-border-dim flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stealth_Kernel_Logs</span>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-2 scrollbar-thin">
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <Activity className="w-12 h-12 text-brand-500 mb-2" />
                        <span className="text-[10px] font-bold uppercase">WAITING_INJECTION</span>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className={`text-[11px] animate-fade-in ${log.includes('[SUCCESS]') || log.includes('[SUCESSO]') || log.includes('[ÉXITO]') ? 'text-emerald-400' : 'text-slate-300'}`}>
                            <span className="text-brand-500 mr-2">➜</span> {log}
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
