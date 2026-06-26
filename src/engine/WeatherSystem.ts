/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubsistemaSimulacao } from './GameLoop';
import { EstadoJogoSimulacao, ClimaRegional, CondicaoClimatica } from '../types/simulation';

/**
 * Subsistema Climatológico Dinâmico
 * Governa o tempo do dia, estações do ano, vento, chuva, neblina e tempestades.
 * Calcula os coeficientes de interferência física em radar, visibilidade visual,
 * velocidade de tropas terrestres e proibições de decolagem aérea.
 */
export class WeatherSystem implements SubsistemaSimulacao {
  private tempoAcumuladoSegundos: number = 0;
  private readonly HORA_SIMULADA_EM_SEGUNDOS = 3600; // 1 hora de simulação

  // Cadeia de transição estocástica simples (Markov-like) para clima
  private readonly TRANSIRE_CLIMA: Record<CondicaoClimatica, { proxima: CondicaoClimatica; chance: number }[]> = {
    'LIMPO': [
      { proxima: 'NEBLINA', chance: 0.15 },
      { proxima: 'CHUVA', chance: 0.10 },
      { proxima: 'LIMPO', chance: 0.75 }
    ],
    'NEBLINA': [
      { proxima: 'LIMPO', chance: 0.60 },
      { proxima: 'CHUVA', chance: 0.30 },
      { proxima: 'NEBLINA', chance: 0.10 }
    ],
    'CHUVA': [
      { proxima: 'LIMPO', chance: 0.40 },
      { proxima: 'TEMPESTADE', chance: 0.25 },
      { proxima: 'NEBLINA', chance: 0.15 },
      { proxima: 'CHUVA', chance: 0.20 }
    ],
    'TEMPESTADE': [
      { proxima: 'CHUVA', chance: 0.60 },
      { proxima: 'LIMPO', chance: 0.30 },
      { proxima: 'TEMPESTADE', chance: 0.10 }
    ],
    'NEVE': [ // Rara no Cone Sul, mas incluída para cenários andinos futuros
      { proxima: 'LIMPO', chance: 0.80 },
      { proxima: 'NEVE', chance: 0.20 }
    ]
  };

  public inicializar(estado: EstadoJogoSimulacao): void {
    // Configura o clima global inicial
    estado.climaGlobal = {
      'SUL_BRASIL': this.criarClimaPadrao(-25.5, -54.5, 180), // Foz / Itaipu
      'CHACO_PARAGUAIO': this.criarClimaPadrao(-21.5, -60.0, 180), // Chaco árido
      'BRASILIA_CENTRAL': this.criarClimaPadrao(-15.8, -47.9, 180) // Planalto central
    };
  }

  public atualizar(estado: EstadoJogoSimulacao, deltaTimeReal: number, deltaTimeSimulacao: number): void {
    this.tempoAcumuladoSegundos += deltaTimeSimulacao;

    // Atualiza o clima das macroregiões a cada 3 horas simuladas
    if (this.tempoAcumuladoSegundos >= this.HORA_SIMULADA_EM_SEGUNDOS * 3) {
      this.tempoAcumuladoSegundos -= this.HORA_SIMULADA_EM_SEGUNDOS * 3;

      const diaDoAno = Math.floor((estado.tempoTotalSegundos / (86400)) % 365) + 1;

      // Atualiza o clima em cada macroregião
      for (const regiaoId of Object.keys(estado.climaGlobal)) {
        this.atualizarClimaRegiao(estado.climaGlobal[regiaoId], regiaoId, diaDoAno);
      }
    }
  }

  /**
   * Constrói uma instância climatológica padrão inicial
   */
  private criarClimaPadrao(lat: number, lng: number, diaDoAno: number): ClimaRegional {
    return {
      condicao: 'LIMPO',
      temperatura: this.calcularTemperaturaBase(lat, diaDoAno, 12),
      velocidadeVento: 15,
      direcaoVento: 45,
      visibilidadeCoeficiente: 1.0,
      bloqueioRadarCoeficiente: 0.0,
      penalidadeVooCacas: false
    };
  }

