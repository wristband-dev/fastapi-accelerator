import { theme } from '@/config/theme'

export default function Home() {
  return (
      <main className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
              Home
            </h1>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              Home page content goes here.
            </p>
          </div>
        </div>
      </main>
  )
}

