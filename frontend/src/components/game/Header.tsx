import React from 'react';
import { useGameContext } from '@/contexts/GameContext';

const Header: React.FC = () => {
  const { gameState, endGame } = useGameContext();
  const { currentGame } = gameState;
  
  const handleNewGame = () => {
    // Only show confirmation if there's an IN PROGRESS game (not completed)
    if (currentGame && !currentGame.isComplete && !window.confirm('You have a game in progress. Start a new game instead?')) {
      return;
    }
    
    if (currentGame) {
      endGame();
    }
    
    // Scroll to top to show the new game form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          {currentGame && (
            <h1 className="page-title mb-2">
            {currentGame.name}
            </h1>
          )}
        </div>
        {currentGame && (
          <button
            onClick={handleNewGame}
            className="page-btn-primary self-start sm:self-auto flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Game</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;

