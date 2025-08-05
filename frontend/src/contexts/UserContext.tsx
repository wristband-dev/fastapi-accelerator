import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/models/user';
import { Tenant, TenantOption } from '@/models/tenant';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoadingUser: boolean;
  setIsLoadingUser: (loading: boolean) => void;
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  tenantOptions: TenantOption[];
  setTenantOptions: (options: TenantOption[]) => void;
  isLoadingTenants: boolean;
  setIsLoadingTenants: (loading: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenantOptions, setTenantOptions] = useState<TenantOption[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      isLoadingUser, 
      setIsLoadingUser,
      currentTenant,
      setCurrentTenant,
      tenantOptions,
      setTenantOptions,
      isLoadingTenants,
      setIsLoadingTenants
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}