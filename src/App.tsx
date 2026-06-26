/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import MainMenu from './pages/MainMenu';
import NewCampaign from './pages/NewCampaign';
import Dashboard from './pages/Dashboard';

function GameFlow() {
  const { gameState } = useGame();
  const [screen, setScreen] = useState<'MENU' | 'SETUP'>('MENU');

  // Se o estado de turnos resetar (voltar a 0), reconfigura a tela para o menu principal
  useEffect(() => {
    if (gameState.currentTurn === 0) {
      setScreen('MENU');
    }
  }, [gameState.currentTurn]);

  // Se a campanha estiver ativa, exibe o painel de mídias operacionais (Dashboard)
  if (gameState.currentTurn >= 1) {
    return <Dashboard />;
  }

  // Se no menu principal, renderiza o Splash e os manuais
  if (screen === 'MENU') {
    return <MainMenu onStartCampaign={() => setScreen('SETUP')} />;
  }

  // Senão, abre as diretrizes para seleção de dificuldade de Nova Campanha
  return <NewCampaign onBackToMenu={() => setScreen('MENU')} />;
}

export default function App() {
  return (
    <GameProvider>
      <GameFlow />
    </GameProvider>
  );
}

