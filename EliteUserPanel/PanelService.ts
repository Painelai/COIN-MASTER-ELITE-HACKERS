import { ElitePanelData } from './types';

// Detecta se estamos em ambiente de desenvolvimento ou produção
const API_BASE = './EliteUserPanel/api/elite-api.php';

export const PanelService = {
    async login(email: string, pass: string): Promise<{ success: boolean; data?: ElitePanelData; error?: string }> {
        try {
            const response = await fetch(`${API_BASE}?action=login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, pass })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                return { 
                    success: false, 
                    error: errData.error || `Erro de Servidor (${response.status})` 
                };
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Terminal sem resposta. Verifique sua conexão.' };
        }
    },

    async register(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${API_BASE}?action=register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, pass })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: 'Falha ao registrar novo operador.' };
        }
    },

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE}?action=dashboard`);
            return response.ok;
        } catch (e) {
            return false;
        }
    }
};