export type LeadTemperature = 'Frio' | 'Morno' | 'Quente'
export type LeadFase =
  | 'Contato'
  | 'Qualificação'
  | 'Agendamento'
  | 'Visita'
  | 'Negociação'
  | 'Proposta Comercial'
  | 'Contrato'
export type LeadTipo = string
export type LeadMeio = 'Facebook' | 'Instagram' | 'Site' | 'Indicação' | 'Imobiliária' | 'Placa' | 'Campanha' | 'Marketplace' | 'Outro'

export interface Lead {
  id: string
  data: string
  nome: string
  telefone: string
  tipo: LeadTipo
  imovel: string
  meio: LeadMeio
  valor: number
  fase: LeadFase
  temperatura: LeadTemperature
  observacoes: string
  customFields: Record<string, string>
  createdAt: string
}

export type OwnerTipo = 'Casa' | 'Apartamento' | 'Terreno' | 'Sala Comercial' | 'Investidor'
export type OwnerNegocio = 'Venda' | 'Aluguel' | 'Avaliar para Venda' | 'Venda e Aluguel'

export type OwnerDocumentacao =
  | 'OK'
  | 'Contrato de Compra e Venda'
  | 'Escritura'
  | 'Inventário'
  | 'Matrícula'
  | 'IPTU'
  | 'Habite-se'
  | 'Procuração'
  | 'Pendente'

export interface Owner {
  id: string
  data: string
  nome: string
  telefone: string
  tipo: OwnerTipo
  negocio: OwnerNegocio
  escritura: boolean
  endereco: string
  exclusividade: boolean
  captacao: string
  documentacao: OwnerDocumentacao | ''
  observacoes: string
  customFields: Record<string, string>
  createdAt: string
}

export interface Reminder {
  id: string
  titulo: string
  descricao: string
  data: string
  hora: string
  leadId: string | null
  concluido: boolean
  createdAt: string
}

export interface Goals {
  vendaMensal: number
  aluguelMensal: number
}

export interface CustomField {
  id: string
  label: string
  type: 'text' | 'number' | 'select'
  options?: string[]
  module: 'leads' | 'owners'
}

export const LEAD_FASES: LeadFase[] = [
  'Contato',
  'Qualificação',
  'Agendamento',
  'Visita',
  'Negociação',
  'Proposta Comercial',
  'Contrato',
]

export const LEAD_MEIOS: LeadMeio[] = ['Facebook', 'Instagram', 'Site', 'Indicação', 'Imobiliária', 'Placa', 'Campanha', 'Marketplace', 'Outro']
export const OWNER_DOCUMENTACOES: OwnerDocumentacao[] = [
  'OK',
  'Contrato de Compra e Venda',
  'Escritura',
  'Inventário',
  'Matrícula',
  'IPTU',
  'Habite-se',
  'Procuração',
  'Pendente',
]
export const LEAD_TIPOS: string[] = ['Venda', 'Aluguel', 'Aluguel e Venda', 'Outro']
export const LEAD_TEMPERATURES: LeadTemperature[] = ['Frio', 'Morno', 'Quente']
export const OWNER_TIPOS: OwnerTipo[] = ['Casa', 'Apartamento', 'Terreno', 'Sala Comercial', 'Investidor']
export const OWNER_NEGOCIOS: OwnerNegocio[] = ['Venda', 'Aluguel', 'Avaliar para Venda', 'Venda e Aluguel']
