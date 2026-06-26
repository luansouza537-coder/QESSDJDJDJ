/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameLoop } from './GameLoop';
import { WeatherSystem } from './WeatherSystem';
import { EconomySystem } from './EconomySystem';
import { criarEstadoSimulacao } from './SimulationBridge';
import { EstadoJogoSimulacao } from '../types/simulation';
import { GameState } from '../types/game';

type EngineSubscriber = (state: EstadoJogoSimulacao) => void;

/**
 * Singleton que gerencia o ciclo de vida do motor real-time (GameLoop,
 * WeatherSystem, EconomySystem) fora da árvore React.
 *
 * Componentes React se inscrevem via subscribe() para receber atualizações
 * com throttle de 500ms, sem acoplamento ao GameContext.
 */
class EngineManager {
  private loop: GameLoop | null = null;
  private simState: EstadoJogoSimulacao | null = null;
  private subscribers = new Set<EngineSubscriber>();
  private lastNotify = 0;

  /** Inicia o motor. Idempotente: ignora chamadas duplicadas. */
  start(gameState: GameState): void {
    if (this.loop) return;

    const simState = criarEstadoSimulacao(gameState);
    this.simState = simState;

    const loop = new GameLoop(simState);
    loop.registrarSubsistema(new WeatherSystem());
    loop.registrarSubsistema(new EconomySystem());

    loop.assinarAtualizacao((estado) => {
      this.simState = estado;

      // Throttle global de 500ms — todos os subscribers recebem na mesma janela
      const now = performance.now();
      if (now - this.lastNotify >= 500) {
        this.lastNotify = now;
        this.subscribers.forEach(cb => cb(estado));
      }
    });

    this.loop = loop;
    loop.iniciar();
  }

  /** Para o motor e limpa o estado. */
  stop(): void {
    this.loop?.pausar();
    this.loop = null;
    this.simState = null;
    this.lastNotify = 0;
  }

  /** Retorna o estado de simulação atual para acesso síncrono (ex: combate). */
  getSimState(): EstadoJogoSimulacao | null {
    return this.simState;
  }

  /**
   * Inscreve um callback nas atualizações do motor (throttle 500ms).
   * Retorna uma função de cancelamento para usar em useEffect cleanup.
   */
  subscribe(cb: EngineSubscriber): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }
}

export const engineManager = new EngineManager();
