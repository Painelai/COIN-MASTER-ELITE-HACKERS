
import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ShieldCheck, Terminal, Wifi, Lock, Server, Globe, Cpu, Zap, Activity, CheckCircle2, Monitor } from 'lucide-react';
import { CoinMasterEmulator } from './CoinMasterEmulator';
import { useCore } from '../core/CoreContext';
import { UI_TRANSLATIONS } from '../core/translations';

interface GeneratorDemoProps {
  onOpenCheckout: () => void;
}

const generateGuestSession = () => {
    const randomId = Math.floor(Math.random() * 899999999) + 100000000;
    const servers = ['US_EAST_1', 'EU_WEST_2', 'SA_BRA_01', 'ASIA_TOK_04'];
    
    return {
        guestId: `GUEST_${randomId}`,
        server: servers[Math.floor(Math.random() * servers.length)],
        ping: Math.floor(Math.random() * 40) + 12,
        sessionKey: Math.random().toString(36).substring(2, 15).toUpperCase()
    };
};

export const GeneratorDemo: React.FC<GeneratorDemoProps> = ({ onOpenCheckout }) => {
  const { locale } = useCore();
  const t = UI_TRANSLATIONS[locale];
  
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [logs, setLogs] = useState<{text: string, type: 'info'|'success'|'error'|'warn'|'system'}[]>([]);
  const [progress, setProgress] = useState(0);
  const [guestData, setGuestData] = useState<ReturnType<typeof generateGuestSession> | null>(null);

  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: 'info'|'success'|'error'|'warn'|'system' = 'info') => {
    setLogs(prev => [...prev, { text, type }]);
  };

  const startDiagnosis = async () => {
    if (status === 'running') return;
    setStatus('running');
    setLogs([]);
    setProgress(0);
    setGuestData(null);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const session = generateGuestSession();

    addLog(t.log_init, 'system');
    await delay(600);
    addLog(t.log_net_ping);
    await delay(800);
    addLog(t.log_net_resp.replace('{ping}', session.ping.toString()).replace('{server}', session.server), 'info');
    setProgress(15);
    
    await delay(800);
    addLog(t.log_auth_attempt);
    await delay(1200);
    addLog(t.log_err_firewall, 'error');
    addLog(t.log_warn_anticheat, 'warn');
    setProgress(30);
    await delay(1000);

    addLog(t.log_auto_spoof, 'system');
    await delay(800);
    addLog(t.log_gen_id);
    await delay(1000);
    addLog(t.log_success_token.replace('{id}', session.guestId), 'success');
    setGuestData(session); 
    setProgress(60);
    
    await delay(800);
    addLog(t.log_tunnel.replace('{id}', session.guestId));
    await delay(800);
    addLog(t.log_check_integrity);
    addLog(t.log_inject_ready);
    setProgress(90);
    await delay(1000);

    addLog(t.log_done, 'success');
    setProgress(100);
    setStatus('finished');
  };

  return (
    <section className="bg-page relative overflow-hidden flex flex-col items-center">
      <div className="max-w-4xl w-full px-4 relative z-10">
        
        <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-display font-black text-primary mb-2 uppercase">
                {t.gen_title}
            </h2>
            <p className="text-secondary text-sm">
                {t.gen_subtitle}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-20">
            <div className="bg-surface/80 border border-border-dim rounded-xl p-5 shadow-2xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-center min-h-[250px]">
                {status === 'idle' ? (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto border border-border-highlight shadow-inner">
                            <Wifi className="w-8 h-8 text-secondary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-1">{t.gen_status_checking}</h3>
                            <p className="text-xs text-secondary max-w-[200px] mx-auto">
                                {t.gen_status_desc}
                            </p>
                        </div>
                        <button 
                            onClick={startDiagnosis}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-neon transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-display"
                        >
                            <Zap className="w-4 h-4 fill-current" />
                            {t.gen_btn_start}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${status === 'finished' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-brand-500/20 border-brand-500 text-brand-500 animate-pulse'}`}>
                                {status === 'finished' ? <CheckCircle2 className="w-5 h-5" /> : <RotateCw className="w-5 h-5 animate-spin" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-primary text-base">
                                    {status === 'finished' ? t.gen_status_established : t.gen_status_executing}
                                </h3>
                                <p className="text-[10px] text-muted font-mono uppercase tracking-wider">
                                    {status === 'finished' ? `${t.gen_latency}: 14ms` : `${t.gen_step} ${Math.floor(progress / 20) + 1}/5`}
                                </p>
                            </div>
                        </div>

                        {guestData && (
                            <div className="bg-black/40 rounded-lg p-3 border border-brand-500/20 animate-slide-up-fade">
                                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                                    <div>
                                        <span className="text-muted block">GUEST ID</span>
                                        <span className="text-primary font-bold">{guestData.guestId}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-muted block">SERVER</span>
                                        <span className="text-brand-400">{guestData.server.split('_')[0]}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === 'finished' && (
                            <button 
                                onClick={onOpenCheckout}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 animate-bounce-in flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                            >
                                <Lock className="w-4 h-4" />
                                {t.gen_btn_link}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-black border border-border-dim rounded-xl shadow-2xl overflow-hidden flex flex-col h-[300px] font-mono text-[10px] relative">
                <div className="bg-surface-highlight px-3 py-2 flex items-center justify-between border-b border-border-dim shrink-0">
                    <div className="flex items-center gap-2 text-secondary">
                        <Terminal className="w-3 h-3" />
                        <span className="font-bold tracking-wider">ROOT_ACCESS_LOG</span>
                    </div>
                </div>

                <div ref={logsContainerRef} className="flex-1 p-3 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted opacity-30 space-y-2">
                            <Cpu className="w-8 h-8" />
                            <p className="font-bold tracking-widest uppercase">WAITING_COMMAND</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className={`flex items-start gap-2 font-medium animate-fade-in ${
                                    log.type === 'error' ? 'text-red-500' : 
                                    log.type === 'warn' ? 'text-yellow-400' : 
                                    log.type === 'success' ? 'text-emerald-400' : 
                                    log.type === 'system' ? 'text-blue-400' :
                                    'text-slate-300'
                                }`}>
                                    <span className="text-secondary shrink-0 opacity-50 select-none">></span>
                                    <span className="break-all leading-tight">{log.text}</span>
                                </div>
                            ))}
                            {status === 'running' && (
                                <div className="w-1.5 h-3 bg-brand-500 animate-pulse mt-1"></div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-0.5 w-full bg-surface-highlight">
                    <div className={`h-full transition-all duration-300 ${status === 'finished' ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
