
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Bot, Room, TimelineMessage, BotArchetype } from './types';

export type AppMode = 'none' | 'orchestration' | 'admin';

const FIRST_NAMES = ["Ana", "Bruno", "Carla", "Daniel", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Julia", "Lucas", "Mariana", "Nicolas", "Olivia", "Pedro", "Rafael", "Sofia", "Thiago", "Vitoria", "Wesley", "Amanda", "Beatriz", "Caio", "Diego", "Ricardo", "Marcelo", "Leandro", "Tiago", "Anderson", "Rodrigo", "Pablo", "Diogo", "Fagner", "Júlio", "Gilberto", "Renan", "Douglas", "Wagner", "Everton", "Jeferson"];
const LAST_NAMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha", "Dias", "Nascimento", "Andrade", "Moreira"];
const ARCHETYPES: BotArchetype[] = ['enthusiast', 'skeptic', 'friendly', 'pragmatic', 'curious', 'influencer', 'experienced', 'beginner'];
const COLORS = ['bg-pink-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'];

const generateLargeBotArmy = (count: number): Bot[] => {
  const army: Bot[] = [];
  for (let i = 0; i < count; i++) {
    const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`;
    const archetype = ARCHETYPES[i % ARCHETYPES.length];
    const color = COLORS[i % COLORS.length];
    const wisdom = Math.floor(Math.random() * 90) + 10;
    
    army.push({
      id: `bot-army-${i}`,
      name,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=e5e7eb`,
      color,
      archetype,
      description: `Membro Elite - Focado em ${archetype === 'experienced' ? 'estratégias avançadas' : 'resultados rápidos'}.`,
      wisdomLevel: wisdom
    });
  }
  return army;
};

const INITIAL_BOT_ARMY = generateLargeBotArmy(1321);

interface AppState {
  isAuthenticated: boolean;
  appMode: AppMode;
  theme: 'light' | 'dark';
  useRealAI: boolean;
  bots: Bot[];
  rooms: Room[];
  currentRoomId: string | null;
  isSystemOverlayActive: boolean;
  userReactions: Record<string, string>;
  persistentOnlineCount: number | null;
  
  login: () => void;
  logout: () => void;
  setAppMode: (mode: AppMode) => void;
  toggleTheme: () => void;
  toggleAI: () => void;
  setSystemOverlay: (active: boolean) => void;
  addBot: (bot: Bot) => void;
  addBots: (bots: Bot[]) => void;
  updateBot: (id: string, updates: Partial<Bot>) => void;
  deleteBot: (id: string) => void;
  
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  selectRoom: (id: string) => void;
  
  updateTimeline: (roomId: string, timeline: TimelineMessage[]) => void;
  setReaction: (messageId: string, emoji: string | null) => void;
  setOnlineCount: (count: number) => void;
}

