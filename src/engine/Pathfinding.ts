/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TipoMestreTerreno } from '../types/simulation';

export type TipoCustoTerreno =
  | 'ESTRADA'      // Custo: 0.5 (Acelera velocidade)
  | 'CAMPO_ABERTO' // Custo: 1.0 (Padrão)
  | 'FLORESTA'     // Custo: 2.5 (Desacelera)
  | 'MONTANHA'     // Custo: 5.0 (Desacelera severamente / Barreira)
  | 'AGUA'         // Custo: 8.0 (Bloqueio terrestre / Canal naval)
  | 'BLOQUEADO';   // Custo: Infinito (Fronteira intransitável)

export interface NodoPath {
  x: number;
  y: number;
  g: number; // custo do nodo inicial até este nodo
  h: number; // heurística até o destino (distância euclidiana ou Manhattan)
  f: number; // g + h
  pai: NodoPath | null;
}

/**
 * Motor de Inteligência de Caminhos A* (A-Star Pathfinding)
 * Integrado geograficamente na Bacia do Rio da Prata.
 */
export class Pathfinding {
  // Configurações do Grid de Pathfinding
  private readonly RESOLUCAO_GRID = 100; // Grid de 100x100 de alta resolução sobre a região do conflito
  
  // Limites geográficos do mapa da campanha (Sul-Americana: Sul do Brasil, Paraguai, etc)
  private readonly MIN_LAT = -35.0;
  private readonly MAX_LAT = -10.0;
  private readonly MIN_LNG = -65.0;
  private readonly MAX_LNG = -45.0;

  // Mapa bidimensional de custos de terreno
  private gridCustos: TipoCustoTerreno[][];

  constructor() {
    this.gridCustos = [];
    this.inicializarGridProcedural();
  }

  /**
   * Inicializa o grid de terreno com base em padrões geográficos reais aproximados (Rios, Chaco, Pantanal, Estradas)
   */
  private inicializarGridProcedural(): void {
    for (let x = 0; x < this.RESOLUCAO_GRID; x++) {
      this.gridCustos[x] = [];
      for (let y = 0; y < this.RESOLUCAO_GRID; y++) {
        // Mapear frações de 0.0 a 1.0 para simular biomas locais
        const fx = x / this.RESOLUCAO_GRID;
        const fy = y / this.RESOLUCAO_GRID;

        let terreno: TipoCustoTerreno = 'CAMPO_ABERTO';

        // 1. Simular o Rio Paraná e Bacia do Prata (Caminho sinuoso de água)
        // Uma curva sinusoidal correndo verticalmente do norte para o sul
        const curvaRio = 0.5 + 0.15 * Math.sin(fy * Math.PI * 2.5) + 0.1 * Math.cos(fy * Math.PI * 4);
        if (Math.abs(fx - curvaRio) < 0.03) {
          terreno = 'AGUA';
        }
        
        // 2. Simular a Cordilheira no extremo oeste (Montanhas na Bolívia/Argentina)
        else if (fx < 0.15) {
          terreno = 'MONTANHA';
        }

        // 3. Simular Florestas Tropicais (Norte/Leste - Mato Grosso e Paraná)
        else if (fy < 0.35 && fx > 0.6) {
          terreno = 'FLORESTA';
        }

        // 4. Inserir Estradas Estratégicas (Rodovias federais simuladas conectando capitais)
        // Conexão Brasília (Top Right) -> Campo Grande -> Assunção (Center Left)
        const naEstradaBrasiliaAssuncao = Math.abs((fx + fy) - 1.1) < 0.015;
        const naEstradaFozAssuncao = Math.abs(fy - 0.65) < 0.012 && fx > 0.35 && fx < 0.75;

        if (naEstradaBrasiliaAssuncao || naEstradaFozAssuncao) {
          if (terreno !== 'AGUA') { // pontes sobre o rio mantêm tráfego rápido!
            terreno = 'ESTRADA';
          }
        }

        this.gridCustos[x][y] = terreno;
      }
    }
  }

  /**
   * Converte uma coordenada geográfica real [lat, lng] para coordenadas inteiras do grid interno [x, y]
   */
  public converterGeoParaGrid(lat: number, lng: number): [number, number] {
    const latPct = (lat - this.MIN_LAT) / (this.MAX_LAT - this.MIN_LAT);
    const lngPct = (lng - this.MIN_LNG) / (this.MAX_LNG - this.MIN_LNG);

    const x = Math.max(0, Math.min(this.RESOLUCAO_GRID - 1, Math.floor(lngPct * this.RESOLUCAO_GRID)));
    const y = Math.max(0, Math.min(this.RESOLUCAO_GRID - 1, Math.floor(latPct * this.RESOLUCAO_GRID)));

    return [x, y];
  }

  /**
   * Converte coordenadas do grid [x, y] de volta para geográfica real [lat, lng]
   */
  public converterGridParaGeo(x: number, y: number): [number, number] {
    const lngPct = (x + 0.5) / this.RESOLUCAO_GRID;
    const latPct = (y + 0.5) / this.RESOLUCAO_GRID;

    const lat = this.MIN_LAT + latPct * (this.MAX_LAT - this.MIN_LAT);
    const lng = this.MIN_LNG + lngPct * (this.MAX_LNG - this.MIN_LNG);

    return [lat, lng];
  }

  /**
   * Retorna o multiplicador de custo de movimento de uma célula para uma unidade específica
   */
  public obterCustoMovimento(x: number, y: number, tipoMestre: TipoMestreTerreno): number {
    const terreno = this.gridCustos[x][y];

    // Unidades Aéreas ignoram totalmente o terreno terrestre/naval
    if (tipoMestre === 'AR') {
      return 1.0; 
    }

    // Unidades Navais só podem se mover na água (Rios/Oceanos)
    if (tipoMestre === 'AGUA') {
      return terreno === 'AGUA' ? 1.0 : Infinity;
    }

    // Unidades Terrestres
    switch (terreno) {
      case 'ESTRADA':
        return 0.5; // Rodovias de alta velocidade (dobra velocidade)
      case 'CAMPO_ABERTO':
        return 1.0; // Velocidade nominal
      case 'FLORESTA':
        return 2.2; // Marcha lenta por selvas densas
      case 'MONTANHA':
        return 4.5; // Escalar relevo de montanhas impõe desgaste imenso
      case 'AGUA':
        return Infinity; // Rios sem pontes bloqueiam infantaria/blindados
      case 'BLOQUEADO':
        return Infinity; // Fronteiras seladas diplomática/militarmente
      default:
        return 1.0;
    }
  }

  /**
   * Executa o algoritmo A* para calcular a rota mais barata entre duas coordenadas geográficas
   */
  public calcularRota(
    latOrigem: number,
    lngOrigem: number,
    latDestino: number,
    lngDestino: number,
    tipoMestre: TipoMestreTerreno
  ): [number, number][] {
    const [startX, startY] = this.converterGeoParaGrid(latOrigem, lngOrigem);
    const [endX, endY] = this.converterGeoParaGrid(latDestino, lngDestino);

    // Se origem e destino mapearem para a mesma célula, traça vetor direto
    if (startX === endX && startY === endY) {
      return [[latDestino, lngDestino]];
    }

    const openList: NodoPath[] = [];
    const closedList = new Set<string>();

    const nodoInicial: NodoPath = {
      x: startX,
      y: startY,
      g: 0,
      h: this.calcularHeuristica(startX, startY, endX, endY),
      f: 0,
      pai: null
    };
    nodoInicial.f = nodoInicial.g + nodoInicial.h;
    openList.push(nodoInicial);

    let nodoDestinoFinal: NodoPath | null = null;
    let iteracoes = 0;
    const MAX_ITERACOES = 2500; // Impede travamento do navegador em buscas impossíveis

    while (openList.length > 0 && iteracoes < MAX_ITERACOES) {
      iteracoes++;
      
      // Ordena e pega o nodo com menor F
      openList.sort((a, b) => a.f - b.f);
      const atual = openList.shift()!;
      
      // Se alcançou a célula de destino
      if (atual.x === endX && atual.y === endY) {
        nodoDestinoFinal = atual;
        break;
      }

      closedList.add(`${atual.x},${atual.y}`);

      // Avalia vizinhos de 8 direções (ortogonais e diagonais)
      const direcoes = [
        [0, 1], [0, -1], [1, 0], [-1, 0],   // Ortogonais
        [1, 1], [1, -1], [-1, 1], [-1, -1]   // Diagonais
      ];

      for (const [dx, dy] of direcoes) {
        const nx = atual.x + dx;
        const ny = atual.y + dy;

        // Limites do Grid
        if (nx < 0 || nx >= this.RESOLUCAO_GRID || ny < 0 || ny >= this.RESOLUCAO_GRID) {
          continue;
        }

        const chaveVizinho = `${nx},${ny}`;
        if (closedList.has(chaveVizinho)) {
          continue;
        }

        // Custo do Terreno
        const custoTerreno = this.obterCustoMovimento(nx, ny, tipoMestre);
        if (custoTerreno === Infinity) {
          continue; // Bloqueado para esta unidade
        }

        // Se for diagonal, o custo de distância base aumenta ligeiramente (raiz de 2 ~ 1.41)
        const distBase = (dx !== 0 && dy !== 0) ? 1.414 : 1.0;
        const gAcumulado = atual.g + distBase * custoTerreno;

        // Procura vizinho na open list
        let nodoVizinho = openList.find(n => n.x === nx && n.y === ny);

        if (!nodoVizinho) {
          nodoVizinho = {
            x: nx,
            y: ny,
            g: gAcumulado,
            h: this.calcularHeuristica(nx, ny, endX, endY),
            f: 0,
            pai: atual
          };
          nodoVizinho.f = nodoVizinho.g + nodoVizinho.h;
          openList.push(nodoVizinho);
        } else if (gAcumulado < nodoVizinho.g) {
          nodoVizinho.g = gAcumulado;
          nodoVizinho.f = gAcumulado + nodoVizinho.h;
          nodoVizinho.pai = atual;
        }
      }
    }

    // Se achou um caminho, reconstrói a lista de waypoints reais
    if (nodoDestinoFinal) {
      const rotaGeo: [number, number][] = [];
      let cursor: NodoPath | null = nodoDestinoFinal;
      
      while (cursor !== null) {
        rotaGeo.unshift(this.converterGridParaGeo(cursor.x, cursor.y));
        cursor = cursor.pai;
      }
      
      // Substitui o último waypoint exato do grid pelo destino pontual exato selecionado pelo usuário
      rotaGeo[rotaGeo.length - 1] = [latDestino, lngDestino];
      return rotaGeo;
    }

    // Fallback: se nenhum caminho for viável, traça rota linear direta
    return [[latDestino, lngDestino]];
  }

  /**
   * Heurística de distância euclidiana para busca diagonal ideal
   */
  private calcularHeuristica(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
