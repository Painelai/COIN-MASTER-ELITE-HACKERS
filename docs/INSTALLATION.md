# ⚙️ Guia de Instalação e Configuração

Este documento detalha como colocar o sistema online em diferentes infraestruturas.

## 1. Ambiente Local (Desenvolvimento)
Ideal para testar alterações antes do deploy.
- **Requisitos:** Node.js v18+.
- **Comandos:**
  ```bash
  npm install
  npm run dev
  ```
- **Nota:** O sistema usará o `MockProvider` (LocalStorage) por padrão.

## 2. Hospedagem Compartilhada (Cpanel / PHP)
Para usar o painel com banco de dados real (MySQL/SQLite).
1. Execute `npm run build` na sua máquina.
2. Envie o conteúdo da pasta `dist` para o `public_html` do seu servidor.
3. Configure o arquivo `EliteUserPanel/api/elite-api.php` com suas credenciais MySQL.
4. Importe o arquivo `DataBase.sql` no seu PHPMyAdmin.

## 3. Deploy no Render / Vercel
Para hospedar apenas o front-end (estático).
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Variáveis de Ambiente:** Adicione `GEMINI_API_KEY` nas configurações do projeto para ativar a IA.

## 4. Configuração de Banco de Dados
O sistema possui fallback automático. Se você não configurar um MySQL no arquivo PHP, ele criará um banco SQLite (`elite_users.db`) automaticamente na pasta da API. Certifique-se de dar permissão de escrita (775 ou 777) na pasta `EliteUserPanel/api/`.