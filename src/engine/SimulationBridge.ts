/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EstadoJogoSimulacao, EstadoEconomico, EstadoPolitico } from '../types/simulation';
import { GameState } from '../types/game';

function criarEstadoEconomico(pibBilhoes: number, reservas: number): EstadoEconomico {
  return {
    pib: pibBilhoes,
    pibCrescimento: 0.025,
    inflacao: 0.05,
    desemprego: 0.09,
    dividaPublica: 88,
    receitaEstado: pibBilhoes * 0.33 / 12,
    taxaImposto: 0.33,
    taxaJurosSelic: 0.1175,
    reservasInternacionais: reservas,
    producao: {
      industria: Math.floor(pibBilhoes * 0.38),
      agronegocio: Math.floor(pibBilhoes * 1.14),
      energia: Math.floor(pibBilhoes * 0.29),
      petroleo: Math.floor(pibBilhoes * 1.52),
      combustivelRefinado: Math.floor(pibBilhoes * 2380),
    },
    comercioExterior: {
      importacao: pibBilhoes * 0.0013,
      exportacao: pibBilhoes * 0.0015,
      parceirosSancionados: [],
    },
    orcamento: {
      defesa: 0.08,
      saude: 0.16,
      infraestrutura: 0.12,
      educacao: 0.18,
      inteligencia: 0.03,
    },
  };
}

function criarEstadoPolitico(relacaoComBrasil: number, relacaoComParaguai: number): EstadoPolitico {
  return {
    popularidadeGoverno: 50,
    estabilidadePolitica: 60,
    apoioCongresso: 55,
    proximaEleicaoSegundos: 86400 * 365 * 2,
    corrupcaoIndex: 40,
    tensaoGreve: 20,
    probabilidadeProtestos: 15,
    riscoGolpe: 5,
    diplomacia: {
      BRASIL: { relacaoValor: relacaoComBrasil, tratados: [], embargoAtivo: false, sancoesEconomicas: false },
      PARAGUAI: { relacaoValor: relacaoComParaguai, tratados: [], embargoAtivo: false, sancoesEconomicas: false },
      ARGENTINA: { relacaoValor: 20, tratados: ['Mercosul'], embargoAtivo: false, sancoesEconomicas: false },
      BOLIVIA: { relacaoValor: 10, tratados: [], embargoAtivo: false, sancoesEconomicas: false },
      URUGUAI: { relacaoValor: 30, tratados: ['Mercosul'], embargoAtivo: false, sancoesEconomicas: false },
      REBELDES: { relacaoValor: -80, tratados: [], embargoAtivo: false, sancoesEconomicas: false },
    },
    pontosInteligencia: 30,
    espioesAtivos: [],
  };
}

/**
 * Cria o EstadoJogoSimulacao inicial a partir do GameState existente.
 * Serve como ponte entre o sistema turn-based (GameContext) e o motor real-time (GameLoop).
 */
export function criarEstadoSimulacao(gameState: GameState): EstadoJogoSimulacao {
  const fundsBrasil = gameState.factions['BRASIL']?.resources.funds ?? 120;
  const fundsParaguai = gameState.factions['PARAGUAI']?.resources.funds ?? 60;
  const energiaBrasil = gameState.factions['BRASIL']?.resources.energy ?? 100;
  const energiaParaguai = gameState.factions['PARAGUAI']?.resources.energy ?? 40;

  return {
    tempoTotalSegundos: 0,
    tempoPausado: false,
    velocidadeMultiplicador: 1,
    facoes: {
      BRASIL: {
        id: 'BRASIL',
        nome: 'República Federativa do Brasil',
        corHex: '#00875a',
        energiaDisponivel: energiaBrasil,
        poupancaNacional: fundsBrasil * 1_000_000,
        estadoEconomico: criarEstadoEconomico(2100, 350),
        estadoPolitico: criarEstadoPolitico(0, -50),
      },
      PARAGUAI: {
        id: 'PARAGUAI',
        nome: 'República do Paraguai',
        corHex: '#d62626',
        energiaDisponivel: energiaParaguai,
        poupancaNacional: fundsParaguai * 1_000_000,
        estadoEconomico: criarEstadoEconomico(42, 10),
        estadoPolitico: criarEstadoPolitico(-50, 0),
      },
      ARGENTINA: {
        id: 'ARGENTINA',
        nome: 'República Argentina',
        corHex: '#75b2dd',
        energiaDisponivel: 200,
        poupancaNacional: 500_000_000,
        estadoEconomico: criarEstadoEconomico(640, 30),
        estadoPolitico: criarEstadoPolitico(20, -10),
      },
      BOLIVIA: {
        id: 'BOLIVIA',
        nome: 'Estado Plurinacional da Bolívia',
        corHex: '#f4a830',
        energiaDisponivel: 80,
        poupancaNacional: 100_000_000,
        estadoEconomico: criarEstadoEconomico(45, 5),
        estadoPolitico: criarEstadoPolitico(10, 5),
      },
      URUGUAI: {
        id: 'URUGUAI',
        nome: 'República Oriental do Uruguai',
        corHex: '#4db8ff',
        energiaDisponivel: 60,
        poupancaNacional: 80_000_000,
        estadoEconomico: criarEstadoEconomico(78, 18),
        estadoPolitico: criarEstadoPolitico(30, 0),
      },
      REBELDES: {
        id: 'REBELDES',
        nome: 'Frente de Libertação do Cone Sul',
        corHex: '#9c27b0',
        energiaDisponivel: 20,
        poupancaNacional: 10_000_000,
        estadoEconomico: criarEstadoEconomico(5, 1),
        estadoPolitico: criarEstadoPolitico(-80, -40),
      },
    },
    unidades: [],
    cidades: [],
    depositos: [],
    comboios: [],
    satelites: [],
    climaGlobal: {},
    visibilidadeJogador: {},
    alertas: [],
    eventosFila: [],
  };
}

/**
 * Mapeia um RegionID do GameState para a macrorregião climática do motor de simulação.
 * Usado para aplicar efeitos climáticos ao combate regional.
 */
export function regiaoParaZonaClimatica(regionId: string): string {
  switch (regionId) {
    case 'ITAIPU':
    case 'FOZ_DO_IGUACU':
    case 'CIUDAD_DEL_ESTE':
      return 'SUL_BRASIL';
    case 'CHACO':
    case 'ASSUNCAO':
      return 'CHACO_PARAGUAIO';
    case 'BRASILIA':
    case 'MATO_GROSSO_SUL':
    default:
      return 'BRASILIA_CENTRAL';
  }
}
