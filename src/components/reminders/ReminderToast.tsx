import { useEffect, useRef, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useReminderStore } from '../../store'

interface Toast {
  id: string
  titulo: string
  descricao: string
}

export function ReminderToast() {
  const { reminders, toggleReminder } = useReminderStore()
  const [toasts, setToasts] = useState<Toast[]>([])
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const check = () => {
      const now = new Date()
      reminders.forEach(r => {
        if (r.concluido) return
        if (notifiedRef.current.has(r.id)) return
        const dt = new Date(`${r.data}T${r.hora}`)
        const diff = Math.abs(now.getTime() - dt.getTime())
        if (diff <= 60000 && now >= dt) {
          notifiedRef.current.add(r.id)
          setToasts(prev => [...prev, { id: r.id, titulo: r.titulo, descricao: r.descricao }])
        }
      })
    }

    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [reminders])

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const complete = (id: string) => {
    toggleReminder(id, true)
    dismiss(id)
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <div key={toast.id} className="bg-white rounded-2xl shadow-xl border border-amber-200 p-4 flex gap-3 animate-slide-in">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm">{toast.titulo}</p>
            {toast.descricao && <p className="text-xs text-slate-500 mt-0.5 truncate">{toast.descricao}</p>}
            <button
              onClick={() => complete(toast.id)}
              className="mt-2 text-xs font-medium text-[#1B4F72] hover:underline"
            >
              Marcar como concluído
            </button>
          </div>
          <button onClick={() => dismiss(toast.id)} className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
