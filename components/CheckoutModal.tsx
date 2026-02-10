
import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { Product } from '../types';
import { 
  X, QrCode, CreditCard, ShieldCheck, Loader2, CheckCircle2, Zap, Calendar, 
  Infinity as InfinityIcon, ArrowRight, Timer, Tag, Gift, User, Check, 
  Package, Sparkles, Clock, Ghost as GhostIcon, Cpu, Lock, Link as LinkIcon, Bitcoin,
  Copy, Star, ClipboardList, Crown, ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../data/pricing';
import { useDiscountTimer } from '../hooks/useDiscountTimer';
import { useCore } from '../core/CoreContext';
import { PlanContent, ProductContent } from '../core/types';
import { UI_TRANSLATIONS } from '../core/translations';

interface CheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, isOpen, onClose }) => {
  const { content, config, features, locale } = useCore(); 
  const t = UI_TRANSLATIONS[locale];
  const [step, setStep] = useState<'plan' | 'payment' | 'processing' | 'success'>('plan');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'link' | 'crypto' | null>(null);
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  
  const activePlans = useMemo(() => {
    return content.plans
      ? [...content.plans].filter(p => p.active).sort((a, b) => a.order - b.order)
      : [];
  }, [content.plans]);

  const [pixCopied, setPixCopied] = useState(false);
  const [cryptoCopied, setCryptoCopied] = useState(false);
  
  const { timeLeft, formatTime } = useDiscountTimer();
  const isPromoActive = features.nemesisCampaignActive || config.pricingMode === 'LayoutPROMO';

  useLayoutEffect(() => {
    if (isOpen) {
      setStep('plan');
      const lifetimePlan = activePlans.find(p => p.type === 'lifetime');
      if (lifetimePlan) {
        setSelectedPlanId(lifetimePlan.id);
      } else if (activePlans.length > 0) {
        setSelectedPlanId(activePlans[0].id);
      }
      setExpandedPlanId(null); 
    }
  }, [isOpen, activePlans]);

  const rawSelectedPlan = activePlans.find(p => p.id === selectedPlanId);

  const enabledMethods = useMemo(() => {
    if (!rawSelectedPlan || !rawSelectedPlan.paymentSettings) return [];
    const pay = rawSelectedPlan.paymentSettings;
    const methods: ('pix' | 'card' | 'link' | 'crypto')[] = [];
    if (pay.pix?.enabled || pay.copyPaste?.enabled) methods.push('pix');
    if (pay.card?.enabled) methods.push('card');
    if (pay.paymentLink?.enabled) methods.push('link');
    if (pay.crypto?.enabled) methods.push('crypto');
    return methods;
  }, [rawSelectedPlan]);

  useEffect(() => {
    if (enabledMethods.length > 0) {
      setPaymentMethod(enabledMethods[0]);
    } else {
      setPaymentMethod(null);
    }
  }, [enabledMethods]);

  const getAdjustedPrices = (plan: PlanContent) => {
      let currentTo = plan.priceTo;
      const currentFrom = plan.priceFrom || (plan.priceTo * 1.5); 
      if (isPromoActive && plan.type !== 'free') {
          if (plan.type === 'annual') currentTo = Number((plan.priceTo * 0.5).toFixed(2));
          else if (plan.type === 'lifetime') currentTo = Math.max(plan.priceTo - 50, 47); 
      }
      return { priceTo: currentTo, priceFrom: currentFrom };
  };

  const handlePlanClick = (id: string) => {
      if (selectedPlanId === id) {
          setExpandedPlanId(prev => prev === id ? null : id);
      } else {
          setSelectedPlanId(id);
          setExpandedPlanId(id);
      }
  };

  const handlePay = () => {
    if (!rawSelectedPlan?.paymentSettings) return;
    const pay = rawSelectedPlan.paymentSettings;
    if (paymentMethod === 'link' && pay.paymentLink?.url) window.open(pay.paymentLink.url, '_blank');
    else if (paymentMethod === 'card' && pay.card?.gatewayUrl) window.open(pay.card.gatewayUrl, '_blank');
    setStep('processing');
    setTimeout(() => { setStep('success'); }, 2000);
  };

  const selectedPlan = rawSelectedPlan ? { ...rawSelectedPlan, ...getAdjustedPrices(rawSelectedPlan) } : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-float flex flex-col max-h-[95vh]">
        
        <div className="bg-slate-900/80 border-b border-white/5 py-2.5 flex justify-center items-center gap-2 shrink-0">
            <Timer className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">{t.checkout_promo_lot}</span>
        </div>

