
import React from 'react';
import { ShieldAlert, Globe, Smartphone, Monitor, Watch, CheckCircle2, Lock, Facebook, Mail, MonitorSmartphone, Zap, X, ShieldCheck } from 'lucide-react';
import { useCore } from '../core/CoreContext';
import { UI_TRANSLATIONS } from '../core/translations';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { locale } = useCore();
  const t = UI_TRANSLATIONS[locale];

  if (!isOpen) return null;

  const handleEnterSystem = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`FullScreen Error: ${err.message}`);
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#020617] border border-brand-500/30 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_0_150px_rgba(234,179,8,0.15)] overflow-hidden animate-bounce-in flex flex-col max-h-[98vh] md:max-h-[90vh] ring-1 ring-white/10">
        
        <div className="absolute -left-20 -bottom-20 opacity-[0.03] rotate-12 pointer-events-none hidden md:block">
            <img src="https://i.ibb.co/VWVvTf1J/rhino.png" alt="Rhino Decor" className="w-[500px]" />
        </div>

        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent animate-pulse"></div>
        
        <div className="p-5 md:p-14 overflow-y-auto custom-scrollbar relative z-10">
          <div className="text-center mb-8 md:mb-12 relative">
            <div className="inline-flex p-3 md:p-4 bg-brand-500/5 rounded-[1.5rem] md:rounded-[2rem] border border-brand-500/20 mb-4 md:mb-6 shadow-neon relative group">
                <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full opacity-50"></div>
                <ShieldAlert className="w-8 h-8 md:w-12 md:h-12 text-brand-500 relative z-10 animate-pulse" />
            </div>
            
            <h2 className="text-2xl md:text-5xl font-display font-black text-white leading-none tracking-tighter uppercase mb-4 italic">
              {t.welcome_security_confirmed.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-b from-brand-300 to-brand-600 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">{t.welcome_security_confirmed.split(' ')[1]}</span>
            </h2>
            
            <div className="flex items-center justify-center gap-3 md:gap-6">
                <div className="h-px w-10 md:w-16 bg-brand-500/30"></div>
                <p className="text-brand-400 font-mono text-[9px] md:text-xs font-black tracking-[0.4em] md:tracking-[0.6em] uppercase whitespace-nowrap">
                  {t.welcome_privacy_guidelines}
                </p>
                <div className="h-px w-10 md:w-16 bg-brand-500/30"></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-8 mb-8 md:mb-14">
            {[
              { label: t.welcome_fb_pass, icon: <Facebook className="w-6 h-6 md:w-14 md:h-14" />, color: "from-blue-600/25" },
              { label: t.welcome_login_email, icon: <Mail className="w-6 h-6 md:w-14 md:h-14" />, color: "from-red-600/25" },
              { label: t.welcome_access_device, icon: <MonitorSmartphone className="w-6 h-6 md:w-14 md:h-14" />, color: "from-emerald-600/25" }
            ].map((item, i) => (
              <div key={i} className={`relative group flex flex-col items-center text-center p-4 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-b ${item.color} to-black/80 border border-white/5 hover:border-brand-500/50 transition-all duration-700 shadow-2xl transform hover:-translate-y-1`}>
                <div className="text-white mb-3 md:mb-6 opacity-100 group-hover:scale-110 transition-all filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    {item.icon}
                </div>
                <div className="space-y-1 md:space-y-2">
                    <span className="text-red-500 font-black text-[7px] md:text-[11px] uppercase tracking-[0.1em] md:tracking-[0.2em] block leading-none">{t.welcome_never_ask}</span>
                    <span className="text-white font-black text-[8px] md:text-[13px] uppercase block pt-1 md:pt-2 border-t border-white/10 mt-1 md:mt-3 leading-tight">{item.label}</span>
                </div>
                <div className="absolute top-3 right-3 md:top-6 md:right-6 w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,1)] animate-pulse"></div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-brand-500/5 to-transparent border border-brand-500/10 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] mb-8 md:mb-12 relative overflow-hidden group shadow-inner">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <img src="https://i.ibb.co/S7Vn5F5B/trio.png" alt="Trio Mascots" className="w-32 md:w-48" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8 relative z-10">
                <div className="p-4 md:p-5 bg-brand-500 rounded-2xl md:rounded-3xl shadow-neon shrink-0">
                    <Globe className="w-8 h-8 md:w-10 md:h-10 text-black" />
                </div>
                <div className="text-center md:text-left max-w-xl">
                    <h4 className="text-brand-400 font-black text-xs md:sm uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 flex items-center justify-center md:justify-start gap-2">
                      <ShieldCheck size={16} /> {t.welcome_cloud_title}
                    </h4>
                    <p className="text-slate-300 text-sm md:text-lg leading-relaxed font-medium">
                        {t.welcome_cloud_desc}
                    </p>
                </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 bg-black/40 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 text-center">
             <div className="flex flex-col items-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-slate-800 flex items-center justify-center mb-4 shadow-inner border border-white/5">
                    <Zap className="text-brand-500 w-7 h-7 md:w-8 md:h-8 fill-brand-500 animate-pulse" />
                </div>
                <div>
                    <h4 className="text-white font-black uppercase tracking-widest text-[11px] md:text-sm mb-1">{t.welcome_no_download}</h4>
                    <p className="text-emerald-500 text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.2em]">{t.welcome_remote_active}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 md:p-12 bg-black/80 border-t border-white/5 mt-auto flex flex-col items-center shrink-0">
          <button 
            onClick={handleEnterSystem}
            className="w-full max-w-md group relative py-4 md:py-5 bg-brand-600 hover:bg-brand-50 text-black font-display font-black text-lg md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-[1.25rem] md:rounded-[1.5rem] shadow-neon transition-all transform active:scale-95 flex items-center justify-center gap-3 md:gap-4 border border-white/10"
          >
            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
            {t.welcome_enter_button}
          </button>
        </div>
      </div>
    </div>
  );
};
