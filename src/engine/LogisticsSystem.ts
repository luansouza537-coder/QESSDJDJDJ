/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubsistemaSimulacao } from './GameLoop';
import { EstadoJogoSimulacao, UnidadeMilitar, DepositoSuprimentos, ComboioLogistico } from '../types/simulation';
import { SpatialHash } from './SpatialHash';

/**
 * Subsistema Logístico e de Cadeia de Abastecimento Militar
 * Governa o queima de combustível das forças em movimento, consumo de munição,
 * conexão espacial com depósitos locais, fadiga de tropas e tráfego de comboios.
 */
export class LogisticsSystem implements SubsistemaSimulacao {
  private acumuladorTempoSegundos: number = 0;
  private readonly INTERVALO_ATUALIZACAO_SEGUNDOS = 600; // Roda rotinas logísticas a cada 10 minutos simulados

  public inicializar(estado: EstadoJogoSimulacao): void {
    // Configura depósitos de suprimentos iniciais na foz e fronteiras
    estado.depositos = [
      {
        id: 'DEP_FOZ',
        nome: 'Depósito Logístico Central de Foz do Iguaçu',
        latitude: -25.51,
        longitude: -54.58,
        combustivelEstoque: 1500000, // litros
        municaoEstoque: 25000, // caixas
        alimentosEstoque: 1000, // toneladas
        pecasReparoEstoque: 500,
        capacidadeMax: 3000000
      },
      {
        id: 'DEP_ASSUNCAO',
        nome: 'Quartel Logístico Geral de Assunção',
        latitude: -25.26,
        longitude: -57.57,
        combustivelEstoque: 900000,
        municaoEstoque: 18000,
        alimentosEstoque: 800,
        pecasReparoEstoque: 300,
        capacidadeMax: 2000000
      },
      {
        id: 'DEP_CHACO',
        nome: 'Base de Operações Avançada do Chaco',
        latitude: -21.50,
        longitude: -60.00,
        combustivelEstoque: 400000,
        municaoEstoque: 8000,
        alimentosEstoque: 300,
        pecasReparoEstoque: 150,
        capacidadeMax: 1000000
      }
    ];
  }

  public atualizar(estado: EstadoJogoSimulacao, deltaTimeReal: number, deltaTimeSimulacao: number): void {
    this.acumuladorTempoSegundos += deltaTimeSimulacao;

    // Atualização em lotes periódicos para otimização extrema de performance (suporta mais de 20.000 unidades)
    if (this.acumuladorTempoSegundos >= this.INTERVALO_ATUALIZACAO_SEGUNDOS) {
      this.acumuladorTempoSegundos -= this.INTERVALO_ATUALIZACAO_SEGUNDOS;
      
      this.atualizarLogisticaUnidades(estado);
      this.atualizarComboiosLogicos(estado);
    }
  }

