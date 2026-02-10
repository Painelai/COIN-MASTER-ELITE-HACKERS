# 🛡️ Manual das Ferramentas (Hacks)

O CM ELITE não altera o código do jogo no seu celular, ele intercepta a comunicação entre o jogo e o servidor da MoonActive.

### 1. IA Oráculo (Sequence Reader)
- **O que é:** Um motor de predição baseado em análise de entropia.
- **Como funciona:** Ele captura a "Seed RNG" (semente de aleatoriedade) enviada pelo servidor antes da animação da roleta começar.
- **Manual de Uso:** Ative o módulo no painel. Quando o indicador piscar em verde, suba a aposta para o valor máximo (x100 ou x500). O sistema detectou uma sequência premiada (3 porcos ou 3 martelos).

### 2. Stealth 7 (Protocolo Fantasma)
- **O que é:** Camuflagem de hardware e rede Layer-7.
- **Como funciona:** Gera um ID de dispositivo virtual e mascara os cabeçalhos das requisições para que pareçam vir de um aparelho "limpo".
- **Manual de Uso:** Mantenha sempre ativo durante sessões de farm intenso para evitar que sua conta entre na "lista de auditoria" do servidor.

### 3. Viking Quest Bot
- **O que é:** Automação inteligente para o evento Viking.
- **Como funciona:** Utiliza a estratégia "Low-High". Joga valores baixos para queimar rodadas sem prêmio e valores altos quando a probabilidade de bônus é superior a 85%.
- **Manual de Uso:** Defina o saldo reserva e clique em "Iniciar Protocolo". O bot jogará sozinho até completar os 3 níveis dourados.

### 4. Card Set Finisher
- **O que é:** Manipulador de probabilidade de drops.
- **Como funciona:** Injeta um payload que solicita ao servidor a abertura de baús baseada no index de cartas faltantes.
- **Manual de Uso:** Selecione o set que deseja completar. O sistema priorizará cartas raras e douradas daquele set específico nos próximos baús abertos.

### 5. Time-Warp Engine
- **O que é:** Acelerador de clock via injeção de pacotes.
- **Como funciona:** Remove os delays de animação de construção e ataque, forçando o servidor a processar a transação instantaneamente.
- **Manual de Uso:** Use para fechar vilas em segundos durante o evento de "Village Master" para maximizar recompensas.