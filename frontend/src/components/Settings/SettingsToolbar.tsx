import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { getGradientClasses } from './theme';

interface SettingsToolbarProps {
  onOpenSettings: () => void;
  isOpen: boolean;
}

export default function SettingsToolbar({ onOpenSettings, isOpen }: SettingsToolbarProps) {
  return (
    <div className="fixed top-6 left-6 z-50">
      <button
        onClick={onOpenSettings}
        className="relative p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#00CC9A]/50 dark:hover:border-[#00FFC1]/50 group hover:scale-105 active:scale-95"
        title="Open Menu"
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className={`absolute transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'}`}>
            <div className="w-5 h-0.5 bg-gray-600 dark:bg-gray-400 group-hover:bg-[#00AA81] dark:group-hover:bg-[#00CC9A] transition-colors"></div>
          </div>
          <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-5 h-0.5 bg-gray-600 dark:bg-gray-400 group-hover:bg-[#00AA81] dark:group-hover:bg-[#00CC9A] transition-colors"></div>
          </div>
          <div className={`absolute transition-all duration-300 ${isOpen ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'}`}>
            <div className="w-5 h-0.5 bg-gray-600 dark:bg-gray-400 group-hover:bg-[#00AA81] dark:group-hover:bg-[#00CC9A] transition-colors"></div>
          </div>
        </div>
        
        {/* Animated background glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00AA81]/20 to-[#00FFC1]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  );
} 