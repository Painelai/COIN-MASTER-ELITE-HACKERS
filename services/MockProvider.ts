import { IDataProvider } from './DataProvider.ts';
import { AppConfig, FeatureFlags, SystemAuditLog, AppContent, PaymentSettings } from '../core/types.ts';

const STORAGE_KEYS = {
  CONFIG: 'cm_elite_core_config_v3',
  FEATURES: 'cm_elite_core_features_v3',
  LOGS: 'cm_elite_core_logs_v3',
  SECURITY: 'cm_elite_core_security_v3',
  CONTENT: 'cm_elite_core_content_v8'
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
    pix: { enabled: true, titular: "ELITE HACKS LTDA", chave: "contato@elitehacks.com" },
    copyPaste: { enabled: true, titular: "ELITE HACKS", code: "00020126580014BR.GOV.BCB.PIX0136653ea967-8547-497d-947b-1234567890125204000053039865802BR5913ELITE_HACKS6009SAO_PAULO62070503***6304" },
    paymentLink: { enabled: true, titular: "", url: "https://pay.elitehacks.com/checkout/elite-pass" },
    card: { enabled: true, titular: "ELITE GATEWAY", gatewayUrl: "https://pay.elitehacks.com/card" },
    crypto: {
      enabled: true,
      titular: "ELITE CRYPTO",
      selectedCoin: 'BTC',
      wallets: {
        BTC: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        DOGE: "DH5yaieqZN36fDVci2no8CGEUnFhd7dBtU"
      }
    }
};

const DEFAULT_CONFIG: AppConfig = {
  pricingMode: 'LayoutPRINCIPAL',
  themeMode: 'gold',
  provider: 'mock',
  environment: 'prod',
  maintenanceMode: false,
  version: '4.7.0',
  nemesisAnchorPrice: 350
};

const DEFAULT_FEATURES: FeatureFlags = {
  salesToast: true,
  exitPopup: true,
  floatingChat: true,
  topBanner: true,
  emulator: true,
  nemesisCampaignActive: false,
  geminiEnabled: false, 
  globalNotes: true    
};

const ALL_TOOLS = ['bundle_elite', 'tool_viking', 'tool_sequence', 'tool_sniper', 'tool_cards', 'tool_ghost', 'tool_speed', 'tool_magnata'];

