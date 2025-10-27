import React, { useEffect, useRef, useState } from 'react';
import { redirectToLogin } from "@wristband/react-client-auth";
import { ChevronRightIcon, RocketLaunchIcon, ShieldCheckIcon, CloudIcon, CubeIcon, CircleStackIcon, BoltIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Custom hook for intersection observer to trigger animations on scroll
 * @param threshold - Intersection threshold (0-1)
 * @param rootMargin - Root margin for intersection observer
 * @returns [ref, isVisible] - Reference to attach to element and visibility state
 */
function useIntersectionObserver(
  threshold: number = 0.1,
  rootMargin: string = '0px 0px -100px 0px'
): [React.RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Once visible, disconnect observer to prevent re-triggering
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, isVisible]);

  return [ref, isVisible];
}

/**
 * Animation wrapper component for scroll-triggered animations
 * @param children - Child components to animate
 * @param delay - Animation delay in milliseconds
 * @param className - Additional CSS classes
 */
interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function AnimatedSection({ children, delay = 0, className = '' }: AnimatedSectionProps) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    >
      {children}
    </div>
  );
}

/**
 * UnauthenticatedView Component
 * 
 * Landing page showcasing the Multi-Tenant App Accelerator features
 */
export default function UnauthenticatedView() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Handles user login by redirecting to Wristband auth
   */
  const handleLogin = () => {
    redirectToLogin(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:6001'}/api/auth/login`);
  };

  /**
   * Handles user signup by redirecting to configured signup URL
   */
  const handleSignUp = () => {
    window.location.href = process.env.NEXT_PUBLIC_APPLICATION_SIGNUP_URL || '';
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 p-4 md:p-6 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img
            src="/logo_light.svg"
            alt="Wristband Logo"
            width={160}
            height={32}
            className="block dark:hidden"
          />
          <img
            src="/logo_dark.svg"
            alt="Wristband Logo"
            width={160}
            height={32}
            className="hidden dark:block"
          />
          
          <div className="hidden xs:flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="group px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:-translate-y-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Log In
            </button>
            <button
              onClick={handleSignUp}
              className="group px-4 py-2 btn-primary rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 transform"
            >
              Sign Up
            </button>
          </div>

          <div className="xs:hidden">
            <button
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-menu" className="xs:hidden absolute left-0 right-0 top-full z-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ring-1 ring-black/5 p-3 flex flex-col gap-2">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogin(); }}
                  className="group w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-center font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Log In
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleSignUp(); }}
                  className="group w-full px-4 py-2 btn-primary rounded-md font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:scale-105 transform"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 1: Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 md:pt-0">
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="group inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light px-4 py-2 rounded-full text-sm font-medium mb-8 hover:bg-primary/20 dark:hover:bg-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <RocketLaunchIcon className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
              Multi-Tenant App Accelerator
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Build Multi-Tenant SaaS{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
                In Minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Enterprise-ready authentication, multi-tenant architecture, and cloud infrastructure — 
              all configured and ready to deploy with <span className="font-semibold text-gray-900 dark:text-white">FastAPI</span> and <span className="font-semibold text-gray-900 dark:text-white">Next.js</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignUp}
                className="group px-8 py-4 btn-primary rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-105 text-lg font-medium flex items-center justify-center gap-2 transform"
              >
                Get Started
                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
              <a
                href="https://github.com/wristband-dev/fastapi-accelerator"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 text-lg font-medium flex items-center justify-center gap-2 transform hover:border-primary dark:hover:border-primary"
              >
                View on GitHub
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </AnimatedSection>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/60 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/60 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/60 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* SECTION 2: Features */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection delay={200}>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Everything You Need
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-dark mx-auto mb-6 rounded-full"></div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Production-ready from day one
              </p>
            </div>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <AnimatedSection delay={300}>
              <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Enterprise Authentication
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Secure Wristband auth integration with OAuth2, OIDC, and role-based access control out of the box
                  </p>
                </div>
                
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-16 -mb-16 opacity-50"></div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <CubeIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Multi-Tenant Architecture
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Built-in tenant management with strict isolation, perfect for B2B SaaS applications
                  </p>
                </div>
                
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full -mr-16 -mb-16 opacity-50"></div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={500}>
              <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <CloudIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Cloud-Ready
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Deploy to GCP Cloud Run and Vercel with Terraform. Infrastructure as code included
                  </p>
                </div>
                
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-full -mr-16 -mb-16 opacity-50"></div>
              </div>
            </AnimatedSection>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            <AnimatedSection delay={600}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <BoltIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">FastAPI Backend</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">High-performance Python API</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={650}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Next.js Frontend</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Modern React-based UI</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={700}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <CircleStackIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Firebase Integration</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Optional document storage</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={750}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Security First</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">CSRF protection & secure sessions</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* SECTION 3: Authentication & Security */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Powered by Wristband
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Enterprise-grade authentication that's secure by default, truly multi-tenant, and ungated for small businesses
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left side - Wristband info */}
                <div className="flex-1 text-center lg:text-left">
                  <img
                    src="/wristband-logo-dark.svg"
                    alt="Wristband Authentication Platform Logo"
                    className="h-12 w-auto mx-auto lg:mx-0 mb-6"
                  />
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 max-w-md mx-auto lg:mx-0">
                    Built on Wristband's proven multi-tenant authentication platform, trusted by B2B SaaS companies worldwide for secure, scalable user management.
                  </p>
                  <a
                    href="https://www.wristband.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 text-sm font-medium transform"
                    aria-label="Learn more about Wristband authentication platform (opens in new tab)"
                  >
                    Learn More About Wristband
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                
                {/* Right side - Security features */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:-translate-y-1">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">OAuth2 & OIDC</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Industry-standard protocols</p>
                    </div>
                    
                    <div className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:-translate-y-1">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Multi-Tenant</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Strict tenant isolation</p>
                    </div>
                    
                    <div className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:-translate-y-1">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">RBAC</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Role-based access control</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}