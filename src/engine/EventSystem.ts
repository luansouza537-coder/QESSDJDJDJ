/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { GameEvent, GameState, FactionID } from '../types/game';

export type CondicaoJogo =
  | 'CRISE_SUPRIMENTOS'
  | 'CRISE_MORAL'
  | 'OFENSIVA_INIMIGA'
  | 'DIPLOMACIA_CRITICA'
  | 'VITORIA_IMINENTE'
  | 'PADRAO';

/**
 * Avalia o estado atual e retorna a condição estratégica dominante para
 * orientar o tipo de evento que o Gemini deve gerar.
 */
export function avaliarCondicoes(gameState: GameState): CondicaoJogo {
  const playerFac = gameState.factions[gameState.playerFaction];

  if (playerFac.resources.supplies < 25) return 'CRISE_SUPRIMENTOS';
  if (playerFac.nationalMorale < 30 || gameState.popularSupport < 25) return 'CRISE_MORAL';

  // Detecta ofensiva inimiga recente nas últimas 5 entradas do log
  const recentLogs = gameState.historyLogs.slice(0, 5);
  if (recentLogs.some(l => l.message.includes('OFENSIVA INIMIGA') || l.message.includes('conquistou'))) {
    return 'OFENSIVA_INIMIGA';
  }

  // Vitória iminente: jogador controla 5+ regiões
  const playerRegionCount = Object.values(gameState.regions).filter(
    r => r.controller === gameState.playerFaction
  ).length;
  if (playerRegionCount >= 5) return 'VITORIA_IMINENTE';

  // Abertura diplomática
  const adversario: FactionID = gameState.playerFaction === 'BRASIL' ? 'PARAGUAI' : 'BRASIL';
  const rel = gameState.relations.find(
    r =>
      (r.factionA === gameState.playerFaction && r.factionB === adversario) ||
      (r.factionA === adversario && r.factionB === gameState.playerFaction)
  );
  if (rel && rel.value > 15) return 'DIPLOMACIA_CRITICA';

  return 'PADRAO';
}

/**
 * Valida e sanitiza o objeto JSON retornado pelo Gemini, garantindo que
 * todos os campos obrigatórios existem e os valores numéricos estão dentro
 * dos intervalos seguros para o balanço do jogo.
 *
 * Retorna null se a estrutura for inválida (caller deve usar fallback).
 */
export function validarEventoGemini(raw: unknown, eventId: string): GameEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  if (typeof obj.title !== 'string' || obj.title.length < 5) return null;
  if (typeof obj.description !== 'string' || obj.description.length < 30) return null;
  if (!Array.isArray(obj.choices) || obj.choices.length < 2) return null;

  const VALID_CATEGORIES = ['MILITAR', 'DIPLOMATICO', 'INFRAESTRUTURA', 'REMANCENTES'];
  const category = typeof obj.category === 'string' && VALID_CATEGORIES.includes(obj.category)
    ? (obj.category as GameEvent['category'])
    : 'MILITAR';

  const clamp = (val: unknown, min: number, max: number): number => {
    const n = typeof val === 'number' ? val : 0;
    return Math.max(min, Math.min(max, Math.round(n)));
  };

  const validatedChoices: GameEvent['choices'] = [];

  for (let i = 0; i < 2; i++) {
    const rawChoice = obj.choices[i];
    if (!rawChoice || typeof rawChoice !== 'object') return null;
    const c = rawChoice as Record<string, unknown>;

    if (typeof c.text !== 'string' || c.text.length < 5) return null;

    const rawEffect = c.effect as Record<string, unknown> | null;
    if (!rawEffect || typeof rawEffect !== 'object') return null;
    if (typeof rawEffect.logMessage !== 'string' || rawEffect.logMessage.length < 10) return null;

    validatedChoices.push({
      id: `${eventId}_${String.fromCharCode(65 + i)}`,
      text: c.text as string,
      consequencesDescription:
        typeof c.consequencesDescription === 'string'
          ? (c.consequencesDescription as string)
          : 'Avaliação de impacto tático em andamento.',
      effect: {
        fundsChange:              clamp(rawEffect.fundsChange, -80, 150),
        suppliesChange:           clamp(rawEffect.suppliesChange, -100, 100),
        nationalMoraleChange:     clamp(rawEffect.nationalMoraleChange, -25, 25),
        popularSupportChange:     clamp(rawEffect.popularSupportChange, -25, 25),
        politicalStabilityChange: clamp(rawEffect.politicalStabilityChange, -25, 25),
        intelPointsChange:        clamp(rawEffect.intelPointsChange, -40, 50),
        globalInfluenceChange:    clamp(rawEffect.globalInfluenceChange, -25, 25),
        logMessage:               rawEffect.logMessage as string,
      },
    });
  }

  // Imagem Unsplash neutra — evita dependência de URL por categoria
  const CATEGORY_IMAGES: Record<string, string> = {
    MILITAR:        'https://images.unsplash.com/photo-1494523374633-8d29e5b34c09?auto=format&fit=crop&q=80&w=400',
    DIPLOMATICO:    'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400',
    INFRAESTRUTURA: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400',
    REMANCENTES:    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
  };

  return {
    id: eventId,
    title: obj.title as string,
    description: obj.description as string,
    image: CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.MILITAR,
    category,
    choices: validatedChoices,
  };
}

