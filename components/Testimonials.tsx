
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, StarHalf, Users, ThumbsUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { generateUniqueIdentity } from '../data/names';
import { useCore } from '../core/CoreContext';
import { UI_TRANSLATIONS } from '../core/translations';

const TESTIMONIAL_TEMPLATES = [
    { text: "Finalmente fechei o set do Espaço! O Card Finisher achou a carta que faltava no segundo baú.", roles: ["Set Completo", "Colecionador", "Vila 210+", "Membro Vitalício"] },
    { text: "O Bot da Viking Quest é insano. Fiz os 3 níveis dourados sem gastar nem 2bi de moedas.", roles: ["Top Evento", "Farmer", "Mestre Viking", "Vila 150+"] },
    { text: "Tava travado na vila 180 sem coins. Usei o Sniper de Escudos e farmei 10bi em uma hora.", roles: ["Vila 192", "Vila 205", "Vila 250+", "Membro Elite"]  },
    { text: "Achei que era fake, mas o Sequence Reader acertou 3 ataques seguidos x100. Recuperei o investimento na hora.", roles: ["Apostador VIP", "High Roller", "Vila 100+", "Membro Vitalício"] },
    { text: "Meu Tigre tava nível baixo, mas com o Speed Hack upei ele pro max rapidinho.", roles: ["Pet Max", "Farmer", "Vila 140", "VIP"] }
];

interface GeneratedReview {
    id: number;
    name: string;
    role: string;
    content: string;
    rating: number;
    date: string;
    avatarUrl: string;
    gender: 'men' | 'women';
}

const generateReviews = (count: number): GeneratedReview[] => {
    const reviews: GeneratedReview[] = [];
    for (let i = 0; i < count; i++) {
        const isMale = i % 2 === 0;
        const fullName = generateUniqueIdentity(isMale ? 'male' : 'female');
        const genderDir = isMale ? 'men' : 'women';
        const template = TESTIMONIAL_TEMPLATES[i % TESTIMONIAL_TEMPLATES.length];
        reviews.push({
            id: i,
            name: fullName,
            role: template.roles[i % template.roles.length],
            content: template.text,
            rating: 5.0,
            date: "Live",
            avatarUrl: `https://randomuser.me/api/portraits/${genderDir}/${(i % 90) + 1}.jpg`,
            gender: genderDir
        });
    }
    return reviews;
};

export const Testimonials: React.FC<{ paused?: boolean }> = ({ paused = false }) => {
  const { content, locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const reviews = useMemo(() => generateReviews(50), []);
  const sectionRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section id="reviews" ref={sectionRef} className="py-12 md:py-24 bg-page relative overflow-hidden px-4">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[9px] md:text-[10px] font-bold mb-3 md:mb-4 uppercase tracking-widest leading-none">
            {t.testi_badge}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black text-primary mb-4 md:mb-6 uppercase leading-tight">
            {t.testi_title_prefix} <span className="text-brand-500">{t.testi_title_suffix}</span>
          </h2>
        </div>

        <div className="relative w-full max-w-2xl mx-auto">
             <div className="bg-surface border border-border-dim rounded-[2rem] md:rounded-[2.5rem] relative shadow-2xl overflow-hidden min-h-[360px] md:min-h-[400px] flex flex-col">
                 <div key={currentIndex} className="relative z-10 text-center w-full flex-1 flex flex-col items-center p-6 md:p-10 animate-fade-in">
                       <div className="shrink-0 flex flex-col items-center mb-5 md:mb-6">
                           <div className="w-16 h-16 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-br from-brand-500 to-emerald-700 shadow-neon mb-3 md:mb-4">
                               <img src={reviews[currentIndex].avatarUrl} className="w-full h-full rounded-full object-cover border-4 border-surface" alt=""/>
                           </div>
                           <h4 className="font-bold text-primary text-base md:text-lg font-display uppercase truncate max-w-[200px] md:max-w-[240px] leading-tight">{reviews[currentIndex].name}</h4>
                           <span className="text-[9px] md:text-[10px] font-bold text-brand-400 uppercase tracking-tighter">{reviews[currentIndex].role}</span>
                       </div>
                       
                       <p className="text-base md:text-2xl text-secondary italic leading-relaxed font-serif px-2 flex-1 flex items-center justify-center">
                          "{reviews[currentIndex].content}"
                       </p>
                       
                       <div className="pt-5 md:pt-6 mt-auto">
                           <div className="flex justify-center gap-1 mb-1 md:mb-2">
                               {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 md:w-4 h-4 fill-brand-500 text-brand-500" />)}
                           </div>
                           <span className="font-display font-black text-lg md:text-xl text-primary">5.0</span>
                       </div>
                 </div>
             </div>

             <button onClick={prevSlide} className="absolute left-[-15px] sm:left-[-60px] top-1/2 -translate-y-1/2 p-2 text-muted hover:text-white transition-all hidden sm:block">
                <ChevronLeft size={48} strokeWidth={1} />
             </button>
             <button onClick={nextSlide} className="absolute right-[-15px] sm:right-[-60px] top-1/2 -translate-y-1/2 p-2 text-muted hover:text-white transition-all hidden sm:block">
                <ChevronRight size={48} strokeWidth={1} />
             </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-12 md:mt-16">
            {[
                { label: t.testi_stat_members, val: content.socialProof.totalMembers, icon: Users },
                { label: t.testi_stat_satisfaction, val: content.socialProof.satisfactionRate, icon: ThumbsUp },
                { label: t.testi_stat_refund, val: content.socialProof.refundRate, icon: AlertCircle },
                { label: t.testi_stat_rating, val: '4.9/5', icon: Star }
            ].map((stat, i) => (
                <div key={i} className="bg-surface/60 border border-border-dim p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                    <div className="text-lg md:text-xl font-black text-primary flex justify-center items-center gap-2 mb-0.5 md:mb-1 leading-tight">
                        <stat.icon size={14} className="text-brand-500" /> {stat.val}
                    </div>
                    <div className="text-[8px] md:text-[9px] text-muted uppercase font-bold tracking-widest">{stat.label}</div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};
