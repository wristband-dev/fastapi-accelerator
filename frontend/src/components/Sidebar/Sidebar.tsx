import React, { useState } from 'react';
import SidebarOpen from './SidebarOpen';
import SidebarClosed from './SidebarClosed';
import type { InlineViewSection } from './wristband/WristbandSidebar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onContentSelect: (content: 'home' | 'secrets') => void;
}

export default function Sidebar({ isOpen, onClose, onOpen, onContentSelect }: SidebarProps) {
  const [lastSelectedInlineView, setLastSelectedInlineView] = useState<InlineViewSection>('user');

  const handleInlineViewChange = (view: InlineViewSection) => {
    setLastSelectedInlineView(view);
  };

  return (
    <>
      {/* Backdrop - only when open */}
      <div 
        className={`hidden sm:block fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* 
      MARK: - Unified Sidebar (Expands in Place)
      */}
      <div 
        className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-out shadow-lg ${
          isOpen 
            ? 'w-full sm:max-w-lg lg:max-w-2xl xl:max-w-4xl' 
            : 'w-16 hidden sm:block'
        }`}
        style={{ 
          backgroundColor: isOpen ? 'var(--background)' : undefined,
          color: isOpen ? 'var(--foreground)' : 'white'
        }}
      >
        {isOpen ? (
          // EXPANDED STATE - Full Sidebar Content
          <SidebarOpen 
            onClose={onClose}
            onContentSelect={onContentSelect}
            isOpen={isOpen}
            lastSelectedInlineView={lastSelectedInlineView}
            onInlineViewChange={handleInlineViewChange}
          />
        ) : (
          // COLLAPSED STATE - Icon Bar
          <SidebarClosed 
            onOpen={onOpen}
            onContentSelect={onContentSelect}
            onInlineViewChange={handleInlineViewChange}
          />
        )}
      </div>
    </>
  );
}