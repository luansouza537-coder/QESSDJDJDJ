/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnidadeMilitar } from '../types/simulation';

/**
 * Classe de Indexação Espacial baseada em Spatial Hashing.
 * Altamente performática, projetada para indexar, atualizar e buscar mais de 20.000 unidades militares em tempo real.
 */
export class SpatialHash {
  private tamanhoCelula: number;
  private grade: Map<string, UnidadeMilitar[]>;

  constructor(tamanhoCelula: number = 0.5) { // 0.5 graus de lat/lng é aprox. 55km (ótimo para alcance de mísseis/aviões)
    this.tamanhoCelula = tamanhoCelula;
    this.grade = new Map<string, UnidadeMilitar[]>();
  }

  /**
   * Limpa a grade espacial para re-indexação rápida a cada frame
   */
  public limpar(): void {
    this.grade.clear();
  }

  /**
   * Gera uma chave de hash textual a partir de coordenadas geográficas
   */
  private obterChave(lat: number, lng: number): string {
    const x = Math.floor(lng / this.tamanhoCelula);
    const y = Math.floor(lat / this.tamanhoCelula);
    return `${x},${y}`;
  }

  /**
   * Insere uma unidade na grade com base em sua localização geográfica atual
   */
  public inserir(unidade: UnidadeMilitar): void {
    const chave = this.obterChave(unidade.latitude, unidade.longitude);
    let lista = this.grade.get(chave);
    if (!lista) {
      lista = [];
      this.grade.set(chave, lista);
    }
    lista.push(unidade);
  }

  /**
   * Insere um conjunto massivo de unidades simultaneamente (O(N))
   */
  public indexarUnidades(unidades: UnidadeMilitar[]): void {
    this.limpar();
    for (let i = 0; i < unidades.length; i++) {
      this.inserir(unidades[i]);
    }
  }

  /**
   * Retorna todas as unidades contidas nas células vizinhas que se sobrepõem ao raio de busca R (em graus)
   */
  public buscarVizinhos(lat: number, lng: number, raioEmGraus: number): UnidadeMilitar[] {
    const vizinhos: UnidadeMilitar[] = [];
    
    const minLng = lng - raioEmGraus;
    const maxLng = lng + raioEmGraus;
    const minLat = lat - raioEmGraus;
    const maxLat = lat + raioEmGraus;

    const minX = Math.floor(minLng / this.tamanhoCelula);
    const maxX = Math.floor(maxLng / this.tamanhoCelula);
    const minY = Math.floor(minLat / this.tamanhoCelula);
    const maxY = Math.floor(maxLat / this.tamanhoCelula);

    // Varre apenas as células que cruzam a caixa envolvente (bounding box) da busca
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const chave = `${x},${y}`;
        const unidadesNaCelula = this.grade.get(chave);
        if (unidadesNaCelula) {
          // Filtra por distância euclidiana exata para precisão radial
          for (let i = 0; i < unidadesNaCelula.length; i++) {
            const u = unidadesNaCelula[i];
            const dLat = u.latitude - lat;
            const dLng = u.longitude - lng;
            const distQuadrada = dLat * dLat + dLng * dLng;
            if (distQuadrada <= raioEmGraus * raioEmGraus) {
              vizinhos.push(u);
            }
          }
        }
      }
    }

    return vizinhos;
  }
  
  /**
   * Método estático auxiliar para calcular distância real em Quilômetros entre coordenadas usando a Fórmula de Haversine
   */
  public static calcularDistanciaRealKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const raioTerraKm = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return raioTerraKm * c;
  }
}
