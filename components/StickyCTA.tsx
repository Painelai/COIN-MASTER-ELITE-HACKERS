
import React, { useState, useEffect } from 'react';
import { UserPlus, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCore } from '../core/CoreContext';
import { UI_TRANSLATIONS } from '../core/translations';

interface StickyCTAProps {
  onOpenCheckout: () => void;
  product?: Product;
}

export const StickyCTA: React.FC<StickyCTAProps> = ({ onOpenCheckout, product }) => {
  const { locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const currentScroll = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const isPastHero = currentScroll > 600;
      const isNearBottom = (currentScroll + windowHeight) >= (docHeight - 150);
      setIsVisible(isPastHero && !isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-[45] md:hidden animate-slide-up-fade h-14 flex justify-center px-4">
      <div 
        className="relative h-full w-full max-w-[260px] bg-surface backdrop-blur-2xl border border-brand-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1),0_0_20px_rgba(234,179,8,0.1)] flex items-center justify-between gap-2 ring-1 ring-white/10 overflow-visible group pr-1 pl-3 cursor-pointer -translate-x-[30px]" 
        onClick={onOpenCheckout}
      >
        
        <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full z-10 font-mono pointer-events-none shadow-lg border border-white/20 whitespace-nowrap animate-bounce-slow">
            {t.sticky_free_badge}
        </div>

        <div className="flex flex-col justify-center leading-none min-w-0">
            <span className="text-[6.5px] text-slate-400 font-mono flex items-center gap-1 mb-0.5 uppercase tracking-widest font-bold truncate">
                {t.sticky_terminal_access}
            </span>
            <div className="flex items-baseline gap-1">
                <span className="text-primary font-display font-bold text-xs uppercase truncate">{t.sticky_create_account}</span>
            </div>
        </div>

        <button 
            className="h-10 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-display font-black px-2.5 rounded-xl shadow-neon flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest whitespace-nowrap border border-white/10"
        >
            {t.sticky_register_btn}
            <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
