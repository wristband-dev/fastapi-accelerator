import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import WristbandSidebar, { type InlineViewSection, type NavigationItem } from './wristband/WristbandSidebar';
import TenantSwitcher from './wristband/TenantSwitcher';

interface SidebarOpenProps {
  onClose: () => void;
  navigationItems: NavigationItem[];
  onNavigate: (itemId: string) => void;
  isOpen: boolean;
  lastSelectedInlineView: InlineViewSection;
  onInlineViewChange: (view: InlineViewSection) => void;
}

export default function SidebarOpen({ 
  onClose, 
  navigationItems,
  onNavigate, 
  isOpen,
  lastSelectedInlineView,
  onInlineViewChange 
}: SidebarOpenProps) {
  const wristbandSidebar = WristbandSidebar({ navigationItems, onNavigate, initialInlineView: lastSelectedInlineView });

  // Note: Removed problematic useEffect hooks that were causing infinite loops
  // The sidebar state management should work without these synchronization effects

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key to close sidebar
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Loading skeleton component for navigation items
  const renderLoadingSkeleton = () => (
    <div className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg animate-pulse">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700">
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );

  const renderNavigationButton = (item: NavigationItem) => (
    <button
      key={item.id}
      onClick={() => wristbandSidebar.handleNavigationItemClick(item.id)}
      className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left rounded-lg transition-all duration-200 group text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
        <item.icon className="w-5 h-5 transition-all duration-200 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
      </div>
      <span className="text-sm sm:text-base font-medium transition-all duration-200 text-gray-900 dark:text-gray-100">
        {item.label}
      </span>
    </button>
  );

  const renderInlineViewButton = (item: { id: InlineViewSection | 'loading'; label: string; icon: any; isLoading?: boolean }) => {
    // Render loading skeleton if this is a loading item
    if (item.isLoading) {
      return (
        <div key={item.id} className="w-full">
          {renderLoadingSkeleton()}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          wristbandSidebar.handleInlineViewClick(item.id as InlineViewSection);
          onInlineViewChange(item.id as InlineViewSection);
        }}
        className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left rounded-lg transition-all duration-200 group ${
          wristbandSidebar.activeInlineView === item.id
            ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
          wristbandSidebar.activeInlineView === item.id
            ? 'bg-white/20'
            : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
        }`}>
          <item.icon className={`w-5 h-5 transition-all duration-200 ${
            wristbandSidebar.activeInlineView === item.id
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
          }`} />
        </div>
        <span className={`text-sm sm:text-base font-medium transition-all duration-200 ${
          wristbandSidebar.activeInlineView === item.id
            ? 'text-white'
            : 'text-gray-900 dark:text-gray-100'
        }`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img 
            src="/wristband_logo_dark.svg" 
            alt="Wristband" 
            className="h-6 sm:h-8 w-auto"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <TenantSwitcher />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Navigation */}
        <nav className="p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Navigation Items */}
          <div className="space-y-1 mb-4">
            {wristbandSidebar.navigationItems.map((item) => renderNavigationButton(item))}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

          {/* Inline View Items */}
          <div className="space-y-1">
            {wristbandSidebar.inlineViewItems.map((item) => renderInlineViewButton(item))}
          </div>
        </nav>

        {/* Inline View Content */}
        <div className="transform transition-all duration-300 ease-out">
          {(wristbandSidebar.isLoadingRoles || wristbandSidebar.isLoadingTenants) ? (
            <div className="p-4 sm:p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="space-y-2 mt-6">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            wristbandSidebar.renderInlineViewContent()
          )}
        </div>
      </div>
    </div>
  );
}
