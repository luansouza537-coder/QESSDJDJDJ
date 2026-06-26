/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { engineManager } from '../engine/EngineManager';
import { ClimaRegional } from '../types/simulation';
import { FactionID, EconomicIndicators } from '../types/game';

/**
 * Retorna o estado climático de todas as zonas em tempo real.
 * Atualiza no máximo a cada 500ms (throttle gerido pelo EngineManager).
 */
export function useWeatherState(): Record<string, ClimaRegional> {
  const [weather, setWeather] = useState<Record<string, ClimaRegional>>({});

  useEffect(() => {
    const unsubscribe = engineManager.subscribe((state) => {
      setWeather({ ...state.climaGlobal });
    });
    return unsubscribe;
  }, []);

  return weather;
}

/**
 * Retorna os indicadores econômicos da facção do jogador em tempo real.
 * Retorna null até o motor estar ativo e gerar o primeiro dado.
 */
export function useEconomicIndicators(playerFaction: FactionID): EconomicIndicators | null {
  const [indicators, setIndicators] = useState<EconomicIndicators | null>(null);

  useEffect(() => {
    const facaoKey = playerFaction === 'PARAGUAI' ? 'PARAGUAI' : 'BRASIL';

    const unsubscribe = engineManager.subscribe((state) => {
      const econ = state.facoes[facaoKey as keyof typeof state.facoes]?.estadoEconomico;
      if (!econ) return;

      setIndicators({
        pib:                    econ.pib,
        pibCrescimento:         econ.pibCrescimento,
        inflacao:               econ.inflacao,
        desemprego:             econ.desemprego,
        dividaPublica:          econ.dividaPublica,
        reservasInternacionais: econ.reservasInternacionais,
      });
    });

    return unsubscribe;
  }, [playerFaction]);

  return indicators;
}
