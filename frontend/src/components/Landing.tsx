import React, { useState, useCallback } from 'react';
import { useWristbandSession } from "@wristband/react-client-auth";
import { redirectToLogin } from "@wristband/react-client-auth";
import axios from "axios";
import SidebarButton from "@/components/Sidebar/SidebarButton";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useUser } from "@/contexts/UserContext";
import Home from "@/components/Content/Home";
import ItemSecrets from "@/components/Content/Secrets";

type ContentView = 'dashboard' | 'home' | 'secrets';

export default function Landing() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentContent, setCurrentContent] = useState<ContentView>('dashboard');

  const { metadata } = useWristbandSession();
  const { setCurrentUser, setIsLoadingUser } = useUser();

  const handleApiError = useCallback((error: unknown) => {
    console.error(error);

    if (axios.isAxiosError(error)) {
      if ([401, 403].includes(error.response?.status!)) {
        redirectToLogin('/api/auth/login');
        window.alert('Authentication required.');
      }
    } else {
      window.alert(`Error: ${error}`);
    }
  }, []);

  const handleContentSelect = (content: 'home' | 'secrets') => {
    // Map sidebar content selections to our internal content view
    const contentMap: { [K in 'home' | 'secrets']: ContentView } = {
      home: 'dashboard',
      secrets: 'secrets'
    };
    setCurrentContent(contentMap[content]);
    setIsSidebarOpen(false); // Close sidebar when content item is selected
  };

  const renderMainContent = () => {
    switch (currentContent) {
      case 'secrets':
        return <ItemSecrets />;
      case 'home':
      case 'dashboard':
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* 
      MARK: - Sidebar
       */}
      <SidebarButton 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
        isOpen={isSidebarOpen}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onContentSelect={handleContentSelect}
      />

      {/* 
      MARK: - Main Content
       */}
      {renderMainContent()}
    </div>
  );
}
