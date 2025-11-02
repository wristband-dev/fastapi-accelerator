import React, { useState, useRef, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

interface UserDropdownProps {
  users: User[];
  selectedUserId: string;
  currentUserId?: string;
  onSelect: (userId: string) => void;
  disabled?: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  users,
  selectedUserId,
  currentUserId,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getUserDisplayName = (user: User) => {
    if (user.givenName && user.familyName) {
      return `${user.givenName} ${user.familyName}`;
    }
    if (user.givenName) {
      return user.givenName;
    }
    return user.email;
  };

  const getInitials = (user: User) => {
    if (user.givenName && user.familyName) {
      return `${user.givenName[0]}${user.familyName[0]}`.toUpperCase();
    }
    if (user.givenName) {
      return user.givenName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getSelectedLabel = () => {
    if (selectedUserId === 'all') return 'All Users';
    if (currentUserId && selectedUserId === currentUserId) return 'My Games';
    const user = users.find(u => u.id === selectedUserId);
    return user ? getUserDisplayName(user) : 'Select User';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (userId: string) => {
    onSelect(userId);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    const email = user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return displayName.includes(query) || email.includes(query);
  });

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        } ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="page-text font-medium truncate">{getSelectedLabel()}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden animate-fade-in">
          {/* Search Box */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent page-text"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-80 overflow-y-auto">
            {/* All Users Option */}
            <button
              onClick={() => handleSelect('all')}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                selectedUserId === 'all' ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium page-text">All Users</div>
                <div className="text-xs page-text-muted">Show games from everyone</div>
              </div>
              {selectedUserId === 'all' && (
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* My Games Option */}
            {currentUserId && (
              <button
                onClick={() => handleSelect(currentUserId)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                  selectedUserId === currentUserId ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium page-text">My Games</div>
                  <div className="text-xs page-text-muted">Show only your games</div>
                </div>
                {selectedUserId === currentUserId && (
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}

            {/* Divider */}
            {filteredUsers.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 my-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Players
                </div>
              </div>
            )}

            {/* Individual Users */}
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                  selectedUserId === user.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                  {getInitials(user)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium page-text truncate">{getUserDisplayName(user)}</div>
                  <div className="text-xs page-text-muted truncate">{user.email}</div>
                </div>
                {selectedUserId === user.id && (
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}

            {/* No Results */}
            {searchQuery && filteredUsers.length === 0 && (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm page-text-muted">No users found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;

