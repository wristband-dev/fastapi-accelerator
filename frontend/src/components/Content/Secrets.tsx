import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { 
  KeyIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import frontendApiClient from '@/client/frontend-api-client';
import axios from 'axios';

interface Secret {
  sku: string;
  displayName: string;
  id: string;
  secret: string;
  host?: string;
}

interface SecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingSecret: Secret | null;
}

function SecretModal({ isOpen, onClose, onSave, editingSecret }: SecretModalProps) {
  const [sku, setSku] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [id, setId] = useState('');
  const [secret, setSecret] = useState('');
  const [host, setHost] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSku, setIsCheckingSku] = useState(false);
  const [skuExists, setSkuExists] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSecret) {
      setSku(editingSecret.sku);
      setDisplayName(editingSecret.displayName);
      setId(editingSecret.id);
      setSecret(editingSecret.secret);
      setHost(editingSecret.host || '');
    } else {
      // Reset form
      setSku('');
      setDisplayName('');
      setId('');
      setSecret('');
      setHost('');
      setShowSecret(false);
      setError(null);
      setSkuExists(false);
      setUrlError(null);
    }
  }, [editingSecret, isOpen]);

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlError(null);
      return true;
    }
    
    try {
      new URL(url);
      setUrlError(null);
      return true;
    } catch {
      setUrlError('Please enter a valid URL (e.g., https://api.example.com)');
      return false;
    }
  };

  const checkSkuExists = useCallback(async (skuValue: string) => {
    if (!skuValue || editingSecret?.sku === skuValue) {
      setSkuExists(false);
      return;
    }

    try {
      setIsCheckingSku(true);
      const response = await frontendApiClient.get(`/secrets/check/${skuValue}`);
      setSkuExists(response.data.exists);
      if (response.data.exists) {
        setError('A secret with this name already exists. Please choose a different name.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error checking SKU:', error);
    } finally {
      setIsCheckingSku(false);
    }
  }, [editingSecret]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sku) {
        checkSkuExists(sku);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [sku, checkSkuExists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (skuExists && !editingSecret) {
      return;
    }

    if (!validateUrl(host)) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const secretData: Secret = {
        sku,
        displayName,
        id,
        secret,
        ...(host && { host })
      };

      await frontendApiClient.post('/secrets/upsert', secretData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving secret:', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        setError(errorData?.message || 'Failed to save secret. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Panel - Optimized for mobile */}
      <div className={`fixed inset-0 sm:inset-y-0 sm:right-0 z-[9999] w-full sm:max-w-md lg:max-w-lg bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-out overflow-hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-primary-dark">
                <KeyIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {editingSecret ? 'Edit Secret' : 'Add New Secret'}
              </h3>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-safe">
                  
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name (SKU) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white transition-all duration-200 ${
                            skuExists && !editingSecret 
                              ? 'border-red-300 dark:border-red-600' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          placeholder="unique-secret-name"
                          required
                          disabled={!!editingSecret}
                        />
                        {isCheckingSku && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {editingSecret ? 'Cannot change the name of an existing secret' : 'Unique identifier for this secret'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        placeholder="My API Key"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ID *
                      </label>
                      <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        placeholder="api-key-id"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Secret Value *
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                          placeholder="••••••••••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showSecret ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Host URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={host}
                        onChange={(e) => {
                          setHost(e.target.value);
                          validateUrl(e.target.value);
                        }}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white transition-all duration-200 ${
                          urlError 
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        placeholder="https://api.example.com"
                      />
                      {urlError && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{urlError}</p>
                      )}
                    </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSubmit}
              disabled={isSaving || (skuExists && !editingSecret) || !!urlError}
              className="btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                editingSecret ? 'Update Secret' : 'Add Secret'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:mr-3 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function ItemSecrets() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  const fetchSecrets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await frontendApiClient.get('/secrets');
      setSecrets(response.data);
    } catch (error) {
      console.error('Error fetching secrets:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const filteredSecrets = secrets.filter(secret => {
    const searchLower = searchTerm.toLowerCase();
    return secret.displayName.toLowerCase().includes(searchLower) ||
           secret.sku.toLowerCase().includes(searchLower) ||
           secret.id.toLowerCase().includes(searchLower);
  });

  const handleAddSecret = () => {
    setEditingSecret(null);
    setIsModalOpen(true);
  };

  const handleEditSecret = (secret: Secret) => {
    setEditingSecret(secret);
    setIsModalOpen(true);
  };

  const handleDeleteSecret = async (sku: string) => {
    if (confirm('Are you sure you want to delete this secret? This action cannot be undone.')) {
      try {
        await frontendApiClient.delete(`/secrets/${sku}`);
        fetchSecrets();
      } catch (error) {
        console.error('Error deleting secret:', error);
        alert('Failed to delete secret. Please try again.');
      }
    }
  };

  const toggleSecretVisibility = (sku: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [sku]: !prev[sku]
    }));
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Secrets
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This is a demonstration for saving data to Firebase Firestore. Store and manage your API keys, tokens, and other sensitive information securely.
          </p>
        </div>
        
        <div className="space-y-6">
        {/* Search and Add */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search secrets..."
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            />
          </div>
          
          <button
            onClick={handleAddSecret}
            className="btn-primary px-6 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Add Secret
          </button>
        </div>

        {/* Secrets Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredSecrets.length === 0 ? (
            <div className="text-center py-12">
              <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No secrets found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Add your first secret to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Secret
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSecrets.map((secret) => (
                  <tr key={secret.sku} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {secret.displayName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {secret.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {secret.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <input
                          type={showSecrets[secret.sku] ? 'text' : 'password'}
                          value={secret.secret}
                          readOnly
                          className="text-sm bg-transparent border-none focus:outline-none text-gray-900 dark:text-white w-40"
                        />
                        <button
                          onClick={() => toggleSecretVisibility(secret.sku)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showSecrets[secret.sku] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {secret.host || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditSecret(secret)}
                          className="text-primary hover:text-primary-dark transition-colors p-1"
                          title="Edit secret"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSecret(secret.sku)}
                          className="text-red-600 hover:text-red-700 transition-colors p-1"
                          title="Delete secret"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
        </div>
      </div>

      {/* Secret Modal - Rendered outside of main container */}
      <SecretModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchSecrets}
        editingSecret={editingSecret}
      />
    </>
  );
}