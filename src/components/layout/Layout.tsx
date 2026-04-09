import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { ReminderToast } from '../reminders/ReminderToast'
import { useReminderStore } from '../../store'

export function Layout({ children }: { children: ReactNode }) {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useReminderStore()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        reminders={reminders}
        onAddReminder={addReminder}
        onToggleReminder={toggleReminder}
        onDeleteReminder={deleteReminder}
      />
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
      <ReminderToast reminders={reminders} onComplete={id => toggleReminder(id, true)} />
    </div>
  )
}
