import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/sidebar/Sidebar";
import Home from "@/pages/Home";
import ItemSecrets from "@/pages/Secrets";
import { useUser } from '@/contexts/UserContext';
import frontendApiClient from '@/client/frontend-api-client';
import { HomeIcon, KeyIcon } from '@heroicons/react/24/outline';
import type { NavigationItem } from '@/components/sidebar/wristband/WristbandSidebar';

// -------Set your content views here-------
const contentViews = [
  'home', 
  'secrets'
] as const;
type ContentView = typeof contentViews[number];

// Navigation configuration - add new pages here
const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'secrets', label: 'Secrets', icon: KeyIcon },
];

export default function Landing() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentContent, setCurrentContent] = useState<ContentView>(contentViews[0]);
  
  const { 
    setCurrentTenant, 
    setTenantOptions, 
    setIsLoadingTenants, 
    setUserRoles, 
    setIsLoadingRoles 
  } = useUser();

  // Fetch tenant data and user roles immediately on page load
  useEffect(() => {
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
  }, [setCurrentTenant, setTenantOptions, setIsLoadingTenants, setUserRoles, setIsLoadingRoles]);

  const handleNavigate = (itemId: string) => {
    // Map navigation item ID to content view
    if (itemId === 'home' || itemId === 'secrets') {
      setCurrentContent(itemId as ContentView);
      setIsSidebarOpen(false);
    }
  };

  const renderMainContent = () => {
    switch (currentContent) {
      case 'home':
        return <Home />;
      case 'secrets':
        return <ItemSecrets />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* 
      MARK: - Sidebar
       */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpen={() => setIsSidebarOpen(true)}
        navigationItems={navigationItems}
        onNavigate={handleNavigate}
      />

      {/* 
      MARK: - Main Content
       */}
      <div className="sm:pl-16">
        {renderMainContent()}
      </div>
    </div>
  );
}
