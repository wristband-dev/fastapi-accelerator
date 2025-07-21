import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  PhotoIcon, 
  KeyIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useUser } from '@/contexts/UserContext';
import frontendApiClient from '@/client/frontend-api-client';
import axios from 'axios';

interface TenantData {
  id: string;
  displayName: string;
  logoUrl: string | null;
}

interface IdentityProviderDto {
  id?: string;
  type: string;
  ownerType: string;
  ownerId: string;
  name: string;
  displayName: string;
  domainName: string;
  status: 'ENABLED' | 'DISABLED';
  protocol: {
    type: string;
    clientId: string;
    clientSecret: string;
  };
  jitProvisioningEnabled: boolean;
}

export default function ItemAdmin() {
  const { currentUser } = useUser();
  
  // Tenant/Organization state
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [tenantDisplayName, setTenantDisplayName] = useState<string>('');
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string>('');
  const [isUpdateTenantInProgress, setIsUpdateTenantInProgress] = useState(false);
  
  // Okta IDP state
  const [currentOktaIdp, setCurrentOktaIdp] = useState<IdentityProviderDto | null>(null);
  const [domainName, setDomainName] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isOktaEnabled, setIsOktaEnabled] = useState<boolean>(true);
  const [isOktaIdpInProgress, setOktaIdpInProgress] = useState<boolean>(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  
  // Initialize tenant data when user loads
  useEffect(() => {
    if (currentUser?.tenantId) {
      // Initialize with basic tenant info from user context
      const initialTenant: TenantData = {
        id: currentUser.tenantId,
        displayName: '', // Will be loaded from API
        logoUrl: null
      };
      setTenant(initialTenant);
      loadTenantData();
    }
  }, [currentUser]);
  
  const loadTenantData = async () => {
    try {
      const response = await frontendApiClient.get('/tenant/me');
      const tenantData = response.data;
      setTenant(tenantData);
      setTenantDisplayName(tenantData.displayName || '');
      setTenantLogoUrl(tenantData.logoUrl || '');
    } catch (error) {
      console.error('Error loading tenant data:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
      }
    }
  };

  const handleTenantDisplayNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdateTenantInProgress(true);
    
    try {
      // Update tenant via API
      const response = await frontendApiClient.patch('/tenant/me', {
        displayName: tenantDisplayName,
        logoUrl: tenantLogoUrl || null
      });
      
      // Update local state with response
      const updatedTenant = response.data;
      setTenant(updatedTenant);
      
      console.log('Tenant updated successfully:', updatedTenant);
      // TODO: Add toast notification
    } catch (error) {
      console.error('Error updating tenant:', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (error.response?.status === 400) {
          alert(errorData?.message || 'Invalid tenant data. Please check your inputs.');
        } else {
          alert('An error occurred while updating the organization. Please try again.');
        }
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsUpdateTenantInProgress(false);
    }
  };

  const handleUpsertOktaIdp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOktaIdpInProgress(true);
    
    try {
      const idpData: IdentityProviderDto = {
        type: 'OKTA',
        ownerType: 'TENANT',
        ownerId: currentUser?.tenantId || '',
        name: 'okta',
        displayName: 'Okta',
        domainName,
        status: isOktaEnabled ? 'ENABLED' : 'DISABLED',
        protocol: {
          type: 'OAUTH2',
          clientId,
          clientSecret
        },
        jitProvisioningEnabled: true
      };
      
      const response = await frontendApiClient.post('/idp/upsert', { idp: idpData });
      const upsertedIdp = response.data;
      setCurrentOktaIdp(upsertedIdp);
      
      console.log('Okta IDP upserted successfully:', upsertedIdp);
      // TODO: Add toast notification
    } catch (error) {
      console.error('Error upserting Okta IDP:', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (error.response?.status === 400) {
          alert(errorData?.message || 'Invalid Okta configuration. Please check your inputs.');
        } else {
          alert('An error occurred while configuring Okta SSO. Please try again.');
        }
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setOktaIdpInProgress(false);
    }
  };

  const testOktaConnection = async () => {
    try {
      // TODO: Implement connection test API call
      console.log('Testing Okta connection...');
      alert('Connection test feature coming soon!');
    } catch (error) {
      console.error('Error testing Okta connection:', error);
      alert('Connection test failed. Please check your configuration.');
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Organization Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-gradient-to-r from-primary-dark to-primary">
            <BuildingOfficeIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Organization Settings
          </h3>
        </div>
        <form onSubmit={handleTenantDisplayNameSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={tenantDisplayName}
              onChange={(e) => setTenantDisplayName(e.target.value)}
              placeholder="Enter organization name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              required
              maxLength={60}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum 60 characters
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Logo URL
            </label>
            <input
              type="url"
              value={tenantLogoUrl}
              onChange={(e) => setTenantLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum 2000 characters. Leave empty for no logo.
            </p>
            {tenantLogoUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo Preview
                </label>
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                  <img 
                    src={tenantLogoUrl} 
                    alt="Logo Preview" 
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isUpdateTenantInProgress || !tenantDisplayName.trim()}
            className="w-full btn-primary py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isUpdateTenantInProgress ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Organization'
            )}
          </button>
        </form>
      </div>

      {/* SSO Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-gradient-to-r from-primary to-primary-light">
            <KeyIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            SSO Configuration
          </h3>
        </div>
        
        <div className="mb-6 p-4 bg-info/10 border border-info/20 rounded-xl flex items-start space-x-3">
          <CloudIcon className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-info">Okta Integration</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure Okta SSO for seamless enterprise authentication
            </p>
          </div>
        </div>

        <form onSubmit={handleUpsertOktaIdp} className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isOktaEnabled}
                onChange={(e) => setIsOktaEnabled(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Okta SSO
              </span>
            </label>
            {isOktaEnabled && (
              <button
                type="button"
                onClick={testOktaConnection}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Test Connection
              </button>
            )}
          </div>

          {isOktaEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  placeholder="your-domain.okta.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  required={isOktaEnabled}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your full Okta domain (e.g., company.okta.com)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="0oa..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  required={isOktaEnabled}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Found in your Okta application settings
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showClientSecret ? 'text' : 'password'}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Enter client secret"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                    required={isOktaEnabled}
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-xl transition-colors"
                  >
                    {showClientSecret ? 
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" /> : 
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    }
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Found in your Okta application settings
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Setup Instructions
                </h4>
                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Create a new OIDC application in your Okta Admin Console</li>
                  <li>Set the application type to "Web Application"</li>
                  <li>Configure redirect URIs in your Okta application</li>
                  <li>Copy the Client ID and Client Secret from Okta to the fields above</li>
                </ol>
              </div>
            </>
          )}
          
          <button
            type="submit"
            disabled={isOktaIdpInProgress || !isOktaEnabled || (isOktaEnabled && (!domainName.trim() || !clientId.trim() || !clientSecret.trim()))}
            className="w-full btn-primary py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isOktaIdpInProgress ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {currentOktaIdp ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              currentOktaIdp ? 'Update SSO Configuration' : 'Create SSO Configuration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}