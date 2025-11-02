import React, { useState } from 'react';
import { useGameContext } from '@/contexts/GameContext';

const NewGameForm: React.FC = () => {
  const { startNewGame } = useGameContext();
  const [gameName, setGameName] = useState('');
  const [targetScore, setTargetScore] = useState(500);
  const [customScoreInput, setCustomScoreInput] = useState('500');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPlayer = () => {
    setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length <= 2) {
      setError('You need at least 2 players');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
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
    
    // Check players (at least 2 with names)
    const validPlayers = playerNames.filter(name => name.trim() !== '');
    if (validPlayers.length < 2) return false;
    
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
    
    const validPlayers = playerNames.filter(name => name.trim() !== '');
    if (validPlayers.length < 2) {
      setError('You need at least 2 players with names');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await startNewGame(gameName, validPlayers, targetScore);
      
      // Reset form
      setGameName('');
      setPlayerNames(['', '']);
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
        
        <div>
          <label className="page-form-label flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Players</span>
            <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500">(minimum 2)</span>
          </label>
          <div className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="page-form-input"
                  placeholder={`Player ${index + 1} name`}
                  disabled={isSubmitting}
                />
                {playerNames.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    disabled={isSubmitting}
                    className="self-start sm:self-auto p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="sm:hidden text-sm">Remove</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addPlayer}
            disabled={isSubmitting}
            className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Player</span>
          </button>
        </div>
        
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

