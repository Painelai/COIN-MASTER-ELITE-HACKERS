
import React from 'react';
import { Shield, Zap, Lock, Headphones, RefreshCw, TrendingUp, Users, PiggyBank, Smartphone, Plus, ArrowRight, Star, ThumbsUp, AlertCircle, ChevronDown, ChevronUp, GripVertical, Brain, Ghost, EyeOff, Info, Target, Cpu } from 'lucide-react';
import { useCore } from '../core/CoreContext';
import { UI_TRANSLATIONS } from '../core/translations';

interface FeaturesProps {
    onOpenDetails?: () => void;
    staticMode?: boolean;
}

const ICON_MAP: Record<string, any> = {
    Shield, Zap, Lock, Headphones, RefreshCw, TrendingUp, Users, PiggyBank, Smartphone, Brain, Ghost, EyeOff, AlertCircle, Target, Cpu
};

export const Features: React.FC<FeaturesProps> = ({ onOpenDetails, staticMode = false }) => {
  const { content, locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  
  const features = content.features.map(f => ({
      ...f,
      icon: ICON_MAP[f.iconName] || Zap
  }));

  return (
    <section id="features" className="py-12 md:py-24 bg-page relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-6xl font-black text-blue-500 mb-3 md:mb-4 uppercase tracking-tighter italic leading-tight">
            {t.features_main_title}
          </h2>
          <p className="text-secondary max-w-3xl mx-auto text-base md:text-2xl font-light tracking-wide italic leading-snug">
            {t.features_main_subtitle}
          </p>
        </div>

        <div className="space-y-8 md:space-y-12">
            <div className="relative">
                {/* Grid alterado para 2 colunas em desktop conforme solicitado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                  {features.map((feature, idx) => {
                    const isSpecial = feature.title.toLowerCase().includes('resultado') || feature.title.toLowerCase().includes('comprometimento');
                    
                    return (
                      <div 
                        key={idx} 
                        className={`group relative border p-8 md:p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full animate-fade-in w-full
                        ${isSpecial 
                            ? 'bg-brand-900/10 border-brand-500/30 hover:border-brand-500/60 hover:bg-brand-900/20 shadow-lg' 
                            : 'bg-surface/40 border-border-dim/60 hover:border-brand-500/50 hover:bg-surface-highlight/60 shadow-md'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none from-brand-500/10"></div>

                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-6">
                              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner border
                                ${isSpecial 
                                    ? 'bg-brand-900/20 text-brand-500 border-brand-500/30 group-hover:bg-brand-600 group-hover:text-white' 
                                    : 'bg-surface-highlight text-secondary border-border-highlight/50 group-hover:text-brand-400 group-hover:bg-brand-950 group-hover:border-brand-500/20'
                                }`}>
                                  {React.createElement(feature.icon, { className: "w-7 h-7 md:w-8 md:h-8" })}
                              </div>
                          </div>

                          <h3 className={`text-xl md:text-2xl font-display font-black mb-4 md:mb-5 uppercase tracking-tight transition-colors
                            ${isSpecial ? 'text-brand-400' : 'text-primary group-hover:text-brand-400'}`}>
                              {feature.title}
                          </h3>
                          <p className="text-sm md:text-lg text-secondary leading-relaxed font-medium group-hover:text-white transition-colors">
                              {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
