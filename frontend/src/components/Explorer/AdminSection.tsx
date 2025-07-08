import React, { useState } from 'react';
import { 
  BuildingOfficeIcon, 
  PhotoIcon, 
  KeyIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getGradientClasses } from '../../utils/theme';

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

export default function AdminSection() {
  const [organization, setOrganization] = useState<OrganizationSettings>({
    name: 'Acme Corporation',
    logo: null
  });

  const [oktaConfig, setOktaConfig] = useState<OktaConfig>({
    url: 'https://dev-123456.okta.com',
    domain: 'dev-123456.okta.com',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    enabled: false
  });

  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [isUpdatingOkta, setIsUpdatingOkta] = useState(false);
  const [testingOkta, setTestingOkta] = useState(false);
  const [oktaTestResult, setOktaTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleOrgUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingOrg(true);
    
    try {
      // TODO: Implement API call to update organization settings
      console.log('Updating organization:', organization);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOrganization(prev => ({
          ...prev,
          logo: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOktaUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingOkta(true);
    
    try {
      // TODO: Implement API call to update Okta configuration
      console.log('Updating Okta config:', oktaConfig);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error updating Okta config:', error);
    } finally {
      setIsUpdatingOkta(false);
    }
  };

  const handleTestOktaConnection = async () => {
    setTestingOkta(true);
    setOktaTestResult(null);
    
    try {
      // TODO: Implement API call to test Okta connection
      console.log('Testing Okta connection...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;
      setOktaTestResult({
        success,
        message: success 
          ? 'Successfully connected to Okta!' 
          : 'Failed to connect. Please check your configuration.'
      });
    } catch (error) {
      setOktaTestResult({
        success: false,
        message: 'Error testing connection. Please try again.'
      });
    } finally {
      setTestingOkta(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Organization Settings */}
      <div>
        <div className="flex items-center mb-4">
          <BuildingOfficeIcon className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Organization Settings
          </h3>
        </div>
        
        <form onSubmit={handleOrgUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={organization.name}
              onChange={(e) => setOrganization(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Organization Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-600">
                {organization.logo ? (
                  <img 
                    src={organization.logo} 
                    alt="Organization logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PhotoIcon className="w-4 h-4 mr-2" />
                  Upload Logo
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingOrg}
            className="w-full bg-gradient-to-r from-[#00AA81] to-[#00CC9A] text-white py-3 px-6 rounded-xl hover:from-[#00AA81]/90 hover:to-[#00CC9A]/90 focus:outline-none focus:ring-2 focus:ring-[#00CC9A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
          >
            {isUpdatingOrg ? 'Updating...' : 'Update Organization'}
          </button>
        </form>
      </div>

      {/* Okta Configuration */}
      <div>
        <div className="flex items-center mb-4">
          <CloudIcon className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Okta Configuration
          </h3>
        </div>

        <form onSubmit={handleOktaUpdate} className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="okta-enabled"
              checked={oktaConfig.enabled}
              onChange={(e) => setOktaConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="okta-enabled" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Enable Okta Authentication
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Okta URL
              </label>
              <input
                type="url"
                value={oktaConfig.url}
                onChange={(e) => setOktaConfig(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://dev-123456.okta.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={!oktaConfig.enabled}
                required={oktaConfig.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Domain Name
              </label>
              <input
                type="text"
                value={oktaConfig.domain}
                onChange={(e) => setOktaConfig(prev => ({ ...prev, domain: e.target.value }))}
                placeholder="dev-123456.okta.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={!oktaConfig.enabled}
                required={oktaConfig.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client ID
              </label>
              <input
                type="text"
                value={oktaConfig.clientId}
                onChange={(e) => setOktaConfig(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="your-client-id"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={!oktaConfig.enabled}
                required={oktaConfig.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Secret
              </label>
              <input
                type="password"
                value={oktaConfig.clientSecret}
                onChange={(e) => setOktaConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                placeholder="your-client-secret"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={!oktaConfig.enabled}
                required={oktaConfig.enabled}
              />
            </div>
          </div>

          {oktaConfig.enabled && (
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleTestOktaConnection}
                disabled={testingOkta}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <KeyIcon className="w-4 h-4 mr-2" />
                {testingOkta ? 'Testing...' : 'Test Connection'}
              </button>
              
              {oktaTestResult && (
                <div className={`flex items-center px-3 py-2 rounded-md ${
                  oktaTestResult.success 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {oktaTestResult.success ? (
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  )}
                  <span className="text-sm">{oktaTestResult.message}</span>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingOkta}
            className="w-full bg-gradient-to-r from-[#00CC9A] to-[#00FFC1] text-white py-3 px-6 rounded-xl hover:from-[#00CC9A]/90 hover:to-[#00FFC1]/90 focus:outline-none focus:ring-2 focus:ring-[#00FFC1] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
          >
            {isUpdatingOkta ? 'Updating...' : 'Update Okta Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
} 