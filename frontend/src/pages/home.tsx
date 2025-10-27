import React from 'react';
import { GameProvider, useGameContext } from '@/contexts/GameContext';
import Header from '@/components/game/Header';
import NewGameForm from '@/components/game/NewGameForm';
import GameScoreboard from '@/components/game/GameScoreboard';
import GameList from '@/components/game/GameList';

function HomeContent() {
  const { gameState } = useGameContext();
  const { currentGame } = gameState;
  
  return (
    <div className="page-container">
      <Header />
      
      <div className="space-y-8">
        {currentGame ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="animate-fade-in">
                <GameScoreboard />
              </div>
            </div>
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="animate-slide-in">
                <GameList />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="animate-fade-in">
                <NewGameForm />
              </div>
            </div>
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="animate-slide-in">
                <GameList />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <HomeContent />
    </GameProvider>
  );
}
