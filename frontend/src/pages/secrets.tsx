import { useState, useEffect } from 'react'
import { theme } from '@/config/theme'
import frontendApiClient from '@/client/frontend-api-client'
import axios from 'axios'
import { Icon } from '@/components/Icon'

interface Secret {
  name: string
  displayName: string
  environmentId: string
  token: string
}

export default function Secrets() {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [environmentId, setEnvironmentId] = useState('')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Track which secrets are visible
  const [visibleSecrets, setVisibleSecrets] = useState<{ [key: string]: boolean }>({})

  // Fetch secrets
  useEffect(() => {
    fetchSecrets()
  }, [])

  const fetchSecrets = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await frontendApiClient.get('/secrets')
      setSecrets(response.data)
    } catch (error) {
      console.error('Error fetching secrets:', error)
      if (axios.isAxiosError(error)) {
        const errorType = error.response?.data?.error
        if (errorType === 'datastore_unavailable') {
          setError('Datastore not enabled')
        } else if (errorType === 'encryption_unavailable') {
          setError('Encryption service not available')
        } else {
          setError('Failed to load secrets')
        }
      } else {
        setError('Failed to load secrets')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSaving(true)
    setError(null)

    try {
      const secretData: Secret = {
        name,
        displayName,
        environmentId,
        token,
      }

      await frontendApiClient.post('/secrets/upsert', secretData)
      
      // Reset form and refresh list
      setName('')
      setDisplayName('')
      setEnvironmentId('')
      setToken('')
      setShowForm(false)
      
      await fetchSecrets()
    } catch (error) {
      console.error('Error saving secret:', error)
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data
        if (errorData?.error === 'datastore_unavailable') {
          setError('Datastore not enabled')
        } else if (errorData?.error === 'encryption_unavailable') {
          setError('Encryption service not available')
        } else if (errorData?.error === 'encryption_error') {
          setError('Failed to encrypt secret')
        } else {
          setError(errorData?.message || 'Failed to save secret')
        }
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (secretName: string) => {
    if (!confirm('Are you sure you want to delete this secret?')) {
      return
    }

    try {
      await frontendApiClient.delete(`/secrets/${secretName}`)
      await fetchSecrets()
    } catch (error) {
      console.error('Error deleting secret:', error)
      alert('Failed to delete secret')
    }
  }

  if (error && error.includes('Encryption service') && !showForm) {
    return (
      <main className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8" style={{ color: theme.colors.textPrimary }}>
            Secrets
          </h1>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <p className="text-sm" style={{ color: '#ef4444' }}>
              {error}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
            Secrets
          </h1>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
            Store encrypted secrets in database.
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-target"
            style={{
              backgroundColor: theme.colors.primary,
              color: 'white'
            }}
          >
            {showForm ? 'Cancel' : '+ Add Secret'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <p className="text-sm" style={{ color: '#ef4444' }}>
              {error}
            </p>
          </div>
        )}

        {/* Add Secret Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                  Name (unique identifier)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: theme.colors.textPrimary
                  }}
                  placeholder="my-secret-key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: theme.colors.textPrimary
                  }}
                  placeholder="My Secret Key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                  Environment ID
                </label>
                <input
                  type="text"
                  value={environmentId}
                  onChange={(e) => setEnvironmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: theme.colors.textPrimary
                  }}
                  placeholder="prod-env-123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                  Secret Value
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: theme.colors.textPrimary
                    }}
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    <Icon name={showToken ? 'eye-off' : 'eye'} size={16} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  opacity: isSaving ? 0.5 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save Secret'}
              </button>
            </div>
          </form>
        )}

        {/* Secrets List */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Loading...
              </p>
            </div>
          ) : secrets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                No secrets yet. Add your first secret to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              {secrets.map((secret) => (
                <div key={secret.name} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                        {secret.displayName}
                      </h3>
                      <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                        {secret.name}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            Env ID:
                          </span>
                          <code className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: theme.colors.textTertiary }}>
                            {secret.environmentId}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            Token:
                          </span>
                          <code className="text-xs px-2 py-1 rounded font-mono flex-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: theme.colors.textTertiary, wordBreak: 'break-all' }}>
                            {visibleSecrets[secret.name] ? secret.token : '••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => setVisibleSecrets(prev => ({ ...prev, [secret.name]: !prev[secret.name] }))}
                            className="p-1 rounded hover:opacity-70 transition-opacity"
                            style={{ color: theme.colors.textSecondary }}
                            title={visibleSecrets[secret.name] ? 'Hide token' : 'Show token'}
                          >
                            <Icon name={visibleSecrets[secret.name] ? 'eye-off' : 'eye'} size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(secret.name)}
                      className="ml-4 px-3 py-1 rounded text-xs transition-colors"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
