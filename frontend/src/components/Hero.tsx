import React from 'react';
import { redirectToLogin } from "@wristband/react-client-auth";
import { ChevronRightIcon, ShieldCheckIcon, BoltIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Hero() {
  const handleLogin = () => {
    redirectToLogin('/api/auth/login');
  };

  const handleSignUp = () => {
    // TODO: Implement signup flow
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950">
      {/* Navigation */}
      <nav className="z-10 p-6 md:absolute md:top-0 md:left-0 md:right-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img
            src="/wristband_logo.svg"
            alt="Wristband Logo"
            width={160}
            height={32}
            className="block dark:hidden"
          />
          <img
            src="/wristband_logo_dark.svg"
            alt="Wristband Logo"
            width={160}
            height={32}
            className="hidden dark:block"
          />
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Log In
            </button>
            <button
              onClick={handleSignUp}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <BoltIcon className="w-4 h-4" />
              Wristband + FastAPI Accelerator
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Launch Your SaaS in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Minutes, Not Months
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Enterprise-ready authentication and multi-tenancy for your FastAPI application. 
              Built with security, scalability, and developer experience in mind.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={handleSignUp}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg font-medium flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="https://docs.wristband.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md text-lg font-medium"
              >
                View Documentation
              </a>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Enterprise Security
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  OAuth2, CSRF protection, encrypted sessions, and automatic token refresh
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <UserGroupIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Multi-Tenant Ready
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Built-in tenant isolation, user management, and role-based access control
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BoltIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Production Ready
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  FastAPI backend, Next.js frontend, and Terraform infrastructure included
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </div>
  );
}