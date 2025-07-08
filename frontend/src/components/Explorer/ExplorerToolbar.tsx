import React from 'react';
import { getPrimaryColor, getPrimaryLightColor, getPrimaryDarkColor } from '../../utils/theme';

interface ExplorerToolbarProps {
  onOpenExplorer: () => void;
  isOpen: boolean;
}

export default function ExplorerToolbar({ onOpenExplorer, isOpen }: ExplorerToolbarProps) {
  const primaryColor = getPrimaryColor();
  const primaryLight = getPrimaryLightColor();
  const primaryDark = getPrimaryDarkColor();

  return (
    <div className="fixed top-6 left-6 z-50">
      <button
        onClick={onOpenExplorer}
        className="relative p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:border-[var(--primary)]/50 dark:hover:border-[var(--primary-light)]/50 group hover:scale-105 active:scale-95"
        style={{
          '--primary': primaryColor,
          '--primary-light': primaryLight,
          '--primary-dark': primaryDark,
        } as React.CSSProperties}
        title="Open Explorer"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Wristband Logo */}
          
        </div>
        
        {/* Animated background glow */}
        <div 
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}20, ${primaryLight}20)`,
          }}
        ></div>
      </button>
    </div>
  );
} 