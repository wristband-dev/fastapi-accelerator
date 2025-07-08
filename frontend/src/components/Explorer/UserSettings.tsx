import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { getGradientClasses, getPrimaryColor, getPrimaryLightColor, getPrimaryDarkColor } from '../../utils/theme';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserSettings() {
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  });
  
  const [password, setPassword] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const primaryColor = getPrimaryColor();
  const primaryLight = getPrimaryLightColor();
  const primaryDark = getPrimaryDarkColor();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      // TODO: Implement API call to update profile
      console.log('Updating profile:', profile);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.newPassword !== password.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      // TODO: Implement API call to update password
      console.log('Updating password');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Clear password fields on success
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="p-6 space-y-8">
      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
            style={{
              background: `linear-gradient(to right, ${primaryDark}, ${primaryColor})`,
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Profile Information
          </h3>
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter your first name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                style={{
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
                autoComplete="given-name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter your last name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                style={{
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
                autoComplete="family-name"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                style={{
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
                autoComplete="email"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full text-white py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: primaryColor,
              '--tw-ring-color': primaryColor,
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              if (!isUpdatingProfile) {
                e.currentTarget.style.backgroundColor = `${primaryColor}e6`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdatingProfile) {
                e.currentTarget.style.backgroundColor = primaryColor;
              }
            }}
          >
            {isUpdatingProfile ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${primaryLight})`,
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Change Password
          </h3>
        </div>
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={password.currentPassword}
                onChange={(e) => setPassword(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                style={{
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-xl transition-colors"
              >
                {showPasswords.current ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={password.newPassword}
                onChange={(e) => setPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter your new password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                style={{
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-xl transition-colors"
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={password.confirmPassword}
                onChange={(e) => setPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                style={{
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-xl transition-colors"
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full text-white py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: primaryColor,
              '--tw-ring-color': primaryColor,
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              if (!isUpdatingPassword) {
                e.currentTarget.style.backgroundColor = `${primaryColor}e6`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isUpdatingPassword) {
                e.currentTarget.style.backgroundColor = primaryColor;
              }
            }}
          >
            {isUpdatingPassword ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 