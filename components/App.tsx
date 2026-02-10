
import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { CoreProvider, useCore } from '../core/CoreContext';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ProductCard, GridProductCard } from './ProductCard';
import { Features } from './Features';
import { Testimonials } from './Testimonials';
import { Footer } from './Footer';
import { FAQ } from './FAQ';
import { TopBanner } from './TopBanner';
import { Product } from '../types'; 
import { Locale } from '../core/types';
import { CheckoutModal } from './CheckoutModal';
import { SalesToast } from './SalesToast';
import { ExitPopup } from './ExitPopup';
import { ServerStatusModal } from './ServerStatusModal';
import { FeaturesModal } from './FeaturesModal';
import { GeneratorDemo } from './GeneratorDemo';
import { GhostModeDemo } from './GhostModeDemo';
import { StickyCTA } from './StickyCTA';
import { LoadingScreen } from './LoadingScreen';
import { WelcomeModal } from './WelcomeModal';
import { Grid2X2, ChevronDown, ChevronUp, Loader2, Zap, Brain, Target, Magnet, Ghost, Coins, Crown, Users, Rabbit } from 'lucide-react';
import { usePerformanceMonitoring } from '../utils/performance';
import { useDiscountTimer } from '../hooks/useDiscountTimer';
import { UI_TRANSLATIONS } from '../core/translations';

// ESTILOS UNIFICADOS
import '../layout/css/ThemeStyles.css';

// LAZY LOADING
const GlobalNotes = React.lazy(() => import('../tools/GlobalNotes').then(module => ({ default: module.GlobalNotes })));
const AdminPanel = React.lazy(() => import('./AdminPanel').then(module => ({ default: module.AdminPanel })));
const TemplateViewer = React.lazy(() => import('../TemplateViewer').then(module => ({ default: module.TemplateViewer })));
const ElitePanel = React.lazy(() => import('../EliteUserPanel/ElitePanel').then(module => ({ default: module.ElitePanel })));
const FloatingChat = React.lazy(() => import('./FloatingChat').then(module => ({ default: module.FloatingChat })));

const ICON_MAP: Record<string, any> = {
    Zap, Brain, Target, Magnet, Ghost, Coins, Crown, Users, Rabbit
};

