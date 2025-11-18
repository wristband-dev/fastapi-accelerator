import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, ReactNode } from 'react'
import { useWristbandAuth, useWristbandSession } from '@wristband/react-client-auth'
import { Sidebar } from '@/components/Sidebar'
import LoadingScreen from '@/components/LoadingScreen'
import { useUser } from '@/context/UserContext'
import { useTenant } from '@/context/TenantContext'
import frontendApiClient from '@/client/frontend-api-client'

interface AuthenticatedLayoutProps {
  children: ReactNode
  title: string
}

export function AuthenticatedLayout({ children, title }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useWristbandAuth()
  const { metadata } = useWristbandSession()
  const { 
    setCurrentUser, 
    setIsLoadingUser,
    setTenantOptions, 
    setIsLoadingTenants,
    setUserRoles,
    setIsLoadingRoles
  } = useUser()
  const {
    setCurrentTenant,
    setIsLoadingTenant
  } = useTenant()

  // The WristbandAuthProvider automatically calls the session endpoint on every page load
  // This ensures fresh session data is fetched from the backend each time
  
  // Redirect unauthenticated users to landing
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Scroll to top with animation when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    // Scroll immediately on mount
    handleRouteChange()
    
    // Listen for route changes
    router.events?.on('routeChangeComplete', handleRouteChange)
    
    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.pathname, router.events])

  // Fetch user and tenant data when layout mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!metadata) return

      try {
        setIsLoadingUser(true)
        setIsLoadingTenants(true)
        setIsLoadingRoles(true)
        setIsLoadingTenant(true)
        
        // Fetch user data, tenant info, tenant options, and roles in parallel
        const [userResponse, tenantResponse, optionsResponse, rolesResponse] = await Promise.all([
          frontendApiClient.get('/user/me'),
          frontendApiClient.get('/tenant/me'),
          frontendApiClient.get('/tenant/options'),
          frontendApiClient.get('/user/me/roles')
        ])
        
        setCurrentUser(userResponse.data)
        setCurrentTenant(tenantResponse.data)
        setTenantOptions(optionsResponse.data)
        setUserRoles(rolesResponse.data)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoadingUser(false)
        setIsLoadingTenant(false)
        setIsLoadingTenants(false)
        setIsLoadingRoles(false)
      }
    }

    fetchUserData()
  }, [metadata, setCurrentUser, setIsLoadingUser, setCurrentTenant, setIsLoadingTenant, setTenantOptions, setIsLoadingTenants, setUserRoles, setIsLoadingRoles])

  // Show loading screen while authenticating
  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />
  }

  return (
    <>
      <Head>
        <title>{title} - Mobile App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </Head>
      
      <Sidebar>
        {children}
      </Sidebar>
    </>
  )
}
