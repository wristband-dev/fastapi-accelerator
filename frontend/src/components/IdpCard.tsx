import { theme } from '@/config/theme'

interface IdpCardProps {
  displayName: string
  logoPath?: string
  status?: string
  showActions?: boolean
  onConfigure?: () => void
  showConfigButton?: boolean
  isConfigFormOpen?: boolean
  noBorder?: boolean
}

export const IdpCard = ({ 
  displayName, 
  logoPath,
  status, 
  showActions = false,
  onConfigure,
  showConfigButton = false,
  isConfigFormOpen = false,
  noBorder = false
}: IdpCardProps) => {
  const renderLogo = () => {
    if (logoPath) {
      return (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src={logoPath} alt={displayName} className="w-full h-full object-contain" />
        </div>
      )
    }
    
    // Fallback to first letter if no logo provided
    return (
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(167, 88, 157, 0.2)' }}
      >
        <span className="text-xl font-semibold" style={{ color: theme.colors.primary }}>
          {displayName.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  const content = (
    <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {renderLogo()}
          <div className="flex-1">
            <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
              {displayName}
            </p>
            {status && (
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Status: {status}
              </p>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-3">
            {status && (
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: status === 'ENABLED' 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : 'rgba(107, 114, 128, 0.2)',
                  color: status === 'ENABLED' ? '#22c55e' : '#6b7280'
                }}
              >
                {status === 'ENABLED' ? 'Active' : status ? 'Disabled' : 'Not Setup'}
              </span>
            )}
            {showConfigButton && onConfigure && (
              <button
                type="button"
                onClick={onConfigure}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'rgba(167, 88, 157, 0.2)',
                  color: theme.colors.primary
                }}
              >
                {isConfigFormOpen ? 'Hide' : 'Configure'}
              </button>
            )}
          </div>
        )}
      </div>
  )

  if (noBorder) {
    return content
  }

  return (
    <div className="rounded-lg border" style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: isConfigFormOpen ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'
    }}>
      {content}
    </div>
  )
}

