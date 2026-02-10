
import React, { useState, useMemo } from 'react';
import { Plus, HelpCircle, MessageCircleQuestion, ChevronDown } from 'lucide-react';
import { useCore } from '../core/CoreContext';
import { FaqItemContent } from '../core/types';
import { UI_TRANSLATIONS } from '../core/translations';

export const FAQ: React.FC = () => {
  const { content, locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    if (openCategory !== category) {
      setOpenQuestion(null);
    }
    setOpenCategory(prev => prev === category ? null : category);
  };

  const toggleQuestion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenQuestion(prev => prev === id ? null : id);
  };

  const groupedFaq = useMemo(() => {
    const groups: Record<string, FaqItemContent[]> = {};
    content.faq.forEach(item => {
      const cat = item.category || 'Geral';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [content.faq]);

  return (
    <section id="faq" className="py-16 md:py-24 bg-surface border-t border-border-dim">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center p-2.5 md:p-3 bg-brand-500/10 rounded-xl mb-4 text-brand-400 border border-brand-500/20">
             <HelpCircle className="w-6 h-6 md:w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-primary mb-3 md:mb-4 uppercase tracking-tight leading-tight">
            {t.faq_title}
          </h2>
          <p className="text-secondary max-w-2xl mx-auto text-base md:text-lg leading-snug">
            {t.faq_subtitle}
          </p>
        </div>

        <div className="space-y-4 md:space-y-8">
          {(Object.entries(groupedFaq) as [string, FaqItemContent[]][]).map(([category, items], groupIdx) => {
            const isCategoryOpen = openCategory === category;
            
            return (
              <div 
                key={groupIdx} 
                className={`border-2 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 overflow-hidden ${
                  isCategoryOpen 
                    ? 'border-brand-500 bg-surface-highlight shadow-[0_0_60px_rgba(var(--brand-rgb),0.2)]' 
                    : 'border-border-dim bg-surface/50 hover:border-border-highlight'
                }`}
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className={`w-full flex items-center justify-between p-6 md:p-10 text-left focus:outline-none group transition-colors ${isCategoryOpen ? 'bg-brand-500/5' : ''}`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className={`text-2xl md:text-3xl transition-transform duration-500 ${isCategoryOpen ? 'scale-125 rotate-12' : 'group-hover:scale-110'}`}>🟦</span>
                    <h3 className={`text-lg md:text-3xl font-display font-black uppercase tracking-tighter transition-colors leading-tight ${isCategoryOpen ? 'text-brand-400' : 'text-primary'}`}>
                      {category}
                    </h3>
                  </div>
                  <div className={`p-2 md:p-3 rounded-full transition-all duration-500 ${isCategoryOpen ? 'bg-brand-500 text-white rotate-180 shadow-neon' : 'bg-surface-highlight text-secondary group-hover:text-white'}`}>
                    <ChevronDown className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                </button>

                <div 
                  className={`transition-all duration-700 ease-in-out overflow-hidden ${
                    isCategoryOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="py-8 md:py-24 px-4 md:px-12 border-t border-brand-500/10 bg-black/10">
                    <div className="max-w-3xl mx-auto space-y-3 md:space-y-5">
                        {items.map((item, itemIdx) => {
                          const qId = `${groupIdx}-${itemIdx}`;
                          const isQuestionOpen = openQuestion === qId;
                          
                          return (
                            <div 
                              key={qId} 
                              className={`rounded-[1.25rem] md:rounded-[1.5rem] transition-all duration-300 ${
                                isQuestionOpen 
                                  ? 'bg-surface border-2 border-brand-500/30 shadow-lg' 
                                  : 'bg-surface-highlight/40 border border-border-highlight hover:border-brand-500/20'
                              }`}
                            >
                              <button
                                className="w-full flex items-center justify-between p-4 md:p-6 text-left focus:outline-none"
                                onClick={(e) => toggleQuestion(qId, e)}
                              >
                                <span className={`font-bold text-sm md:text-lg pr-4 md:pr-6 transition-colors leading-snug ${isQuestionOpen ? 'text-brand-400' : 'text-secondary group-hover:text-primary'}`}>
                                  {item.question}
                                </span>
                                <div className={`shrink-0 transition-all duration-300 ${isQuestionOpen ? 'rotate-45 text-brand-500' : 'text-muted'}`}>
                                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                              </button>
                              
                              <div 
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                  isQuestionOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                              >
                                <div className="p-4 md:p-6 pt-0 text-muted leading-relaxed text-xs md:text-lg border-t border-white/5 mt-1 md:mt-2 whitespace-pre-line font-medium">
                                  {item.answer}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 md:mt-20 text-center bg-gradient-to-b from-surface-highlight/50 to-surface border border-border-dim rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
           
           <div className="relative z-10">
               <MessageCircleQuestion className="w-10 h-10 md:w-14 md:h-14 text-brand-500 mx-auto mb-4 md:mb-6" />
               <h4 className="text-primary font-bold text-xl md:text-3xl mb-3 md:mb-4 font-display uppercase tracking-tight leading-tight">{t.faq_support_title}</h4>
               <p className="text-secondary mb-8 md:mb-10 max-w-xl mx-auto text-sm md:text-lg leading-relaxed">
                   {t.faq_support_desc}
               </p>
               <button className="w-full md:w-auto px-8 md:px-12 py-4 md:py-6 bg-brand-600 hover:bg-brand-50 text-white rounded-xl md:rounded-[1.5rem] font-black transition-all shadow-neon hover:-translate-y-1 uppercase tracking-widest text-[10px] md:text-sm border border-brand-400/30">
                 {t.faq_support_btn}
               </button>
           </div>
        </div>
      </div>
    </section>
  );
};
