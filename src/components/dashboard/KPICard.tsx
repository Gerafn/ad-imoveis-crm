import type { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: ReactNode
  color: 'blue' | 'green' | 'orange' | 'red'
}

const colors = {
  blue: { bg: 'bg-blue-50', icon: 'bg-[#1B4F72] text-white', value: 'text-[#1B4F72]' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-600 text-white', value: 'text-emerald-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-[#F39C12] text-white', value: 'text-orange-700' },
  red: { bg: 'bg-red-50', icon: 'bg-red-500 text-white', value: 'text-red-700' },
}

export function KPICard({ title, value, subtitle, icon, color }: KPICardProps) {
  const c = colors[color]
  return (
    <div className={`${c.bg} rounded-2xl p-5 shadow-sm border border-white flex items-center gap-4`}>
      <div className={`${c.icon} w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold ${c.value} leading-tight`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