const DEFAULT_CONTENT: AppContent = {
  hero: {
    titleLine1: "DOMINE O JOGO.",
    titleLine2: "ACESSO GRATUITO.",
    subtitle: "Você não precisa pagar para entrar. Crie sua conta agora e acesse o terminal de ferramentas CM Elite. A ativação dos scripts de injeção é feita dentro do painel.",
    ctaButton: "CRIAR ACESSO GRÁTIS"
  },
  socialProof: {
    totalMembers: "9.854",
    totalReviews: "1.342",
    satisfactionRate: "98.5%",
    refundRate: "1.2%",
    averageRating: "4.9",
    recentOpensTemplate: "+{count} pessoas criaram conta agora",
    recentOpensMin: "12",
    recentOpensMax: "47",
    chatOnlineMin: "400",
    chatOnlineMax: "1500",
    userAddedTemplate: "{name} entrou na comunidade"
  },
  plans: [
    {
      id: 'plan_anual',
      name: 'Plano Anual',
      type: 'annual',
      active: true,
      priceFrom: 299.00,
      priceTo: 100.00,
      highlight: false,
      order: 1,
      description: "Acesso completo a todas as ferramentas por 1 ano.",
      features: [
        "⭐ Licença Anual Completa",
        "⭐ Grupo Troca de Cartas",
        "⭐ Atualizações semanais",
        "⭐ Operação Cloud 100%"
      ],
      includedTools: ALL_TOOLS,
      paymentSettings: { ...DEFAULT_PAYMENT_SETTINGS }
    },
    {
      id: 'plan_vitalicio',
      name: 'Acesso Vitalício',
      type: 'lifetime',
      active: true,
      priceFrom: 350.00,
      priceTo: 150.00,
      highlight: true,
      order: 2,
      description: "A chave mestra definitiva. Pague uma vez, use para sempre com todos os recursos.",
      features: [
        "⭐ Licença Vitalícia (Sem mensalidade)",
        "⭐ Todas as Ferramentas Desbloqueadas",
        "⭐ Módulo Magnata Social (Incluso)",
        "⭐ Grupo VIP de Troca de Cartas",
        "⭐ Acesso Antecipado a Betas",
        "⭐ Atualizações Semanais Vitalícias",
        "⭐ Operação Cloud 100%",
        "⭐ Sorteios Exclusivos",
        "⭐ Suporte Prioritário 24/7",
        "⭐ Direito a Revenda de Licenças"
      ],
      includedTools: ALL_TOOLS,
      paymentSettings: { ...DEFAULT_PAYMENT_SETTINGS }
    }
  ],
  paymentSettings: { ...DEFAULT_PAYMENT_SETTINGS },
  products: [
    {
      id: 'bundle_elite',
      name: 'CM Elite Pass (All-in-One)',
      description: 'Placeholder', 
      benefits: [
        'Auto-Play na Viking Quest (Infinito)',
        'Troca de Cartas Douradas (Glitch)',
        'Proteção Anti-Ban 3.0',
        'Updates Automáticos Pós-Evento'
      ],
      iconName: 'Crown',
      badge: 'CADASTRO ABERTO',
      popularity: 100
    },
    {
      id: 'tool_sequence',
      name: 'IA Oráculo: RNG Bypass',
      description: 'Placeholder',
      benefits: ['Economia de 80% em Spins', 'Predição RNG em Tempo Real'],
      iconName: 'Brain',
      popularity: 95
    },
    {
      id: 'tool_viking',
      name: 'Viking Quest Bot',
      description: 'Placeholder',
      benefits: [
        'Garante a Carta Dourada Final',
        'Lucro de +50k Spins por evento',
        'Mode: Apenas Lucro (Para na roda bônus)'
      ],
      iconName: 'Coins',
      badge: 'SISTEMA ATIVO',
      popularity: 99
    },
    {
      id: 'tool_sniper',
      name: 'Shield Piercer: Bypass de Escudo',
      description: 'Placeholder',
      benefits: ['Foxy/Tigre always ativado', 'Drena 100% do banco do alvo'],
      iconName: 'Target',
      popularity: 92
    },
    {
        id: 'tool_ghost',
        name: 'Stealth 7: Protocolo Fantasma',
        description: 'Placeholder',
        benefits: ['Imune a Vingança', 'Vila Invisível'],
        iconName: 'Ghost',
        popularity: 96
    },
    {
        id: 'tool_cards',
        name: 'Card Set Finisher',
        description: 'Placeholder',
        benefits: ['Prioriza Raras/Douradas', 'Drop Manipulado'],
        iconName: 'Magnet',
        popularity: 88
    },
    {
        id: 'tool_speed',
        name: 'Time-Warp: Speed Hack',
        description: 'Placeholder',
        benefits: ['Clock Injection', 'Animação Zero'],
        iconName: 'Rabbit',
        popularity: 85
    },
    {
        id: 'tool_magnata',
        name: 'Módulo Magnata (Social Aid)',
        description: 'Placeholder',
        benefits: [
          'Engajamento Social Explosivo',
          'Ajuda Amigos a Subirem de Vila',
          'Status de Liderança e Gratidão'
        ],
        iconName: 'Users',
        badge: 'ENGENHARIA SOCIAL',
        popularity: 98
    }
  ],
  features: [
    {
      iconName: 'Target',
      title: 'Resultado ou nada',
      description: 'A CM ELITE não cria projetos que não possam gerar impacto real. Se não houver resultado claro, mensurável e estratégico, simplesmente não iniciamos.'
    },
    {
      iconName: 'Shield',
      title: 'Nível técnico que elimina riscos',
      description: 'Você não está contratando “mais programinha barato”. Está trazendo junto especialistas que antecipam dificuldades no game mesmo antes delas existirem — e com isso aplicamos solução antecipadamente.'
    },
    {
      iconName: 'TrendingUp',
      title: 'Projetos que já nascem prontos para escalar',
      description: 'Enquanto outros entregam algo que “funciona por alguns minutos ou dias”, nós entregamos algo que continua funcionando quando tudo cresce: usuários, dados e demanda, por isso estamos online desde 2023.'
    },
    {
      iconName: 'Zap',
      title: 'Velocidade que o mercado respeita',
      description: 'Tempo é dinheiro — e atrasos custam caro. A CM ELITE entrega rápido porque executa certo desde o primeiro movimento mapeando fatos e probabilidades.'
    },
    {
      iconName: 'Cpu',
      title: 'Tecnologia que conversa com lucro',
      description: 'Código bonito não paga conta. Cada decisão técnica aqui é pensada para gerar eficiência, vantagem competitiva e retorno financeiro econômico.'
    },
    {
      iconName: 'Users',
      title: 'Aumento de clientes, aumento de profissionais.',
      description: 'Não nos preocupamos com crescimento rápido, nossa preocupação é o sigilo, atendimento, e eficiência. Cada projeto recebe atenção real, estratégia dedicada e responsabilidade pelo resultado.'
    }
  ],
  faq: [
    { category: 'Acesso e Registro', question: '1. O cadastro é realmente gratuito?', answer: 'Sim. Você pode criar sua conta sem custos para acessar o terminal. O uso das ferramentas de injeção avançadas requer uma licença ativa que pode ser adquirida dentro do painel.' },
    { category: 'Uso no dia a dia', question: '23. É difícil de usar?', answer: 'Não. O painel é intuitivo e automatiza tarefas complexas em um clique.' },
    { category: 'Segurança e controle', question: '27. Meus dados ficam seguros?', answer: 'Sim. Utilizamos criptografia AES-256 e o protocolo Stealth 7 para garantir anonimato total.' },
    { category: 'Upgrade', question: '30. Como ativo uma licença?', answer: 'Dentro do seu painel de membro, clique em qualquer ferramenta bloqueada ou no botão de Upgrade para ver os planos disponíveis.' }
  ],
  footer: {
    copyrightText: "© 2026 CM ELITE - JARVIS PROTOCOL",
    disclaimerText: "Plataforma independente. Não possuímos vínculo com os desenvolvedores oficiais do game."
  }
};

