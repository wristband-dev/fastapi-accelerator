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
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img 
                src="/wristband_logo_dark.svg" 
                alt="Wristband" 
                className="h-8 w-auto"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Explorer
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                    activeSection === item.id
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  style={{
                    background: activeSection === item.id 
                      ? `linear-gradient(135deg, ${primaryColor}, ${primaryDark})` 
                      : 'transparent',
                  }}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                  }`}>
                    <item.icon className={`w-4 h-4 transition-all duration-200 ${
                      activeSection === item.id
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                  </div>
                  <span className={`font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {item.label}
                  </span>
                
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
            <div className="transform transition-all duration-300 ease-out">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 