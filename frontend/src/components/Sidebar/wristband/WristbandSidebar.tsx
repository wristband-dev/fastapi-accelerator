import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

import ItemSettings from './Settings';
import ItemUsers from './Users';
import SidebarAdmin from './Admin';
import { useUser } from '@/contexts/UserContext';

export type InlineViewSection = 'user' | 'users' | 'admin';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface WristbandSidebarProps {
  navigationItems: NavigationItem[];
  onNavigate: (itemId: string) => void;
}

export default function WristbandSidebar({ navigationItems, onNavigate }: WristbandSidebarProps) {
  const [activeInlineView, setActiveInlineView] = useState<InlineViewSection>('user');
  const [lastSelectedInlineView, setLastSelectedInlineView] = useState<InlineViewSection>('user');
  const [selectedNavigationItem, setSelectedNavigationItem] = useState<string>(navigationItems[0]?.id || '');
  const { 
    hasAdminRole,
    isLoadingRoles,
    isLoadingTenants 
  } = useUser();

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

  const handleNavigationItemClick = (itemId: string) => {
    setSelectedNavigationItem(itemId);
    onNavigate(itemId);
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
    selectedNavigationItem,
    isLoadingRoles,
    isLoadingTenants,
    
    // Data
    navigationItems,
    inlineViewItems: getInlineViewItems(),
    
    // Handlers
    handleNavigationItemClick,
    handleInlineViewClick,
    setActiveInlineView,
    setLastSelectedInlineView,
    
    // Render functions
    renderInlineViewContent
  };
}
