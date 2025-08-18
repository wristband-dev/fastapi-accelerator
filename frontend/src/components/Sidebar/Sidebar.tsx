import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  UsersIcon, 
  ChevronRightIcon,
  KeyIcon,
  CogIcon,
  ShieldCheckIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

import ItemSettings from './InLineViews/Settings';
import ItemUsers from './InLineViews/Users';
import ItemAdmin from './InLineViews/Admin';
import TenantSwitcher from '@/components/Sidebar/TenantSwitcher';
import { useUser } from '@/contexts/UserContext';
import frontendApiClient from '@/client/frontend-api-client';
import { theme } from '@/utils/theme';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onContentSelect: (content: 'home' | 'secrets') => void;
}

type InlineViewSection = 'user' | 'users' | 'admin';
type ContentSection = 'home' | 'secrets';

export default function Sidebar({ isOpen, onClose, onOpen, onContentSelect }: SidebarProps) {
  const [activeInlineView, setActiveInlineView] = useState<InlineViewSection>('user');
  const [lastSelectedInlineView, setLastSelectedInlineView] = useState<InlineViewSection>('user');
  const [selectedContentItem, setSelectedContentItem] = useState<ContentSection>('home');
  const { 
    setCurrentTenant, 
    setTenantOptions, 
    setIsLoadingTenants, 
    setUserRoles, 
    setIsLoadingRoles, 
    hasAdminRole,
    isLoadingRoles,
    isLoadingTenants 
  } = useUser();

  // Restore last selected inline view when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setActiveInlineView(lastSelectedInlineView);
    }
  }, [isOpen, lastSelectedInlineView]);

  // Fetch tenant data and user roles when sidebar opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchUserData = async () => {
      try {
        setIsLoadingTenants(true);
        setIsLoadingRoles(true);
        
        // Fetch current tenant, tenant options, and user roles in parallel
        const [tenantResponse, optionsResponse, rolesResponse] = await Promise.all([
          frontendApiClient.get('/tenant/me'),
          frontendApiClient.get('/tenant/options'),
          frontendApiClient.get('/user/me/roles')
        ]);
        
        setCurrentTenant(tenantResponse.data);
        setTenantOptions(optionsResponse.data);
        setUserRoles(rolesResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingTenants(false);
        setIsLoadingRoles(false);
      }
    };

    fetchUserData();
  }, [isOpen, setCurrentTenant, setTenantOptions, setIsLoadingTenants, setUserRoles, setIsLoadingRoles]);

  // Prevent body scroll when sidebar is open
  React.useEffect(() => {
    if (isOpen) {
      // Store original body overflow
      const originalOverflow = document.body.style.overflow;
      // Prevent body scroll but keep position static for bounce scrolling
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore body overflow
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key to close sidebar
  React.useEffect(() => {
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

  const contentItems = [
    { id: 'home' as const, label: 'Home', icon: HomeIcon },
    { id: 'secrets' as const, label: 'Secrets', icon: KeyIcon },
  ];

  const getInlineViewItems = () => {
    const baseItems = [
      { id: 'user' as const, label: 'Settings', icon: CogIcon },
      { id: 'users' as const, label: 'Users', icon: UsersIcon },
    ];
    
    if (isLoadingRoles) {
      // Show skeleton for potential admin item while loading
      return [
        ...baseItems,
        { id: 'loading' as const, label: '', icon: null, isLoading: true }
      ];
    }
    
    return [
      ...baseItems,
      ...(hasAdminRole ? [{ id: 'admin' as const, label: 'Admin', icon: ShieldCheckIcon }] : []),
    ];
  };

  const inlineViewItems = getInlineViewItems();

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

  // Reset active inline view to 'user' if user doesn't have admin role and is on admin section
  useEffect(() => {
    if (!hasAdminRole && activeInlineView === 'admin') {
      setActiveInlineView('user');
      setLastSelectedInlineView('user');
    }
  }, [hasAdminRole, activeInlineView]);

  const handleContentItemClick = (contentId: ContentSection) => {
    setSelectedContentItem(contentId);
    onContentSelect(contentId);
  };

  const handleInlineViewClick = (viewId: InlineViewSection) => {
    setActiveInlineView(viewId);
    setLastSelectedInlineView(viewId);
  };

  const renderContentButton = (item: { id: ContentSection; label: string; icon: any }) => (
    <button
      key={item.id}
      onClick={() => handleContentItemClick(item.id)}
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
        onClick={() => handleInlineViewClick(item.id as InlineViewSection)}
        className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left rounded-lg transition-all duration-200 group ${
          activeInlineView === item.id
            ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
          activeInlineView === item.id
            ? 'bg-white/20'
            : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
        }`}>
          <item.icon className={`w-5 h-5 transition-all duration-200 ${
            activeInlineView === item.id
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
          }`} />
        </div>
        <span className={`text-sm sm:text-base font-medium transition-all duration-200 ${
          activeInlineView === item.id
            ? 'text-white'
            : 'text-gray-900 dark:text-gray-100'
        }`}>
          {item.label}
        </span>
      </button>
    );
  };

  const renderInlineViewContent = () => {
    switch (activeInlineView) {
      case 'user':
        return <ItemSettings />;
      case 'users':
        return <ItemUsers />;
      case 'admin':
        return <ItemAdmin />;
      default:
        return <ItemSettings />;
    }
  };

  // Collapsed sidebar icon for content items
  const renderCollapsedContentIcon = (item: { id: ContentSection; label: string; icon: any }) => (
    <button
      key={item.id}
      onClick={() => handleContentItemClick(item.id)}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 mb-2 group ${
        selectedContentItem === item.id
          ? 'bg-white/20 shadow-lg'
          : 'hover:bg-white/10'
      }`}
      title={item.label}
    >
      <item.icon className={`w-5 h-5 transition-all duration-200 ${
        selectedContentItem === item.id
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
        <div key={item.id} className="w-10 h-10 flex items-center justify-center rounded-lg mb-2 animate-pulse">
          <div className="w-5 h-5 bg-white/30 rounded"></div>
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          handleInlineViewClick(item.id as InlineViewSection);
          // Auto-open sidebar when clicking inline view in collapsed state
          if (!isOpen) {
            onOpen();
          }
        }}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 mb-2 group ${
          lastSelectedInlineView === item.id
            ? 'bg-white/20 shadow-lg'
            : 'hover:bg-white/10'
        }`}
        title={item.label}
      >
        <item.icon className={`w-5 h-5 transition-all duration-200 ${
          lastSelectedInlineView === item.id
            ? 'text-white'
            : 'text-white/70 group-hover:text-white'
        }`} />
      </button>
    );
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
          backgroundColor: isOpen ? 'var(--background)' : theme.colors.primary,
          color: isOpen ? 'var(--foreground)' : 'white'
        }}
      >
        {isOpen ? (
          // EXPANDED STATE - Full Sidebar Content
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
                {/* Content Items */}
                <div className="space-y-1 mb-4">
                  {contentItems.map((item) => renderContentButton(item))}
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                {/* Inline View Items */}
                <div className="space-y-1">
                  {inlineViewItems.map((item) => renderInlineViewButton(item))}
                </div>
              </nav>

              {/* Inline View Content */}
              <div className="transform transition-all duration-300 ease-out">
                {(isLoadingRoles || isLoadingTenants) ? (
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
                  renderInlineViewContent()
                )}
              </div>
            </div>
          </div>
        ) : (
          // COLLAPSED STATE - Icon Bar
          <div className="flex flex-col items-center py-4 h-full">
            {/* Brand Icon */}
            <div className="mb-6 cursor-pointer" onClick={() => onOpen()}>
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/wristband_icon.svg" 
                  alt="Wristband" 
                  className="w-6 h-6"
                />
              </div>
            </div>

            {/* Content Items */}
            <div className="flex flex-col items-center mb-4">
              {contentItems.map((item) => renderCollapsedContentIcon(item))}
            </div>

            {/* Separator */}
            <div className="w-8 h-px bg-white/20 mb-4"></div>

            {/* Inline View Items */}
            <div className="flex flex-col items-center">
              {inlineViewItems.map((item) => renderCollapsedInlineViewIcon(item))}
            </div>
          </div>
        )}
      </div>
    </>
  );
} 