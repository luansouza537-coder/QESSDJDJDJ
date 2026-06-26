/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameEvent } from '../types/game';
import eventsJson from './events.json';

// Exportado como GameEvent[] tipado para garantir total segurança de tipos nas rotas do jogo
export const GEOPOLITICAL_EVENTS: GameEvent[] = eventsJson as GameEvent[];
