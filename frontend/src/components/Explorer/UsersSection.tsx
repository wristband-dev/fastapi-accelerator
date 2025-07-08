import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserPlusIcon, 
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { getGradientClasses } from '../../utils/theme';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    role: 'viewer',
    status: 'inactive',
    lastLogin: '2024-01-10T09:15:00Z'
  }
];

export default function UsersSection() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<User['role']>('user');

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="w-4 h-4 text-red-500" />;
      case 'user':
        return <UserIcon className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to invite user
    console.log('Inviting user:', { email: inviteEmail, role: inviteRole });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    setInviteEmail('');
    setInviteRole('user');
    setIsInviteModalOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Users ({filteredUsers.length})
        </h3>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#00AA81] to-[#00CC9A] text-white rounded-xl hover:from-[#00AA81]/90 hover:to-[#00CC9A]/90 focus:outline-none focus:ring-2 focus:ring-[#00CC9A] focus:ring-offset-2 transition-all duration-200 shadow-lg"
        >
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Invite User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-[#00CC9A] dark:hover:border-[#00FFC1] transition-all duration-300 hover:scale-[1.02]"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00AA81] to-[#00CC9A] rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.firstName} {user.lastName}
                    </h4>
                    <div className="flex-shrink-0">
                      {getRoleIcon(user.role)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Last login: {formatLastLogin(user.lastLogin)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 flex-shrink-0">
                <div className="flex flex-col space-y-1 items-end">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#00AA81]/20 to-[#00CC9A]/20 text-[#00AA81] dark:from-[#00AA81]/30 dark:to-[#00CC9A]/30 dark:text-[#00CC9A] capitalize">
                    {user.role}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 text-gray-400 hover:text-[#00AA81] dark:hover:text-[#00CC9A] transition-colors rounded-lg hover:bg-[#00AA81]/10 dark:hover:bg-[#00CC9A]/20"
                    title="Edit user"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete user"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Hover gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00AA81]/10 to-[#00CC9A]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-[#00AA81] to-[#00CC9A] rounded-xl flex items-center justify-center mr-3">
                  <UserPlusIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Invite New User
                </h3>
              </div>
            </div>
            
            <form onSubmit={handleInviteUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  required
                  autoComplete="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as User['role'])}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none transition-all duration-200"
                  >
                    <option value="viewer">👀 Viewer - View only access</option>
                    <option value="user">👤 User - Standard access</option>
                    <option value="admin">🛡️ Admin - Full access</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#00AA81] to-[#00CC9A] text-white rounded-xl hover:from-[#00AA81]/90 hover:to-[#00CC9A]/90 focus:outline-none focus:ring-2 focus:ring-[#00CC9A] focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 