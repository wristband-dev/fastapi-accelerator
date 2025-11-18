import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '@/styles/globals.css'
import { WristbandAuthProvider } from '@wristband/react-client-auth'
import { AuthenticatedLayout } from '@/layout/AuthenticatedLayout'
import { UserProvider } from '@/context/UserContext'
import { TenantProvider } from '@/context/TenantContext'

// Routes that should NOT have the authenticated layout (sidebar)
const publicRoutes = ['/']

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isPublicRoute = publicRoutes.includes(router.pathname)

  return (
    <WristbandAuthProvider
      loginUrl={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:6001'}/api/auth/login`}
      sessionUrl="/api/auth/session"
      disableRedirectOnUnauthenticated={true}
    >
      <UserProvider>
        <TenantProvider>
          {isPublicRoute ? (
            <Component {...pageProps} />
          ) : (
            <AuthenticatedLayout title={getTitleFromPath(router.pathname)}>
              <Component {...pageProps} />
            </AuthenticatedLayout>
          )}
        </TenantProvider>
      </UserProvider>
    </WristbandAuthProvider>
  )
}

function getTitleFromPath(pathname: string): string {
  const path = pathname.slice(1)
  if (!path) return 'Home'
  return path.charAt(0).toUpperCase() + path.slice(1)
}
