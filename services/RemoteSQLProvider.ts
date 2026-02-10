import { IDataProvider } from './DataProvider';
import { AppConfig, FeatureFlags, SystemAuditLog, AppContent } from '../core/types';

/**
 * REMOTESQL PROVIDER (Local PHP Bridge)
 * Sincroniza o Core do App com o banco de dados via elite-api.php
 */
const API_BASE = './EliteUserPanel/api/elite-api.php';

export class RemoteSQLProvider implements IDataProvider {
  
  private async request(action: string, method: 'GET' | 'POST' = 'GET', body?: any) {
      const url = method === 'GET' ? `${API_BASE}?action=${action}` : `${API_BASE}?action=${action}`;
      const options: RequestInit = {
          method,
          headers: { 'Content-Type': 'application/json' }
      };
      if (body) options.body = JSON.stringify(body);

      const resp = await fetch(url, options);
      if (!resp.ok) throw new Error("API_OFFLINE");
      return await resp.json();
  }

  async init(): Promise<void> {
      // API inicializa as tabelas automaticamente no PHP
  }

  async getConfig(): Promise<AppConfig> {
      const res = await this.request('get_storage&key=config');
      return res.data;
  }

  async saveConfig(config: AppConfig): Promise<void> {
      await this.request('save_storage', 'POST', { key: 'config', data: config });
  }

  async getFeatures(): Promise<FeatureFlags> {
      const res = await this.request('get_storage&key=features');
      return res.data;
  }

  async saveFeatures(features: FeatureFlags): Promise<void> {
      await this.request('save_storage', 'POST', { key: 'features', data: features });
  }

  async getContent(): Promise<AppContent> {
      const res = await this.request('get_storage&key=content');
      return res.data;
  }

  async saveContent(content: AppContent): Promise<void> {
      await this.request('save_storage', 'POST', { key: 'content', data: content });
  }

  async getLogs(): Promise<SystemAuditLog[]> {
      const res = await this.request('get_logs');
      return res.data || [];
  }

  async addLog(log: SystemAuditLog): Promise<void> {
      await this.request('add_log', 'POST', log);
  }
}