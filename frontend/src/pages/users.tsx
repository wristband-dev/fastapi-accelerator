import { useWristbandAuth } from '@/context/AuthContext'
import { useUser } from '@/context/UserContext'
import { theme } from '@/config/theme'
import { useState, useEffect } from 'react'
import frontendApiClient from '@/client/frontend-api-client'
import { User, PendingInvitation } from '@/types/wristband/user'
import { Role } from '@/types/wristband/role'
import { Toast } from '@/components/Toast'
import { Icon } from '@/components/Icon'
import { Modal } from '@/components/Modal'

interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export default function Users() {
  const { tenantName } = useWristbandAuth()
  const { hasAdminRole, userRoles, currentUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Roles
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  
  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  // Edit user roles
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newRoleToAdd, setNewRoleToAdd] = useState<string>('')
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false)

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })
  }

  useEffect(() => {
    fetchUsers()
    if (hasAdminRole) {
      fetchPendingInvitations()
      fetchRoles()
    }
  }, [hasAdminRole])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await frontendApiClient.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPendingInvitations = async () => {
    try {
      const response = await frontendApiClient.get('/users/invitations/pending')
      setPendingInvitations(response.data || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }

  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true)
      const response = await frontendApiClient.get('/roles')
      const fetchedRoles = response.data || []
      setRoles(fetchedRoles)
      // Set first non-account-admin role as default
      const defaultRole = fetchedRoles.find((r: Role) => r.sku !== 'account-admin')
      if (defaultRole && !selectedRole) {
        setSelectedRole(defaultRole.sku)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setIsLoadingRoles(false)
    }
  }

  // Check if user can be deleted
  const canDeleteUser = (user: User): boolean => {
    // Can't delete yourself
    if (user.id === currentUser?.id) return false
    
    // Can't delete account admin
    if (user.roles.includes('account-admin')) return false
    
    return true
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    if (!selectedRole) {
      showToast('Please select a role', 'error')
      return
    }

    setIsInviting(true)
    try {
      // Convert SKU to role ID
      const role = roles.find(r => r.sku === selectedRole)
      if (!role) {
        showToast('Selected role not found', 'error')
        return
      }

      await frontendApiClient.post('/user/invite', {
        email: inviteEmail,
        roles: [role.id]
      })
      
      showToast(`Invitation sent to ${inviteEmail}`, 'success')
      setInviteEmail('')
      setSelectedRole(roles[0]?.sku || '')
      setShowInviteForm(false)
      fetchPendingInvitations()
    } catch (error) {
      console.error('Error inviting user:', error)
      showToast('Error sending invitation', 'error')
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteUser = (userId: string, email: string) => {
    // Safety check - prevent deleting yourself or account admin
    const user = users.find(u => u.id === userId)
    if (user && !canDeleteUser(user)) {
      showToast('This user cannot be deleted', 'error')
      return
    }

    setModalState({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete ${email}?`,
      confirmText: 'Delete',
      onConfirm: async () => {
        closeModal()
        try {
          await frontendApiClient.delete(`/user/${userId}`)
          showToast('User deleted successfully', 'success')
          fetchUsers()
        } catch (error) {
          console.error('Error deleting user:', error)
          showToast('Error deleting user', 'error')
        }
      }
    })
  }

  const handleCancelInvitation = (invitationId: string, email: string) => {
    setModalState({
      isOpen: true,
      title: 'Cancel Invitation',
      message: `Are you sure you want to cancel the invitation for ${email}?`,
      confirmText: 'Cancel Invitation',
      onConfirm: async () => {
        closeModal()
        try {
          await frontendApiClient.delete(`/user/invitations/${invitationId}`)
          showToast('Invitation cancelled', 'success')
          fetchPendingInvitations()
        } catch (error) {
          console.error('Error cancelling invitation:', error)
          showToast('Error cancelling invitation', 'error')
        }
      }
    })
  }

  const handleEditUserRoles = (user: User) => {
    setEditingUserId(user.id)
    // Set to first available role that user doesn't have
    const availableRoles = roles.filter(r => !user.roles.includes(r.sku) && r.sku !== 'account-admin')
    setNewRoleToAdd(availableRoles[0]?.sku || '')
  }

  const handleCancelEditRoles = () => {
    setEditingUserId(null)
    setNewRoleToAdd('')
  }

  const handleUpdateUserRoles = async (userId: string) => {
    if (!newRoleToAdd) {
      showToast('Please select a role', 'error')
      return
    }

    const user = users.find(u => u.id === userId)
    if (!user) return

    setIsUpdatingRoles(true)
    try {
      // Convert existing role SKUs to role IDs
      const existingRoleIds = user.roles
        .map(sku => roles.find(r => r.sku === sku)?.id)
        .filter((id): id is string => id !== undefined)

      // Convert new role SKU to role ID
      const newRoleId = roles.find(r => r.sku === newRoleToAdd)?.id
      if (!newRoleId) {
        showToast('Selected role not found', 'error')
        return
      }

      await frontendApiClient.put(`/user/${userId}/roles`, {
        newRoleIds: [newRoleId],
        existingRoleIds: existingRoleIds
      })

      showToast('Roles updated successfully', 'success')
      setEditingUserId(null)
      setNewRoleToAdd('')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user roles:', error)
      showToast('Error updating user roles', 'error')
    } finally {
      setIsUpdatingRoles(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.givenName?.toLowerCase().includes(searchLower) ||
      user.familyName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    )
  })

  const filteredInvitations = pendingInvitations.filter(inv =>
    inv.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
            Users
          </h1>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
            All members of {tenantName}
          </p>
        </div>

        {/* Search and Invite */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: theme.colors.textPrimary
              }}
            />
            {hasAdminRole && (
              <button
                onClick={() => {
                  if (!showInviteForm && roles.length > 0 && !selectedRole) {
                    setSelectedRole(roles[0].sku)
                  }
                  setShowInviteForm(!showInviteForm)
                }}
                className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 whitespace-nowrap"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: 'white'
                }}
              >
                {showInviteForm ? 'Cancel' : 'Invite User'}
              </button>
            )}
          </div>

          {/* Inline Invite Form */}
          {showInviteForm && (
            <form onSubmit={handleInviteUser} className="p-4 rounded-lg border" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderColor: 'rgba(255, 255, 255, 0.2)' 
            }}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: theme.colors.textPrimary
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      Role *
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 cursor-pointer transition-all"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          color: theme.colors.textPrimary,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = theme.colors.primary
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        required
                      >
                        {roles
                          .filter(role => role.sku !== 'account-admin')
                          .map((role) => (
                            <option 
                              key={role.id} 
                              value={role.sku} 
                              style={{ backgroundColor: '#1a1a1a', color: theme.colors.textPrimary, padding: '8px' }}
                            >
                              {role.displayName}
                            </option>
                          ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg 
                          className="w-4 h-4 transition-transform group-focus-within:rotate-180" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          style={{ color: theme.colors.primary }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isInviting || isLoadingRoles || !selectedRole}
                  className="w-full py-2 px-6 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: 'white'
                  }}
                >
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Invitations */}
            {filteredInvitations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: theme.colors.textSecondary }}>
                  Pending Invitations ({filteredInvitations.length})
                </h3>
                <div className="space-y-2">
                  {filteredInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 165, 0, 0.3)'
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                          style={{ backgroundColor: 'rgba(255, 165, 0, 0.3)', color: '#FFA500' }}
                        >
                          {invitation.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                            {invitation.email}
                          </p>
                          <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            Invited • Pending
                          </p>
                        </div>
                      </div>
                      {hasAdminRole && (
                        <button
                          onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                          className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap flex-shrink-0"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Users */}
            <div>
              {filteredInvitations.length > 0 && (
                <h3 className="text-sm font-medium mb-3" style={{ color: theme.colors.textSecondary }}>
                  Active Users ({filteredUsers.length})
                </h3>
              )}
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: editingUserId === user.id ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {user.pictureUrl ? (
                          <img
                            src={user.pictureUrl}
                            alt={user.fullName || user.email}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                            style={{ backgroundColor: theme.colors.primary, color: 'white' }}
                          >
                            {(user.givenName?.[0] || user.email[0]).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                            {user.fullName || `${user.givenName || ''} ${user.familyName || ''}`.trim() || user.email}
                          </p>
                          <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                            {user.email}
                          </p>
                          
                          {/* User Roles - View Mode */}
                          {editingUserId !== user.id && user.roles && user.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.roles.map((roleSku) => (
                                <span
                                  key={roleSku}
                                  className="px-2 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: 'rgba(167, 88, 157, 0.2)',
                                    color: theme.colors.primary
                                  }}
                                >
                                  {roleSku}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {hasAdminRole && editingUserId !== user.id && (canDeleteUser(user) || (user.id !== currentUser?.id && !user.roles.includes('account-admin') && roles.filter(r => !user.roles.includes(r.sku) && r.sku !== 'account-admin').length > 0)) && (
                        <div className="flex gap-2 flex-shrink-0">
                          {user.id !== currentUser?.id && !user.roles.includes('account-admin') && roles.filter(r => !user.roles.includes(r.sku) && r.sku !== 'account-admin').length > 0 && (
                            <button
                              onClick={() => handleEditUserRoles(user)}
                              className="p-2 rounded-lg transition-colors hover:opacity-80"
                              style={{
                                backgroundColor: 'rgba(167, 88, 157, 0.2)',
                                color: theme.colors.primary
                              }}
                              title="Edit user roles"
                            >
                              <Icon name="settings-2" size={16} />
                            </button>
                          )}
                          {canDeleteUser(user) && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="p-2 rounded-lg transition-colors hover:opacity-80"
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444'
                              }}
                              title="Delete user"
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Edit Roles Mode */}
                    {editingUserId === user.id && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <p className="text-sm font-medium mb-3" style={{ color: theme.colors.textPrimary }}>
                          Edit Role
                        </p>
                        <div className="mb-3">
                          <div className="relative group">
                            <select
                              value={newRoleToAdd}
                              onChange={(e) => setNewRoleToAdd(e.target.value)}
                              className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 cursor-pointer transition-all"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                color: theme.colors.textPrimary,
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = theme.colors.primary
                                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              {roles
                                .filter(role => !user.roles.includes(role.sku) && role.sku !== 'account-admin')
                                .map((role) => (
                                  <option 
                                    key={role.id} 
                                    value={role.sku}
                                    style={{ backgroundColor: '#1a1a1a', color: theme.colors.textPrimary, padding: '8px' }}
                                  >
                                    {role.displayName}
                                  </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg 
                                className="w-4 h-4 transition-transform group-focus-within:rotate-180" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                style={{ color: theme.colors.primary }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {roles.filter(role => !user.roles.includes(role.sku) && role.sku !== 'account-admin').length === 0 && (
                            <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
                              User already has all available roles
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateUserRoles(user.id)}
                            disabled={isUpdatingRoles || !newRoleToAdd}
                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                              backgroundColor: theme.colors.primary,
                              color: 'white'
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="hidden sm:inline">
                              {isUpdatingRoles ? 'Editing...' : 'Save Role'}
                            </span>
                          </button>
                          <button
                            onClick={handleCancelEditRoles}
                            disabled={isUpdatingRoles}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80 flex items-center justify-center gap-2"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              color: theme.colors.textSecondary
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {filteredUsers.length === 0 && filteredInvitations.length === 0 && (
              <div className="text-center py-12" style={{ color: theme.colors.textSecondary }}>
                No users found
              </div>
            )}
          </div>
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        confirmStyle="danger"
      />
    </main>
  )
}
