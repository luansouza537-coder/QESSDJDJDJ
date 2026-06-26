/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EstadoJogoSimulacao, UnidadeMilitar } from '../types/simulation';

/**
 * Interface para os subsistemas que assinam o loop de simulação principal
 */
export interface SubsistemaSimulacao {
  inicializar?: (estado: EstadoJogoSimulacao) => void;
  atualizar: (estado: EstadoJogoSimulacao, deltaTimeReal: number, deltaTimeSimulacao: number) => void;
}

/**
 * Engine do Loop de Jogo Real-Time (60 FPS)
 * Responsável pelo controle de ticks, fator de aceleração temporal e execução sequencial de subsistemas.
 */
export class GameLoop {
  private estado: EstadoJogoSimulacao;
  private subsistemas: SubsistemaSimulacao[] = [];
  
  private requestFrameId: number | null = null;
  private ultimoTimestamp: number = 0;
  
  // Taxa de conversão: 1 segundo real = X segundos de simulação
  // Por exemplo, 1 seg real = 3600 seg simulação (1 hora) -> para simulação econômica e logística ágil
  private readonly SEGUNDOS_SIMULACAO_POR_REAL_PADRAO = 3600; 

  private callbacksAoAtualizar: ((estado: EstadoJogoSimulacao) => void)[] = [];

  constructor(estadoInicial: EstadoJogoSimulacao) {
    this.estado = estadoInicial;
  }

  /**
   * Adiciona um módulo de subsistema (ex: Economia, Combate, Movimentação)
   */
  public registrarSubsistema(subsistema: SubsistemaSimulacao): void {
    this.subsistemas.push(subsistema);
    if (subsistema.inicializar) {
      subsistema.inicializar(this.estado);
    }
  }

  /**
   * Registra escutadores do React para renderização e sincronização de interface
   */
  public assinarAtualizacao(callback: (estado: EstadoJogoSimulacao) => void): () => void {
    this.callbacksAoAtualizar.push(callback);
    return () => {
      this.callbacksAoAtualizar = this.callbacksAoAtualizar.filter(cb => cb !== callback);
    };
  }

  /**
   * Inicia o processamento contínuo
   */
  public iniciar(): void {
    if (this.requestFrameId !== null) return;
    
    this.estado.tempoPausado = false;
    this.ultimoTimestamp = performance.now();
    this.loop(this.ultimoTimestamp);
  }

  /**
   * Pausa a simulação
   */
  public pausar(): void {
    this.estado.tempoPausado = true;
    if (this.requestFrameId !== null) {
      cancelAnimationFrame(this.requestFrameId);
      this.requestFrameId = null;
    }
  }

  /**
   * Altera a velocidade de aceleração temporal (1x, 2x, 5x, 10x)
   */
  public alterarVelocidade(multiplicador: number): void {
    if (multiplicador <= 0) return;
    this.estado.velocidadeMultiplicador = multiplicador;
  }

  /**
   * Função interna recursiva de animação (RequestAnimationFrame)
   */
  private loop = (timestamp: number): void => {
    this.requestFrameId = requestAnimationFrame(this.loop);
    
    // Calcular DeltaTime em segundos reais
    const deltaRealMs = timestamp - this.ultimoTimestamp;
    this.ultimoTimestamp = timestamp;
    
    // Evitar picos de lag ao minimizar a janela (limitar delta máximo a 100ms)
    const deltaTimeReal = Math.min(deltaRealMs / 1000, 0.1);

    if (this.estado.tempoPausado) return;

    // Calcular o DeltaTime correspondente na simulação (tempo acelerado)
    const taxaSimulacao = this.SEGUNDOS_SIMULACAO_POR_REAL_PADRAO * this.estado.velocidadeMultiplicador;
    const deltaTimeSimulacao = deltaTimeReal * taxaSimulacao;

    // Incrementar cronômetro da simulação
    this.estado.tempoTotalSegundos += deltaTimeSimulacao;

    // Executar sequencialmente todos os subsistemas da simulação militar e geopolítica
    for (const subsistema of this.subsistemas) {
      try {
        subsistema.atualizar(this.estado, deltaTimeReal, deltaTimeSimulacao);
      } catch (erro) {
        console.error(`Erro crítico no subsistema de simulação:`, erro);
      }
    }

    // Notificar UI (React)
    this.notificarAtualizacao();
  };

  /**
   * Dispara atualizações estruturadas para a UI
   */
  private notificarAtualizacao(): void {
    // Para evitar overhead de renderização excessiva no React, podemos usar
    // clone raso (shallow clone) ou apenas enviar o estado atualizado.
    // Usaremos clone raso das listas críticas para forçar o React a re-renderizar adequadamente.
    const estadoCopiado = {
      ...this.estado,
      unidades: [...this.estado.unidades],
      cidades: [...this.estado.cidades],
      comboios: [...this.estado.comboios],
      alertas: [...this.estado.alertas]
    };
    
    for (const callback of this.callbacksAoAtualizar) {
      callback(estadoCopiado);
    }
  }

  /**
   * Retorna o estado atualizado da simulação
   */
  public obterEstado(): EstadoJogoSimulacao {
    return this.estado;
  }
}
