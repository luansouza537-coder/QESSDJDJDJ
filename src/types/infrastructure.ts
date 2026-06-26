/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InfraType = 'ENERGY' | 'WATER' | 'AIRPORT' | 'CORRIDOR';

export interface InfrastructureItem {
  id: string;
  name: string;
  type: InfraType;
  location: string;
  capacity: string;
  vulnerability: string;
  status: 'OPERATIONAL' | 'DAMAGED' | 'OFFLINE';
  description: string;
  defenseLevel: number; // 0 to 3
  effectOnFailure: string;
  regionBinding: string; // RegionID linked for attacks/recon
}

export interface StrategicInfrastructureState {
  items: InfrastructureItem[];
  rationingLevel: 'NONE' | 'LIGHT' | 'SEVERE';
  waterEmergency: boolean;
  supplyRouteCapacity: number; // percentage (0 - 100)
}
