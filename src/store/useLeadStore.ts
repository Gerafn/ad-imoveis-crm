import { useState, useEffect } from 'react'
import type { Lead } from '../types'
import { supabase } from '../lib/supabase'

function dbToLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    data: row.data as string,
    nome: row.nome as string,
    telefone: row.telefone as string,
    tipo: row.tipo as Lead['tipo'],
    imovel: row.imovel as string,
    meio: row.meio as Lead['meio'],
    valor: row.valor as number,
    fase: row.fase as Lead['fase'],
    temperatura: row.temperatura as Lead['temperatura'],
    observacoes: (row.observacoes as string) || '',
    customFields: (row.custom_fields as Record<string, string>) || {},
    createdAt: row.created_at as string,
  }
}

async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(dbToLead)
}

export function useLeadStore() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads().then(data => {
      setLeads(data)
      setLoading(false)
    })

    const channel = supabase
      .channel('leads-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads().then(setLeads)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    await supabase.from('leads').insert({
      data: lead.data,
      nome: lead.nome,
      telefone: lead.telefone,
      tipo: lead.tipo,
      imovel: lead.imovel,
      meio: lead.meio,
      valor: lead.valor,
      fase: lead.fase,
      temperatura: lead.temperatura,
      observacoes: lead.observacoes,
      custom_fields: lead.customFields,
    })
  }

  const updateLead = async (id: string, data: Partial<Lead>) => {
    const dbData: Record<string, unknown> = {}
    if (data.data !== undefined) dbData.data = data.data
    if (data.nome !== undefined) dbData.nome = data.nome
    if (data.telefone !== undefined) dbData.telefone = data.telefone
    if (data.tipo !== undefined) dbData.tipo = data.tipo
    if (data.imovel !== undefined) dbData.imovel = data.imovel
    if (data.meio !== undefined) dbData.meio = data.meio
    if (data.valor !== undefined) dbData.valor = data.valor
    if (data.fase !== undefined) dbData.fase = data.fase
    if (data.temperatura !== undefined) dbData.temperatura = data.temperatura
    if (data.observacoes !== undefined) dbData.observacoes = data.observacoes
    if (data.customFields !== undefined) dbData.custom_fields = data.customFields
    await supabase.from('leads').update(dbData).eq('id', id)
  }

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id)
  }

  const moveLead = async (id: string, newFase: Lead['fase']) => {
    await supabase.from('leads').update({ fase: newFase }).eq('id', id)
  }

  return { leads, loading, addLead, updateLead, deleteLead, moveLead, setLeads }
}
