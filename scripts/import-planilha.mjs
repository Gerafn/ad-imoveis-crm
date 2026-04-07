import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  'https://tfmavtkoslvmczpxntja.supabase.co',
  'sb_publishable_mtWwEFdInuCiqerqxc3hNg_LRz7goU7'
)

function excelDateToISO(serial) {
  if (!serial || typeof serial === 'string') return new Date().toISOString().split('T')[0]
  if (serial < 1000) return new Date().toISOString().split('T')[0] // só ano (ex: 2024)
  const date = new Date((serial - 25569) * 86400 * 1000)
  return date.toISOString().split('T')[0]
}

function mapMeio(valor) {
  if (!valor) return 'Site'
  const v = String(valor).toLowerCase()
  if (v.includes('facebook')) return 'Facebook'
  if (v.includes('instagram')) return 'Instagram'
  if (v.includes('indica')) return 'Indicação'
  if (v.includes('imobili')) return 'Imobiliária'
  return 'Site'
}

function mapTemperatura(valor) {
  if (!valor) return 'Frio'
  const v = String(valor).trim()
  if (v === 'Quente') return 'Quente'
  if (v === 'Morno') return 'Morno'
  return 'Frio'
}

function mapFase(valor) {
  const fases = ['Contato', 'Qualificação', 'Agendamento', 'Visita', 'Negociação', 'Proposta Comercial', 'Contrato']
  if (!valor) return 'Contato'
  const found = fases.find(f => f.toLowerCase() === String(valor).toLowerCase())
  return found || 'Contato'
}

function mapNegocio(valor) {
  const negocios = ['Venda', 'Aluguel', 'Avaliar para Venda', 'Venda e Aluguel']
  if (!valor) return 'Venda'
  const v = String(valor).toLowerCase()
  if (v.includes('aluguel') && v.includes('venda')) return 'Venda e Aluguel'
  if (v.includes('avaliar')) return 'Avaliar para Venda'
  if (v.includes('aluguel')) return 'Aluguel'
  return 'Venda'
}

async function importLeads() {
  const wb = XLSX.readFile('./CRM AD IMOVEIS 3.2.xlsx')
  const sheet = wb.Sheets['Funil de Vendas']
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  const leads = []
  for (let i = 9; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row[1]) continue

    leads.push({
      data: excelDateToISO(row[0]),
      nome: String(row[1]).trim(),
      telefone: row[2] ? String(row[2]).trim() : '',
      tipo: row[3] ? String(row[3]).trim() : 'Venda',
      imovel: row[4] ? String(row[4]).trim() : '',
      meio: mapMeio(row[5]),
      valor: (row[6] !== null && row[6] !== undefined && !isNaN(Number(row[6]))) ? Number(row[6]) : 0,
      fase: mapFase(row[7]),
      temperatura: mapTemperatura(row[8]),
      observacoes: '',
      custom_fields: {},
    })
  }

  console.log(`Importando ${leads.length} leads...`)
  const { error } = await supabase.from('leads').insert(leads)
  if (error) console.error('Erro leads:', error.message)
  else console.log(`✓ ${leads.length} leads importados!`)
}

async function importProprietarios() {
  const wb = XLSX.readFile('./CRM AD IMOVEIS 3.2.xlsx')
  const sheet = wb.Sheets['Proprietários']
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  const owners = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row[1]) continue

    owners.push({
      data: excelDateToISO(row[0]),
      nome: String(row[1]).trim(),
      telefone: row[2] ? String(row[2]).trim() : '',
      tipo: row[3] ? String(row[3]).trim() : 'Casa',
      negocio: mapNegocio(row[4]),
      escritura: row[5] ? String(row[5]).toLowerCase().includes('sim') : false,
      endereco: row[6] ? String(row[6]).trim() : '',
      exclusividade: row[7] ? String(row[7]).toLowerCase().includes('sim') : false,
      captacao: row[8] ? String(row[8]).trim() : '',
      custom_fields: {},
    })
  }

  console.log(`Importando ${owners.length} proprietários...`)
  const { error } = await supabase.from('proprietarios').insert(owners)
  if (error) console.error('Erro proprietários:', error.message)
  else console.log(`✓ ${owners.length} proprietários importados!`)
}

await importLeads()
await importProprietarios()
console.log('\nImportação concluída!')
