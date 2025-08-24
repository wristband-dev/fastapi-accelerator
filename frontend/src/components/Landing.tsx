import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar/Sidebar";
import Home from "@/components/Content/Home";
import ItemSecrets from "@/components/Content/Secrets";

// -------Set your content views here-------
const contentViews = [
  'home', 
  'secrets'
] as const;
type ContentView = typeof contentViews[number];

export default function Landing() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentContent, setCurrentContent] = useState<ContentView>(contentViews[0]);

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
