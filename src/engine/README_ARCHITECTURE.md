# 🛠️ Arquitetura Geral do Simulador Geopolítico e Militar
## Teatro de Conflito do Prata (Brasil x Paraguai)

Este documento descreve a especificação técnica, estrutural e matemática para a simulação geopolítica e militar em tempo real do jogo. Projetado para rodar diretamente no navegador com altíssima performance (60 FPS com suporte para mais de 20.000 unidades simuladas).

---

## 1. Estrutura de Pastas e Módulos do Projeto

Para garantir modularidade, separação estrita de responsabilidades e alta escalabilidade, o simulador foi organizado na seguinte estrutura arquitetônica:

```
/src
  /types
    - simulation.ts           # Definição e modelagem de tipos de dados macro (unidades, economia, clima, etc)
    - Character.ts            # Tipagens de espiões, generais e diplomatas
    - game.ts                 # Tipagens da UI e fluxo de campanha histórico
  /engine
    - README_ARCHITECTURE.md  # Especificação arquitetural sênior (este documento)
    - GameLoop.ts             # Ticker contínuo 60 FPS com requestAnimationFrame
    - SpatialHash.ts          # Indexador espacial 2D de alta performance para busca O(N) de vizinhos
    - Pathfinding.ts          # Algoritmo A* de busca de caminhos geográficos com coeficientes de relevo
    - EconomySystem.ts        # Sistema macroeconômico com equações diferenciais acopladas
    - WeatherSystem.ts        # Clima dinâmico regional, estações e atenuação física de visibilidade/radar
    - LogisticsSystem.ts      # Abastecimento dinâmico, consumo de combustível, fadiga e convois
    - CombatSystem.ts         # Motor de combate em tempo real baseado em balística, blindagem e terreno (Próxima etapa)
    - AISystem.ts             # Inteligência artificial de tomada de decisões militares estratégicas (Próxima etapa)
  /components
    - Map.tsx                 # Renderizador de mapa Leaflet com tiles de satélite e sobreposição militar
    - Dashboard.tsx           # HUD de monitoramento geral
  /context
    - GameContext.tsx         # Contexto React de ligação do estado do jogo à interface
```

---

## 2. Tecnologias Adotadas e Justificativas

1. **React 19 + TypeScript (Vite)**: Fornece tipagem estática rigorosa para evitar falhas em tempo de execução no motor de simulação e compilação ultra veloz.
2. **Leaflet (Mapas de Satélite)**: Leaflet foi escolhido como motor de renderização geográfica sem dependências de APIs proprietárias/pagas. Utiliza a camada pública de satélite da **Esri World Imagery** (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) que oferece imagens globais detalhadas de graça.
3. **Tailwind CSS v4 (Design do Gabinete Militar)**: Configurado diretamente via plugin nativo no Vite para estilização ultra rápida de um HUD escuro estilo terminal tático, com transparências, glows ciano/azul neon e linhas vetoriais de radar.
4. **HTML5 Canvas / SVG Instanciado**: Utilizado para desenhar milhares de unidades militares simultâneas sem engasgar o DOM do navegador.

---

## 3. Fluxo de Jogo em Tempo Real (Game Loop)

A simulação funciona através de uma arquitetura baseada em **Ticks de Simulação**. 
- Um cronômetro mestre calcula o tempo decorrido usando o relógio do sistema (`performance.now()`).
- O **Delta Time Real** ($dt_{real}$) mede a fração de segundo real que passou entre os quadros.
- O **Delta Time da Simulação** ($dt_{sim}$) multiplica o $dt_{real}$ pelo fator de aceleração temporal selecionado pelo jogador (ex: 1x, 2x, 5x, 10x):
  $$\Delta t_{sim} = \Delta t_{real} \times \text{Multiplicador} \times 3600$$
  *(Nesta escala, 1 segundo real equivale a 1 hora de simulação padrão)*

Os subsistemas rodam em cadeia sequencial a cada frame dentro do ticker de animação do navegador:

```
[RequestAnimationFrame Ticker]
             │
             ▼
[Calcular dt_real e dt_sim]
             │
             ▼
[Executar Subsistema de Clima] ───► Atualiza chuva, vento, neblina e coeficientes físicos
             │
             ▼
[Executar Subsistema de Movimento] ──► Move tropas ao longo dos waypoints gerados pelo A*
             │
             ▼
[Executar Subsistema de Logística] ──► Queima combustível, consome munição e drena depósitos
             │
             ▼
[Executar Subsistema de Combate] ───► Efetua disparos, calcula penetração de blindagem e HP
             │
             ▼
[Executar Subsistema Econômico] ────► Roda equações macroeconômicas diferenciais diárias
             │
             ▼
[Executar IA Estratégica] ─────────► Dispara decisões automatizadas a cada 2-3 segundos
             │
             ▼
[Notificar UI / Renderização Canvas]
```

---

## 4. Modelagem Matemática de Dados (Data Modeling)

### A. Movimentação Livre e Vetorial de Tropas
Cada unidade possui coordenadas físicas contínuas de latitude e longitude, sem amarras a grades de tabuleiro. 
A velocidade ($v$) varia continuamente em função da aceleração ($a$) e da fricção do relevo do terreno ($\mu$):
$$v_{t+1} = \max\left(0, \min\left(v_{max}, v_{t} + (a - \mu) \cdot \Delta t\right)\right)$$

### B. Sistema Macroeconômico Dinâmico
A economia não é baseada em acréscimos estáticos simples, mas em um modelo interconectado de equações macroeconômicas diferenciais:

* **PIB (PIB)**: Crescimento influenciado positivamente por indústrias, reservas, exportações e energia; reduzido por juros Selic altos e desemprego:
  $$\Delta PIB = \text{Crescimento Base} + f(\text{Energia}) + f(\text{Impostos}) - (i_{Selic} - i_{neutro}) \cdot 0.2$$
* **Inflação ($\pi$)**: Controlada via elevação da Selic pelo Banco Central, e impulsionada pelo aquecimento da demanda (PIB e Curva de Phillips):
  $$\pi = \text{Inflação Base} + 0.4 \cdot \Delta PIB + (\text{Pleno Emprego} - \text{Desemprego}) \cdot 0.15 - i_{Selic} \cdot 0.35$$
* **Desemprego ($U$)**: Sobe com taxas Selic elevadas e carga tributária alta; cai com crescimento econômico:
  $$U_{alvo} = U_{estrutural} + \text{Impostos} \cdot 0.08 + i_{Selic} \cdot 0.15 - \Delta PIB \cdot 0.6$$

### C. Coeficientes de Clima e Logística
O clima atua como um multiplicador limitante:
* **Neblina**: Reduz o raio de visão visual em 75% ($\text{coeficiente} = 0.25$).
* **Tempestade**: Impede a decolagem de caças e drones, e reduz o alcance de radares em 80% ($\text{coeficiente} = 0.20$).
* **Falta de Abastecimento**: Unidades distantes mais de $120\text{ km}$ de depósitos amigáveis perdem $2.5\%$ de moral por dia de simulação e entram em exaustão física.

---

## 5. Próximas Etapas de Desenvolvimento

Com os alicerces arquitetônicos documentados e os sistemas de dados, Loop, Spatial Hash, Pathfinding A*, Economia, Clima e Logística totalmente implementados e testados em TypeScript compilável, as próximas etapas lógicas serão:

1. **Sistema de Mapa e Renderização**: Integração visual do Leaflet com a camada de satélite da Esri e renderização das posições de satélites, cidades e unidades.
2. **Sistema de Combate e Movimentação Real-Time**: Ativação física das unidades se movendo em tempo real no mapa e atirando umas nas outras.
3. **IA Estratégica**: Programar os exércitos oponentes para planejar frentes de assalto a pontes, proteger portos e flanquear.
4. **Interface de Controle (HUD)**: Painéis laterais deslizantes, gráficos Recharts dinâmicos da saúde econômica e militar.
