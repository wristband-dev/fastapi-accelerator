/**
 * ============================================
 * SIDEBAR COMPONENT
 * ============================================
 * 
 * A responsive sidebar that adapts between desktop and mobile:
 * 
 * DESKTOP MODE:
 * - Collapsible sidebar (64px closed, 256px open)
 * - Logo visible in top-left, toggle button appears on hover
 * - When open, both logo and toggle button are visible
 * 
 * MOBILE MODE:
 * - Fixed top bar with menu, logo, and profile
 * - Dropdown menu overlay when opened
 * 
 * All configuration values can be customized in:
 * @see /config/sidebarConfig.ts
 * @see /config/theme.ts
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Icon } from './Icon'
import { theme } from '@/config/theme'
import { 
  sidebarItems, 
  settingsItems, 
  getProfileItem, 
  HOVER_BG, 
  DIVIDER_COLOR,
  SIDEBAR_WIDTH_OPEN, 
  SIDEBAR_WIDTH_CLOSED, 
  TOGGLE_BUTTON_SIZE,
  TRANSITION_DURATION,
  Z_INDEX,
  APP_NAME 
} from '@/config/sidebarConfig'
import { useWristbandAuth } from '@/context/AuthContext'
import { SidebarState } from '@/types/sideBarTypes'
import { useUser } from '@/context/UserContext'
import { useTenant } from '@/context/TenantContext'

interface SidebarProps {
  children: React.ReactNode
}

// ============================================
// SHARED STYLES
// ============================================
const buttonBaseClasses = 'flex items-center gap-3 px-3 py-2.5 rounded-lg shrink-0 text-sm font-medium'
const buttonFullWidth = 'w-full'

// ============================================
// REUSABLE COMPONENTS
// ============================================

// Reusable Logo Component
function Logo({ appName, isOpen, onClick }: { appName: string; isOpen?: boolean; onClick?: () => void }) {
  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ color: theme.colors.textPrimary }}
    >
      <img 
        src="/icon.svg" 
        alt="Logo" 
        className={`w-6 h-6 ${onClick ? 'hover:scale-110' : ''} transition-transform duration-300`}
      />
      {isOpen !== false && (
        <span className="text-sm font-medium whitespace-nowrap">{appName}</span>
      )}
    </div>
  )
}

// Navigation Items
function NavigationItems({ isOpen, onItemClick }: { isOpen?: boolean; onItemClick?: () => void }) {
  const router = useRouter()
  const { hasAdminRole } = useUser()
  
  return (
    <>
      {sidebarItems
        .filter(item => !item.isAdmin || hasAdminRole)
        .map((item) => {
          const isSelected = router.pathname === item.path && item.showSelected !== false
          const widthClass = isOpen === false ? '' : buttonFullWidth
          
          return (
            <button
              key={item.path}
              onClick={() => { router.push(item.path); onItemClick?.() }}
              className={`${buttonBaseClasses} ${widthClass} ${
                isSelected 
                  ? 'bg-white/20 hover:bg-white/25' 
                  : 'hover:bg-white/10'
              }`}
              style={{ color: theme.colors.textPrimary }}
            >
              <Icon name={item.icon} size={20} className="shrink-0" />
              {isOpen !== false && <span className={isOpen === undefined ? '' : 'whitespace-nowrap'}>{item.name}</span>}
            </button>
          )
        })}
    </>
  )
}

// Settings Items
function SettingsItems({ items, isOpen, onItemClick }: { items: any[]; isOpen?: boolean; onItemClick?: () => void }) {
  const router = useRouter()
  const { hasAdminRole } = useUser()
  
  return (
    <>
      {items
        .filter(item => !item.isAdmin || hasAdminRole)
        .map((item) => {
          const isSelected = router.pathname === item.path && item.showSelected !== false
          const widthClass = isOpen === false ? '' : buttonFullWidth
          
          return (
            <button
              key={item.path}
              onClick={() => { router.push(item.path); onItemClick?.() }}
              className={`${buttonBaseClasses} ${widthClass} ${
                isSelected 
                  ? 'bg-white/20 hover:bg-white/25' 
                  : 'hover:bg-white/10'
              }`}
              style={{ color: theme.colors.textPrimary }}
            >
              <Icon name={item.icon} size={20} className="shrink-0" />
              {isOpen !== false && <span className={isOpen === undefined ? '' : 'whitespace-nowrap'}>{item.name}</span>}
            </button>
          )
        })}
    </>
  )
}

// ============================================
// DESKTOP SIDEBAR
// ============================================
function DesktopSidebar({ isOpen, onToggle, settingsItems, profileItem, appName, tenantName }: SidebarState) {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  
  // Calculate toggle button position based on sidebar width
  const toggleButtonLeft = isOpen 
    ? `${SIDEBAR_WIDTH_OPEN - TOGGLE_BUTTON_SIZE - 8}px` 
    : `${(SIDEBAR_WIDTH_CLOSED - TOGGLE_BUTTON_SIZE) / 2}px`

  return (
    <>
      {/* Logo - visible when closed (not hovering) or when open */}
      <div 
        className={`hidden md:flex fixed items-center transition-all`}
        style={{
          zIndex: Z_INDEX.logo,
          top: '12px',
          left: isOpen ? '20px' : '0px',
          width: isOpen ? 'auto' : `${SIDEBAR_WIDTH_CLOSED}px`,
          height: `${TOGGLE_BUTTON_SIZE}px`,
          opacity: isOpen ? 1 : (isHovering ? 0 : 1),
          transitionDuration: `${TRANSITION_DURATION}ms`,
          justifyContent: isOpen ? 'flex-start' : 'center'
        }}
        onMouseEnter={() => !isOpen && setIsHovering(true)}
        onMouseLeave={() => !isOpen && setIsHovering(false)}
      >
        <Logo appName={appName} isOpen={isOpen} onClick={onToggle} />
      </div>

      {/* Toggle button - shows on hover when closed, always visible when open */}
      <button 
        onClick={() => {
          if (isOpen) setIsHovering(false) // Reset hover state when closing
          onToggle()
        }}
        className={`hidden md:flex fixed p-2.5 rounded-lg items-center justify-center ${HOVER_BG} hover:scale-110 transition-all ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        style={{ 
          zIndex: Z_INDEX.logo,
          backgroundColor: theme.colors.sidebar,
          color: theme.colors.textPrimary,
          top: '12px',
          left: toggleButtonLeft,
          opacity: isOpen ? 1 : (isHovering ? 1 : 0),
          transitionDuration: `${TRANSITION_DURATION}ms`
        }}
        onMouseEnter={() => !isOpen && setIsHovering(true)}
        onMouseLeave={() => !isOpen && setIsHovering(false)}
      >
        <Icon name="panel-right" size={20} />
      </button>

      {/* Main Sidebar Container */}
      <aside 
        className={`hidden md:flex fixed left-0 top-0 h-full flex-col justify-between py-3 transition-all overflow-hidden`}
        style={{ 
          zIndex: Z_INDEX.sidebar,
          backgroundColor: theme.colors.sidebar,
          color: theme.colors.textPrimary,
          width: isOpen ? `${SIDEBAR_WIDTH_OPEN}px` : `${SIDEBAR_WIDTH_CLOSED}px`,
          transitionDuration: `${TRANSITION_DURATION}ms`
        }}
      >
        {/* Top: Navigation Items */}
        <div className="flex flex-col pt-14">
          <nav className="space-y-1 px-3">
            <NavigationItems isOpen={isOpen} />
          </nav>
        </div>
        
        {/* Bottom: Settings + Profile */}
        <div className="flex flex-col">
          <nav className="space-y-1 px-3 mb-3">
            <SettingsItems items={settingsItems} isOpen={isOpen} />
          </nav>

          <div className={`mx-3 mb-3 border-t ${DIVIDER_COLOR}`} />

          <button
            onClick={() => router.push(profileItem.path)}
            className={`${buttonBaseClasses} mx-3 ${
              router.pathname === profileItem.path 
                ? 'bg-white/20 hover:bg-white/25' 
                : 'hover:bg-white/10'
            }`}
            style={{ color: theme.colors.textPrimary }}
          >
            <Icon name={profileItem.icon} size={20} className="shrink-0" />
            {isOpen && <span className="whitespace-nowrap">{profileItem.name}</span>}
          </button>

          {/* Tenant name - maintains height but only shows text when expanded */}
          <div className="text-sm mx-3 mb-3 text-white/40 text-center h-5 flex items-center justify-center overflow-hidden">
            {isOpen && (
              <span className="whitespace-nowrap overflow-hidden text-ellipsis w-full">
                {tenantName}
              </span>
            )}
          </div>
          
        </div>
      </aside>
    </>
  )
}

// ============================================
// MOBILE SIDEBAR
// ============================================
function MobileSidebar({ isOpen, onToggle, settingsItems, profileItem, appName, tenantName }: SidebarState) {
  const router = useRouter()

  return (
    <>
      {/* Mobile Top Bar */}
      <aside 
        className={`md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4`} 
        style={{ 
          zIndex: Z_INDEX.sidebar,
          backgroundColor: theme.colors.sidebar, 
          color: theme.colors.textPrimary 
        }}
      >
        {/* Left: Menu + Logo + App Name */}
        <div className="flex items-center gap-3">
          <button onClick={onToggle} className={`p-2.5 rounded-lg ${HOVER_BG}`}>
            <Icon name="menu" size={20} />
          </button>
          <Logo appName={appName} onClick={onToggle} />
        </div>
        
        {/* Right: Profile */}
        <button 
          onClick={() => {
            router.push(profileItem.path)
            if (isOpen) onToggle() // Close menu if open
          }} 
          className={`flex items-center gap-2 p-2.5 rounded-lg ${HOVER_BG}`} 
          style={{ color: theme.colors.textPrimary }}
        >
          <span className="text-sm font-medium">{profileItem.name}</span>
          <Icon name={profileItem.icon} size={20} />
        </button>
      </aside>

      {/* Mobile Navigation Menu (Dropdown) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50" 
          style={{ zIndex: Z_INDEX.overlay }}
          onClick={onToggle}
        >
          <div 
            className={`p-4 mt-14 space-y-2`} 
            style={{ 
              backgroundColor: theme.colors.sidebar, 
              color: theme.colors.textPrimary 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <NavigationItems onItemClick={onToggle} />
            
            <div className="py-2">
              <div className={`border-t ${DIVIDER_COLOR}`} />
            </div>
            
            <SettingsItems items={settingsItems} onItemClick={onToggle} />
            
            {/* Tenant name - mobile */}
            <div className="text-sm px-3 pt-3 text-white/40 text-center">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis block">
                {tenantName}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================
// MAIN SIDEBAR COMPONENT
// ============================================
export function Sidebar({ children }: SidebarProps) {
  // Initialize to false to match server-side render
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { tenantName, email } = useWristbandAuth()
  const { currentUser } = useUser()
  const { currentTenant } = useTenant()
  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('sidebarOpen')
    if (saved === 'true') {
      setIsOpen(true)
    }
  }, [])

  // Persist sidebar state to localStorage whenever it changes (only after mount)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarOpen', String(isOpen))
    }
  }, [isOpen, mounted])

  const sidebarState: SidebarState = {
    isOpen,
    onToggle: () => setIsOpen(!isOpen),
    settingsItems: settingsItems,
    profileItem: getProfileItem(currentUser?.givenName || email?.split('@')[0] || ''),
    appName: APP_NAME,
    tenantName: currentTenant?.displayName || tenantName || ''
  }

  return (
    <>
      <DesktopSidebar {...sidebarState} />
      <MobileSidebar {...sidebarState} />
      
      {/* Main Content Area - adjusts margin based on sidebar state */}
      <div 
        className={`min-h-screen pt-14 md:pt-0 transition-all ${isOpen ? 'md:ml-64' : 'md:ml-16'}`}
        style={{ 
          backgroundColor: theme.colors.content,
          transitionDuration: `${TRANSITION_DURATION}ms`
        }}
      >
        {children}
      </div>
    </>
  )
}
