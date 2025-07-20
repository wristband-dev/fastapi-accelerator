import React, { useState } from 'react';
import { 
  BuildingOfficeIcon, 
  PhotoIcon, 
  KeyIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface OrganizationSettings {
  name: string;
  logo: string | null;
}

interface OktaConfig {
  url: string;
  domain: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export default function ItemAdmin() {
  const [organization, setOrganization] = useState<OrganizationSettings>({
    name: 'Acme Corporation',
    logo: null
  });

  const [okta, setOkta] = useState<OktaConfig>({
    url: '',
    domain: '',
    clientId: '',
    clientSecret: '',
    enabled: false
  });

  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [isUpdatingOkta, setIsUpdatingOkta] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);

  const handleOrganizationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingOrg(true);
    
    try {
      // TODO: Implement API call to update organization
      console.log('Updating organization:', organization);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  const handleOktaUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingOkta(true);
    
    try {
      // TODO: Implement API call to update Okta config
      console.log('Updating Okta config:', okta);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error updating Okta config:', error);
    } finally {
      setIsUpdatingOkta(false);
    }
  };

  const testOktaConnection = async () => {
    // TODO: Implement connection test
    console.log('Testing Okta connection...');
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
        <form onSubmit={handleOrganizationUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={organization.name}
              onChange={(e) => setOrganization(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter organization name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                {organization.logo ? (
                  <img src={organization.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Upload Logo
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isUpdatingOrg}
            className="w-full btn-primary py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isUpdatingOrg ? (
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

        <form onSubmit={handleOktaUpdate} className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={okta.enabled}
                onChange={(e) => setOkta(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Okta SSO
              </span>
            </label>
            {okta.enabled && (
              <button
                type="button"
                onClick={testOktaConnection}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Test Connection
              </button>
            )}
          </div>

          {okta.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Okta URL
                </label>
                <input
                  type="url"
                  value={okta.url}
                  onChange={(e) => setOkta(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-domain.okta.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  required={okta.enabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={okta.domain}
                  onChange={(e) => setOkta(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="your-domain"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  required={okta.enabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={okta.clientId}
                  onChange={(e) => setOkta(prev => ({ ...prev, clientId: e.target.value }))}
                  placeholder="0oa..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  required={okta.enabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showClientSecret ? 'text' : 'password'}
                    value={okta.clientSecret}
                    onChange={(e) => setOkta(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="Enter client secret"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                    required={okta.enabled}
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showClientSecret ? 
                      <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" /> : 
                      <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                </div>
              </div>
            </>
          )}
          
          <button
            type="submit"
            disabled={isUpdatingOkta || !okta.enabled}
            className="w-full btn-primary py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isUpdatingOkta ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update SSO Configuration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}