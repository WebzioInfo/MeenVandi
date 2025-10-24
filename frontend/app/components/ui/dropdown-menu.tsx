'use client'

import * as React from 'react'
import { ChevronDown, Check, Circle } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

const DropdownMenu = ({ children, open, onOpenChange }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <DropdownMenuContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('DropdownMenu components must be used within a DropdownMenu')
  }
  return context
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenu()

    if (asChild && React.isValidElement(children)) {
  return React.cloneElement(children as React.ReactElement<any>, {
    onClick: () => setOpen(!open),
  })
}


    return (
      <button
        ref={ref}
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'end' | 'center'
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, align = 'start', sideOffset = 4, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenu()

    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false)
        }
      }

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node
        if (!document.querySelector('.dropdown-menu-content')?.contains(target)) {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener('keydown', handleEscape)
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [open, setOpen])

    if (!open) return null

    const alignmentStyles = {
      start: 'left-0',
      end: 'right-0',
      center: 'left-1/2 transform -translate-x-1/2',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'dropdown-menu-content absolute z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          'animate-in fade-in-80 zoom-in-95',
          alignmentStyles[align],
          className
        )}
        style={{ top: `calc(100% + ${sideOffset}px)` }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  variant?: 'default' | 'destructive'
  inset?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, className, disabled, onClick, variant = 'default', inset = false, ...props }, ref) => {
    const { setOpen } = useDropdownMenu()

    const handleClick = () => {
      if (!disabled) {
        onClick?.()
        setOpen(false)
      }
    }

    const variantStyles = {
      default: 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100',
      destructive: 'text-red-600 hover:bg-red-50 focus:bg-red-50',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900',
          variantStyles[variant],
          disabled && 'opacity-50 pointer-events-none',
          inset && 'pl-8',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ children, checked, onCheckedChange, className, disabled, ...props }, ref) => {
    const { setOpen } = useDropdownMenu()

    const handleClick = () => {
      if (!disabled) {
        onCheckedChange?.(!checked)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    )
  }
)
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

interface DropdownMenuRadioItemProps {
  children: React.ReactNode
  value: string
  checked?: boolean
  onSelect?: (value: string) => void
  className?: string
  disabled?: boolean
}

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ children, value, checked, onSelect, className, disabled, ...props }, ref) => {
    const { setOpen } = useDropdownMenu()

    const handleClick = () => {
      if (!disabled) {
        onSelect?.(value)
        setOpen(false)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Circle className="h-2 w-2 fill-current" />}
        </span>
        {children}
      </div>
    )
  }
)
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
  inset?: boolean
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ children, className, inset = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-sm font-semibold text-gray-900',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

interface DropdownMenuSeparatorProps {
  className?: string
}

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

interface DropdownMenuGroupProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuGroup = React.forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-1', className)}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuGroup.displayName = 'DropdownMenuGroup'

interface DropdownMenuShortcutProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, DropdownMenuShortcutProps>(
  ({ children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('ml-auto text-xs tracking-widest text-gray-500', className)}
      {...props}
    >
      {children}
    </span>
  )
)
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

interface DropdownMenuSubProps {
  children: React.ReactNode
}

const DropdownMenuSub = ({ children }: DropdownMenuSubProps) => {
  return <div className="relative">{children}</div>
}

interface DropdownMenuSubTriggerProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-gray-100',
        'data-[state=open]:bg-gray-100',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="ml-auto h-4 w-4" />
    </div>
  )
)
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

interface DropdownMenuSubContentProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute left-full top-0 z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg',
        'animate-in slide-in-from-right-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

// Export all components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}