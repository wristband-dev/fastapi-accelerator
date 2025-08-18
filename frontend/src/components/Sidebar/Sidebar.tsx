import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  UsersIcon, 
  ChevronRightIcon,
  KeyIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

import ItemUserSettings from './Items/UserSettings';
import ItemUsers from './Items/Users';
import ItemAdmin from './Items/Admin';
import ItemSecrets from './Items/Secrets';
import TenantSwitcher from '@/components/TenantSwitcher';
import { useUser } from '@/contexts/UserContext';
import frontendApiClient from '@/client/frontend-api-client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SidebarSection = 'user' | 'users' | 'admin' | 'secrets';

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeSection, setActiveSection] = useState<SidebarSection>('user');
  const { setCurrentTenant, setTenantOptions, setIsLoadingTenants, setUserRoles, setIsLoadingRoles, hasAdminRole } = useUser();

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

  const navigationItems = [
    { id: 'user' as const, label: 'Settings', icon: CogIcon },
    { id: 'users' as const, label: 'Users', icon: UsersIcon },
    ...(hasAdminRole ? [{ id: 'admin' as const, label: 'Admin', icon: ShieldCheckIcon }] : []),
    { id: 'secrets' as const, label: 'Secrets', icon: KeyIcon },
  ];

  // Reset active section to 'user' if user doesn't have admin role and is on admin section
  useEffect(() => {
    if (!hasAdminRole && activeSection === 'admin') {
      setActiveSection('user');
    }
  }, [hasAdminRole, activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'user':
        return <ItemUserSettings />;
      case 'users':
        return <ItemUsers />;
      case 'admin':
        return <ItemAdmin />;
      case 'secrets':
        return <ItemSecrets />;
      default:
        return <ItemUserSettings />;
    }
  };

  return (
    <>
      {/* Backdrop - only on desktop */}
      <div 
        className={`hidden sm:block fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-0 sm:inset-y-0 sm:left-0 z-50 w-full sm:max-w-lg lg:max-w-2xl xl:max-w-4xl shadow-2xl transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)'
        }}
      >
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
            {/* Navigation - now inside scrollable area */}
            <nav className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left rounded-lg transition-all duration-200 group ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-white/20'
                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                    }`}>
                      <item.icon className={`w-4 h-4 transition-all duration-200 ${
                        activeSection === item.id
                          ? 'text-white'
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`} />
                    </div>
                    <span className={`text-sm sm:text-base font-medium transition-all duration-200 ${
                      activeSection === item.id
                        ? 'text-white'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {item.label}
                    </span>
                  
                  </button>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="transform transition-all duration-300 ease-out">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 