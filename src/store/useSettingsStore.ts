import { useState, useEffect } from 'react'
import type { Goals, CustomField } from '../types'
import { supabase } from '../lib/supabase'

async function fetchSettings() {
  const [metasRes, configRes] = await Promise.all([
    supabase.from('metas').select('*').eq('id', 1).single(),
    supabase.from('configuracoes').select('*').eq('id', 1).single(),
  ])
  const goals: Goals = metasRes.data
    ? { vendaMensal: metasRes.data.venda_mensal, aluguelMensal: metasRes.data.aluguel_mensal }
    : { vendaMensal: 0, aluguelMensal: 0 }
  const customFields: CustomField[] = configRes.data?.custom_fields ?? []
  return { goals, customFields }
}

export function useSettingsStore() {
  const [goals, setGoalsState] = useState<Goals>({ vendaMensal: 0, aluguelMensal: 0 })
  const [customFields, setCustomFieldsState] = useState<CustomField[]>([])

  useEffect(() => {
    fetchSettings().then(({ goals, customFields }) => {
      setGoalsState(goals)
      setCustomFieldsState(customFields)
    })

    const channel = supabase
      .channel('settings-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metas' }, () => {
        fetchSettings().then(({ goals }) => setGoalsState(goals))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes' }, () => {
        fetchSettings().then(({ customFields }) => setCustomFieldsState(customFields))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const saveGoals = async (g: Goals) => {
    setGoalsState(g)
    await supabase.from('metas').upsert({ id: 1, venda_mensal: g.vendaMensal, aluguel_mensal: g.aluguelMensal })
  }

  const addCustomField = async (field: Omit<CustomField, 'id'>) => {
    const newField: CustomField = { ...field, id: crypto.randomUUID() }
    const updated = [...customFields, newField]
    setCustomFieldsState(updated)
    await supabase.from('configuracoes').upsert({ id: 1, custom_fields: updated })
  }

  const updateCustomField = async (id: string, data: Partial<CustomField>) => {
    const updated = customFields.map(f => (f.id === id ? { ...f, ...data } : f))
    setCustomFieldsState(updated)
    await supabase.from('configuracoes').upsert({ id: 1, custom_fields: updated })
  }

  const deleteCustomField = async (id: string) => {
    const updated = customFields.filter(f => f.id !== id)
    setCustomFieldsState(updated)
    await supabase.from('configuracoes').upsert({ id: 1, custom_fields: updated })
  }

  return { goals, saveGoals, customFields, addCustomField, updateCustomField, deleteCustomField }
}