function buildPrompt(gameState: GameState, condicao: CondicaoJogo): string {
  const playerFac = gameState.factions[gameState.playerFaction];
  const controlledRegions = Object.values(gameState.regions)
    .filter(r => r.controller === gameState.playerFaction)
    .map(r => r.name)
    .join(', ');

  const condicaoDesc: Record<CondicaoJogo, string> = {
    CRISE_SUPRIMENTOS:   'CRISE LOGÍSTICA GRAVE — estoques de suprimentos abaixo do mínimo operacional',
    CRISE_MORAL:         'COLAPSO DE MORAL — apoio popular e moral nacional em queda livre',
    OFENSIVA_INIMIGA:    'OFENSIVA INIMIGA RECENTE — território perdido nas últimas 24 horas de combate',
    DIPLOMACIA_CRITICA:  'ABERTURA DIPLOMÁTICA — relações com o adversário em zona de negociação',
    VITORIA_IMINENTE:    'VITÓRIA IMINENTE — domínio territorial consolidado, pressão final sobre o inimigo',
    PADRAO:              'DESENVOLVIMENTO NORMAL DA CAMPANHA — tensão estratégica moderada',
  };

  return `Você é o narrador geopolítico de "Teatro de Conflito do Prata: 2034", jogo de estratégia sobre a guerra Brasil-Paraguai pelo controle da usina de Itaipu.

SITUAÇÃO NO TURNO ${gameState.currentTurn}:
- Facção do jogador: ${playerFac.name}
- Condição dominante: ${condicaoDesc[condicao]}
- Fundos disponíveis: F$${playerFac.resources.funds} bilhões
- Suprimentos de guerra: ${playerFac.resources.supplies} unidades
- Moral nacional: ${playerFac.nationalMorale}%
- Apoio popular: ${gameState.popularSupport}%
- Regiões controladas: ${controlledRegions || 'nenhuma'}

Gere UM evento geopolítico dramático e imersivo adequado à situação, com exatamente 2 escolhas estratégicas contrastantes. Requisitos:
- Específico ao conflito Brasil-Paraguai / Itaipu / 2034
- Tom militar, jornalístico e urgente
- Dilema real — sem resposta "certa" óbvia
- Pode referenciar personagens: Gen. Santiago Caballero, Cap. Lucas Azevedo, Li Wei, Maria Clara, Mike Connors

Retorne SOMENTE JSON válido com esta estrutura:
{
  "title": "string (máx 70 chars, impactante)",
  "description": "string (2-3 parágrafos, 150-300 palavras, narrativa de guerra)",
  "category": "MILITAR | DIPLOMATICO | INFRAESTRUTURA | REMANCENTES",
  "choices": [
    {
      "text": "string (ação A, máx 80 chars)",
      "consequencesDescription": "string (1 frase sobre consequências esperadas)",
      "effect": {
        "fundsChange": number,
        "suppliesChange": number,
        "nationalMoraleChange": number,
        "popularSupportChange": number,
        "politicalStabilityChange": number,
        "intelPointsChange": number,
        "globalInfluenceChange": number,
        "logMessage": "string (narração do resultado, 1-2 frases)"
      }
    },
    {
      "text": "string (ação B, contraste claro com A)",
      "consequencesDescription": "string",
      "effect": {
        "fundsChange": number,
        "suppliesChange": number,
        "nationalMoraleChange": number,
        "popularSupportChange": number,
        "politicalStabilityChange": number,
        "intelPointsChange": number,
        "globalInfluenceChange": number,
        "logMessage": "string"
      }
    }
  ]
}`;
}

/**
 * Chama o Gemini para gerar um evento contextual.
 * Retorna null se a chave de API não estiver configurada, se o Gemini falhar
 * ou se o output não passar na validação de schema — o caller deve usar
 * generateProceduralEvent() como fallback nesses casos.
 */
export async function gerarEventoGemini(
  gameState: GameState,
  condicao: CondicaoJogo
): Promise<GameEvent | null> {
  const apiKey = (import.meta.env as Record<string, string | undefined>)['VITE_GEMINI_API_KEY'];
  if (!apiKey) return null;

  const eventId = `EVT_GEMINI_${gameState.currentTurn}_${Date.now()}`;

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(gameState, condicao);

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed: unknown = JSON.parse(text);
    return validarEventoGemini(parsed, eventId);
  } catch {
    return null;
  }
}
