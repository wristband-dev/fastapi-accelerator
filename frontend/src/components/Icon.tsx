import { LucideProps } from 'lucide-react'
import { useState, useEffect } from 'react'

interface IconProps {
  name: string
  className?: string
  size?: number
}

// Map of custom SVG icons available in public/symbols/
const CUSTOM_ICONS = new Set([''])

export function Icon({ name, className = '', size = 20 }: IconProps) {
  const [useCustom, setUseCustom] = useState(false)
  const [LucideIcon, setLucideIcon] = useState<React.ComponentType<LucideProps> | null>(null)

  useEffect(() => {
    // Check if custom icon exists
    if (CUSTOM_ICONS.has(name)) {
      setUseCustom(true)
      return
    }

    // Otherwise load from lucide-react
    const loadLucideIcon = async () => {
      try {
        // Convert kebab-case to PascalCase (e.g., 'user-lock' -> 'UserLock')
        const iconName = name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('')

        const lucideModule = await import('lucide-react')
        const IconComponent = (lucideModule as any)[iconName]
        
        if (IconComponent) {
          setLucideIcon(() => IconComponent)
        } else {
          console.warn(`Icon "${name}" not found in lucide-react, falling back to default`)
          setLucideIcon(() => (lucideModule as any).HelpCircle) // Fallback icon
        }
      } catch (error) {
        console.error(`Error loading icon "${name}":`, error)
      }
    }

    loadLucideIcon()
  }, [name])

  // Use custom SVG sprite
  if (useCustom) {
    return (
      <svg
        className={`text-inherit ${className}`}
        width={size}
        height={size}
        aria-hidden="true"
        strokeWidth="1.5"
        stroke="currentColor"
        fill="none"
        style={{ color: 'inherit' }}
      >
        <use href={`/symbols/${name}.svg#icon-${name}`} />
      </svg>
    )
  }

  // Use Lucide React component
  if (LucideIcon) {
    return <LucideIcon size={size} className={className} strokeWidth={1.5} />
  }

  // Loading state
  return null
}
