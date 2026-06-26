/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Módulo de Tipagem e Modelagem de Dados - Simulador Geopolítico e Militar Real-Time
 * Focado no conflito de Fronteira Brasil x Paraguai (Teatro de Conflito do Prata)
 */

export type FacaoID = 'BRASIL' | 'PARAGUAI' | 'ARGENTINA' | 'BOLIVIA' | 'URUGUAI' | 'REBELDES';

export type TipoUnidade =
  | 'INFANTARIA'
  | 'BLINDADOS'
  | 'ARTILHARIA'
  | 'FORCAS_ESPECIAIS'
  | 'CAVALARIA_MECANIZADA'
  | 'HELICOPTEROS'
  | 'CACAS'
  | 'BOMBARDEIROS'
  | 'DRONES'
  | 'NAVIOS'
  | 'SUBMARINOS'
  | 'PORTA_AVIOES';

export type TipoMestreTerreno = 'TERRA' | 'AGUA' | 'AR';

export interface AtributosCombate {
  hp: number;
  maxHp: number;
  combustivel: number;
  maxCombustivel: number;
  consumoCombustivel: number; // por segundo de simulação
  municao: number;
  maxMunicao: number;
  consumoMunicao: number; // por segundo em combate
  experiencia: number; // 0 - 100 (veterano)
  moral: number; // 0 - 100
  alcanceDisparo: number; // em km no mapa
  velocidadeMax: number; // km/h
  peso: number; // toneladas (logística)
  visao: number; // alcance visual em km
  radar: number; // alcance radar em km
  deteccao: number; // habilidade de detectar inimigos camuflados (0-100)
  camuflagem: number; // habilidade de se esconder (0-100)
  blindagem: number; // espessura equivalente em mm
  penetracao: number; // penetração de blindagem equivalente em mm
  poderAtaque: number; // dano base por segundo
}

/**
 * Entidade de Unidade Militar (Movimentação Livre Real-Time)
 */
export interface UnidadeMilitar {
  id: string;
  nome: string;
  facao: FacaoID;
  tipo: TipoUnidade;
  tipoMestre: TipoMestreTerreno;
  
  // Coordenadas contínuas reais do mapa (Leaflet Lng/Lat)
  latitude: number;
  longitude: number;
  
  // Vetores de movimentação contínua
  velocidade: number; // velocidade atual (km/h)
  direcao: number; // ângulo de rotação em graus (0-359)
  aceleracao: number; // variação de velocidade por seg (km/h^2)
  
  // Rota de movimentação calculada pelo Pathfinding A*
  latitudeDestino: number | null;
  longitudeDestino: number | null;
  rotasWaypoints: [number, number][]; // lista de coordenadas [lat, lng]
  waypointAtualIndex: number;
  
  // Atributos de Estado de Combate e Sobrevivência
  status: AtributosCombate;
  
  // Logística e Fadiga
  fadiga: number; // 0 (descansado) - 100 (exaustão completa)
  cadeiaLogisticaConectada: boolean;
  ultimoSuprimentoSegundo: number;
  emCombate: boolean;
  alvoId: string | null; // ID da unidade inimiga que está atacando
  
  // Metadata Visual
  selecionada: boolean;
  icone: string;
}

/**
 * Modelo de Dados Econômico Completo do País
 */
export interface EstadoEconomico {
  pib: number; // PIB em Bilhões de USD
  pibCrescimento: number; // % ao ano
  inflacao: number; // % ao ano
  desemprego: number; // % da população ativa
  dividaPublica: number; // % em relação ao PIB
  receitaEstado: number; // receita fiscal em Bilhões USD/mês
  taxaImposto: number; // Alíquota tributária média (0-100%)
  taxaJurosSelic: number; // Taxa de juros do Banco Central (0-100%)
  reservasInternacionais: number; // Reservas em Bilhões de USD
  
  // Produção e Estoques Estratégicos
  producao: {
    industria: number; // índice de produção industrial
    agronegocio: number; // produção agrícola (toneladas)
    energia: number; // geração de energia ativa (GW/h)
    petroleo: number; // extração de barris/dia
    combustivelRefinado: number; // litros refinados em estoque
  };
  
  // Fluxo de Balança Comercial
  comercioExterior: {
    importacao: number; // Bilhões USD/mês
    exportacao: number; // Bilhões USD/mês
    parceirosSancionados: FacaoID[]; // países sob embargo comercial
  };
  
  // Orçamento Setorial (em % da receita)
  orcamento: {
    defesa: number;
    saude: number;
    infraestrutura: number;
    educacao: number;
    inteligencia: number;
  };
}

/**
 * Modelo de Política e Coesão Social
 */
export interface EstadoPolitico {
  popularidadeGoverno: number; // 0 - 100 (apreço popular)
  estabilidadePolitica: number; // 0 - 100 (risco de impeachment/revolução)
  apoioCongresso: number; // % de parlamentares aliados (0 - 100)
  proximaEleicaoSegundos: number; // contagem regressiva em segundos
  corrupcaoIndex: number; // 0 (limpo) - 100 (sistêmica)
  
  // Tensões Sociais e Segurança Interna
  tensaoGreve: number; // probabilidade de greves gerais (0-100)
  probabilidadeProtestos: number; // probabilidade de manifestações (0-100)
  riscoGolpe: number; // probabilidade de intervenção militar/golpe de estado
  