const AppContent = () => {
  const { config, features, content, isInitialized, toggleFeature, updateConfig, logAction, setLocale, locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  const { isExpired } = useDiscountTimer();
  
  const [appLoading, setAppLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [siteReady, setSiteReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home'|'ghost'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMemberPanelOpen, setIsMemberPanelOpen] = useState(false);
  const [isServerStatusOpen, setIsServerStatusOpen] = useState(false);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(features.topBanner);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShowroomOpen, setIsShowroomOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // MODO LITE / PERFORMANCE
  const [isLightMode, setIsLightMode] = useState(() => {
      return localStorage.getItem('cm_lite_mode') === 'true';
  });

  const isSystemPaused = useMemo(() => {
    return isAdminOpen || isMemberPanelOpen || isCheckoutOpen || isFeaturesModalOpen || isServerStatusOpen || appLoading || showWelcome;
  }, [isAdminOpen, isMemberPanelOpen, isCheckoutOpen, isFeaturesModalOpen, isServerStatusOpen, appLoading, showWelcome]);

  usePerformanceMonitoring();

  // Monitor de FullScreen
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  // Sincroniza o modo Lite com o DOM
  useEffect(() => {
      document.documentElement.setAttribute('data-perf', isLightMode ? 'low' : 'high');
      localStorage.setItem('cm_lite_mode', isLightMode.toString());
      logAction('PERFORMANCE_MODE_CHANGE', `Modo Lite: ${isLightMode}`, 'info');
  }, [isLightMode]);

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentFileContext = useMemo(() => {
      if (appLoading) return 'LoadingScreen.tsx';
      if (showWelcome) return 'WelcomeModal.tsx';
      if (isAdminOpen) return 'admin_panel.tsx';
      if (isMemberPanelOpen) return 'EliteUserPanel.tsx';
      if (isCheckoutOpen) return 'CheckoutModal.tsx';
      if (isShowroomOpen) return 'TemplateViewer.tsx';
      
      switch(currentPage) {
          case 'ghost': return 'GhostModeDemo.tsx';
          case 'home': return 'Hero.tsx';
          default: return 'index.tsx';
      }
  }, [appLoading, showWelcome, isAdminOpen, isMemberPanelOpen, isCheckoutOpen, isShowroomOpen, currentPage]);

  useEffect(() => {
    if (isExpired && features.nemesisCampaignActive) {
        if (features.nemesisCampaignActive) toggleFeature('nemesisCampaignActive');
        updateConfig('pricingMode', 'LayoutPRINCIPAL');
        setIsBannerVisible(true); 
    }
  }, [isExpired, features.nemesisCampaignActive]);

  useEffect(() => {
      if (isInitialized && content.products.length > 0) {
          const timer = setTimeout(() => {
              setSiteReady(true);
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [isInitialized, content.products]);

  if (!isInitialized || !content.products || content.products.length === 0) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          </div>
      );
  }

  const products: Product[] = content.products.map(p => ({
      ...p,
      icon: ICON_MAP[p.iconName] || Zap
  }));

  const handleSecretTrigger = () => {
      logoClickCount.current += 1;
      if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
      if (logoClickCount.current >= 5) {
          setIsAdminOpen(true);
          logoClickCount.current = 0;
      } else {
          logoClickTimer.current = setTimeout(() => {
              logoClickCount.current = 0;
          }, 1000);
      }
  };

  const handleNavigate = (target: string) => {
    if (target === 'home') {
        if (currentPage !== 'home') setCurrentPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handleSecretTrigger();
        return;
    }
    if (target === 'specs') { setIsFeaturesModalOpen(true); return; }
    if (target === 'ghost') {
        setCurrentPage('ghost');
        window.scrollTo(0, 0);
        return;
    }
    if (target === 'connectivity') {
        if (currentPage !== 'home') setCurrentPage('home');
        setTimeout(() => {
            const el = document.getElementById('network-diagnostic');
            if (el) {
                const offset = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }, 100);
        return;
    }

    if (currentPage !== 'home') setCurrentPage('home');
    setTimeout(() => {
        const el = document.getElementById(target);
        if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }, 100);
  };

  const handleAccessRequest = () => {
    setIsMemberPanelOpen(true);
    logAction('REGISTRATION_INTENT', 'User triggered access request from landing', 'info');
  };

  return (
    <div className="min-h-screen bg-page text-primary font-sans selection:bg-brand-500 selection:text-white relative">
      
      <Suspense fallback={null}>
          {features.globalNotes && <GlobalNotes forcedContext={currentFileContext} />}
          {isAdminOpen && <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />}
          {isShowroomOpen && <TemplateViewer onExit={() => setIsShowroomOpen(false)} />}
          {isMemberPanelOpen && <ElitePanel onClose={() => setIsMemberPanelOpen(false)} onOpenCheckout={() => setIsCheckoutOpen(true)} />}
          {features.floatingChat && !appLoading && !showWelcome && (
            <FloatingChat 
                hasBottomOffset={currentPage === 'home'} 
                staticMode={isLightMode || isSystemPaused} 
                onCTA={handleAccessRequest}
            />
          )}
      </Suspense>

      {appLoading && (
        <LoadingScreen 
            isSiteReady={siteReady} 
            onFinish={(lang) => {
                logAction('LANGUAGE_SELECTED', `User selected: ${lang}`, 'info');
                setLocale(lang as Locale);
                setAppLoading(false);
                setShowWelcome(true); 
            }} 
        />
      )}

      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />

      <div className={`transition-all duration-1000 ${(appLoading || showWelcome) ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100'}`}>
          {isBannerVisible && features.topBanner && <TopBanner onClose={() => setIsBannerVisible(false)} />}
          
          <Navbar 
            onNavigate={handleNavigate} 
            onOpenCheckout={handleAccessRequest} 
            onOpenMemberPanel={() => setIsMemberPanelOpen(true)}
            hasBanner={isBannerVisible} 
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenShowroom={() => setIsShowroomOpen(true)}
            isLightMode={isLightMode}
            onToggleLightMode={() => setIsLightMode(!isLightMode)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          <main className={currentPage === 'home' ? 'pb-24 md:pb-0' : ''}>
            {currentPage === 'home' && (
                <>
                    <Hero 
                        onNavigate={handleNavigate} 
                        onOpenCheckout={handleAccessRequest} 
                        onOpenServerStatus={() => setIsServerStatusOpen(true)} 
                        onOpenLogin={() => setIsMemberPanelOpen(true)}
                        paused={isLightMode || isSystemPaused} 
                    />
                    <Features onOpenDetails={() => setIsFeaturesModalOpen(true)} staticMode={isLightMode || isSystemPaused} />
                    
                    <section id="products" className="py-12 md:py-20 max-w-7xl mx-auto px-4 scroll-mt-24">
                      <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4 md:mb-6 uppercase tracking-tight leading-tight">
                            {t.section_terminal_title}
                        </h2>
                      </div>
                      <div className="max-w-md mx-auto mb-8 md:mb-12 relative">
                         <ProductCard product={products[0]} onBuy={handleAccessRequest} isFeatured={true} />
                      </div>
                      
                      <div className="text-center mt-12 mb-6">
                        <h3 className="text-xl md:text-2xl font-display font-black text-brand-500 uppercase tracking-[0.2em] italic">
                            {t.features_title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 mb-8 cursor-pointer select-none max-w-2xl mx-auto" onClick={() => setShowAllProducts(!showAllProducts)}>
                        <div className="h-px bg-border-dim flex-1"></div>
                        <div className="text-muted text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-surface border border-border-dim font-mono shadow-sm">
                          <Grid2X2 className="w-3 h-3 md:w-4 h-4" />
                          {showAllProducts ? t.hide_tools : t.view_all}
                          {showAllProducts ? <ChevronUp className="w-3 h-3 md:w-4 h-4" /> : <ChevronDown className="w-3 h-3 md:w-4 h-4" />}
                        </div>
                        <div className="h-px bg-border-dim flex-1"></div>
                      </div>
                      
                      {showAllProducts && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
                            {products.slice(1).map((product) => <GridProductCard key={product.id} product={product} onBuy={handleAccessRequest} />)}
                          </div>
                      )}
                    </section>

                    <Testimonials paused={isSystemPaused} />
                    
                    <div id="network-diagnostic" className="py-16 md:py-24 bg-surface/30 border-y border-white/5 scroll-mt-24">
                         <GeneratorDemo onOpenCheckout={handleAccessRequest} />
                    </div>
                    
                    <FAQ />
                </>
            )}
            {currentPage === 'ghost' && (
                 <div className="pt-32 pb-20 min-h-screen bg-page">
                     <GhostModeDemo />
                 </div>
            )}
          </main>

          <Footer />
          
          {features.salesToast && <SalesToast staticMode={isLightMode || isSystemPaused} />}
          
          {currentPage === 'home' && (
              <>
                {features.exitPopup && <ExitPopup onAccept={handleAccessRequest} onOpenAdmin={() => setIsAdminOpen(true)} />}
                <StickyCTA onOpenCheckout={handleAccessRequest} />
              </>
          )}
      </div>

      {selectedProduct && <CheckoutModal product={selectedProduct} isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />}
      <ServerStatusModal isOpen={isServerStatusOpen} onClose={() => setIsServerStatusOpen(false)} />
      <FeaturesModal isOpen={isFeaturesModalOpen} onClose={() => setIsFeaturesModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <CoreProvider>
      <AppContent />
    </CoreProvider>
  );
}
