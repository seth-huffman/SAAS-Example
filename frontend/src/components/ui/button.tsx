import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cn } from '@/lib/utils'

const VARIANT: Record<string, string> = {
  default:     'btn btn--primary',
  outline:     'btn btn--outline',
  secondary:   'btn btn--secondary',
  ghost:       'btn btn--ghost',
  destructive: 'btn btn--destructive',
  link:        'btn btn--link',
}

const SIZE: Record<string, string> = {
  default:   '',
  xs:        'btn--xs',
  sm:        'btn--sm',
  lg:        'btn--lg',
  icon:      'btn--icon',
  'icon-xs': 'btn--icon btn--xs',
  'icon-sm': 'btn--icon btn--sm',
  'icon-lg': 'btn--icon btn--lg',
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & { variant?: string; size?: string }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(VARIANT[variant] ?? 'btn', SIZE[size], className)}
      {...props}
    />
  )
}

export { Button }
