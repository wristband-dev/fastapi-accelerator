import React, { useState } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import PlayerSelection from './PlayerSelection';

interface SelectedPlayer {
  userId?: string;
  customName?: string;
  displayName: string;
  isCustom: boolean;
}

const NewGameForm: React.FC = () => {
  const { startNewGame } = useGameContext();
  const [gameName, setGameName] = useState('');
  const [targetScore, setTargetScore] = useState(500);
  const [customScoreInput, setCustomScoreInput] = useState('500');
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlayersChange = (players: SelectedPlayer[]) => {
    setSelectedPlayers(players);
  };

  const handleCustomScoreChange = (value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setCustomScoreInput(numericValue);
    
    // Update targetScore if there's a valid number, otherwise set to 0
    if (numericValue !== '') {
      const numValue = parseInt(numericValue);
      setTargetScore(numValue > 0 ? numValue : 0);
    } else {
      // Empty input - set to 0 to disable submit
      setTargetScore(0);
    }
  };

  const handleQuickScoreSelect = (score: number) => {
    setTargetScore(score);
    setCustomScoreInput(String(score));
  };

  // Check if form is valid
  const isFormValid = () => {
    // Check game name
    if (!gameName.trim()) return false;
    
    // Check target score
    if (!targetScore || targetScore < 1) return false;
    
    // Check players (at least 2 selected)
    if (selectedPlayers.length < 2) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!gameName.trim()) {
      setError('Please enter a game name');
      return;
    }

    if (!targetScore || targetScore < 1) {
      setError('Please enter a valid target score (at least 1)');
      return;
    }
    
    if (selectedPlayers.length < 2) {
      setError('You need at least 2 players');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Convert selected players to API format
      const playerInputs = selectedPlayers.map(player => ({
        userId: player.userId,
        customName: player.customName,
      }));
      
      await startNewGame(gameName, playerInputs, targetScore);
      
      // Reset form
      setGameName('');
      setSelectedPlayers([]);
      setTargetScore(500);
      setCustomScoreInput('500');
      setError('');
    } catch (err) {
      setError('Failed to create game. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-card-simple">
      <div className="text-center mb-8">
        <h2 className="page-section-title mb-2">Start New Game</h2>
        <p className="page-text-muted">Set up your game and start tracking scores</p>
      </div>
      
      {error && (
        <div className="page-alert-error mb-6">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="page-form-label">
            Game Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="page-form-input"
            placeholder="e.g., Friday Night Rummy"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="page-form-label flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span>Target Score</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {[300, 500, 750, 1000].map(score => (
              <button
                key={score}
                type="button"
                onClick={() => handleQuickScoreSelect(score)}
                disabled={isSubmitting}
                className={`p-3 rounded-lg transition-all duration-200 font-medium text-center ${
                  targetScore === score && customScoreInput === String(score)
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                }`}
              >
                {score}
                <div className="text-xs opacity-75">points</div>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={customScoreInput}
              onChange={(e) => handleCustomScoreChange(e.target.value)}
              className="page-form-input"
              placeholder="Enter custom target score"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <PlayerSelection
          onPlayersChange={handlePlayersChange}
          initialPlayers={selectedPlayers}
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid()}
          className="w-full page-btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Game...' : 'Start Game'}
        </button>
      </form>
    </div>
  );
};

export default NewGameForm;

