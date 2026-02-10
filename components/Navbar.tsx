
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Menu, X, Wifi, Layout, UserCircle, Globe2, ChevronRight, ZapOff, Zap, Maximize2, Minimize2 } from 'lucide-react';
import { useCore } from '../core/CoreContext';
import { Locale } from '../core/types';
import { UI_TRANSLATIONS } from '../core/translations';

interface NavbarProps {
  onNavigate: (id: string) => void;
  onOpenCheckout?: () => void;
  onOpenMemberPanel?: () => void;
  hasBanner?: boolean;
  onOpenAdmin?: () => void;
  onOpenShowroom?: () => void;
  isLightMode?: boolean;
  onToggleLightMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const LANGUAGES = [
  { id: 'pt', label: 'Português', flag: '🇧🇷' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'es', label: 'Español', flag: '🇪🇸' }
];

export const Navbar: React.FC<NavbarProps> = ({ 
    onNavigate, 
    onOpenCheckout, 
    onOpenMemberPanel,
    hasBanner = true, 
    onOpenAdmin,
    onOpenShowroom,
    isLightMode = false,
    onToggleLightMode,
    isFullscreen = false,
    onToggleFullscreen
}) => {
  const { setLocale, locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 10) setIsVisible(true);
        else if (currentScrollY > lastScrollY.current && currentScrollY > 100) setIsVisible(false);
        else setIsVisible(true);
        lastScrollY.current = currentScrollY;
      }
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
      e.preventDefault();
      e.stopPropagation();
      setIsMenuOpen(false);
      action();
  };

  const menuItems = [
    { id: 'home', label: `🏠 ${t.home}`, action: () => onNavigate('home') }
  ];

  const FlagSelector = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-2 p-1.5 bg-slate-800/40 rounded-xl border border-white/5 ${className}`}>
        {LANGUAGES.map((lang) => (
            <button
                key={lang.id}
                onClick={() => setLocale(lang.id as Locale)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all text-xl hover:scale-110 active:scale-95 ${locale === lang.id ? 'bg-brand-500/20 ring-1 ring-brand-500/50 shadow-inner' : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                title={lang.label}
            >
                {lang.flag}
            </button>
        ))}
    </div>
  );

  return (
    <nav 
        className={`fixed left-0 right-0 z-50 bg-page/95 backdrop-blur-md border-b border-border-dim transition-all duration-300 transform 
        ${hasBanner ? 'top-[41px] md:top-[44px]' : 'top-0'}
        ${isVisible ? 'translate-y-0' : '-translate-y-[200%]'}
        `}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => handleAction(e, () => onNavigate('home'))}>
          <div className="p-2 rounded-lg shadow-neon bg-brand-600"><Gamepad2 className="w-6 h-6 text-white" /></div>
          <span className="text-2xl font-display font-bold text-white tracking-wider">CM <span className="text-brand-500">ELITE</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
            <button onClick={(e) => handleAction(e, () => onNavigate('home'))} className="text-secondary hover:text-white text-xs font-bold uppercase tracking-widest">{t.home}</button>
        </div>

        <div className="flex items-center gap-2">
            {/* IDIOMAS DESKTOP */}
            <FlagSelector className="hidden lg:flex mr-2" />

            {/* FULL SCREEN DESKTOP */}
            <button 
                onClick={onToggleFullscreen}
                className="hidden md:flex p-2 rounded-xl border border-white/5 bg-slate-800/50 text-slate-500 hover:text-brand-400 transition-all shadow-sm"
                title={isFullscreen ? t.fullscreen_off : t.fullscreen_on}
            >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button 
                onClick={onToggleLightMode}
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isLightMode ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' : 'bg-slate-800/50 border-white/5 text-slate-500 hover:text-white'}`}
            >
                {isLightMode ? <ZapOff size={18} /> : <Zap size={18} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isLightMode ? 'Lite ON' : 'Elite'}</span>
            </button>
            
            <button className="md:hidden text-secondary p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-page z-40 p-4 space-y-4 animate-fade-in flex flex-col h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
                {menuItems.map((item) => (
                    <button 
                        key={item.id} 
                        onClick={(e) => handleAction(e, item.action)} 
                        className={`w-full text-left p-4 rounded-xl font-bold text-lg border border-white/5 flex items-center gap-3 transition-all ${item.id === 'member' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-white/5 text-secondary'}`}
                    >
                        {item.label}
                    </button>
                ))}

                {/* FULL SCREEN NO MOBILE MENU */}
                <button 
                    onClick={(e) => handleAction(e, onToggleFullscreen!)} 
                    className="w-full text-left p-4 rounded-xl font-bold text-lg border border-white/5 flex items-center gap-3 bg-white/5 text-secondary transition-all"
                >
                    {isFullscreen ? <><Minimize2 size={20} /> {t.fullscreen_off}</> : <><Maximize2 size={20} /> {t.fullscreen_on}</>}
                </button>
            </div>

            {/* SELETOR DE IDIOMAS MOBILE CENTRALIZADO */}
            <div className="pt-6 border-t border-white/5 flex flex-col items-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                    <Globe2 size={12} /> {t.lang_selector}
                </p>
                <FlagSelector />
            </div>
            
            <div className="mt-auto pb-10">
                <button onClick={(e) => handleAction(e, onOpenCheckout!)} className="w-full bg-gradient-to-r from-brand-600 to-emerald-600 py-5 rounded-2xl text-white font-black text-xl shadow-neon">
                    {t.free_access_btn}
                </button>
                <p className="text-center text-[10px] text-slate-600 uppercase mt-4 tracking-widest">Protocolo Jarvis v4.7.0</p>
            </div>
        </div>
      )}
    </nav>
  );
};
