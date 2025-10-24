'use client'

import * as React from 'react'
import { cn } from '@/app/lib/utils'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  variant?: 'default' | 'error' | 'success'
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'text-gray-700',
      error: 'text-red-600',
      success: 'text-green-600',
    }

    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )
  }
)
Label.displayName = 'Label'

export { Label }