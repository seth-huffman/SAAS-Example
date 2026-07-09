import * as React from 'react'
import { cn } from '@/lib/utils'

const VARIANT: Record<string, string> = {
  default:     'badge badge--primary',
  secondary:   'badge badge--secondary',
  destructive: 'badge badge--destructive',
  outline:     'badge badge--outline',
  ghost:       'badge',
}

function Badge({ className, variant = 'default', ...props }: React.ComponentProps<'span'> & { variant?: string }) {
  return (
    <span
      data-slot="badge"
      className={cn(VARIANT[variant] ?? 'badge', className)}
      {...props}
    />
  )
}

export { Badge }
