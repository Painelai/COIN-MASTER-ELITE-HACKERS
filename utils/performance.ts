
import { useEffect, useState } from 'react';

type PerformanceTier = 'low' | 'high';

/**
 * Lógica de Classificação de Hardware
 * REVISÃO: Agora permite detectar o estado inicial mas respeita o override do usuário.
 */
const getHardwareTier = (): PerformanceTier => {
  // Verifica se já existe uma preferência salva
  const saved = localStorage.getItem('cm_lite_mode');
  if (saved === 'true') return 'low';
  if (saved === 'false') return 'high';

  // Fallback para detecção automática simples
  if (typeof navigator !== 'undefined') {
      const memory = (navigator as any).deviceMemory;
      if (memory && memory <= 4) return 'low';
  }
  
  return 'high'; 
};

export const usePerformanceMonitoring = () => {
  const [tier, setTier] = useState<PerformanceTier>('low');

  useEffect(() => {
    const initialTier = getHardwareTier();
    setTier(initialTier);
    
    // Define o atributo inicial se não houver um override ativo no DOM
    if (!document.documentElement.getAttribute('data-perf')) {
        document.documentElement.setAttribute('data-perf', initialTier);
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      // Se o usuário tem preferência de sistema por movimento reduzido, forçamos 'low'
      if (e.matches) {
          setTier('low');
          document.documentElement.setAttribute('data-perf', 'low');
      }
    };

    if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', handleMotionChange);
    } else {
        motionQuery.addListener(handleMotionChange);
    }

    return () => {
        if (motionQuery.removeEventListener) {
            motionQuery.removeEventListener('change', handleMotionChange);
        } else {
            motionQuery.removeListener(handleMotionChange);
        }
    };
  }, []);

  return tier;
};