        <div className="flex items-center justify-between p-6 pb-4 shrink-0">
          <h3 className="text-xl font-display font-black text-primary uppercase tracking-tight">
            {step === 'plan' ? t.checkout_title_plan : step === 'payment' ? t.checkout_title_payment : step === 'processing' ? t.checkout_processing : t.checkout_success_title}
          </h3>
          <button onClick={onClose} className="text-secondary hover:text-white p-1 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 pt-0 overflow-y-auto custom-scrollbar flex-1">
          {step === 'plan' && (
            <div key="step-plan" className="space-y-6 animate-slide-up-fade">
              <div className="space-y-2">
                  <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.checkout_promo_lot}</span>
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">{t.checkout_limited_spots}</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 w-[82%] rounded-full"></div>
                  </div>
              </div>

              <div className="flex flex-col gap-4"> 
                  {activePlans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      const isExpanded = expandedPlanId === plan.id;
                      const prices = getAdjustedPrices(plan);
                      const isLifetime = plan.type === 'lifetime';
                      const discountPercentage = Math.round((1 - (prices.priceTo / prices.priceFrom)) * 100);

                      return (
                        <div key={plan.id} className="relative">
                            {isLifetime && (
                                <div className="absolute -top-2.5 right-6 bg-brand-500 text-black text-[9px] font-black px-3 py-0.5 rounded-full z-20 shadow-lg uppercase tracking-tighter">
                                    {t.checkout_recommended}
                                </div>
                            )}

                            <button 
                                onClick={() => handlePlanClick(plan.id)}
                                className={`w-full rounded-[1.5rem] border text-left transition-all relative overflow-hidden flex flex-col ${isSelected ? 'bg-brand-500/5 border-brand-500 shadow-neon' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                            >
                                <div className="p-5 flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-brand-500' : 'border-white/20'}`}>
                                        {isSelected && <div className="w-3 h-3 bg-brand-500 rounded-full" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {isLifetime ? <InfinityIcon className={`w-5 h-5 ${isSelected ? 'text-brand-500' : 'text-slate-500'}`} /> : <Calendar className="w-5 h-5 text-slate-500" />}
                                                    <span className={`text-lg font-display font-black uppercase tracking-tight ${isSelected ? 'text-primary' : 'text-secondary'}`}>{plan.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="bg-red-600/20 text-red-500 border border-red-500/30 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">
                                                        -{discountPercentage}% {t.checkout_economy}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-slate-500 font-mono line-through leading-none opacity-60">{formatCurrency(prices.priceFrom)}</div>
                                                <div className={`font-mono font-black text-xl leading-tight ${isSelected ? 'text-white' : 'text-slate-400'}`}>R$ {prices.priceTo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-5 pb-6 space-y-5 animate-fade-in">
                                        <div className="h-px bg-white/10"></div>
                                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.15em] mb-1">
                                                <Sparkles className="w-3.5 h-3.5" /> {t.checkout_benefits}
                                            </div>
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {plan.features.slice(0, 8).map((f, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300 font-semibold">
                                                        <Star className="w-3 h-3 text-brand-500 fill-brand-500" />
                                                        {f.replace('⭐', '').trim()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>
                      );
                  })}
              </div>

              <button 
                onClick={() => setStep('payment')}
                disabled={!selectedPlanId}
                className="w-full mt-2 py-5 bg-brand-500 hover:bg-brand-400 text-black font-display font-black text-lg uppercase tracking-[0.15em] rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                {t.checkout_cta_access}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 'payment' && selectedPlan && (
            <div key="step-payment" className="animate-slide-up-fade space-y-6">
              <div className={`border p-5 rounded-2xl ${isPromoActive ? 'bg-red-950/20 border-red-500/30' : 'bg-brand-900/10 border-brand-500/20'}`}>
                  <div className="flex justify-between items-center">
                      <div>
                          <span className={`text-[10px] block uppercase tracking-widest font-black mb-1 ${isPromoActive ? 'text-red-400' : 'text-brand-400'}`}>{t.checkout_order_summary}</span>
                          <span className="text-white font-display font-black text-xl leading-none">{selectedPlan.name.toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                          <span className="text-white font-mono font-black text-2xl">{formatCurrency(selectedPlan.priceTo)}</span>
                      </div>
                  </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {enabledMethods.map(method => (
                        <button key={method} onClick={() => setPaymentMethod(method)} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === method ? 'bg-brand-500 text-black border-brand-500' : 'bg-white/5 border-white/10 text-secondary'}`}>
                            {method === 'pix' && <QrCode className="w-6 h-6" />}{method === 'card' && <CreditCard className="w-6 h-6" />}{method === 'link' && <LinkIcon className="w-6 h-6" />}{method === 'crypto' && <Bitcoin className="w-6 h-6" />}
                            <span className="text-[10px] font-black uppercase">{method.toUpperCase()}</span>
                        </button>
                    ))}
                </div>
              </div>

              <div className="pt-2">
                <button onClick={handlePay} className="w-full py-5 bg-brand-500 hover:bg-brand-400 text-black font-display font-black text-lg uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3">
                    <ShieldCheck className="w-6 h-6" /> {t.checkout_pay_cta}
                </button>
                <button onClick={() => setStep('plan')} className="w-full mt-6 text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-[0.3em]">{t.checkout_change_plan}</button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div key="step-processing" className="text-center py-20 animate-slide-up-fade">
              <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-500/10"></div>
                  <Loader2 className="w-full h-full text-brand-500 animate-spin" strokeWidth={3} />
              </div>
              <h4 className="text-2xl font-display font-black text-primary mb-3 uppercase tracking-widest">{t.checkout_processing}</h4>
              <p className="text-secondary text-sm font-medium opacity-60">{t.checkout_sync_license}</p>
            </div>
          )}

          {step === 'success' && (
            <div key="step-success" className="text-center py-16 animate-bounce-in">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h4 className="text-3xl font-display font-black text-primary mb-4 uppercase tracking-tighter">{t.checkout_success_title}</h4>
              <p className="text-secondary text-base mb-10 leading-relaxed opacity-80 max-w-[320px] mx-auto">{t.checkout_success_desc}</p>
              <button onClick={onClose} className="w-full py-5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl font-display text-lg uppercase tracking-widest shadow-neon">{t.checkout_close}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
