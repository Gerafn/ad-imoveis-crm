import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, GitBranch, Building2, Target, Settings, Bell } from 'lucide-react'
import { useReminderStore } from '../../store'
import { ReminderPanel } from '../reminders/ReminderPanel'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Funil de Vendas', icon: GitBranch },
  { to: '/proprietarios', label: 'Proprietários', icon: Building2 },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/metas', label: 'Metas', icon: Target },
]

export function Sidebar() {
  const { pendentes } = useReminderStore()
  const [reminderOpen, setReminderOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-40"
        style={{ background: 'linear-gradient(180deg, #0F2D48 0%, #1B4F72 100%)' }}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F39C12] rounded-xl flex items-center justify-center shadow-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-tight block">AD Imóveis</span>
              <span className="text-white/50 text-xs">CRM Imobiliário</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-white/15 text-white border-l-4 border-[#F39C12] pl-2'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          {/* Lembretes */}
          <button
            onClick={() => setReminderOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-white/60 hover:bg-white/10 hover:text-white relative"
          >
            <div className="relative flex-shrink-0">
              <Bell size={18} />
              {pendentes.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F39C12] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendentes.length > 9 ? '9+' : pendentes.length}
                </span>
              )}
            </div>
            Lembretes
          </button>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs">v1.0 · AD Imóveis CRM</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F2D48] border-t border-white/10 flex">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#F39C12]' : 'text-white/50'
              }`
            }
          >
            <Icon size={20} />
            <span className="truncate px-1">{label.split(' ')[0]}</span>
          </NavLink>
        ))}
        {/* Bell mobile */}
        <button
          onClick={() => setReminderOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium text-white/50 relative"
        >
          <div className="relative">
            <Bell size={20} />
            {pendentes.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F39C12] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {pendentes.length > 9 ? '9+' : pendentes.length}
              </span>
            )}
          </div>
          <span>Alertas</span>
        </button>
      </nav>

      <ReminderPanel open={reminderOpen} onClose={() => setReminderOpen(false)} />
    </>
  )
}
