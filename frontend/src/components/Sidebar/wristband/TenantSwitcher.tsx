import React, { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, CheckIcon, ArrowRightIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useUser } from '@/contexts/UserContext';
import { truncateDisplayString } from '@/utils/helpers';

const TenantSwitcher = () => {
  const { currentTenant, tenantOptions, isLoadingTenants } = useUser();

  // Tenant Switcher State
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState<boolean>(false);
  const currentTenantId = currentTenant?.id || '';
  const toggleTenantDropdown = () => setTenantDropdownOpen(!tenantDropdownOpen);

  // Close the dropdown if a click occurs outside of it
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tenantDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTenantDropdownOpen(false);
      }
    };

    // Attach the event listener to the document
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener when the component unmounts or menuOpen changes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tenantDropdownOpen]);

  // Show loading state while tenants are loading
  if (isLoadingTenants) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 animate-pulse">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="hidden sm:block w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  // Don't render if there are no tenant options or only one option
  if (!tenantOptions || tenantOptions.length <= 1) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggleTenantDropdown}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
          tenantDropdownOpen 
            ? 'border-primary bg-primary/5 text-primary' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary'
        }`}
      >
        <BuildingOfficeIcon className="w-4 h-4" />
        <span className="hidden sm:block max-w-[120px] truncate">
          {currentTenant?.displayName || 'Select Company'}
        </span>
        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${tenantDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {tenantDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {tenantOptions.map((tenantOption) => (
            <div
              key={tenantOption.tenantId}
              title={tenantOption.tenantDisplayName}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
              onClick={() => {
                if (tenantOption.tenantId === currentTenantId) {
                  setTenantDropdownOpen(false);
                } else {
                  window.location.href = tenantOption.tenantLoginUrl;
                }
              }}
            >
              <div className="flex items-center space-x-3">
                {tenantOption.tenantLogoUrl && (
                  <img 
                    src={tenantOption.tenantLogoUrl} 
                    alt={`${tenantOption.tenantDisplayName} logo`}
                    className="w-6 h-6 rounded object-cover"
                  />
                )}
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {truncateDisplayString(tenantOption.tenantDisplayName, 20)}
                </span>
              </div>
              
              <div className="flex items-center">
                {tenantOption.tenantId === currentTenantId ? (
                  <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantSwitcher;