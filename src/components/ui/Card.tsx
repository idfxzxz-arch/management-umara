import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-white/70 bg-white/88 shadow-[0_16px_45px_rgba(15,23,42,0.07)] ring-1 ring-slate-900/[0.03] backdrop-blur dark:border-white/10 dark:bg-slate-900/78 dark:shadow-black/20 dark:ring-white/[0.04]', className)}
      {...props}
    />
  )
}
