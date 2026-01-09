import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'
import { cn } from '../lib/utils'

type ThreatLevel = 'ALERT' | 'UNLIKELY' | 'UNCERTAIN'

interface ThreatBadgeProps {
  level: ThreatLevel
  className?: string
}

const config: Record<ThreatLevel, {
  icon: typeof AlertTriangle
  label: string
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  ALERT: {
    icon: AlertTriangle,
    label: 'POTENTIAL THREAT',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
  },
  UNLIKELY: {
    icon: CheckCircle,
    label: 'UNLIKELY THREAT',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
  UNCERTAIN: {
    icon: HelpCircle,
    label: 'UNCERTAIN',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
  },
}

export function ThreatBadge({ level, className }: ThreatBadgeProps) {
  const { icon: Icon, label, bgColor, textColor, borderColor } = config[level]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm",
        bgColor,
        textColor,
        borderColor,
        className
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </div>
  )
}
