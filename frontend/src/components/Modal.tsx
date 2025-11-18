import { theme } from '@/config/theme'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  confirmStyle?: 'danger' | 'primary'
  isLoading?: boolean
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  confirmStyle = 'danger',
  isLoading = false
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black transition-opacity"
        style={{ opacity: 0.6 }}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-lg border shadow-xl animate-in fade-in zoom-in duration-200"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 transition-colors hover:opacity-70"
              style={{ color: theme.colors.textSecondary }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-sm text-center" style={{ color: theme.colors.textSecondary }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: theme.colors.textSecondary
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: confirmStyle === 'danger' ? '#ef4444' : theme.colors.primary,
              color: 'white'
            }}
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

