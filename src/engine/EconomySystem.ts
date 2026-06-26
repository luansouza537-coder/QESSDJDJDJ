/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubsistemaSimulacao, GameLoop } from './GameLoop';
import { EstadoJogoSimulacao, EstadoEconomico, FacaoID } from '../types/simulation';

/**
 * Subsistema Econômico Macroeconômico Dinâmico
 * Simula PIB, Inflação, Desemprego, Dívida, Taxa de Juros Selic e Balança Comercial.
 */
export class EconomySystem implements SubsistemaSimulacao {
  // Intervalo de tempo de acumulação: executa atualização econômica pesada a cada 24 horas simuladas
  private acumuladorTempoSegundos: number = 0;
  private readonly DIA_SIMULADO_EM_SEGUNDOS = 86400; // 24 horas

  public inicializar(estado: EstadoJogoSimulacao): void {
    // Inicialização econômica inicial se necessário
  }

  public atualizar(estado: EstadoJogoSimulacao, deltaTimeReal: number, deltaTimeSimulacao: number): void {
    this.acumuladorTempoSegundos += deltaTimeSimulacao;

    // Executa a simulação econômica complexa diariamente na simulação
    if (this.acumuladorTempoSegundos >= this.DIA_SIMULADO_EM_SEGUNDOS) {
      this.acumuladorTempoSegundos -= this.DIA_SIMULADO_EM_SEGUNDOS;
      
      const facoes = Object.values(estado.facoes);
      for (const facao of facoes) {
        this.processarDiaEconomico(facao.estadoEconomico, facao.id, estado);
      }
    }
  }

