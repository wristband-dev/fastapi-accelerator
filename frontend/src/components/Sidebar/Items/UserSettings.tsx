import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { redirectToLogout } from "@wristband/react-client-auth";
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import frontendApiClient from '@/client/frontend-api-client';
import axios from 'axios';

interface UserProfileData {
  firstName: string;
  lastName: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ItemUserSettings() {
  const { currentUser, isLoadingUser, setCurrentUser } = useUser();
  const { theme, effectiveTheme, setTheme } = useTheme();
  
  // Get system theme for display
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: '',
    lastName: ''
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasCurrentPassword: false,
    hasNewPassword: false,
    passwordsMatch: false,
    isNewPasswordValid: false
  });
  
  // Track if profile data has changed
  const hasProfileDataChanged = () => {
    if (!currentUser) return false;
    return profile.firstName !== (currentUser.givenName || '') || 
           profile.lastName !== (currentUser.familyName || '');
  };

  // Update profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfile({
        firstName: currentUser.givenName || '',
        lastName: currentUser.familyName || ''
      });
    }
  }, [currentUser]);

  // Real-time password validation
  useEffect(() => {
    const hasCurrentPassword = password.currentPassword.trim().length > 0;
    const hasNewPassword = password.newPassword.trim().length >= 8;
    const passwordsMatch = password.newPassword === password.confirmPassword && password.confirmPassword.length > 0;
    const isNewPasswordValid = password.newPassword.length >= 8 && password.newPassword.length <= 64;

    setPasswordValidation({
      hasCurrentPassword,
      hasNewPassword,
      passwordsMatch,
      isNewPasswordValid
    });
  }, [password.currentPassword, password.newPassword, password.confirmPassword]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      const response = await frontendApiClient.patch('/user/me', {
        givenName: profile.firstName,
        familyName: profile.lastName
      });
      
      // Update the current user in context with the updated data
      setCurrentUser(response.data);
      
      // Show success message (you can implement a toast system later)
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (password.newPassword !== password.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (password.currentPassword === password.newPassword) {
      alert('New password must be different from current password');
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      await frontendApiClient.post('/user/me/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });
      
      // Clear password fields on success
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success message
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (error.response?.status === 400) {
          alert(errorData?.message || 'Password change failed. Please check your current password or ensure your new password meets security requirements.');
        } else if (error.response?.status === 403) {
          alert(errorData?.message || 'You are not authorized to change passwords. Please contact your administrator to enable password change permissions.');
        } else {
          alert('An error occurred while updating your password. Please try again.');
        }
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
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

  const handleLogout = () => {
    setIsLoggingOut(true);
    redirectToLogout('/api/auth/logout');
  };

  return (
    <div className="p-6 space-y-8">
      {/* 
      MARK: - Profile Information
      */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-gradient-to-r from-primary-dark to-primary">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Profile Information
          </h3>
        </div>
        {isLoadingUser ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  autoComplete="given-name"
                  required
                  disabled={isLoadingUser}
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                autoComplete="family-name"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {currentUser?.email || 'Loading...'}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isUpdatingProfile || !hasProfileDataChanged()}
            className="w-full btn-primary py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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
        )}
      </div>

      {/* 
      MARK: - Password Change
      */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-gradient-to-r from-primary to-primary-light">
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={64}
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={64}
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Password must be 8-64 characters long
            </p>
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
                className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 ${
                  password.confirmPassword.length > 0 
                    ? passwordValidation.passwordsMatch 
                      ? 'border-green-300 dark:border-green-600' 
                      : 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={64}
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
            {password.confirmPassword.length > 0 && (
              <p className={`text-xs mt-1 ${passwordValidation.passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {passwordValidation.passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isUpdatingPassword || !passwordValidation.hasCurrentPassword || !passwordValidation.hasNewPassword || !passwordValidation.passwordsMatch || !passwordValidation.isNewPasswordValid}
            className="w-full btn-primary py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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

      {/* 
      MARK: - Theme Preferences
      */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-gradient-to-r from-primary to-primary-light">
            {effectiveTheme === 'dark' ? (
              <MoonIcon className="w-5 h-5 text-white" />
            ) : (
              <SunIcon className="w-5 h-5 text-white" />
            )}
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Theme Preferences
          </h3>
        </div>
        


        <div className="space-y-3">
          {/* Light Theme Option */}
          <button
            onClick={() => setTheme('light')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              theme === 'light'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                theme === 'light' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <SunIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">Light</div>
              </div>
            </div>
            {theme === 'light' && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>

          {/* Dark Theme Option */}
          <button
            onClick={() => setTheme('dark')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                theme === 'dark' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <MoonIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">Dark</div>
              </div>
            </div>
            {theme === 'dark' && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>

          {/* System Theme Option */}
          <button
            onClick={() => setTheme('system')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              theme === 'system'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                theme === 'system' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <ComputerDesktopIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">System</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Currently {getSystemTheme()}</div>
              </div>
            </div>
            {theme === 'system' && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        </div>


      </div>

      {/* 
      MARK: - Logout Section
      */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-red-100 dark:bg-red-900"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Sign Out
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          End your current session and return to the login page.
        </p>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full text-white py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 bg-red-600 hover:bg-red-700"
        >
          {isLoggingOut ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging out...
            </span>
          ) : (
            'Sign Out'
          )}
        </button>
      </div>
    </div>
  );
} 