import { useState } from 'react'
import type { Lead, LeadFase } from '../../types'
import { LEAD_FASES } from '../../types'
import { TemperatureBadge } from '../ui/Badge'
import { formatCurrency } from '../../utils'
import { Phone } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const faseColors: Record<LeadFase, string> = {
  'Contato': 'bg-slate-400',
  'Qualificação': 'bg-blue-400',
  'Agendamento': 'bg-indigo-400',
  'Visita': 'bg-purple-400',
  'Negociação': 'bg-yellow-400',
  'Proposta Comercial': 'bg-orange-400',
  'Contrato': 'bg-green-500',
}

function KanbanCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <p className="font-medium text-slate-800 text-sm mb-1 truncate">{lead.nome}</p>
      <a href={`tel:${lead.telefone}`} className="text-xs text-slate-400 flex items-center gap-1 mb-2">
        <Phone size={10} />{lead.telefone}
      </a>
      {lead.valor > 0 && (
        <p className="text-xs font-mono font-semibold text-[#1B4F72] mb-2">{formatCurrency(lead.valor)}</p>
      )}
      <div className="flex items-center justify-between">
        <TemperatureBadge value={lead.temperatura} />
        <span className="text-xs text-slate-400">{lead.meio}</span>
      </div>
    </div>
  )
}

function KanbanColumn({ fase, leads }: { fase: LeadFase; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: fase })

  return (
    <div className="flex-shrink-0 w-60">
      <div className="mb-3 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${faseColors[fase]}`} />
        <h3 className="font-semibold text-sm text-slate-700">{fase}</h3>
        <span className="ml-auto bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-32 rounded-xl p-2 transition-colors ${isOver ? 'bg-[#1B4F72]/10 border-2 border-dashed border-[#1B4F72]/30' : 'bg-slate-100/60'}`}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {leads.map(lead => <KanbanCard key={lead.id} lead={lead} />)}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

interface LeadKanbanProps {
  leads: Lead[]
  onMove: (id: string, fase: LeadFase) => void
}

export function LeadKanban({ leads, onMove }: LeadKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeLead = leads.find(l => l.id === activeId)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const leadId = active.id as string
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return
    const targetFase = LEAD_FASES.includes(over.id as LeadFase)
      ? (over.id as LeadFase)
      : leads.find(l => l.id === over.id)?.fase
    if (targetFase && targetFase !== lead.fase) {
      onMove(leadId, targetFase)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_FASES.map(fase => (
          <KanbanColumn
            key={fase}
            fase={fase}
            leads={leads.filter(l => l.fase === fase)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeLead && (
          <div className="bg-white rounded-xl p-3 shadow-xl border border-[#1B4F72]/20 w-56 rotate-2">
            <p className="font-medium text-slate-800 text-sm">{activeLead.nome}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