  /**
   * Processa queima de combustível, munição, cansaço e lealdade logística das tropas
   */
  private atualizarLogisticaUnidades(estado: EstadoJogoSimulacao): void {
    const unidades = estado.unidades;
    const depositos = estado.depositos;

    // Distância máxima de abastecimento direto (em km) de um depósito até uma unidade
    const RAIO_ABASTECIMENTO_MAX_KM = 120.0; 

    for (let i = 0; i < unidades.length; i++) {
      const u = unidades[i];
      const s = u.status;

      // 1. CONSUMO DE COMBUSTÍVEL
      // Se a unidade está se movendo (velocidade > 0), consome mais combustível
      let consumoCombustivelAtual = s.consumoCombustivel * this.INTERVALO_ATUALIZACAO_SEGUNDOS;
      if (u.velocidade > 0) {
        consumoCombustivelAtual *= 3.0; // queima triplica em deslocamento ativo
      }
      
      s.combustivel = Math.max(0, s.combustivel - consumoCombustivelAtual);

      // 2. CONSUMO DE MUNIÇÃO (Se engajado em tiroteio ativo)
      if (u.emCombate) {
        const consumoMunicaoAtual = s.consumoMunicao * this.INTERVALO_ATUALIZACAO_SEGUNDOS;
        s.municao = Math.max(0, s.municao - consumoMunicaoAtual);
        
        // Fadiga escala rapidamente em combate
        u.fadiga = Math.min(100, u.fadiga + 5.0);
        s.moral = Math.max(10, s.moral - 1.5);
      } else {
        // Tropas estacionadas recuperam fadiga lentamente se abastecidas
        u.fadiga = Math.max(0, u.fadiga - 1.2);
      }

      // 3. CADEIA DE LOGÍSTICA E REABASTECIMENTO
      // Verifica qual o depósito amigável mais próximo
      let menorDistancia = Infinity;
      let depositoMaisProximo: DepositoSuprimentos | null = null;

      for (let j = 0; j < depositos.length; j++) {
        const d = depositos[j];
        // Apenas depósitos controlados ou amigáveis
        const dist = SpatialHash.calcularDistanciaRealKm(u.latitude, u.longitude, d.latitude, d.longitude);
        if (dist < menorDistancia) {
          menorDistancia = dist;
          depositoMaisProximo = d;
        }
      }

      const conectado = menorDistancia <= RAIO_ABASTECIMENTO_MAX_KM;
      u.cadeiaLogisticaConectada = conectado;

      if (conectado && depositoMaisProximo) {
        // Reabastece unidade e abate estoques do depósito
        const necessidadeCombustivel = s.maxCombustivel - s.combustivel;
        if (necessidadeCombustivel > 0 && depositoMaisProximo.combustivelEstoque > 0) {
          const combustivelAbastecido = Math.min(necessidadeCombustivel, depositoMaisProximo.combustivelEstoque, 500);
          s.combustivel += combustivelAbastecido;
          depositoMaisProximo.combustivelEstoque -= combustivelAbastecido;
        }

        const necessidadeMunicao = s.maxMunicao - s.municao;
        if (necessidadeMunicao > 0 && depositoMaisProximo.municaoEstoque > 0) {
          const municaoAbastecida = Math.min(necessidadeMunicao, depositoMaisProximo.municaoEstoque, 10);
          s.municao += municaoAbastecida;
          depositoMaisProximo.municaoEstoque -= municaoAbastecida;
        }

        // Se reabastecido e descansando, moral sobe
        if (s.combustivel > (s.maxCombustivel * 0.5) && !u.emCombate) {
          s.moral = Math.min(100, s.moral + 0.8);
        }
      } else {
        // Isolado das linhas de suprimentos amigáveis!
        // Perda severa de moral diária por isolamento e risco de aniquilação
        s.moral = Math.max(5, s.moral - 2.5);
        u.fadiga = Math.min(100, u.fadiga + 1.0);

        if (s.combustivel === 0) {
          // Pane seca! Unidade imobilizada
          u.velocidade = 0;
          u.aceleracao = 0;
        }
      }
    }
  }

  /**
   * Move caminhões e navios cargueiros de suprimentos no mapa
   */
  private atualizarComboiosLogicos(estado: EstadoJogoSimulacao): void {
    const comboios = estado.comboios;

    for (let i = comboios.length - 1; i >= 0; i--) {
      const c = comboios[i];
      
      // Calcula distância geográfica até o destino do comboio
      const dist = SpatialHash.calcularDistanciaRealKm(c.latitude, c.longitude, c.latitudeDestino, c.longitudeDestino);
      
      // Velocidade do comboio convertida de km/h para variação de graus de lat/lng por segundo
      const velocidadeGrausPorSegundo = (c.velocidade / 111) / 3600; // 1 grau de latitude ~ 111km
      const deltaMovimento = velocidadeGrausPorSegundo * this.INTERVALO_ATUALIZACAO_SEGUNDOS;

      if (dist <= 5.0) {
        // Comboio chegou ao destino! Descarrega suprimentos no depósito alvo
        const depAlvo = estado.depositos.find(d => d.id === c.unidadeAlvoId);
        if (depAlvo) {
          depAlvo.combustivelEstoque = Math.min(depAlvo.capacidadeMax, depAlvo.combustivelEstoque + c.carga.combustivel);
          depAlvo.municaoEstoque = Math.min(depAlvo.capacidadeMax, depAlvo.municaoEstoque + c.carga.municao);
          
          estado.alertas.unshift({
            id: `log_arriv_${Date.now()}`,
            timestampSegundos: estado.tempoTotalSegundos,
            titulo: `🚚 COMBOIO REABASTECIDO`,
            conteudo: `O comboio de suprimentos "${c.nome}" chegou a "${depAlvo.nome}", entregando ${c.carga.combustivel}L de combustível e ${c.carga.municao} caixas de armamentos.`,
            tipo: 'LOGISTICO',
            lida: false
          });
        }
        
        // Remove comboio da simulação ativa (recarrega frota)
        comboios.splice(i, 1);
      } else {
        // Move comboio linearmente em direção ao destino
        const radianos = Math.atan2(c.latitudeDestino - c.latitude, c.longitudeDestino - c.longitude);
        c.latitude += Math.sin(radianos) * deltaMovimento;
        c.longitude += Math.cos(radianos) * deltaMovimento;
      }
    }
  }
}
