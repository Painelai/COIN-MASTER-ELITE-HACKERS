
import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, CheckSquare, Square, Trash2, 
  Copy, Check, GripVertical, 
  Target, Crosshair, X, Maximize2, Upload,
  Eye, ArrowRight, PlusCircle, 
  Smartphone, Monitor, Tablet, AlertCircle, Plus
} from 'lucide-react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface NoteItem {
  id: string;
  text: string;
  context: string;
  timestamp: number;
  isCompleted: boolean;
  deviceType: DeviceType; 
  domSelector?: string; 
  elementPreview?: string;
  destinationSelector?: string; 
  destinationPreview?: string;
}

interface GlobalNotesProps {
  forcedContext?: string; 
  storageKey?: string;    
  onHide?: () => void;    
}

const TRIGGER_POS_KEY = 'cm_elite_notes_trigger_pos';
const PANEL_POS_KEY = 'cm_elite_notes_panel_pos';

const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 520;

const getCurrentDevice = (): DeviceType => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

const getFriendlySelector = (el: HTMLElement): { selector: string, preview: string } => {
    let path: string[] = [];
    let current: HTMLElement | null = el;
    
    while (current && current !== document.body && current !== document.documentElement) {
        let selector = current.tagName.toLowerCase();
        if (current.id) {
            selector += `#${current.id}`;
            path.unshift(selector);
            break; 
        } else {
            let className = current.className;
            if (typeof className === 'string' && className.trim()) {
                const firstClass = className.trim().split(/\s+/)[0];
                if (firstClass && !firstClass.includes(':')) { 
                    selector += `.${firstClass}`;
                }
            }
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children);
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    selector += `:nth-child(${index})`;
                }
            }
            path.unshift(selector);
        }
        current = current.parentElement;
    }
    const fullSelector = path.join(' > ');
    let classNamePart = '';
    if (typeof el.className === 'string' && el.className.trim()) {
        classNamePart = '.' + el.className.trim().split(/\s+/)[0];
    }
    const preview = `${el.tagName.toLowerCase()}${classNamePart.length > 15 ? classNamePart.substring(0, 15) + '...' : classNamePart}`;
    return { selector: fullSelector, preview };
};

