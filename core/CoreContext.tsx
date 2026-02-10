
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CoreState, CoreActions, AppConfig, FeatureFlags, ProviderType, Environment, SecurityConfig, AppContent, Locale } from './types.ts';
import { IDataProvider } from '../services/DataProvider.ts';
import { MockProvider } from '../services/MockProvider.ts';
import { RemoteSQLProvider } from '../services/RemoteSQLProvider.ts';
import { SEMANTIC_PALETTE } from '../layout/fragments/Colors.ts';
import { UI_TRANSLATIONS } from './translations';

const providers: Record<ProviderType, IDataProvider> = {
  mock: new MockProvider(),
  sqlite: new RemoteSQLProvider()
};

interface CoreContextType extends CoreState, CoreActions {}

const CoreContext = createContext<CoreContextType | null>(null);

export const CoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ATIVAÇÃO DO BANCO SQL COMO PADRÃO
  const [activeProvider, setActiveProvider] = useState<IDataProvider>(providers.sqlite);
  const [isNemesisPopupForced, setIsNemesisPopupForced] = useState(false);
  
  const [state, setState] = useState<CoreState>({
    config: {
      pricingMode: 'LayoutPRINCIPAL',
      themeMode: 'gold',
      provider: 'sqlite',
      environment: 'prod',
      maintenanceMode: false,
      version: '4.7.2',
      nemesisAnchorPrice: 350
    },
    features: {
      salesToast: true,
      exitPopup: true,
      floatingChat: true,
      topBanner: true,
      emulator: true,
      nemesisCampaignActive: false,
      geminiEnabled: false, 
      globalNotes: true
    },
    security: {
      activeRoles: [],
      permissions: {} as any
    },
    content: {
      hero: {
        titleLine1: "DOMINE O JOGO.",
        titleLine2: "ACESSO LIBERADO.",
        subtitle: "Sincronizando banco de dados...",
        ctaButton: "ENTRAR NO TERMINAL"
      },
      products: [],
      features: [],
      faq: [],
      plans: [],
      footer: { copyrightText: "", disclaimerText: "" },
      socialProof: {
        totalMembers: "0", totalReviews: "0", satisfactionRate: "0%", refundRate: "0%", averageRating: "0",
        recentOpensTemplate: "", recentOpensMin: "0", recentOpensMax: "0", chatOnlineMin: "0", chatOnlineMax: "0", userAddedTemplate: ""
      },
      paymentSettings: {
        pix: { enabled: false, titular: "", chave: "" },
        copyPaste: { enabled: false, titular: "", code: "" },
        paymentLink: { enabled: false, titular: "", url: "" },
        card: { enabled: false, titular: "", gatewayUrl: "" },
        crypto: { enabled: false, titular: "", selectedCoin: 'BTC', wallets: { BTC: "", ETH: "", DOGE: "" } }
      }
    },
    logs: [],
    isInitialized: false,
    isNemesisPopupForced: false,
    locale: (localStorage.getItem('cm_elite_locale') as Locale) || 'pt'
  });

  useEffect(() => {
    const boot = async () => {
      try {
          await activeProvider.init();
          
          // Tenta buscar dados do SQL, se falhar ou retornar nulo (banco novo), usa o Mock como fonte de semente
          let config = await activeProvider.getConfig();
          let features = await activeProvider.getFeatures();
          let content = await activeProvider.getContent();
          
          if (!config || !content) {
              console.log("[Core] Banco vazio. Semeando dados iniciais do mercado...");
              const mock = providers.mock;
              config = await mock.getConfig();
              features = await mock.getFeatures();
              content = await mock.getContent();
              
              // Salva os dados iniciais no SQL para permanência
              await activeProvider.saveConfig(config);
              await activeProvider.saveFeatures(features);
              await activeProvider.saveContent(content);
          }

          const logs = await activeProvider.getLogs();
          
          const security: SecurityConfig = {
              activeRoles: ['super_admin', 'admin', 'editor', 'viewer'],
              permissions: {
                super_admin: ['all'],
                admin: ['configure', 'manage_users'],
                editor: ['edit_content'],
                viewer: ['read_only']
              }
          };

          setState(prev => ({
            ...prev,
            config,
            features,
            logs,
            security,
            content: localizeContent(content, prev.locale),
            isInitialized: true
          }));

          applyVisualTheme(config.themeMode);
      } catch (error) {
          console.error("[Core] Falha na conexão SQL. Usando modo de emergência LocalStorage.");
          setActiveProvider(providers.mock);
      }
    };
    boot();
  }, [activeProvider]);

  const localizeContent = (baseContent: AppContent, locale: Locale): AppContent => {
    const t = UI_TRANSLATIONS[locale];
    if (!t) return baseContent;

    const mappedProducts = (baseContent.products || []).map(p => {
        if (p.id === 'bundle_elite') return { ...p, name: t.prod_bundle_name, description: t.prod_bundle_desc };
        if (p.id === 'tool_sequence') return { ...p, name: t.prod_oracle_name, description: t.prod_oracle_desc };
        if (p.id === 'tool_viking') return { ...p, name: t.prod_viking_name, description: t.prod_viking_desc };
        if (p.id === 'tool_sniper') return { ...p, name: t.prod_sniper_name, description: t.prod_sniper_desc };
        if (p.id === 'tool_ghost') return { ...p, name: t.prod_ghost_name, description: t.prod_ghost_desc };
        if (p.id === 'tool_cards') return { ...p, name: t.prod_cards_name, description: t.prod_cards_desc };
        if (p.id === 'tool_speed') return { ...p, name: t.prod_speed_name, description: t.prod_speed_desc };
        if (p.id === 'tool_magnata') return { ...p, name: t.prod_magnata_name, description: t.prod_magnata_desc };
        return p;
    });

    return {
        ...baseContent,
        products: mappedProducts,
        hero: {
            titleLine1: t.hero_title_1 || baseContent.hero.titleLine1,
            titleLine2: t.hero_title_2 || baseContent.hero.titleLine2,
            subtitle: t.hero_subtitle || baseContent.hero.subtitle,
            ctaButton: t.hero_cta || baseContent.hero.ctaButton
        }
    };
  };

  const applyVisualTheme = (mode: string) => {
    const root = document.documentElement;
    Object.entries(SEMANTIC_PALETTE).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
    });
    if (mode === 'gold') root.style.setProperty('--brand-rgb', '234, 179, 8');
    if (mode === 'cyber') root.style.setProperty('--brand-rgb', '14, 165, 233');
    if (mode === 'matrix') root.style.setProperty('--brand-rgb', '34, 197, 94');
  };

  const actions: CoreActions = {
    updateConfig: async (key, value) => {
      const newConfig = { ...state.config, [key]: value };
      setState(prev => ({ ...prev, config: newConfig }));
      try {
          await activeProvider.saveConfig(newConfig);
          if (key === 'themeMode') applyVisualTheme(value);
          actions.logAction('CONFIG_CHANGE', `Changed ${key} to ${value}`, 'info');
      } catch (e) { console.error(e); }
    },

    toggleFeature: async (key) => {
      if (key === 'geminiEnabled') return;
      const newFeatures = { ...state.features, [key]: !state.features[key] };
      setState(prev => ({ ...prev, features: newFeatures }));
      try {
          await activeProvider.saveFeatures(newFeatures);
          actions.logAction('FEATURE_TOGGLE', `Toggled ${key}`, 'info');
      } catch (e) { console.error(e); }
    },

    updateContent: async (section, key, value) => {
      let sectionData = state.content[section];
      if (key === '' || key === null || key === undefined) {
          sectionData = value;
      } else {
          if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
              sectionData = { ...sectionData, [key]: value };
          }
      }
      const newContent = { ...state.content, [section]: sectionData };
      setState(prev => ({ ...prev, content: newContent }));
      try {
          await activeProvider.saveContent(newContent);
          actions.logAction('CONTENT_UPDATE', `Updated ${section}${key ? '.'+key : ''}`, 'info');
      } catch (e) { console.error(e); }
    },

    setEnvironment: async (env: Environment) => {
        const newConfig = { ...state.config, environment: env };
        setState(prev => ({ ...prev, config: newConfig }));
        try {
            await activeProvider.saveConfig(newConfig);
            actions.logAction('ENV_CHANGE', `Environment set to ${env}`, 'warning');
        } catch (e) { console.error(e); }
    },

    logAction: async (action, details, severity = 'info') => {
      const log = { id: Date.now().toString(), timestamp: Date.now(), action, user: 'ADMIN', details, environment: state.config.environment, severity };
      try {
          await activeProvider.addLog(log);
          const logs = await activeProvider.getLogs();
          setState(prev => ({ ...prev, logs }));
      } catch (e) { console.error(e); }
    },

    setProvider: (type: ProviderType) => {
      setActiveProvider(providers[type]);
    },

    triggerNemesisPopup: (show: boolean) => {
        setIsNemesisPopupForced(show);
    },

    setLocale: (lang: Locale) => {
      setState(prev => ({ ...prev, locale: lang, content: localizeContent(prev.content, lang) }));
      localStorage.setItem('cm_elite_locale', lang);
    }
  };

  return (
    <CoreContext.Provider value={{ ...state, ...actions, isNemesisPopupForced }}>
      {children}
    </CoreContext.Provider>
  );
};

export const useCore = () => {
  const context = useContext(CoreContext);
  if (!context) throw new Error("Core not found.");
  return context;
};
