import React from 'react';
import { useGameContext } from '@/contexts/GameContext';
import Header from '@/components/game/Header';
import NewGameForm from '@/components/game/NewGameForm';
import GameScoreboard from '@/components/game/GameScoreboard';

export default function Home() {
  const { gameState } = useGameContext();
  const { currentGame } = gameState;
  
  return (
    <div className="page-container">
      <Header />
      
      <div className="space-y-8">
        {currentGame ? (
          <div className="animate-fade-in">
            <GameScoreboard />
          </div>
        ) : (
          <div className="animate-fade-in">
            <NewGameForm />
          </div>
        )}
      </div>
    </div>
  );
}
