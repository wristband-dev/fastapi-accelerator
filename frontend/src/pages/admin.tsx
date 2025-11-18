import { useWristbandAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { theme } from '@/config/theme'
import { useState, useEffect } from 'react'
import frontendApiClient from '@/client/frontend-api-client'
import { Toast } from '@/components/Toast'
import { IdpCard } from '@/components/IdpCard'
import { IdentityProvider } from '@/types/wristband/idp'

interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export default function Admin() {
  const { tenantName } = useWristbandAuth()
  const { currentTenant, setCurrentTenant, isLoadingTenant } = useTenant()
  
  // Form state
  const [displayName, setDisplayName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // SSO state
  const [identityProviders, setIdentityProviders] = useState<IdentityProvider[]>([])
  const [isLoadingIdps, setIsLoadingIdps] = useState(false)
  
  // Google SSO state
  const [showGoogleForm, setShowGoogleForm] = useState(false)
  const [googleMetadataFile, setGoogleMetadataFile] = useState<File | null>(null)
  const [isUploadingGoogle, setIsUploadingGoogle] = useState(false)
  const [googleSpEntityId, setGoogleSpEntityId] = useState('')
  const [googleAcsUrl, setGoogleAcsUrl] = useState('')
  const [copiedSpEntityId, setCopiedSpEntityId] = useState(false)
  const [copiedAcsUrl, setCopiedAcsUrl] = useState(false)
  
  // Okta SSO state
  const [showOktaForm, setShowOktaForm] = useState(false)
  const [oktaDomain, setOktaDomain] = useState('')
  const [oktaClientId, setOktaClientId] = useState('')
  const [oktaClientSecret, setOktaClientSecret] = useState('')
  const [showOktaSecret, setShowOktaSecret] = useState(false)
  const [isSavingOkta, setIsSavingOkta] = useState(false)
  const [oktaRedirectUrl, setOktaRedirectUrl] = useState('')
  const [copiedOktaRedirect, setCopiedOktaRedirect] = useState(false)
  const [currentOktaIdp, setCurrentOktaIdp] = useState<IdentityProvider | null>(null)
  
  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Update form when tenant data loads from context
  useEffect(() => {
    if (currentTenant) {
      setDisplayName(currentTenant.displayName || '')
      setLogoUrl(currentTenant.logoUrl || '')
    }
  }, [currentTenant])

  // Load identity providers
  useEffect(() => {
    loadIdentityProviders()
    loadOktaRedirectUrl()
  }, [])

  const loadIdentityProviders = async () => {
    try {
      setIsLoadingIdps(true)
      const response = await frontendApiClient.get('/idp/providers')
      const providers = response.data || []
      setIdentityProviders(providers)
      
      // Extract Google SAML details
      const googleIdp = providers.find((idp: IdentityProvider) => idp.type === 'GOOGLE_WORKSPACE' && idp.protocol?.type === 'SAML2')
      if (googleIdp?.protocol) {
        setGoogleSpEntityId(googleIdp.protocol.spEntityId || '')
        setGoogleAcsUrl(googleIdp.protocol.acsUrl || '')
      }
      
      // Load Okta form data if exists
      const oktaIdp = providers.find((idp: IdentityProvider) => idp.type === 'OKTA')
      if (oktaIdp) {
        setCurrentOktaIdp(oktaIdp)
        setOktaDomain(oktaIdp.domainName || '')
        setOktaClientId(oktaIdp.protocol?.clientId || '')
        setOktaClientSecret(oktaIdp.protocol?.clientSecret || '')
      }
    } catch (error) {
      console.error('Error loading identity providers:', error)
    } finally {
      setIsLoadingIdps(false)
    }
  }

  const loadOktaRedirectUrl = async () => {
    try {
      const response = await frontendApiClient.get('/idp/okta/redirect-url')
      setOktaRedirectUrl(response.data?.redirectUrl || '')
    } catch (error) {
      // 404 is expected if not configured yet
      console.error('Error loading Okta redirect URL:', error)
    }
  }

  const handleCopy = async (value: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const handleGoogleFileUpload = async () => {
    if (!googleMetadataFile) {
      showToast('Please select a metadata file', 'error')
      return
    }

    setIsUploadingGoogle(true)
    try {
      const text = await googleMetadataFile.text()
      
      // Simple XML parsing to extract key fields
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      
      const entityId = xmlDoc.getElementsByTagName('EntityDescriptor')[0]?.getAttribute('entityID') || ''
      const ssoUrl = xmlDoc.getElementsByTagName('SingleSignOnService')[0]?.getAttribute('Location') || ''
      const cert = xmlDoc.getElementsByTagName('X509Certificate')[0]?.textContent?.trim() || ''
      
      await frontendApiClient.post('/idp/google/saml/upsert', {
        metadata: {
          idpEntityId: entityId,
          idpSsoUrl: ssoUrl,
          idpSigningCert01: cert
        }
      })
      
      showToast('Google SSO configured successfully', 'success')
      setGoogleMetadataFile(null)
      setShowGoogleForm(false)
      // Reload to get SP Entity ID and ACS URL
      await loadIdentityProviders()
    } catch (error) {
      console.error('Error uploading Google metadata:', error)
      showToast('Error configuring Google SSO', 'error')
    } finally {
      setIsUploadingGoogle(false)
    }
  }

  const handleSaveOkta = async () => {
    if (!oktaDomain || !oktaClientId || !oktaClientSecret) {
      showToast('Please fill in all Okta fields', 'error')
      return
    }

    setIsSavingOkta(true)
    try {
      await frontendApiClient.post('/idp/okta/upsert', {
        domainName: oktaDomain,
        clientId: oktaClientId,
        clientSecret: oktaClientSecret,
        enabled: true
      })
      
      showToast(currentOktaIdp ? 'Okta SSO updated successfully' : 'Okta SSO configured successfully', 'success')
      setShowOktaForm(false)
      loadIdentityProviders()
      loadOktaRedirectUrl()
    } catch (error) {
      console.error('Error saving Okta config:', error)
      showToast('Error configuring Okta SSO', 'error')
    } finally {
      setIsSavingOkta(false)
    }
  }

  const testOktaConnection = async () => {
    try {
      const response = await frontendApiClient.post('/idp/okta/test-connection')
      const { ok } = response.data || {}
      
      if (ok) {
        showToast('Okta connection successful', 'success')
      } else {
        showToast('Okta connection failed. Please verify your configuration.', 'error')
      }
    } catch (error) {
      console.error('Error testing Okta connection:', error)
      showToast('Error testing connection', 'error')
    }
  }

  const hasOktaChanged = () => {
    if (!currentOktaIdp) {
      return oktaDomain.trim() !== '' || oktaClientId.trim() !== '' || oktaClientSecret.trim() !== ''
    }
    
    return oktaDomain !== (currentOktaIdp.domainName || '') ||
           oktaClientId !== (currentOktaIdp.protocol?.clientId || '') ||
           oktaClientSecret !== (currentOktaIdp.protocol?.clientSecret || '')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await frontendApiClient.patch('/tenant/me', {
        displayName: displayName,
        logoUrl: logoUrl === '' ? null : logoUrl
      })
      
      setCurrentTenant(response.data)
      showToast('Organization updated successfully', 'success')
    } catch (error) {
      console.error('Error updating tenant:', error)
      showToast('Error updating organization', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanged = displayName !== (currentTenant?.displayName || '') || logoUrl !== (currentTenant?.logoUrl || '')

  return (
    <main className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8" style={{ color: theme.colors.textPrimary }}>
          Organization Settings
        </h1>

        {isLoadingTenant ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Organization Name */}
            <div>
              <h2 className="text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
                Organization Name
              </h2>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter organization name"
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: theme.colors.textPrimary
                }}
                required
              />
            </div>

            {/* Organization Logo URL */}
            <div>
              <h2 className="text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
                Organization Logo
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>

                {/* Logo Preview */}
                {logoUrl && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                        Preview
                      </label>
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-sm hover:underline transition-colors font-medium"
                        style={{ color: '#ef4444' }}
                      >
                        Remove Logo
                      </button>
                    </div>
                    <div 
                      className="p-4 rounded-lg border flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        minHeight: '100px'
                      }}
                    >
                      <img
                        key={logoUrl}
                        src={logoUrl}
                        alt="Organization logo preview"
                        className="max-h-20 max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML += '<p style="color: rgba(255, 255, 255, 0.4);">Invalid image URL</p>'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SSO Configuration */}
            <div>
              <h2 className="text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
                Single Sign-On (SSO)
              </h2>
              
              {isLoadingIdps ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Google SSO */}
                  {(() => {
                    const googleIdp = identityProviders.find(idp => idp.type === 'GOOGLE_WORKSPACE')
                    return (
                      <div className="rounded-lg border" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: showGoogleForm ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'
                      }}>
                        <IdpCard
                          displayName="Google Workspace"
                          logoPath="/identity_providers/google-logo.svg"
                          status={googleIdp?.status}
                          showActions={true}
                          showConfigButton={true}
                          isConfigFormOpen={showGoogleForm}
                          onConfigure={() => setShowGoogleForm(!showGoogleForm)}
                          noBorder={true}
                        />

                        {/* Google Configuration Form */}
                        {showGoogleForm && (
                          <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                                  Upload SAML Metadata XML
                                </label>
                                <a
                                  href="https://docs.wristband.dev/docs/setting-up-google-workspace-enterprise-ssoa"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs hover:underline transition-colors"
                                  style={{ color: theme.colors.primary }}
                                >
                                  Instructions →
                                </a>
                              </div>
                              
                              {/* Custom File Upload Area */}
                              <div className="relative">
                                <input
                                  id="google-metadata-file"
                                  type="file"
                                  accept=".xml"
                                  onChange={(e) => setGoogleMetadataFile(e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="google-metadata-file"
                                  className="flex flex-col items-center justify-center w-full px-4 py-6 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-opacity-60"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    borderColor: googleMetadataFile ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)',
                                  }}
                                >
                                  {googleMetadataFile ? (
                                    <>
                                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.primary }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <p className="text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                        {googleMetadataFile.name}
                                      </p>
                                      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        Click to change file
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.textSecondary }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                      <p className="text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                        Click to select XML file
                                      </p>
                                      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        or drag and drop
                                      </p>
                                    </>
                                  )}
                                </label>
                              </div>
                              
                              <button
                                type="button"
                                onClick={handleGoogleFileUpload}
                                disabled={!googleMetadataFile || isUploadingGoogle}
                                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  backgroundColor: theme.colors.secondary,
                                  color: 'white'
                                }}
                              >
                                {isUploadingGoogle ? 'Uploading...' : 'Upload & Configure'}
                              </button>

                              {/* SP Entity ID and ACS URL Display */}
                              {(googleSpEntityId || googleAcsUrl) && (
                                <div className="mt-4 p-3 rounded-lg space-y-3" style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                  borderColor: 'rgba(255, 255, 255, 0.1)'
                                }}>
                                  <p className="text-xs font-medium" style={{ color: theme.colors.textPrimary }}>
                                    Use these URLs in your Google Admin Console:
                                  </p>
                                  
                                  {googleSpEntityId && (
                                    <div>
                                      <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                                        SP Entity ID
                                      </label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={googleSpEntityId}
                                          readOnly
                                          className="flex-1 px-3 py-1.5 rounded text-xs"
                                          style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            color: theme.colors.textPrimary
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleCopy(googleSpEntityId, setCopiedSpEntityId)}
                                          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                          style={{
                                            backgroundColor: theme.colors.secondary,
                                            color: 'white'
                                          }}
                                        >
                                          {copiedSpEntityId ? '✓' : 'Copy'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {googleAcsUrl && (
                                    <div>
                                      <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                                        ACS URL
                                      </label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={googleAcsUrl}
                                          readOnly
                                          className="flex-1 px-3 py-1.5 rounded text-xs"
                                          style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            color: theme.colors.textPrimary
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleCopy(googleAcsUrl, setCopiedAcsUrl)}
                                          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                          style={{
                                            backgroundColor: theme.colors.secondary,
                                            color: 'white'
                                          }}
                                        >
                                          {copiedAcsUrl ? '✓' : 'Copy'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Okta SSO */}
                  {(() => {
                    const oktaIdp = identityProviders.find(idp => idp.type === 'OKTA')
                    return (
                      <div className="rounded-lg border" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: showOktaForm ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'
                      }}>
                        <IdpCard
                          displayName="Okta Workforce"
                          logoPath="/identity_providers/okta-logo.svg"
                          status={oktaIdp?.status}
                          showActions={true}
                          showConfigButton={true}
                          isConfigFormOpen={showOktaForm}
                          onConfigure={() => setShowOktaForm(!showOktaForm)}
                          noBorder={true}
                        />

                        {/* Okta Configuration Form */}
                        {showOktaForm && (
                          <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                                  Okta Configuration
                                </label>
                                <a
                                  href="https://docs.wristband.dev/docs/setting-up-okta-enterprise-sso"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs hover:underline transition-colors"
                                  style={{ color: theme.colors.primary }}
                                >
                                  Instructions →
                                </a>
                              </div>

                              {/* Okta Redirect URL */}
                              {oktaRedirectUrl && (
                                <div className="p-3 rounded-lg" style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                  borderColor: 'rgba(255, 255, 255, 0.1)'
                                }}>
                                  <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                                    Okta Redirect URL (use this in your Okta app)
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={oktaRedirectUrl}
                                      readOnly
                                      className="flex-1 px-3 py-1.5 rounded text-xs"
                                      style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        color: theme.colors.textPrimary
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(oktaRedirectUrl, setCopiedOktaRedirect)}
                                      className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                      style={{
                                        backgroundColor: theme.colors.secondary,
                                        color: 'white'
                                      }}
                                    >
                                      {copiedOktaRedirect ? '✓' : 'Copy'}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Test Connection */}
                              {oktaDomain && oktaClientId && (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={testOktaConnection}
                                    className="px-3 py-1.5 rounded text-xs font-medium transition-colors hover:opacity-80"
                                    style={{
                                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                      color: '#3b82f6'
                                    }}
                                  >
                                    Test Connection
                                  </button>
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                                  Okta Domain
                                </label>
                                <input
                                  type="text"
                                  value={oktaDomain}
                                  onChange={(e) => setOktaDomain(e.target.value)}
                                  placeholder="your-domain.okta.com"
                                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    color: theme.colors.textPrimary
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                                  Client ID
                                </label>
                                <input
                                  type="text"
                                  value={oktaClientId}
                                  onChange={(e) => setOktaClientId(e.target.value)}
                                  placeholder="Enter Okta application client ID"
                                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    color: theme.colors.textPrimary
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                                  Client Secret
                                </label>
                                <div className="relative">
                                  <input
                                    type={showOktaSecret ? 'text' : 'password'}
                                    value={oktaClientSecret}
                                    onChange={(e) => setOktaClientSecret(e.target.value)}
                                    placeholder="Enter Okta application client secret"
                                    className="w-full px-4 py-2 pr-12 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                      borderColor: 'rgba(255, 255, 255, 0.2)',
                                      color: theme.colors.textPrimary
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowOktaSecret(!showOktaSecret)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    style={{ color: theme.colors.textSecondary }}
                                  >
                                    {showOktaSecret ? (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleSaveOkta}
                                disabled={isSavingOkta || !oktaDomain || !oktaClientId || !oktaClientSecret || !hasOktaChanged()}
                                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  backgroundColor: theme.colors.secondary,
                                  color: 'white'
                                }}
                              >
                                {isSavingOkta ? (currentOktaIdp ? 'Updating...' : 'Saving...') : (currentOktaIdp ? 'Update Configuration' : 'Save Configuration')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={!hasChanged || isSaving}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.colors.primary,
                color: 'white'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </main>
  )
}
