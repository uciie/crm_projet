'use client'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'
import { Button }      from '@/components/ui/Button'

export default function PipelinePage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pipeline de vente</h1>
          <p className="text-sm text-gray-500">Glissez-déposez les deals pour les déplacer</p>
        </div>
        <Button>+ Nouveau lead</Button>
      </div>
      <KanbanBoard />
    </div>
  )
}