export const GlobalNotes: React.FC<GlobalNotesProps> = ({ forcedContext, storageKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectMode, setInspectMode] = useState<'source' | 'destination'>('source');
  const [inspectCoords, setInspectCoords] = useState({ x: 0, y: 0 });
  const [inspectData, setInspectData] = useState<{ tag: string, classes: string, w: number, h: number } | null>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');

  const [focusMode, setFocusMode] = useState<{ 
      active: boolean; 
      id: string | null; 
      text: string; 
      selector?: string; 
      preview?: string;
      destSelector?: string;
      destPreview?: string;
      device?: DeviceType;
  }>({ active: false, id: null, text: '' });
  
  const [triggerPos, setTriggerPos] = useState(() => {
    const saved = localStorage.getItem(TRIGGER_POS_KEY);
    return saved ? JSON.parse(saved) : { x: 16, y: 480 };
  });

  const [panelPos, setPanelPos] = useState(() => {
    const saved = localStorage.getItem(PANEL_POS_KEY);
    // Centralização inteligente se não houver nada salvo
    if (saved) return JSON.parse(saved);
    
    const x = typeof window !== 'undefined' ? (window.innerWidth / 2 - PANEL_WIDTH / 2) : 20;
    const y = typeof window !== 'undefined' ? (window.innerHeight / 2 - PANEL_HEIGHT / 2) : 100;
    return { x, y };
  });

  const [isDraggingTrigger, setIsDraggingTrigger] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const focusInputRef = useRef<HTMLTextAreaElement>(null);
  const currentContext = forcedContext || 'Global';
  const effectiveStorageKey = storageKey || `cm_elite_notes_v1_${currentContext}`;

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem(effectiveStorageKey);
            if (saved) return JSON.parse(saved);
        } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(effectiveStorageKey, JSON.stringify(notes));
  }, [notes, effectiveStorageKey]);

  useEffect(() => {
    if (!isDraggingTrigger && !isDraggingPanel) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        if (isDraggingTrigger) setTriggerPos({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y });
        else if (isDraggingPanel) setPanelPos({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y });
    };
    const handleEnd = () => {
        if (isDraggingTrigger) localStorage.setItem(TRIGGER_POS_KEY, JSON.stringify(triggerPos));
        if (isDraggingPanel) localStorage.setItem(PANEL_POS_KEY, JSON.stringify(panelPos));
        setIsDraggingTrigger(false);
        setIsDraggingPanel(false);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingTrigger, isDraggingPanel, triggerPos, panelPos]);

  const startDraggingTrigger = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragOffset.current = { x: clientX - triggerPos.x, y: clientY - triggerPos.y };
    setIsDraggingTrigger(true);
  };

  const startDraggingPanel = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, label')) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragOffset.current = { x: clientX - panelPos.x, y: clientY - panelPos.y };
    setIsDraggingPanel(true);
  };

  useEffect(() => {
    if (!isInspecting) return;
    const handleMouseOver = (e: MouseEvent) => {
        let target = e.target as HTMLElement;
        if (target.closest('.layout-notes-ui')) return;
        const container = target.closest('button, a, input, select, textarea, [role="button"]');
        if (container) target = container as HTMLElement;
        const color = inspectMode === 'source' ? '#eab308' : '#10b981';
        target.style.outline = `3px solid ${color}`;
        target.style.outlineOffset = '4px';
        target.style.transform = 'scale(1.02)';
        target.style.zIndex = '99999';
        const rect = target.getBoundingClientRect();
        setInspectData({
            tag: target.tagName.toLowerCase(),
            classes: target.className.toString().split(' ')[0] || '',
            w: Math.round(rect.width),
            h: Math.round(rect.height)
        });
    };
    const handleMouseOut = (e: MouseEvent) => {
        let target = e.target as HTMLElement;
        const container = target.closest('button, a, input, select, textarea');
        if (container) target = container as HTMLElement;
        target.style.outline = '';
        target.style.outlineOffset = '';
        target.style.transform = '';
        target.style.zIndex = '';
    };
    const handleMouseMove = (e: MouseEvent) => setInspectCoords({ x: e.clientX, y: e.clientY });
    const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        let target = e.target as HTMLElement;
        if (target.closest('.layout-notes-ui')) return;
        const interactive = target.closest('button, a, input, select, textarea, [role="button"]');
        if (interactive) target = interactive as HTMLElement;
        const { selector, preview } = getFriendlySelector(target);
        const device = getCurrentDevice();
        target.style.outline = '';
        target.style.transform = '';
        target.style.zIndex = '';
        if (inspectMode === 'source') {
            setFocusMode(prev => ({ ...prev, selector, preview, device }));
        } else {
            setFocusMode(prev => ({ ...prev, destSelector: selector, destPreview: preview, device }));
        }
        setIsInspecting(false);
        setIsOpen(true);
    };
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, { capture: true });
    return () => {
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [isInspecting, inspectMode]);

  const saveFocusNote = () => {
      const text = focusMode.text.trim();
      const device = focusMode.device || getCurrentDevice();
      if (!text && !focusMode.id) { setFocusMode({ active: false, id: null, text: '' }); return; }
      if (focusMode.id) {
          setNotes(prev => prev.map(n => n.id === focusMode.id ? { 
              ...n, 
              text, 
              deviceType: device,
              domSelector: focusMode.selector, 
              elementPreview: focusMode.preview,
              destinationSelector: focusMode.destSelector,
              destinationPreview: focusMode.destPreview
          } : n));
      } else {
          setNotes(prev => [{
              id: Date.now().toString(),
              text,
              context: currentContext,
              deviceType: device,
              timestamp: Date.now(),
              isCompleted: false,
              domSelector: focusMode.selector,
              elementPreview: focusMode.preview,
              destinationSelector: focusMode.destSelector,
              destinationPreview: focusMode.destPreview
          }, ...prev]);
      }
      setFocusMode({ active: false, id: null, text: '' });
  };

  const handleCopyNotes = async () => {
    let report = `** RELATÓRIO DE EDIÇÃO TÉCNICA - CONTEXTO: ${currentContext} **\n\n`;
    notes.forEach((note, index) => {
        const status = note.isCompleted ? 'x' : ' ';
        report += `- [${status}] ${note.text}\n`;
        if (note.domSelector) report += `TARGET: ${note.domSelector}\n`;
        if (note.destinationSelector) report += `DESTINATION: ${note.destinationSelector}\n`;
        report += `DEVICE: ${note.deviceType.toUpperCase()}\n`;
        if (index < notes.length - 1) report += `\n---\n\n`;
    });
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportNotes = () => {
    if (!importText.trim()) return;
    
    try {
        const contextHeaderMatch = importText.match(/\*\* RELATÓRIO DE EDIÇÃO TÉCNICA - CONTEXTO: (.*?) \*\*/);
        const importedContext = contextHeaderMatch ? contextHeaderMatch[1] : currentContext;

        const blocks = importText.split('---');
        const newNotes: NoteItem[] = [];
        
        blocks.forEach((block, idx) => {
            const noteMatch = block.match(/- \[( |x|X|×)\] (.*)/);
            if (noteMatch) {
                const isCompleted = noteMatch[1].toLowerCase() === 'x' || noteMatch[1] === '×';
                const text = noteMatch[2].trim();
                
                const targetMatch = block.match(/TARGET: (.*)/);
                const destMatch = block.match(/DESTINATION: (.*)/);
                const deviceMatch = block.match(/DEVICE: (.*)/);
                
                const device = (deviceMatch ? deviceMatch[1].toLowerCase() : getCurrentDevice()) as DeviceType;
                const domSelector = targetMatch ? targetMatch[1].trim() : undefined;
                const destinationSelector = destMatch ? destMatch[1].trim() : undefined;

                newNotes.push({
                    id: `${Date.now()}-${idx}`,
                    text,
                    isCompleted,
                    context: importedContext,
                    deviceType: device,
                    domSelector,
                    destinationSelector,
                    timestamp: Date.now(),
                    elementPreview: domSelector ? domSelector.split(' > ').pop()?.substring(0, 15) : undefined,
                    destinationPreview: destinationSelector ? destinationSelector.split(' > ').pop()?.substring(0, 15) : undefined
                });
            }
        });

        if (newNotes.length > 0) {
            setNotes(prev => [...newNotes, ...prev]);
            setIsImporting(false);
            setImportText('');
        } else {
            alert('Não foi possível identificar o formato do relatório.');
        }
    } catch (e) {
        alert('Erro ao processar o relatório.');
    }
  };

  const startEditingNote = (note: NoteItem) => {
    setFocusMode({ 
      active: true, 
      id: note.id, 
      text: note.text, 
      device: note.deviceType,
      selector: note.domSelector, 
      preview: note.elementPreview,
      destSelector: note.destinationSelector,
      destPreview: note.destinationPreview
    });
    setIsOpen(true);
  };

  const jumpToElement = (selector: string, type: 'source' | 'destination') => {
    try {
        const el = document.querySelector(selector) as HTMLElement;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const className = type === 'source' ? 'animate-target-flash-red' : 'animate-target-flash-green';
            el.classList.add(className);
            setTimeout(() => el.classList.remove(className), 3000);
            return true;
        }
    } catch(e) {}
    return false;
  };

  const navigateToTarget = async (note: NoteItem) => {
    const currentDevice = getCurrentDevice();
    if (note.deviceType !== currentDevice) {
        if (!confirm(`Atenção: Marcado em ${note.deviceType.toUpperCase()}, atual ${currentDevice.toUpperCase()}. Continuar?`)) return;
    }

    setIsOpen(false);
    if (note.domSelector) {
        jumpToElement(note.domSelector, 'source');
        if (note.destinationSelector) await new Promise(r => setTimeout(r, 2000));
    }
    if (note.destinationSelector) {
        jumpToElement(note.destinationSelector, 'destination');
    }
  };

  const DeviceIcon = ({ type, size = 10 }: { type: DeviceType, size?: number }) => {
      if (type === 'mobile') return <Smartphone size={size} />;
      if (type === 'tablet') return <Tablet size={size} />;
      return <Monitor size={size} />;
  };

  return (
    <>
      <style>{`
        @keyframes flash-red {
          0%, 100% { outline: 5px solid #ef4444; outline-offset: 4px; box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
          50% { outline: 2px solid transparent; outline-offset: 10px; box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes flash-green {
          0%, 100% { outline: 5px solid #10b981; outline-offset: 4px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
          50% { outline: 2px solid transparent; outline-offset: 10px; box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
        }
        .animate-target-flash-red { animation: flash-red 0.6s ease-in-out 5; }
        .animate-target-flash-green { animation: flash-green 0.6s ease-in-out 5; }
      `}</style>

      {isInspecting && (
          <div className="fixed z-[100000] pointer-events-none flex flex-col items-center layout-notes-ui" style={{ left: inspectCoords.x, top: inspectCoords.y - 80, transform: 'translateX(-50%)' }}>
             <div className={`bg-slate-950/90 backdrop-blur-xl border-2 rounded-2xl p-4 shadow-2xl animate-bounce-in min-w-[180px] ${inspectMode === 'source' ? 'border-brand-500' : 'border-emerald-500'}`}>
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                        <Maximize2 className={`w-3 h-3 ${inspectMode === 'source' ? 'text-brand-500' : 'text-emerald-500'}`} />
                        <span className="text-white font-black text-xs uppercase tracking-tighter">{inspectData?.tag || '---'}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{inspectData?.w} x {inspectData?.h}px</span>
                </div>
                <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-slate-300 flex items-center gap-2">
                    <DeviceIcon type={getCurrentDevice()} />
                    {inspectMode === 'source' ? 'MARCANDO ORIGEM' : 'MARCANDO DESTINO'}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                    <Crosshair className={`w-4 h-4 animate-spin-slow ${inspectMode === 'source' ? 'text-brand-500' : 'text-emerald-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest animate-pulse ${inspectMode === 'source' ? 'text-brand-500' : 'text-emerald-500'}`}>Alvo Ativo</span>
                </div>
             </div>
             <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] mt-1 ${inspectMode === 'source' ? 'border-t-brand-500' : 'border-t-emerald-500'}`}></div>
          </div>
      )}

      {isOpen && focusMode.active && (
          <div className="fixed inset-0 z-[10000] flex flex-col justify-end layout-notes-ui">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFocusMode(p => ({...p, active: false}))} />
              <div className="relative z-10 bg-slate-900 border-t-2 border-brand-500 p-6 shadow-2xl animate-slide-up-fade">
                  <div className="max-w-4xl mx-auto">
                      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                          <div className="flex items-center gap-4">
                            <h3 className="text-white font-black uppercase tracking-tighter text-sm flex items-center gap-2">
                                <Crosshair className="text-brand-500 w-4 h-4" /> 
                                {focusMode.id ? 'Editar Registro' : 'Novo Registro'}
                            </h3>
                            
                            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                                {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map(d => {
                                    const activeDevice = focusMode.device || getCurrentDevice();
                                    const isSelected = activeDevice === d;
                                    return (
                                        <button 
                                            key={d}
                                            onClick={() => setFocusMode(p => ({ ...p, device: d }))}
                                            className={`p-1.5 rounded-lg transition-all ${isSelected ? 'bg-brand-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                            title={d.toUpperCase()}
                                        >
                                            <DeviceIcon type={d} size={14} />
                                        </button>
                                    );
                                })}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {focusMode.selector && (
                                <div className="bg-brand-500/10 border border-brand-500/30 px-3 py-1 rounded-lg flex items-center gap-2">
                                    <span className="text-[10px] text-brand-400 font-mono font-bold truncate max-w-[120px]">S: {focusMode.preview}</span>
                                    <button onClick={() => setFocusMode(p => ({...p, selector: undefined, preview: undefined}))} className="text-red-400 hover:text-red-300"><X size={12}/></button>
                                </div>
                            )}
                            {focusMode.destSelector && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg flex items-center gap-2">
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold truncate max-w-[120px]">D: {focusMode.destPreview}</span>
                                    <button onClick={() => setFocusMode(p => ({...p, destSelector: undefined, destPreview: undefined}))} className="text-red-400 hover:text-red-300"><X size={12}/></button>
                                </div>
                            )}
                          </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                          <textarea ref={focusInputRef} value={focusMode.text} onChange={(e) => setFocusMode(p => ({ ...p, text: e.target.value }))} placeholder="O que deve ser alterado?" className="flex-1 w-full bg-slate-950 rounded-xl p-4 text-white font-bold text-lg border border-slate-800 focus:border-brand-500 outline-none resize-none h-20" />
                          <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => { setIsInspecting(true); setInspectMode('source'); setIsOpen(false); }} className="flex-1 md:flex-none h-12 px-4 bg-slate-800 hover:bg-slate-700 text-brand-400 rounded-xl flex items-center justify-center gap-2 border border-brand-500/30 transition-all"><Target size={18} /><span className="text-[10px] font-black uppercase">Origem</span></button>
                            <button onClick={() => { setIsInspecting(true); setInspectMode('destination'); setIsOpen(false); }} className="flex-1 md:flex-none h-12 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl flex items-center justify-center gap-2 border border-emerald-500/30 transition-all"><PlusCircle size={18} /><span className="text-[10px] font-black uppercase">Destino</span></button>
                            <button onClick={saveFocusNote} className="h-12 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg transition-transform active:scale-95"><Check size={24} strokeWidth={3} /></button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className={`fixed z-[9999] layout-notes-ui transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ left: triggerPos.x, top: triggerPos.y }}>
         <div className="relative group flex flex-col items-center gap-2">
            <div onMouseDown={startDraggingTrigger} onTouchStart={startDraggingTrigger} className="w-8 h-4 bg-brand-500/20 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"><GripVertical size={12} className="text-brand-500 rotate-90" /></div>
            <div onClick={() => setIsOpen(true)} className="w-12 h-12 bg-slate-900 text-brand-500 border-2 border-brand-500 rounded-xl flex items-center justify-center shadow-2xl transition-all cursor-pointer">
                <ClipboardList size={24} strokeWidth={2.5} />
                {notes.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">{notes.filter(n => !n.isCompleted).length}</span>}
            </div>
         </div>
      </div>

      {isOpen && !focusMode.active && (
        <div className="layout-notes-ui">
            <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
            <div onMouseDown={startDraggingPanel} onTouchStart={startDraggingPanel} className="fixed z-[9999] w-[95vw] md:w-[380px] bg-slate-900 rounded-2xl shadow-2xl border-2 border-brand-500 flex flex-col overflow-hidden h-[520px] animate-zoom-in" style={{ left: panelPos.x, top: panelPos.y }}>
                <div className="px-6 py-4 flex items-center justify-between bg-slate-800 border-b border-brand-500/30 cursor-move">
                    <div className="flex items-center gap-2"><ClipboardList className="text-brand-500" size={18} /><h2 className="text-white font-black uppercase tracking-tighter text-xs">Ajustes Técnicos</h2></div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsImporting(!isImporting)} className={`p-2 rounded-lg transition-all ${isImporting ? 'bg-blue-500 text-white' : 'hover:bg-slate-700 text-slate-400'}`} title="Importar"><Upload size={18}/></button>
                        <button onClick={handleCopyNotes} className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'hover:bg-slate-700 text-slate-400'}`} title="Copiar">{copied ? <Check size={18}/> : <Copy size={18} />}</button>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={18}/></button>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden flex flex-col">
                    {isImporting ? (
                        <div className="flex-1 p-6 flex flex-col bg-slate-950 animate-slide-up-fade">
                            <h3 className="text-white font-black text-xs uppercase mb-4 flex items-center gap-2 text-blue-400"><Upload size={14}/> Importar Backup</h3>
                            <textarea 
                                value={importText} 
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="Cole o relatório aqui..."
                                className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-300 focus:border-blue-500 outline-none resize-none mb-4"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setIsImporting(false)} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl text-[10px] uppercase">Cancelar</button>
                                <button onClick={handleImportNotes} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-[10px] uppercase shadow-lg">Processar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {notes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 uppercase font-black text-xs">Nenhum registro.</div>
                            ) : (
                                notes.map(note => {
                                    const isWrongDevice = note.deviceType !== getCurrentDevice();
                                    return (
                                        <div key={note.id} className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${note.isCompleted ? 'bg-slate-950 border-slate-800 opacity-40' : 'bg-slate-800/50 border-slate-700 hover:border-brand-500/50'}`}>
                                            <div className="flex items-start gap-3">
                                                <button onClick={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? {...n, isCompleted: !n.isCompleted} : n)); }} className={`mt-1 ${note.isCompleted ? 'text-emerald-500' : 'text-slate-500'}`}>{note.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}</button>
                                                <div className="flex-1 min-w-0" onClick={() => startEditingNote(note)}>
                                                    <p className={`text-xs font-bold text-white leading-snug mb-2 ${note.isCompleted ? 'line-through opacity-50' : ''}`}>{note.text}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <div className="flex items-center gap-1 text-[8px] font-mono text-slate-400 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                                                            <DeviceIcon type={note.deviceType} size={8} /> {note.deviceType.toUpperCase()}
                                                        </div>
                                                        {note.domSelector && (
                                                            <button onClick={(e) => { e.stopPropagation(); jumpToElement(note.domSelector!, 'source'); setIsOpen(false); }} className="flex items-center gap-1 text-[8px] font-mono text-brand-400 bg-brand-500/5 px-1.5 py-0.5 rounded border border-brand-500/20 hover:bg-brand-500/20 transition-colors">
                                                                <Target size={8} /> {note.elementPreview}
                                                            </button>
                                                        )}
                                                        {note.destinationSelector && (
                                                            <button onClick={(e) => { e.stopPropagation(); jumpToElement(note.destinationSelector!, 'destination'); setIsOpen(false); }} className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                                                                <ArrowRight size={8} /> {note.destinationPreview}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button onClick={(e) => { e.stopPropagation(); navigateToTarget(note); }} className="p-1.5 bg-brand-500/10 hover:bg-brand-500 text-brand-500 hover:text-black rounded-lg border border-brand-500/30 transition-all flex items-center justify-center">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setNotes(prev => prev.filter(n => n.id !== note.id)); }} className="p-1.5 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {!isImporting && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                        <button onClick={() => setFocusMode({ active: true, id: null, text: '', device: getCurrentDevice() })} className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-xs font-bold"><Plus size={14} /> Novo Ajuste</button>
                    </div>
                )}
            </div>
        </div>
      )}
    </>
  );
};
