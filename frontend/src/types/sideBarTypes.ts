export interface SidebarItem {
    name: string
    path: string
    icon: string
    showSelected?: boolean
    isAdmin?: boolean
  }
  
export interface SsoOptions {
googleSSOIDP: boolean,
oktaSSOIDP: boolean
}

export interface SidebarState {
  isOpen: boolean
  onToggle: () => void
  settingsItems: SidebarItem[]
  profileItem: SidebarItem
  appName: string
  tenantName: string
}