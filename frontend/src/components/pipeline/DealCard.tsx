import type { PipelineDeal } from '@/types'
import { formatCurrency }    from '@/lib/utils'

interface DealCardProps {
  deal:       PipelineDeal
  stageColor: string
  onDragStart?: (e: React.DragEvent, dealId: string) => void
}

export function DealCard({ deal, stageColor, onDragStart }: DealCardProps) {
  const lead    = deal.lead
  const contact = deal.contact
  const company = deal.company
  const daysIn  = Math.floor((Date.now() - new Date(deal.entered_stage_at).getTime()) / 86400000)

  return (
    <div
      draggable
      onDragStart={e => onDragStart?.(e, deal.deal_id)}
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-sm font-semibold text-gray-800 leading-tight flex-1 mr-2">{lead?.title}</p>
        <span className="text-xs text-gray-400 shrink-0">{daysIn}j</span>
      </div>
      {company && <p className="text-xs text-gray-500 mb-2">{company.name}</p>}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">{formatCurrency(lead?.value)}</span>
        <div className="flex items-center gap-1.5">
          {deal.assignee && (
            <div className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                 style={{ background: stageColor }}>
              {deal.assignee.full_name?.[0]}
            </div>
          )}
          <span className="text-xs text-gray-400">{lead?.probability}%</span>
        </div>
      </div>
      <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${lead?.probability ?? 0}%`, background: stageColor }} />
      </div>
    </div>
  )
}