const MOCK_ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'Elite VIP Group',
    description: 'Comunidade secreta de troca de informações e auditoria de roleta.',
    theme: 'CoinMaster Dominance',
    botIds: INITIAL_BOT_ARMY.map(b => b.id).slice(0, 20),
    status: 'active',
    stats: { views: 12840, completionRate: 94 },
    timeline: [
      { id: 'm1', botId: 'bot-army-10', text: 'Gente! Acabei de testar o novo Bypass do Rinoceronte. O pet do oponente nem reagiu kkkkk 🐷🔥', delayAfter: 6, timestamp: Date.now() },
      { id: 'm2', botId: 'bot-army-15', text: 'Sério? Mas precisa de Root ou Jailbreak? Tenho medo de perder minha conta principal.', delayAfter: 4, timestamp: Date.now() },
      { id: 'm4', botId: 'bot-army-5', text: 'O sistema é 100% Cloud. Ele injeta direto no protocolo do servidor via Stealth 7, seu celular nem detecta.', delayAfter: 4, timestamp: Date.now(), replyToId: 'm2' },
      { id: 'm5', botId: 'bot-army-22', text: 'Fiz o teste com a IA Oráculo agora cedo. Previu 3 sequências de porcos seguidas no x500.', delayAfter: 6, timestamp: Date.now() },
      { id: 'm10', botId: 'bot-army-10', text: 'Exatamente! Valeu cada centavo, já recuperei o investimento só com os spins.', delayAfter: 5, timestamp: Date.now() }
    ]
  },
  {
    id: 'r_cards',
    name: 'Troca de Cartas',
    description: 'Central de trocas rápidas para completar sets comuns e raros.',
    theme: 'Cards Strategy',
    groupImage: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=200&h=200&fit=crop',
    botIds: INITIAL_BOT_ARMY.map(b => b.id).slice(21, 40),
    status: 'active',
    stats: { views: 8520, completionRate: 88 },
    timeline: [
        { id: 'mc1', botId: 'bot-army-25', text: 'Alguém tem a "Ouro de Ofir" sobrando? Falta só ela pra fechar o set.', delayAfter: 4, timestamp: Date.now() },
        { id: 'mc2', botId: 'bot-army-30', text: 'Eu tenho! Manda seu link de amigo que eu envio agora.', delayAfter: 5, timestamp: Date.now() },
        { id: 'mc3', botId: 'bot-army-27', text: 'O Card Finisher do painel ajudou muito hoje, peguei 3 raras em baús de madeira.', delayAfter: 6, timestamp: Date.now() }
    ]
  },
  {
    id: 'r_global_vip',
    name: 'Troca Global VIP',
    description: 'Ambiente exclusivo para troca de CARTAS DOURADAS e itens de alto valor.',
    theme: 'Elite Exclusivity',
    groupImage: 'https://images.unsplash.com/photo-1589482525751-2487f94c631b?w=200&h=200&fit=crop',
    botIds: INITIAL_BOT_ARMY.map(b => b.id).slice(41, 60),
    status: 'active',
    stats: { views: 15400, completionRate: 98 },
    timeline: [
        { id: 'mg1', botId: 'bot-army-42', text: 'Habilitado o glitch de envio de douradas para quem tem o Elite Pass!', delayAfter: 5, timestamp: Date.now() },
        { id: 'mg2', botId: 'bot-army-50', text: 'Acabei de enviar a de hoje. O sistema de proteção anti-ban é sensacional.', delayAfter: 4, timestamp: Date.now() },
        { id: 'mg3', botId: 'bot-army-45', text: 'Quem precisa da dourada do evento? Tenho 5 duplicadas aqui.', delayAfter: 6, timestamp: Date.now() }
    ]
  },
  {
    id: 'r_tips',
    name: 'Grupo de Dicas',
    description: 'Análise de padrões, sequências de aposta e alertas do Oráculo.',
    theme: 'Advanced Intelligence',
    groupImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200&h=200&fit=crop',
    botIds: INITIAL_BOT_ARMY.map(b => b.id).slice(61, 80),
    status: 'active',
    stats: { views: 22100, completionRate: 91 },
    timeline: [
        { id: 'mt1', botId: 'bot-army-65', text: 'Atenção: Sequência de porcos detectada a cada 12 giros no x100.', delayAfter: 5, timestamp: Date.now() },
        { id: 'mt2', botId: 'bot-army-70', text: 'O Oráculo confirmou. Joguei x500 no décimo primeiro e bateu certinho! 🐷💸', delayAfter: 4, timestamp: Date.now() },
        { id: 'mt3', botId: 'bot-army-62', text: 'Melhor dica de hoje: usem o Time-Warp apenas nos últimos 10min do evento.', delayAfter: 6, timestamp: Date.now() }
    ]
  },
  {
    id: 'r_top_players',
    name: 'Top Jogadores',
    description: 'Ranking e discussões entre os maiores farmers do ecossistema Elite.',
    theme: 'Leaderboard Discussions',
    groupImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=200&h=200&fit=crop',
    botIds: INITIAL_BOT_ARMY.map(b => b.id).slice(81, 100),
    status: 'active',
    stats: { views: 5600, completionRate: 99 },
    timeline: [
        { id: 'mj1', botId: 'bot-army-85', text: 'Subi pro Rank 1 do Brasil usando o multiplicador inteligente.', delayAfter: 4, timestamp: Date.now() },
        { id: 'mj2', botId: 'bot-army-90', text: 'Incrível! Qual vila você tá agora? Eu bati a 450 ontem.', delayAfter: 5, timestamp: Date.now() },
        { id: 'mj3', botId: 'bot-army-88', text: 'A meta é 1 milhão de spins até o fim da semana. Com esse painel tá fácil.', delayAfter: 6, timestamp: Date.now() }
    ]
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      appMode: 'none',
      theme: 'dark', 
      useRealAI: false,
      bots: INITIAL_BOT_ARMY,
      rooms: MOCK_ROOMS,
      currentRoomId: 'r1',
      isSystemOverlayActive: false,
      userReactions: {},
      persistentOnlineCount: 1321, 

      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false, appMode: 'none' }),
      setAppMode: (mode) => set({ appMode: mode }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleAI: () => set((state) => ({ useRealAI: !state.useRealAI })),
      setSystemOverlay: (active) => set({ isSystemOverlayActive: active }),

      addBot: (bot) => set((state) => ({ bots: [...state.bots, bot] })),
      addBots: (newBots) => set((state) => ({ bots: [...state.bots, ...newBots] })),
      
      updateBot: (id, updates) => set((state) => ({
        bots: state.bots.map(b => b.id === id ? { ...b, ...updates } : b)
      })),
      deleteBot: (id) => set((state) => ({ bots: state.bots.filter(b => b.id !== id) })),

      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
      updateRoom: (id, updates) => set((state) => ({
        rooms: state.rooms.map(r => r.id === id ? { ...r, ...updates } : r)
      })),
      selectRoom: (id) => set({ currentRoomId: id }),
      
      updateTimeline: (roomId, timeline) => set((state) => ({
        rooms: state.rooms.map(r => r.id === roomId ? { ...r, timeline } : r)
      })),

      setReaction: (messageId, emoji) => set((state) => {
          const newReactions = { ...state.userReactions };
          if (emoji === null) delete newReactions[messageId];
          else newReactions[messageId] = emoji;
          return { userReactions: newReactions };
      }),
      setOnlineCount: (count) => set({ persistentOnlineCount: count }),
    }),
    {
      name: 'social-proof-ai-storage-v1321',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        appMode: state.appMode,
        theme: state.theme,
        useRealAI: state.useRealAI,
        bots: state.bots,
        rooms: state.rooms,
        userReactions: state.userReactions,
        persistentOnlineCount: state.persistentOnlineCount,
        currentRoomId: state.currentRoomId
      }),
    }
  )
);
