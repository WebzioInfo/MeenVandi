'use client'

import * as React from 'react'
import { cn } from '@/app/lib/utils'

/* ============================
   Loading Spinner Component
============================ */

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'white'
  text?: string
  showText?: boolean
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size = 'md', 
    variant = 'default',
    text,
    showText = false,
    ...props 
  }, ref) => {
    const sizeStyles = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    }

    const variantStyles = {
      default: 'text-gray-600',
      primary: 'text-blue-600',
      secondary: 'text-gray-400',
      white: 'text-white',
    }

    const textSizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    }

    const defaultTexts = {
      sm: 'Loading...',
      md: 'Loading...',
      lg: 'Loading, please wait...',
      xl: 'Loading, please wait...',
    }

    const displayText = text || defaultTexts[size]

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          showText && 'flex-col space-y-2',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            sizeStyles[size],
            variantStyles[variant]
          )}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        {showText && (
          <p className={cn('text-gray-600 font-medium', textSizes[size])}>
            {displayText}
          </p>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

/* ============================
   Loading Overlay
============================ */

interface LoadingOverlayProps extends LoadingSpinnerProps {
  backdrop?: boolean
  fullScreen?: boolean
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    backdrop = true, 
    fullScreen = false,
    className,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0',
          backdrop && 'bg-white/80 backdrop-blur-sm',
          className
        )}
      >
        <LoadingSpinner {...props} />
      </div>
    )
  }
)
LoadingOverlay.displayName = 'LoadingOverlay'

/* ============================
   Loading Page
============================ */

interface LoadingPageProps {
  text?: string
  size?: 'md' | 'lg' | 'xl'
}

const LoadingPage = React.forwardRef<HTMLDivElement, LoadingPageProps>(
  ({ text, size = 'lg' }, ref) => {
    return (
      <div
        ref={ref}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <LoadingSpinner 
          size={size} 
          showText 
          text={text}
          className="flex-col space-y-4"
        />
      </div>
    )
  }
)
LoadingPage.displayName = 'LoadingPage'

/* ============================
   Skeleton Loader
============================ */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'text',
    width,
    height,
    animation = 'pulse',
    ...props 
  }, ref) => {
    const variantStyles = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    }

    const animationStyles = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      none: '',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200',
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        style={{
          width: width || (variant === 'circular' ? '2.5rem' : '100%'),
          height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '2.5rem' : '8rem'),
        }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

/* ============================
   Loading Button
============================ */

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    children, 
    loading = false, 
    loadingText,
    disabled,
    className,
    variant = 'default',
    size = 'default',
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center rounded-md text-sm font-medium 
      transition-colors focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-ring focus-visible:ring-offset-2 
      disabled:opacity-50 disabled:pointer-events-none 
      ring-offset-background
    `
    
    const variantStyles = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'hover:bg-gray-100',
      link: 'underline-offset-4 hover:underline text-blue-600',
    }

    const sizeStyles = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <>
            <div
              className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"
            />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
LoadingButton.displayName = 'LoadingButton'

/* ============================
   Exports
============================ */

export { 
  LoadingSpinner, 
  LoadingOverlay, 
  LoadingPage, 
  Skeleton,
  LoadingButton 
}