  // Relações Internacionais e Diplomacia
  diplomacia: Record<FacaoID, {
    relacaoValor: number; // -100 (guerra) a +100 (aliança)
    tratados: string[]; // ["Mercosul", "Tratado Comercial", "Pacto de Não-Agressão"]
    embargoAtivo: boolean;
    sancoesEconomicas: boolean;
  }>;
  
  // Espionagem e Inteligência Clandestina
  pontosInteligencia: number;
  espioesAtivos: {
    id: string;
    local: FacaoID;
    missao: 'RECONHECIMENTO' | 'SABOTAGEM_INFRA' | 'PROPAGANDA' | 'GOLPE_DE_ESTADO';
    progresso: number; // 0 - 100%
  }[];
}

/**
 * Clima Dinâmico e Influência Físico-Militar
 */
export type CondicaoClimatica = 'LIMPO' | 'CHUVA' | 'TEMPESTADE' | 'NEBLINA' | 'NEVE';

export interface ClimaRegional {
  condicao: CondicaoClimatica;
  temperatura: number; // em °C
  velocidadeVento: number; // km/h
  direcaoVento: number; // graus
  visibilidadeCoeficiente: number; // 0.0 (nulo) a 1.0 (perfeito)
  bloqueioRadarCoeficiente: number; // 0.0 (sem bloqueio) a 1.0 (bloqueio total)
  penalidadeVooCacas: boolean; // se caças estão proibidos de decolar
}

/**
 * Infraestrutura de Redes Logísticas (Comboios e Depósitos)
 */
export interface DepositoSuprimentos {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  combustivelEstoque: number; // litros
  municaoEstoque: number; // caixas de munição
  alimentosEstoque: number; // toneladas
  pecasReparoEstoque: number; // unidades
  capacidadeMax: number;
}

export interface ComboioLogistico {
  id: string;
  nome: string;
  facao: FacaoID;
  tipo: 'CAMINHAO' | 'TREM' | 'CARGUEIRO_AEREO' | 'CARGUEIRO_NAVAL';
  latitude: number;
  longitude: number;
  latitudeDestino: number;
  longitudeDestino: number;
  velocidade: number;
  carga: {
    combustivel: number;
    municao: number;
    alimentos: number;
  };
  depositoOrigemId: string;
  unidadeAlvoId: string | null; // unidade militar que receberá os suprimentos
}

/**
 * Modelo Detalhado de Cidade / Hub Estratégico
 */
export interface CidadeHub {
  id: string;
  nome: string;
  facaoControladora: FacaoID;
  latitude: number;
  longitude: number;
  populacao: number; // número de habitantes
  pibLocal: number; // PIB local (Bilhão USD)
  
  // Utilidades e Infraestrutura Industrial
  producaoEnergiaAtiva: number; // GW/h
  reservasAguaAtiva: number; // % (0-100)
  nivelAeroporto: number; // 0 (sem aeroporto) a 5 (base aérea continental)
  nivelPorto: number; // 0 (sem porto) a 5 (porto estratégico de águas profundas)
  nivelQuartel: number; // 0 a 5
  nivelHospital: number; // 0 a 5
  
  // Vias de Transporte Conectadas
  viasEstradaIds: string[];
  viasFerroviaIds: string[];
}

/**
 * Sistema de Satélite e Vigilância de Alta Tecnologia
 */
export interface SateliteVigilancia {
  id: string;
  facao: FacaoID;
  tipo: 'IMAGEM_OPTICA' | 'TERMICA' | 'RADAR_SAR';
  orbitaLatitude: number;
  orbitaLongitude: number;
  coberturaRaioKm: number;
  anguloVarredura: number;
}

/**
 * Estrutura Geral do Estado do Jogo (Simulação Real-Time)
 */
export interface EstadoJogoSimulacao {
  tempoTotalSegundos: number; // tempo de simulação decorrido
  tempoPausado: boolean;
  velocidadeMultiplicador: number; // 1x, 2x, 5x, 10x
  
  facoes: Record<FacaoID, {
    id: FacaoID;
    nome: string;
    corHex: string;
    energiaDisponivel: number;
    poupancaNacional: number;
    estadoEconomico: EstadoEconomico;
    estadoPolitico: EstadoPolitico;
  }>;
  
  unidades: UnidadeMilitar[];
  cidades: CidadeHub[];
  depositos: DepositoSuprimentos[];
  comboios: ComboioLogistico[];
  satelites: SateliteVigilancia[];
  climaGlobal: Record<string, ClimaRegional>; // por região ou global
  
  // Sistema de Fog of War (Neblina de Guerra)
  // Mapeia regiões ou células invisíveis/visíveis para o jogador
  visibilidadeJogador: Record<string, boolean>; // ex: "lat_lng" -> visível
  
  // Histórico de Alertas e Notificações de Combate
  alertas: {
    id: string;
    timestampSegundos: number;
    titulo: string;
    conteudo: string;
    tipo: 'MILITAR' | 'DIPLOMATICO' | 'ECONOMICO' | 'LOGISTICO' | 'ALERTA_MAXIMO';
    lida: boolean;
  }[];
  
  // Linha do tempo de eventos geopolíticos históricos e procedurais
  eventosFila: {
    id: string;
    titulo: string;
    descricao: string;
    segundosParaTrigger: number;
    opcoes: {
      texto: string;
      consequencias: string;
      efeitos: () => void;
    }[];
  }[];
}
