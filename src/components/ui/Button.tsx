import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/20 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-green-700 text-white shadow-sm shadow-green-900/20 hover:bg-green-800 hover:shadow-md hover:shadow-green-900/20',
        secondary: 'border border-slate-200/80 bg-white/85 text-slate-800 shadow-sm hover:border-green-700/20 hover:bg-green-50/70 dark:border-white/10 dark:bg-white/7 dark:text-slate-100 dark:hover:bg-white/12',
        ghost: 'text-slate-700 hover:bg-green-50 hover:text-green-800 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
