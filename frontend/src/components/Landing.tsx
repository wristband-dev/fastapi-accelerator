import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar/Sidebar";
import Home from "@/components/Content/Home";
import ItemSecrets from "@/components/Content/Secrets";
import { useUser } from '@/contexts/UserContext';
import frontendApiClient from '@/client/frontend-api-client';

// -------Set your content views here-------
const contentViews = [
  'home', 
  'secrets'
] as const;
type ContentView = typeof contentViews[number];

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

  const handleContentSelect = (content: ContentView) => {
    setCurrentContent(content);
    setIsSidebarOpen(false);
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
        onContentSelect={handleContentSelect}
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
