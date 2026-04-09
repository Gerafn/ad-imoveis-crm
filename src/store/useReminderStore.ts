import { useState, useEffect } from 'react'
import type { Reminder } from '../types'
import { supabase } from '../lib/supabase'

function dbToReminder(row: Record<string, unknown>): Reminder {
  return {
    id: row.id as string,
    titulo: row.titulo as string,
    descricao: (row.descricao as string) || '',
    data: row.data as string,
    hora: row.hora as string,
    leadId: (row.lead_id as string) || null,
    concluido: row.concluido as boolean,
    createdAt: row.created_at as string,
  }
}

async function fetchReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('lembretes')
    .select('*')
    .order('data', { ascending: true })
  if (error || !data) return []
  return data.map(dbToReminder)
}

export function useReminderStore() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReminders().then(data => {
      setReminders(data)
      setLoading(false)
    })

    const channel = supabase
      .channel('lembretes-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lembretes' }, () => {
        fetchReminders().then(setReminders)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addReminder = async (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    await supabase.from('lembretes').insert({
      titulo: reminder.titulo,
      descricao: reminder.descricao,
      data: reminder.data,
      hora: reminder.hora,
      lead_id: reminder.leadId || null,
      concluido: false,
    })
  }

  const toggleReminder = async (id: string, concluido: boolean) => {
    await supabase.from('lembretes').update({ concluido }).eq('id', id)
  }

  const deleteReminder = async (id: string) => {
    await supabase.from('lembretes').delete().eq('id', id)
  }

  const pendentes = reminders.filter(r => !r.concluido)

  return { reminders, loading, pendentes, addReminder, toggleReminder, deleteReminder }
}
