import React, { useState } from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { getGradientClasses } from './theme';

import UserSettings from './UserSettings';
import UsersSection from './UsersSection';
import AdminSection from './AdminSection';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'user' | 'users' | 'admin';

export default function SettingsSidebar({ isOpen, onClose }: SettingsSidebarProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('user');

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
        return <AdminSection />;
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
      <div className={`fixed inset-y-0 left-0 z-50 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl transform transition-all duration-500 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-[#00AA81]/10 to-[#00FFC1]/10 dark:from-[#00AA81]/20 dark:to-[#00FFC1]/20">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00AA81] to-[#00CC9A] rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-shrink-0 px-4 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <ul className="space-y-2">
              {navigationItems.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`relative w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-[#00AA81] to-[#00CC9A] text-white shadow-lg shadow-[#00AA81]/25 scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:scale-102'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-white/20 shadow-inner'
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
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {item.label}
                    </span>
                    <ChevronRightIcon className={`w-4 h-4 ml-auto transition-all duration-200 ${
                      activeSection === item.id
                        ? 'text-white/80 rotate-90'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} />
                    
                    {/* Active indicator */}
                    {activeSection === item.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00AA81]/20 to-[#00CC9A]/20 rounded-xl border border-white/20"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
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