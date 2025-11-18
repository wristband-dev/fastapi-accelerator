import { useWristbandAuth } from '@/context/AuthContext'
import { theme } from '@/config/theme'

export function LandingView() {
  const { login, signup } = useWristbandAuth()

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{ backgroundColor: theme.colors.landingBg }}
    >
      <div className="text-center">
        <h1 className="text-2xl font-medium mb-6" style={{ color: theme.colors.landingText }}>
          Welcome
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={login}
            className="touch-target text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.colors.buttonBg,
              color: theme.colors.textPrimary
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.buttonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.buttonBg}
          >
            Login
          </button>
          <button
            onClick={signup}
            className="touch-target text-sm font-medium px-5 py-2.5 rounded-lg border-2 transition-colors"
            style={{ 
              borderColor: theme.colors.buttonBg,
              color: theme.colors.buttonBg,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.buttonBg
              e.currentTarget.style.color = theme.colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = theme.colors.buttonBg
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </main>
  )
}

