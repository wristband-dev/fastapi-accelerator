import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CogIcon,
  ShieldCheckIcon,
  HomeIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

import ItemSettings from './Settings';
import ItemUsers from './Users';
import SidebarAdmin from './Admin';
import { useUser } from '@/contexts/UserContext';

export type InlineViewSection = 'user' | 'users' | 'admin';
export type ContentSection = 'home' | 'secrets';

interface WristbandSidebarProps {
  onContentSelect: (content: 'home' | 'secrets') => void;
}

export default function WristbandSidebar({ onContentSelect }: WristbandSidebarProps) {
  const [activeInlineView, setActiveInlineView] = useState<InlineViewSection>('user');
  const [lastSelectedInlineView, setLastSelectedInlineView] = useState<InlineViewSection>('user');
  const [selectedContentItem, setSelectedContentItem] = useState<ContentSection>('home');
  const { 
    hasAdminRole,
    isLoadingRoles,
    isLoadingTenants 
  } = useUser();

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

  const renderInlineViewContent = () => {
    switch (activeInlineView) {
      case 'user':
        return <ItemSettings />;
      case 'users':
        return <ItemUsers />;
      case 'admin':
        return <SidebarAdmin />;
      default:
        return <ItemSettings />;
    }
  };

  return {
    // State
    activeInlineView,
    lastSelectedInlineView,
    selectedContentItem,
    isLoadingRoles,
    isLoadingTenants,
    
    // Data
    contentItems,
    inlineViewItems: getInlineViewItems(),
    
    // Handlers
    handleContentItemClick,
    handleInlineViewClick,
    setActiveInlineView,
    setLastSelectedInlineView,
    
    // Render functions
    renderInlineViewContent
  };
}
