import React, { useState, useEffect, useRef } from 'react';
import { 
    Crown, Power, RefreshCw, Lock, X, Terminal, Activity,
    Cpu, MessageSquare, TerminalSquare, LayoutGrid, ChevronRight,
    Wifi, Shield, Star, Zap, AlertOctagon, CheckCircle2, User as UserIcon, Coins, Brain, Target, Magnet, Ghost, Play, Users, 
    Rabbit, ShieldCheck, UserPlus, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelService } from './PanelService';
import { ElitePanelData } from './types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useForm } from '../hooks/useForm';
import { useApi } from '../hooks/useApi';
import { useCore } from '../core/CoreContext';
import { useStore } from '../store';
import { UI_TRANSLATIONS } from '../core/translations';
import './PanelStyles.css';

type TabType = 'geral' | 'manipular' | 'chats';
type AuthMode = 'login' | 'register';
type InjectionStatus = 'idle' | 'diagnosing' | 'intercepting' | 'injecting' | 'stable' | 'rejected';

interface Tool {
    id: string;
    label: string;
    icon: any;
    color: string;
    description: string;
}

const ICON_MAP: Record<string, any> = {
    Crown, Coins, Brain, Target, Magnet, Ghost, Rabbit, Play, Users, Zap
};

export const ElitePanel: React.FC<{ onClose: () => void; onOpenCheckout?: () => void }> = ({ onClose, onOpenCheckout }) => {
    const { locale, content, logAction } = useCore();
    const t = UI_TRANSLATIONS[locale];
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [data, setData] = useState<ElitePanelData | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('chats');
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [restrictedModal, setRestrictedModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: '' });
    
    const [injectionStatus, setInjectionStatus] = useState<InjectionStatus>('idle');
    const [injectionProgress, setInjectionProgress] = useState(0);
    const [activeLogs, setActiveLogs] = useState<string[]>([]);
    const [activeTools, setActiveTools] = useState<Set<string>>(new Set());
    const [rejectedTools, setRejectedTools] = useState<Set<string>>(new Set());

    const { rooms, bots } = useStore();
    const authApi = useApi<any>();
    
    const { values, errors, setErrors, handleChange, setValues } = useForm({
        email: 'user',
        password: 'user',
        confirmPassword: ''
    });

    const consoleEndRef = useRef<HTMLDivElement>(null);

    // VÍNCULO DINÂMICO
    const dynamicTools: Tool[] = content.products.map(p => ({
        id: p.id,
        label: p.name,
        icon: ICON_MAP[p.iconName] || Zap,
        color: p.id.includes('viking') ? 'text-yellow-400' : p.id.includes('oracle') ? 'text-purple-400' : 'text-brand-400',
        description: p.description.replace(/\{\{GOLD\}\}/g, '').replace(/\{\{\/GOLD\}\}/g, '')
    }));

    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeLogs, injectionStatus]);

    useEffect(() => {
        const active = localStorage.getItem('elite_session_active') === 'true';
        if (active) {
            const savedData = localStorage.getItem('elite_panel_user_db');
            if (savedData) {
                try {
                    setData(JSON.parse(savedData));
                    setIsLoggedIn(true);
                } catch(e) {
                    localStorage.removeItem('elite_session_active');
                }
            }
        }
    }, []);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            if (authMode === 'login') {
                logAction('LOGIN_ATTEMPT', `Attempting login for: ${values.email}`);
                const res = await authApi.execute(() => PanelService.login(values.email, values.password));
                
                if (res.success && res.data) {
                    setData(res.data);
                    setIsLoggedIn(true);
                    localStorage.setItem('elite_session_active', 'true');
                    localStorage.setItem('elite_panel_user_db', JSON.stringify(res.data));
                    logAction('LOGIN_SUCCESS', `Membro logado: ${values.email}`);
                } else {
                    setErrors({ email: res.error || (locale === 'pt' ? 'Acesso negado. Verifique as credenciais.' : 'Access denied.') });
                }
            } else {
                if (values.password !== values.confirmPassword) {
                    setErrors({ confirmPassword: locale === 'pt' ? 'As senhas não coincidem.' : 'Passwords do not match.' });
                    return;
                }
                const res = await authApi.execute(() => PanelService.register(values.email, values.password));
                if (res.success) {
                    alert(locale === 'pt' ? 'Cadastro realizado! Agora faça login.' : 'Registered! Now login.');
                    setAuthMode('login');
                    setValues(prev => ({ ...prev, password: '', confirmPassword: '' }));
                } else {
                    setErrors({ email: res.error || 'Erro no cadastro.' });
                }
            }
        } catch (err) {
            setErrors({ email: 'Terminal offline ou erro de banco de dados.' });
        }
    };

    const runInjectionProtocol = async (tool: Tool) => {
        if (injectionStatus !== 'idle' || activeTools.has(tool.id) || rejectedTools.has(tool.id)) return;

        setInjectionStatus('diagnosing');
        setInjectionProgress(0);
        setActiveLogs([t.log_tool_init.replace('{name}', tool.label.toUpperCase())]);

        const steps = [
            { s: 'diagnosing', p: 20, l: t.log_tool_latency },
            { s: 'diagnosing', p: 40, l: t.log_tool_ssl },
            { s: 'intercepting', p: 55, l: t.log_tool_vpn },
            { s: 'stable', p: 100, l: t.log_tool_success.replace('{id}', tool.id.toUpperCase()) }
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
            setInjectionStatus(step.s as InjectionStatus);
            setInjectionProgress(step.p);
            setActiveLogs(prev => [...prev, step.l]);
        }

        setActiveTools(prev => new Set([...prev, tool.id]));
        await new Promise(r => setTimeout(r, 5000));
        setActiveLogs(prev => [...prev, t.log_tool_disconnected]);
        setInjectionStatus('rejected');
        setRejectedTools(prev => new Set([...prev, tool.id]));
    };

    const handleBecomeElite = () => {
        setRestrictedModal({ open: false, feature: '' });
        onClose();
        if (onOpenCheckout) onOpenCheckout();
    };

    const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 border
                ${activeTab === id 
                    ? 'bg-brand-500 text-black border-brand-500 shadow-neon' 
                    : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300'}`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
            
            <AnimatePresence mode="wait">
                {!isLoggedIn ? (
                    <motion.div key="auth" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 1.1, opacity: 0, y: -20 }} className="relative w-full max-w-md bg-[#020617] border border-brand-500/30 rounded-[2.5rem] shadow-[0_0_80px_rgba(234,179,8,0.15)] overflow-hidden flex flex-col ring-1 ring-white/10">
                        <div className="p-8 md:p-10">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-brand-500/10 rounded-2xl border border-brand-500/20 flex items-center justify-center mx-auto mb-4 shadow-neon">
                                    <Terminal className="w-8 h-8 text-brand-500" />
                                </div>
                                <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">
                                    {authMode === 'login' ? 'RESTRITO' : 'NOVO'} <span className="text-brand-500">{authMode === 'login' ? 'ACCESO' : 'OPERADOR'}</span>
                                </h2>
                                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2">Jarvis Security v4.7.2</p>
                            </div>
                            
                            <form onSubmit={handleAuthAction} className="space-y-4">
                                <Input 
                                    label="Usuário" 
                                    name="email" 
                                    value={values.email} 
                                    onChange={handleChange} 
                                    icon={<UserIcon size={18} />} 
                                    placeholder="usuário ou e-mail" 
                                    error={errors.email} 
                                    required 
                                />
                                <Input 
                                    label="Senha" 
                                    name="password" 
                                    type="password" 
                                    value={values.password} 
                                    onChange={handleChange} 
                                    icon={<Lock size={18} />} 
                                    placeholder="••••••••" 
                                    required 
                                />
                                {authMode === 'register' && (
                                    <Input 
                                        label="Confirmar Senha" 
                                        name="confirmPassword" 
                                        type="password" 
                                        value={values.confirmPassword} 
                                        onChange={handleChange} 
                                        icon={<ShieldCheck size={18} />} 
                                        placeholder="••••••••" 
                                        error={errors.confirmPassword} 
                                        required 
                                    />
                                )}
                                <Button type="submit" className="w-full mt-4" isLoading={authApi.loading}>
                                    {authMode === 'login' ? 'ENTRAR NO TERMINAL' : 'CRIAR CONTA'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <button 
                                    onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setErrors({}); }}
                                    className="text-[10px] font-black text-slate-500 hover:text-brand-400 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-all"
                                >
                                    {authMode === 'login' ? <><UserPlus size={12}/> {t.signup_btn}</> : <><LogIn size={12}/> {t.login_btn}</>}
                                </button>
                            </div>
                        </div>
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-600 hover:text-white transition-colors"><X size={20}/></button>
                    </motion.div>
                ) : (
                    <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-6xl bg-[#020617] rounded-[3rem] border border-brand-500/20 shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[95vh] md:h-[800px]">
                        <div className="p-6 md:px-10 md:py-8 border-b border-white/5 bg-slate-900/20 shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shadow-neon">
                                        <Crown className="w-7 h-7 text-brand-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                                            {t.panel_title.split(' ')[0]} <span className="text-brand-500">{t.panel_title.split(' ')[1]}</span>
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[9px] font-black text-emerald-500 tracking-[0.2em] uppercase">{t.panel_status}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('elite_session_active'); }} className="text-[9px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 transition-all">
                                    <Power size={12} /> {t.panel_disconnect}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                            <div className="flex flex-wrap gap-3 mb-10">
                                <TabButton id="chats" label={t.panel_tab_communities} icon={MessageSquare} />
                                <TabButton id="manipular" label={t.panel_tab_control} icon={TerminalSquare} />
                                <TabButton id="geral" label={t.panel_tab_overview} icon={LayoutGrid} />
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'chats' && (
                                    <motion.div key="tab-chats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Troca de Cartas', icon: MessageSquare, desc: 'Complete seus sets comuns e raros.', stats: '450+ membros' },
                                            { label: 'Troca Global VIP', icon: Crown, desc: 'Exclusivo para Cartas Douradas.', stats: '1.2k+ ativos' },
                                            { label: 'Grupo de Dicas', icon: Zap, desc: 'Sequências e alertas do Oráculo.', stats: '890 membros' },
                                            { label: 'Top Jogadores', icon: Star, desc: 'Ranking e estratégias avançadas.', stats: '100 masters' }
                                        ].map((chat, i) => (
                                            <button 
                                                key={i}
                                                className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] hover:border-brand-500/40 hover:bg-slate-800/40 transition-all text-left flex items-center gap-4 group"
                                                onClick={() => setRestrictedModal({ open: true, feature: chat.label })}
                                            >
                                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                                                    <chat.icon className="w-8 h-8 text-brand-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className="text-white font-black uppercase text-sm tracking-tight">{chat.label}</h4>
                                                        <span className="text-[10px] text-emerald-500 font-bold uppercase">{chat.stats}</span>
                                                    </div>
                                                    <p className="text-slate-500 text-xs">{chat.desc}</p>
                                                </div>
                                                <ChevronRight className="text-slate-700 group-hover:text-brand-500 transition-colors" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {activeTab === 'geral' && (
                                    <motion.div key="tab-geral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                                            <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2 border-b border-white/5 pb-4">
                                                <Activity className="text-brand-500" size={18} /> Diagnóstico Global
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {[
                                                    { label: 'Uptime', val: '99.9%', icon: Wifi, color: 'text-emerald-500' },
                                                    { label: 'Latency', val: '14ms', icon: Cpu, color: 'text-blue-500' },
                                                    { label: 'Security', val: 'AES-256', icon: Shield, color: 'text-brand-500' },
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-black/30 p-4 rounded-2xl border border-white/5">
                                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                            <stat.icon size={12} />
                                                            <span className="text-[9px] font-bold uppercase">{stat.label}</span>
                                                        </div>
                                                        <div className={`text-lg font-black ${stat.color}`}>{stat.val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-brand-500/5 border border-brand-500/20 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-4 border border-brand-500/30">
                                                <ShieldCheck className="text-brand-500 w-8 h-8" />
                                            </div>
                                            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Protocolo de Elite</h4>
                                            <p className="text-slate-500 text-xs leading-relaxed">Sua licença vitalícia garante atualizações prioritárias de sementes RNG.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'manipular' && (
                                    <motion.div key="tab-manipular" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {dynamicTools.map((item) => {
                                                const isActive = activeTools.has(item.id);
                                                const isRejected = rejectedTools.has(item.id);
                                                const ToolIcon = item.icon;
                                                return (
                                                    <motion.button 
                                                        whileHover={{ scale: 1.02, y: -2 }} 
                                                        key={item.id} 
                                                        onClick={() => { setSelectedTool(item); setInjectionStatus(isRejected ? 'rejected' : 'idle'); setInjectionProgress(isRejected ? 100 : 0); setActiveLogs(isRejected ? [t.log_tool_disconnected] : []); }} 
                                                        className={`relative flex flex-col items-center text-center p-6 rounded-[2.5rem] border transition-all duration-500 group overflow-hidden ${isActive ? 'bg-brand-500/10 border-brand-500 shadow-neon' : isRejected ? 'bg-red-950/20 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'bg-slate-900/40 border-white/5 hover:border-brand-500/40 hover:bg-slate-800/40'}`}
                                                    >
                                                        <div className={`p-5 rounded-2xl mb-4 transition-all duration-500 ${isActive ? 'bg-brand-500 text-black shadow-lg scale-110' : isRejected ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 group-hover:bg-brand-500/10'}`}>
                                                            {isRejected ? <AlertOctagon className="w-6 h-6" /> : isActive ? <CheckCircle2 className="w-6 h-6" /> : <ToolIcon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />}
                                                        </div>
                                                        <span className={`text-[11px] font-black uppercase tracking-widest leading-tight h-8 flex items-center ${isRejected ? 'text-red-500' : isActive ? 'text-brand-500' : 'text-slate-300 group-hover:text-white'}`}>{item.label}</span>
                                                        {isActive && (
                                                            <div className="absolute top-2 right-4">
                                                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></div>
                                                            </div>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <AnimatePresence>
                            {selectedTool && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[7000] flex items-center justify-center p-4 backdrop-blur-md bg-black/80">
                                    <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className={`w-full max-w-2xl bg-[#020617] border-2 rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col ${rejectedTools.has(selectedTool.id) ? 'border-red-600/50' : 'border-brand-500/40'}`}>
                                        <div className={`p-6 flex justify-between items-center border-b ${rejectedTools.has(selectedTool.id) ? 'bg-red-950/20 border-red-600/20' : 'bg-slate-900/90 border-brand-500/20'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${rejectedTools.has(selectedTool.id) ? 'bg-red-600/10 border-red-600/30' : 'bg-brand-500/10 border-brand-500/30'}`}>
                                                    {React.createElement(selectedTool.icon, { className: `w-5 h-5 ${rejectedTools.has(selectedTool.id) ? 'text-red-500' : selectedTool.color}` })}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] leading-none">{selectedTool.label}</h4>
                                                    <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold tracking-widest">{selectedTool.description}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedTool(null)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"><X size={20}/></button>
                                        </div>
                                        <div className="p-8 bg-black/60 font-mono text-[11px] h-[350px] overflow-y-auto custom-scrollbar flex flex-col relative">
                                            <div className="space-y-3 relative z-10">
                                                {activeLogs.map((log, i) => {
                                                    const isError = log.includes('[DESCONECTADO]') || log.includes('[DISCONNECTED]');
                                                    return (
                                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-4 group">
                                                            <span className="text-slate-700 shrink-0 select-none">[{new Date().toLocaleTimeString()}]</span>
                                                            <span className={`leading-relaxed ${isError ? 'text-red-500 font-black animate-pulse' : log.includes('[SUCCESS]') || log.includes('[ÉXITO]') ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                                                                <span className={`${isError ? 'text-red-600' : 'text-brand-500'} mr-2`}>➜</span> {log}
                                                            </span>
                                                        </motion.div>
                                                    );
                                                })}
                                                <div ref={consoleEndRef} />
                                            </div>
                                        </div>
                                        <div className="p-8 bg-slate-900/40 border-t border-brand-500/20 space-y-6">
                                            {injectionStatus !== 'idle' && (
                                                <div className="space-y-3 animate-fade-in">
                                                    <div className="flex justify-between items-end text-[10px] font-black tracking-widest uppercase">
                                                        <span className={injectionStatus === 'rejected' ? 'text-red-500' : 'text-brand-400'}>{injectionStatus.toUpperCase()}</span>
                                                        <span className="text-white">{injectionProgress}%</span>
                                                    </div>
                                                    <div className="h-3 bg-black rounded-full overflow-hidden border border-white/5 p-0.5">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${injectionProgress}%` }} className={`h-full rounded-full transition-all duration-300 ${injectionStatus === 'rejected' ? 'bg-red-600' : 'bg-brand-50'}`} />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-4">
                                                {rejectedTools.has(selectedTool.id) ? (
                                                    <button className="flex-1 py-5 rounded-[1.5rem] bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3" onClick={handleBecomeElite}>
                                                        <Crown className="fill-current" /> {t.btn_become_elite}
                                                    </button>
                                                ) : (
                                                    <button onClick={() => runInjectionProtocol(selectedTool)} disabled={injectionStatus !== 'idle'} className="flex-1 py-5 rounded-[1.5rem] bg-brand-600 hover:bg-brand-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-neon flex items-center justify-center gap-3">
                                                        <Zap className="fill-current" /> INICIAR PROTOCOLO
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {restrictedModal.open && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[7500] flex items-center justify-center p-4 backdrop-blur-md bg-black/80">
                                    <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="w-full max-sm bg-[#020617] border-2 border-brand-500/40 rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col p-8 text-center">
                                        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-500/30">
                                            <Crown className="w-8 h-8 text-brand-500" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter mb-4">
                                            <span className="text-white">Recurso</span> <span className="text-red-600">Bloqueado</span>
                                        </h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                            Você não pode acessar <span className="text-brand-400 font-bold uppercase">{restrictedModal.feature}</span> pois este recurso requer uma <span className="text-brand-400 font-bold uppercase">Licença Vitalícia Ativa</span>.
                                        </p>
                                        <button onClick={handleBecomeElite} className="w-full py-4 bg-brand-600 hover:bg-brand-50 text-black font-black rounded-xl uppercase tracking-widest text-xs shadow-neon">
                                            ADQUIRIR ACESSO AGORA
                                        </button>
                                        <button onClick={() => setRestrictedModal({ open: false, feature: '' })} className="mt-4 text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-widest transition-colors">
                                            Voltar para o Painel
                                        </button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};