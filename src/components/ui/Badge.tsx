import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const tones = {
  green: 'bg-green-100 text-green-800 ring-green-700/10 dark:bg-green-500/15 dark:text-green-200 dark:ring-green-300/10',
  blue: 'bg-sky-100 text-sky-800 ring-sky-700/10 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-300/10',
  amber: 'bg-amber-100 text-amber-800 ring-amber-700/10 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-300/10',
  slate: 'bg-slate-100 text-slate-700 ring-slate-700/10 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10',
}

export function Badge({ className, tone = 'slate', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1', tones[tone], className)} {...props} />
}
