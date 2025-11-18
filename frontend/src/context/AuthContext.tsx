/**
 * Wrapper around Wristband Auth hooks for easier consumption
 * Re-exports Wristband functionality and adds custom field accessors
 */

import { useWristbandAuth as useWBAuth, useWristbandSession, redirectToLogin } from '@wristband/react-client-auth'

interface CustomSessionMetadata {
  email?: string
  tenantName?: string
  idpName?: string
  tenantId?: string
  userId?: string
}

export function useWristbandAuth() {
  const { isAuthenticated, isLoading } = useWBAuth()
  const { metadata } = useWristbandSession<CustomSessionMetadata>()

  const login = () => {
    redirectToLogin(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:6001'}/api/auth/login`)
  }

  const signup = () => {
    window.location.href = process.env.NEXT_PUBLIC_APPLICATION_SIGNUP_URL || ''
  }

  const logout = () => {
    window.location.href = '/api/auth/logout'
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    // Custom fields from session metadata
    email: metadata?.email,
    tenantName: metadata?.tenantName,
    tenantType: 'Organization',
    idpName: metadata?.idpName ,
    userId: metadata?.userId ,
    tenantId: metadata?.tenantId ,
  }
}
