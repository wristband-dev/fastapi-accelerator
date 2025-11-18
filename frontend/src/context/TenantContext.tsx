import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Tenant {
  id: string;
  displayName: string;
  logoUrl: string | null;
  domainName?: string;
  vanityDomain?: string;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  isLoadingTenant: boolean;
  setIsLoadingTenant: (loading: boolean) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);

  return (
    <TenantContext.Provider value={{ 
      currentTenant, 
      setCurrentTenant, 
      isLoadingTenant, 
      setIsLoadingTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

