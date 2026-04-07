import { formatCurrency } from '../../utils'

interface GoalProgressProps {
  label: string
  current: number
  goal: number
  color: string
}

export function GoalProgress({ label, current, goal, color }: GoalProgressProps) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-800">{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-slate-400">{formatCurrency(current)} realizado</span>
        <span className="text-xs text-slate-400">Meta: {formatCurrency(goal)}</span>
      </div>
    </div>
  )
}
