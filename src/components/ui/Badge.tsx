import type { LeadTemperature } from '../../types'

const tempColors: Record<LeadTemperature, string> = {
  Frio: 'bg-blue-100 text-blue-700 border-blue-200',
  Morno: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Quente: 'bg-red-100 text-red-700 border-red-200',
}

const tempDot: Record<LeadTemperature, string> = {
  Frio: 'bg-blue-500',
  Morno: 'bg-yellow-500',
  Quente: 'bg-red-500',
}

export function TemperatureBadge({ value }: { value: LeadTemperature }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${tempColors[value]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${tempDot[value]}`} />
      {value}
    </span>
  )
}

export function FaseBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {value}
    </span>
  )
}

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    gray: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}
