
import React, { useState, useEffect } from 'react';
import { X, Zap, Crown, Target, AlertTriangle, Clock } from 'lucide-react';
import { useCore } from '../core/CoreContext';
import { useDiscountTimer } from '../hooks/useDiscountTimer';
import { UI_TRANSLATIONS } from '../core/translations';

interface TopBannerProps {
  onClose: () => void;
}

export const TopBanner: React.FC<TopBannerProps> = ({ onClose }) => {
  const { features, locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  const { formatTime, timeLeft } = useDiscountTimer();
  const [isClient, setIsClient] = useState(false);
  const [vacancies, setVacancies] = useState(87);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
        setVacancies(prev => {
            if (prev <= 3) return prev;
            return prev - 1;
        });
    }, 45000); 

    return () => clearInterval(timer);
  }, []);

  if (!isClient) return null;

  const isNemesis = features.nemesisCampaignActive;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[44px] md:h-[48px] overflow-hidden">
      {!isNemesis ? (
        <>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-brand-500 to-orange-700 animate-pulse border-b-2 border-orange-400 shadow-[0_4px_15px_rgba(234,179,8,0.4)]"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
                <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                    <div className="p-1.5 bg-blue-600 rounded-full shrink-0 border border-blue-400/30 shadow-[0_0_15px_rgba(16,185,129,1)] ring-1 ring-emerald-500/50 perspective-[1000px]">
                        <Zap className="w-3.5 h-3.5 text-white fill-current animate-spin-horizontal" />
                    </div>
                    <div className="flex items-center gap-2 text-white font-black text-[10px] md:text-sm uppercase tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                        <span>{t.banner_remaining}</span>
                        <div className="bg-black/40 border border-red-600 px-1.5 py-0.5 rounded-sm flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                            <span className="animate-pulse inline-block min-w-[3.5ch] text-center text-white">{vacancies} {t.banner_vacancies}</span>
                        </div>
                        <span>{t.banner_presale}</span>
                        <div className="relative flex items-center ml-1 group/flag">
                            <div className="absolute -top-1.5 -right-1.5 rotate-[22deg] z-20">
                                <Crown 
                                className="w-3.5 h-3.5 text-yellow-400 fill-white drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" 
                                strokeWidth={1.2} 
                                />
                            </div>
                            <span className="text-base md:text-lg relative z-10" title="Brasil">🇧🇷</span>
                        </div>
                    </div>
                    <button className="hidden sm:block bg-white text-orange-700 px-3 py-0.5 rounded text-[9px] font-black uppercase hover:scale-105 transition-transform shadow-lg whitespace-nowrap">
                        {t.banner_cta}
                    </button>
                </div>
            </div>
        </>
      ) : (
        <>
            <div className="absolute inset-0 bg-orange-950 border-b-2 border-orange-600/60 shadow-[0_4px_20px_rgba(234,88,12,0.3)]"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
                <div className="flex items-center justify-center gap-4 whitespace-nowrap">
                    <div className="p-1.5 bg-red-600 rounded-full shrink-0 border border-red-400/30 shadow-[0_0_15px_rgba(220,38,38,0.6)] ring-1 ring-red-500/50 perspective-[1000px]">
                        <Target className="w-4 h-4 text-white animate-spin-horizontal" />
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-orange-100 font-mono font-bold text-[10px] md:text-xs uppercase tracking-tighter whitespace-nowrap flex items-center gap-2">
                            <span className="opacity-50">[!]</span> {t.banner_nemesis_active} 
                            <div className="bg-red-600 text-white px-2 py-0.5 rounded-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                <Clock className="w-3 h-3 animate-pulse" />
                                <span className="font-mono tabular-nums">{formatTime(timeLeft)}</span>
                            </div>
                            {t.banner_nemesis_suffix} 🇧🇷
                        </p>
                    </div>
                </div>
            </div>
        </>
      )}

      <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20">
          <button 
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${isNemesis ? 'text-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
              <X className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
};
