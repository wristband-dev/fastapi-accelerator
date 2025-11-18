import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useWristbandAuth as useWBAuth } from '@wristband/react-client-auth'
import { LandingView } from '@/components/LandingView'
import LoadingScreen from '@/components/LoadingScreen'

export default function Index() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useWBAuth()

  // Redirect authenticated users to /home
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/home')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading or landing
  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <Head>
        <title>Mobile-First Next.js App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </Head>
      
      <LandingView />
    </>
  )
}
