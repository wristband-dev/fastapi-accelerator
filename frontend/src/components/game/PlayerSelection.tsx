import React, { useState, useEffect } from 'react';
import frontendApiClient from '@/client/frontend-api-client';

interface TenantUser {
  id: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

interface SelectedPlayer {
  userId?: string;
  customName?: string;
  displayName: string;
  isCustom: boolean;
}

interface PlayerSelectionProps {
  onPlayersChange: (players: SelectedPlayer[]) => void;
  initialPlayers?: SelectedPlayer[];
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  onPlayersChange,
  initialPlayers = [],
}) => {
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>(initialPlayers);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPlayerName, setCustomPlayerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTenantUsers();
  }, []);

  useEffect(() => {
    onPlayersChange(selectedPlayers);
  }, [selectedPlayers]);

  const fetchTenantUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await frontendApiClient.get('/users');
      setTenantUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching tenant users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getUserDisplayName = (user: TenantUser) => {
    if (user.givenName && user.familyName) {
      return `${user.givenName} ${user.familyName}`;
    }
    if (user.givenName) {
      return user.givenName;
    }
    return user.email;
  };

  const getInitials = (user: TenantUser) => {
    if (user.givenName && user.familyName) {
      return `${user.givenName[0]}${user.familyName[0]}`.toUpperCase();
    }
    if (user.givenName) {
      return user.givenName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const isUserAlreadySelected = (userId: string) => {
    return selectedPlayers.some(p => p.userId === userId);
  };

  const handleAddUser = (user: TenantUser) => {
    if (!isUserAlreadySelected(user.id)) {
      setSelectedPlayers([
        ...selectedPlayers,
        {
          userId: user.id,
          displayName: getUserDisplayName(user),
          isCustom: false,
        },
      ]);
    }
    setShowUserDropdown(false);
    setSearchQuery('');
  };

  const handleAddCustomPlayer = () => {
    if (customPlayerName.trim()) {
      setSelectedPlayers([
        ...selectedPlayers,
        {
          customName: customPlayerName.trim(),
          displayName: customPlayerName.trim(),
          isCustom: true,
        },
      ]);
      setCustomPlayerName('');
      setShowCustomInput(false);
    }
  };

  const handleRemovePlayer = (index: number) => {
    setSelectedPlayers(selectedPlayers.filter((_, i) => i !== index));
  };

  const filteredUsers = tenantUsers.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    const email = user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (displayName.includes(query) || email.includes(query)) && !isUserAlreadySelected(user.id);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="page-form-label flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Players</span>
          <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500">(minimum 2)</span>
        </label>
        <span className="text-sm page-text-muted">
          {selectedPlayers.length} selected
        </span>
      </div>

      {/* Selected Players List */}
      {selectedPlayers.length > 0 && (
        <div className="space-y-2">
          {selectedPlayers.map((player, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {player.isCustom ? (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {player.displayName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium page-text truncate">{player.displayName}</div>
                  <div className="text-xs page-text-muted">
                    {player.isCustom ? 'Guest Player' : 'Registered User'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePlayer(index)}
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove player"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Player Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          disabled={loadingUsers}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Add Player</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Guest Player</span>
        </button>
      </div>

      {/* User Dropdown */}
      {showUserDropdown && (
        <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-xl overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent page-text"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleAddUser(user)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(user)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium page-text truncate">{getUserDisplayName(user)}</div>
                    <div className="text-xs page-text-muted truncate">{user.email}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center page-text-muted">
                {searchQuery ? `No users found matching "${searchQuery}"` : 'No available users'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Player Input */}
      {showCustomInput && (
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-500 rounded-lg p-4 animate-fade-in">
          <label className="block text-sm font-medium page-text mb-2">
            Guest Player Name
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customPlayerName}
              onChange={(e) => setCustomPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomPlayer();
                }
              }}
              placeholder="Enter player name..."
              className="flex-1 page-form-input"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddCustomPlayer}
              disabled={!customPlayerName.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomPlayerName('');
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 page-text rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSelection;

