import React, { useState } from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { getPrimaryColor, getPrimaryLightColor, getPrimaryDarkColor } from '../../utils/theme';

import UserSettings from './UserSettings';
import UsersSection from './UsersSection';
import AdminSettings from './AdminSettings';

interface ExplorerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExplorerSection = 'user' | 'users' | 'admin';

export default function ExplorerSidebar({ isOpen, onClose }: ExplorerSidebarProps) {
  const [activeSection, setActiveSection] = useState<ExplorerSection>('user');
  
  const primaryColor = getPrimaryColor();
  const primaryLight = getPrimaryLightColor();
  const primaryDark = getPrimaryDarkColor();

  const navigationItems = [
    { id: 'user' as const, label: 'User Settings', icon: UserIcon },
    { id: 'users' as const, label: 'Users', icon: UsersIcon },
    { id: 'admin' as const, label: 'Admin', icon: Cog6ToothIcon },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'user':
        return <UserSettings />;
      case 'users':
        return <UsersSection />;
      case 'admin':
        return <AdminSettings />;
      default:
        return <UserSettings />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl transform transition-all duration-500 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with Wristband Logo */}
          <div 
            className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}10, ${primaryLight}10)`,
            }}
          >
            <img 
              src="/wristband_logo_dark.svg" 
              alt="Wristband" 
              className="h-8 w-auto"
            />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {navigationItems.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`relative w-full flex flex-col items-center justify-center p-4 lg:p-6 text-center rounded-2xl transition-all duration-200 group ${
                        activeSection === item.id
                          ? 'text-white shadow-lg scale-105'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:scale-102'
                      }`}
                      style={{
                        background: activeSection === item.id 
                          ? `linear-gradient(135deg, ${primaryDark}, ${primaryColor})` 
                          : 'transparent',
                        boxShadow: activeSection === item.id 
                          ? `0 10px 30px ${primaryColor}30` 
                          : 'none',
                        animationDelay: `${index * 100}ms`,
                        aspectRatio: '1.2'
                      }}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl mb-2 lg:mb-3 transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-white/20 shadow-inner'
                          : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                      }`}>
                        <item.icon className={`w-5 h-5 lg:w-6 lg:h-6 transition-all duration-200 ${
                          activeSection === item.id
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                        }`} />
                      </div>
                      <span className={`font-medium text-sm lg:text-base transition-all duration-200 ${
                        activeSection === item.id
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.label}
                      </span>
                      
                      {/* Active indicator */}
                      {activeSection === item.id && (
                        <div 
                          className="absolute inset-0 rounded-2xl border border-white/20"
                          style={{
                            background: `linear-gradient(135deg, ${primaryColor}15, ${primaryLight}15)`,
                          }}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800/50">
            <div className="transform transition-all duration-300 ease-out">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 