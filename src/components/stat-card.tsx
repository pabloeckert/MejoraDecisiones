import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  hint,
  accent,
  className,
  children,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  accent?: 'primary' | 'ally' | 'rival' | 'warn' | 'neutral'
  className?: string
  children?: ReactNode
}) {
  const accentMap: Record<string, string> = {
    primary: 'border-l-primary',
    ally: 'border-l-signal-ally',
    rival: 'border-l-signal-rival',
    warn: 'border-l-signal-warn',
    neutral: 'border-l-signal-neutral',
  }
  return (
    <div
      className={cn(
        'relative bg-card border border-border/60 rounded-lg p-4 border-l-2',
        accent && accentMap[accent],
        className,
      )}
    >
      <div className="text-[9px] font-display uppercase tracking-[0.2em] text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="mt-1.5 font-display text-2xl text-foreground leading-tight font-bold">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      )}
      {children}
    </div>
  )
}
