import { useState, useEffect } from 'react'
import type { Owner } from '../types'
import { supabase } from '../lib/supabase'

function dbToOwner(row: Record<string, unknown>): Owner {
  return {
    id: row.id as string,
    data: row.data as string,
    nome: row.nome as string,
    telefone: row.telefone as string,
    tipo: row.tipo as Owner['tipo'],
    negocio: row.negocio as Owner['negocio'],
    escritura: row.escritura as boolean,
    endereco: (row.endereco as string) || '',
    exclusividade: row.exclusividade as boolean,
    captacao: (row.captacao as string) || '',
    documentacao: (row.documentacao as Owner['documentacao']) || '',
    observacoes: (row.observacoes as string) || '',
    customFields: (row.custom_fields as Record<string, string>) || {},
    createdAt: row.created_at as string,
  }
}

async function fetchOwners(): Promise<Owner[]> {
  const { data, error } = await supabase
    .from('proprietarios')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(dbToOwner)
}

export function useOwnerStore() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOwners().then(data => {
      setOwners(data)
      setLoading(false)
    })

    const channel = supabase
      .channel('proprietarios-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proprietarios' }, () => {
        fetchOwners().then(setOwners)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addOwner = async (owner: Omit<Owner, 'id' | 'createdAt'>) => {
    await supabase.from('proprietarios').insert({
      data: owner.data,
      nome: owner.nome,
      telefone: owner.telefone,
      tipo: owner.tipo,
      negocio: owner.negocio,
      escritura: owner.escritura,
      endereco: owner.endereco,
      exclusividade: owner.exclusividade,
      captacao: owner.captacao,
      documentacao: owner.documentacao || null,
      observacoes: owner.observacoes,
      custom_fields: owner.customFields,
    })
  }

  const updateOwner = async (id: string, data: Partial<Owner>) => {
    const dbData: Record<string, unknown> = {}
    if (data.data !== undefined) dbData.data = data.data
    if (data.nome !== undefined) dbData.nome = data.nome
    if (data.telefone !== undefined) dbData.telefone = data.telefone
    if (data.tipo !== undefined) dbData.tipo = data.tipo
    if (data.negocio !== undefined) dbData.negocio = data.negocio
    if (data.escritura !== undefined) dbData.escritura = data.escritura
    if (data.endereco !== undefined) dbData.endereco = data.endereco
    if (data.exclusividade !== undefined) dbData.exclusividade = data.exclusividade
    if (data.captacao !== undefined) dbData.captacao = data.captacao
    if (data.documentacao !== undefined) dbData.documentacao = data.documentacao || null
    if (data.observacoes !== undefined) dbData.observacoes = data.observacoes
    if (data.customFields !== undefined) dbData.custom_fields = data.customFields
    await supabase.from('proprietarios').update(dbData).eq('id', id)
  }

  const deleteOwner = async (id: string) => {
    await supabase.from('proprietarios').delete().eq('id', id)
  }

  return { owners, loading, addOwner, updateOwner, deleteOwner }
}
