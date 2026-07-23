import { cn } from "../../utils/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-slate-200/80 bg-white/85 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-800/15 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:bg-slate-950",
        className,
      )}
      {...props}
    />
  );
}