  /**
   * Atualiza as variáveis físicas da região baseado nas estações e transições
   */
  private atualizarClimaRegiao(clima: ClimaRegional, regiaoId: string, diaDoAno: number): void {
    // 1. Transição de Condição Climatológica (Estocástica)
    const opcoes = this.TRANSIRE_CLIMA[clima.condicao];
    const roll = Math.random();
    let soma = 0;
    let proximoClima: CondicaoClimatica = clima.condicao;

    for (const op of opcoes) {
      soma += op.chance;
      if (roll <= soma) {
        proximoClima = op.proxima;
        break;
      }
    }

    // O Chaco Paraguaio é extremamente seco, reduz chance de chuvas pela metade
    if (regiaoId === 'CHACO_PARAGUAIO' && (proximoClima === 'CHUVA' || proximoClima === 'TEMPESTADE')) {
      if (Math.random() > 0.4) {
        proximoClima = 'LIMPO';
      }
    }

    clima.condicao = proximoClima;

    // 2. Cálculo de Temperatura Sazonal (Cone Sul)
    // Dezembro - Fevereiro: Verão (Muito quente no Chaco, até 43°C)
    // Junho - Agosto: Inverno (Mais ameno a frio no sul do Brasil)
    const lat = regiaoId === 'BRASILIA_CENTRAL' ? -15.8 : regiaoId === 'SUL_BRASIL' ? -25.5 : -21.5;
    const horaDoDia = 12; // Simplificado para hora do pico
    clima.temperatura = this.calcularTemperaturaBase(lat, diaDoAno, horaDoDia);

    // Ajustes devido à chuva ou tempestade
    if (clima.condicao === 'CHUVA') {
      clima.temperatura -= 4; // resfriamento por precipitação
    } else if (clima.condicao === 'TEMPESTADE') {
      clima.temperatura -= 6;
    }

    // 3. Vento Dinâmico
    clima.velocidadeVento = Math.max(5, Math.floor(12 + Math.random() * 15));
    if (clima.condicao === 'TEMPESTADE') {
      clima.velocidadeVento = Math.max(50, Math.floor(60 + Math.random() * 40)); // rajadas de vento severas
    }
    clima.direcaoVento = (clima.direcaoVento + Math.floor(Math.random() * 30 - 15) + 360) % 360;

    // 4. CÁLCULO DE IMPACTOS MILITARES (Coeficientes físicos de atenuação)
    switch (clima.condicao) {
      case 'LIMPO':
        clima.visibilidadeCoeficiente = 1.0; // Visibilidade irrestrita
        clima.bloqueioRadarCoeficiente = 0.0; // Radar opera perfeitamente
        clima.penalidadeVooCacas = false; // Voo livre
        break;
        
      case 'NEBLINA':
        clima.visibilidadeCoeficiente = 0.25; // Visão de unidades reduzida a 25% (Aperta Neblina de Guerra)
        clima.bloqueioRadarCoeficiente = 0.10; // Radar levemente atenuado
        clima.penalidadeVooCacas = false;
        break;
        
      case 'CHUVA':
        clima.visibilidadeCoeficiente = 0.65; // Visão atenuada
        clima.bloqueioRadarCoeficiente = 0.35; // Gotas de água espalham ondas eletromagnéticas
        clima.penalidadeVooCacas = false;
        break;
        
      case 'TEMPESTADE':
        clima.visibilidadeCoeficiente = 0.15; // Visão severamente prejudicada
        clima.bloqueioRadarCoeficiente = 0.80; // Interferência eletromagnética massiva (Saturação estática)
        clima.penalidadeVooCacas = true; // VENTOS DE CORTE E RAIOS PROÍBEM VOO DE CAÇAS/DRONES
        break;

      case 'NEVE':
        clima.visibilidadeCoeficiente = 0.30;
        clima.bloqueioRadarCoeficiente = 0.40;
        clima.penalidadeVooCacas = true;
        break;
    }
  }

  /**
   * Equação matemática para modelar temperatura base sazonal
   */
  private calcularTemperaturaBase(lat: number, diaDoAno: number, horaDoDia: number): number {
    // Equador é quente, latitude alta (Sul) é fria no inverno
    const amplitudeSazonal = Math.abs(lat) * 0.5; // maior variação sazonal longe do equador
    
    // cosseno ajustado para que o inverno ocorra em Junho (dia ~172) no hemisfério sul
    const fatorSazonal = Math.cos(((diaDoAno - 15) * 2 * Math.PI) / 365);
    
    const tempAnualMedia = 30 - Math.abs(lat) * 0.4; // equador ~30°C, Foz do Iguaçu ~20°C média
    
    // Variação horária (pico às 14h, mínima às 5h)
    const fatorHorario = Math.sin(((horaDoDia - 8) * Math.PI) / 12);

    let temperatura = tempAnualMedia + (amplitudeSazonal * fatorSazonal) + (3 * fatorHorario);
    
    // Se latitude for na região do Chaco Paraguaio, aumenta temperatura devido ao efeito estufa do solo arenoso
    if (lat > -23 && lat < -19) {
      temperatura += 5; // Calor opressor constante
    }

    return Number(temperatura.toFixed(1));
  }
}