  /**
   * Processa equações macroeconômicas diferenciais para um dia de simulação
   */
  private processarDiaEconomico(econ: EstadoEconomico, facaoId: FacaoID, estado: EstadoJogoSimulacao): void {
    // 1. INFLUÊNCIA DA TAXA DE JUROS SELIC
    // Juros altos -> reduzem consumo -> controlam inflação -> aumentam desemprego -> reduzem crescimento do PIB
    // Juros baixos -> estimulam crédito -> aumentam PIB -> aumentam inflação -> reduzem desemprego
    const desvioJurosIdeal = econ.taxaJurosSelic - 0.085; // 8.5% juros de equilíbrio neutro
    
    // 2. CRESCIMENTO DO PIB (Fração diária baseada na taxa anual)
    // Crescimento do PIB anualizado é influenciado por: impostos, juros, petróleo e energia
    const fatorEnergia = econ.producao.energia > 100 ? 0.015 : -0.01;
    const fatorImpostos = econ.taxaImposto > 0.40 ? -0.02 : (0.25 - econ.taxaImposto) * 0.04;
    const fatorCombustivel = econ.producao.combustivelRefinado < 100000 ? -0.02 : 0.01;
    const fatorExportacao = (econ.comercioExterior.exportacao - econ.comercioExterior.importacao) > 0 ? 0.01 : -0.015;

    // Equação de variação do PIB anualizado
    const deltaPIBAnual = 
      0.025 + // Crescimento orgânico base de 2.5% ao ano
      fatorEnergia + 
      fatorImpostos + 
      fatorCombustivel + 
      fatorExportacao - 
      desvioJurosIdeal * 0.2; // taxa de juros alta freia o crescimento

    econ.pibCrescimento = Number(deltaPIBAnual.toFixed(4));
    
    // Incrementa PIB real diário (deltaPIBAnual / 365)
    econ.pib += econ.pib * (deltaPIBAnual / 365);

    // 3. EQUAÇÃO DA INFLAÇÃO
    // Inflação cresce com crescimento acelerado do PIB (superaquecimento) e juros baixos
    // Inflação diminui com juros altos e desemprego elevado (curva de Phillips)
    const curvaPhillips = (0.08 - econ.desemprego) * 0.15; // menos desemprego aumenta inflação (demanda salarial)
    const impactoSelic = -desvioJurosIdeal * 0.35; // juros altos puxam inflação para baixo
    
    const inflacaoAnual = 
      0.035 + // inflação inercial base de 3.5%
      econ.pibCrescimento * 0.4 + 
      curvaPhillips + 
      impactoSelic;

    econ.inflacao = Math.max(0.01, Number(inflacaoAnual.toFixed(4))); // mínimo de 1% de inflação saudável

    // 4. EQUAÇÃO DO DESEMPREGO
    // Desemprego diminui com crescimento do PIB e investimentos em infraestrutura
    // Desemprego aumenta com impostos elevados e Selic alta
    const desempregoAlvo = 
      0.075 + // taxa estrutural de desemprego de 7.5%
      (0.35 - econ.taxaImposto) * -0.08 + // impostos altos geram demissões
      desvioJurosIdeal * 0.15 - // juros altos contraem mercado de trabalho
      econ.pibCrescimento * 0.6; // crescimento forte do PIB contrata trabalhadores

    // Interpolação suave para evitar variações abruptas de um dia para o outro
    econ.desemprego += (desempregoAlvo - econ.desemprego) * 0.02;
    econ.desemprego = Math.max(0.02, Math.min(0.25, econ.desemprego)); // limites de 2% a 25%

    // 5. RECEITAS FISCAIS E ORÇAMENTO DO ESTADO
    // Receita mensal proporcional ao PIB e à alíquota de impostos (Arrecadação diária = PIB * Imposto / 365)
    // Coeficiente de conversão simplificado de PIB de mercado em receita tributária real
    const arrecadacaoDiaria = (econ.pib * econ.taxaImposto) / 365;
    econ.receitaEstado = arrecadacaoDiaria * 30; // exibe receita mensalizada na HUD

    // Gastos Setoriais
    const gastoDefesa = arrecadacaoDiaria * econ.orcamento.defesa;
    const GastoSaude = arrecadacaoDiaria * econ.orcamento.saude;
    const gastoInfra = arrecadacaoDiaria * econ.orcamento.infraestrutura;
    const gastoInteligencia = arrecadacaoDiaria * econ.orcamento.inteligencia;
    
    // Custo de manutenção da Dívida Pública (Baseado na Selic atual)
    const custoServicoDividaDiario = (econ.pib * (econ.dividaPublica / 100) * econ.taxaJurosSelic) / 365;

    // Superavit/Deficit Diário
    const gastosTotaisDiarios = 
      gastoDefesa + GastoSaude + gastoInfra + gastoInteligencia + custoServicoDividaDiario;
    
    const saldoDiario = arrecadacaoDiaria - gastosTotaisDiarios;

    // Ajusta a Dívida Pública
    // Déficit aumenta a dívida, superávit amortiza a dívida
    const variacaoDividaPercentual = -(saldoDiario / econ.pib) * 100;
    econ.dividaPublica = Math.max(5, econ.dividaPublica + variacaoDividaPercentual);

    // 6. PRODUÇÃO DE RECURSOS E MATÉRIAS-PRIMAS MILITARES
    // Geração física diária baseada nos orçamentos de infraestrutura e saúde
    econ.producao.industria = Math.max(10, Math.floor(econ.pib * 0.3 * (1 - econ.desemprego) + gastoInfra * 5));
    econ.producao.agronegocio = Math.max(50, Math.floor(econ.pib * 0.15 * (1.1 - econ.desemprego)));
    
    // Extração de recursos fósseis e refino
    econ.producao.petroleo = Math.max(0, Math.floor(econ.producao.industria * 1.8 + gastoInfra * 2.5));
    
    // Refinar petróleo em combustível estocável
    const litrosRefinadosDia = Math.floor(econ.producao.petroleo * 159); // 1 barril = 159 litros
    econ.producao.combustivelRefinado += litrosRefinadosDia;

    // Geração de Energia
    econ.producao.energy = Math.floor(econ.producao.industria * 0.5 + gastoInfra * 10);

    // 7. BALANÇA COMERCIAL E RESERVAS INTERNACIONAIS
    // Exportações dependem da produção de Agronegócio e Indústria excedente
    // Importações dependem da demanda industrial e combustível em falta
    const consumoCombustivelNacional = Math.floor(econ.pib * 4000);
    let importacaoCombustivelCusto = 0;

    if (econ.producao.combustivelRefinado < consumoCombustivelNacional) {
      // Importa o déficit de combustível do mercado global
      const deficitCombustivel = consumoCombustivelNacional - econ.producao.combustivelRefinado;
      importacaoCombustivelCusto = (deficitCombustivel / 1000) * 0.085; // $0.085 por litro importado
      econ.producao.combustivelRefinado = consumoCombustivelNacional; // supre necessidade
    } else {
      // Exporta o superavit de combustível
      const superavitCombustivel = econ.producao.combustivelRefinado - consumoCombustivelNacional;
      const exportacaoCombustivelReceita = (superavitCombustivel / 1000) * 0.075;
      econ.comercioExterior.exportacao = 1.2 + exportacaoCombustivelReceita;
    }

    econ.comercioExterior.importacao = 0.8 + importacaoCombustivelCusto;
    econ.comercioExterior.exportacao += econ.producao.agronegocio * 0.002 + econ.producao.industria * 0.005;

    // Variação das Reservas Internacionais com base na Balança Comercial diária
    const saldoComercialDiario = (econ.comercioExterior.exportacao - econ.comercioExterior.importacao) / 30;
    econ.reservasInternacionais = Math.max(0.5, econ.reservasInternacionais + saldoComercialDiario);

    // Ajusta saldo disponível da facção no jogo geral (PoupancaNacional para compras militares)
    const facao = estado.facoes[facaoId];
    if (facao) {
      facao.poupancaNacional = Math.max(0, facao.poupancaNacional + saldoDiario * 1000000000); // converte em USD
    }
  }
}
