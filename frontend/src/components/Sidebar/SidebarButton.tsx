import React from 'react';

interface SidebarButtonProps {
  onOpenSidebar: () => void;
  isOpen: boolean;
}

export default function SidebarButton({ onOpenSidebar, isOpen }: SidebarButtonProps) {
  return (
    <div className="fixed top-3 sm:top-6 left-3 sm:left-6 z-50">
      <button
        onClick={onOpenSidebar}
        className="relative p-2.5 sm:p-3 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/50 group hover:scale-105 active:scale-95"
        style={{ 
          backgroundColor: 'var(--background)',
          opacity: 0.9
        }}
        title="Open Sidebar"
      >
        <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          {/* Wristband Symbol */}
          <img 
            src="/wristband_icon.svg" 
            alt="Wristband" 
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </div>
        
        {/* Animated background glow */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/20 to-primary-light/20"></div>
      </button>
    </div>
  );
} 