export class MockProvider implements IDataProvider {
  async init(): Promise<void> {
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FEATURES)) {
      localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(DEFAULT_FEATURES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTENT)) {
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(DEFAULT_CONTENT));
    }
  }

  async getConfig(): Promise<AppConfig> {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  }

  async saveConfig(config: AppConfig): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  async getFeatures(): Promise<FeatureFlags> {
    const saved = localStorage.getItem(STORAGE_KEYS.FEATURES);
    return saved ? JSON.parse(saved) : DEFAULT_FEATURES;
  }

  async saveFeatures(features: FeatureFlags): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(features));
  }

  async getContent(): Promise<AppContent> {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENT);
    const content = saved ? JSON.parse(saved) : DEFAULT_CONTENT;
    
    const plansWithPayments = (content.plans || DEFAULT_CONTENT.plans).map(p => ({
        ...p,
        paymentSettings: p.paymentSettings || { ...DEFAULT_PAYMENT_SETTINGS }
    }));

    return { 
      ...DEFAULT_CONTENT, 
      ...content, 
      plans: plansWithPayments, 
      paymentSettings: content.paymentSettings || DEFAULT_CONTENT.paymentSettings 
    };
  }

  async saveContent(content: AppContent): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
  }

  async getLogs(): Promise<SystemAuditLog[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [];
  }

  async addLog(log: SystemAuditLog): Promise<void> {
    const logs = await this.getLogs();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([log, ...logs].slice(0, 100)));
  }
}
