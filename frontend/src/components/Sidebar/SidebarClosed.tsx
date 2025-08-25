import React from 'react';
import WristbandSidebar, { type InlineViewSection, type NavigationItem } from './wristband/WristbandSidebar';
import { theme } from '@/utils/theme';

interface SidebarClosedProps {
  onOpen: () => void;
  navigationItems: NavigationItem[];
  onNavigate: (itemId: string) => void;
  onInlineViewChange: (view: InlineViewSection) => void;
}

export default function SidebarClosed({ 
  onOpen, 
  navigationItems,
  onNavigate, 
  onInlineViewChange 
}: SidebarClosedProps) {
  const wristbandSidebar = WristbandSidebar({ navigationItems, onNavigate });

  // Collapsed sidebar icon for navigation items
  const renderCollapsedNavigationIcon = (item: NavigationItem) => (
    <button
      key={item.id}
      onClick={() => wristbandSidebar.handleNavigationItemClick(item.id)}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 mb-2 group ${
        wristbandSidebar.selectedNavigationItem === item.id
          ? 'bg-white/20 shadow-lg'
          : 'hover:bg-white/10'
      }`}
      title={item.label}
    >
      <item.icon className={`w-5 h-5 transition-all duration-200 ${
        wristbandSidebar.selectedNavigationItem === item.id
          ? 'text-white'
          : 'text-white/70 group-hover:text-white'
      }`} />
    </button>
  );

  // Collapsed sidebar icon for inline view items
  const renderCollapsedInlineViewIcon = (item: { id: InlineViewSection | 'loading'; label: string; icon: any; isLoading?: boolean }) => {
    // Render loading skeleton for collapsed view
    if (item.isLoading) {
      return (
        <button
          key={item.id}
          onClick={onOpen}
          className="w-10 h-10 flex items-center justify-center rounded-lg mb-2 animate-pulse hover:bg-white/10 transition-all duration-200"
          title="Loading..."
        >
          <div className="w-5 h-5 bg-white/30 rounded"></div>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          wristbandSidebar.handleInlineViewClick(item.id as InlineViewSection);
          onInlineViewChange(item.id as InlineViewSection);
          onOpen();
        }}
        className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 mb-2 group hover:bg-white/10"
        title={item.label}
      >
        <item.icon className="w-5 h-5 transition-all duration-200 text-white/70 group-hover:text-white" />
      </button>
    );
  };

  return (
    <div 
      className="w-16 fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-out shadow-lg"
      style={{ 
        backgroundColor: theme.colors.primary,
        color: 'white'
      }}
    >
      <div className="flex flex-col items-center py-4 h-full">
        {/* Brand Icon */}
        <div className="mb-6 cursor-pointer" onClick={onOpen}>
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-gray-100/10 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/30 shadow-sm transition-all duration-200 hover:bg-white/90 dark:hover:bg-gray-100/20 hover:shadow-md hover:scale-105">
            <img 
              src="/wristband_icon.svg" 
              alt="Wristband" 
              className="w-6 h-6"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col items-center mb-4">
          {wristbandSidebar.navigationItems.map((item) => renderCollapsedNavigationIcon(item))}
        </div>

        {/* Separator */}
        <div className="w-8 h-px bg-white/20 mb-4"></div>

        {/* Inline View Items */}
        <div className="flex flex-col items-center">
          {wristbandSidebar.inlineViewItems.map((item) => renderCollapsedInlineViewIcon(item))}
        </div>
      </div>
    </div>
  );
}
