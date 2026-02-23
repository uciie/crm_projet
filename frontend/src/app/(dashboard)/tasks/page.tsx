'use client'
import { useState, useEffect, useCallback } from 'react'
import { api }           from '@/lib/api'
import { Button }        from '@/components/ui/Button'
import { Badge }         from '@/components/ui/Badge'
import { Spinner }       from '@/components/ui/Spinner'
import { Modal }         from '@/components/ui/Modal'
import { isOverdue, formatDate } from '@/lib/utils'
import type { Task }     from '@/types'

const STATUS_CFG: Record<string, { color:string; bg:string }> = {
  'à_faire':  { color:'#6366f1', bg:'#eef2ff' },
  'en_cours': { color:'#f59e0b', bg:'#fffbeb' },
  'terminée': { color:'#34d399', bg:'#f0fdf4' },
  'annulée':  { color:'#94a3b8', bg:'#f8fafc' },
}
const PRIORITY_COLOR: Record<string,string> = {
  urgente:'#f87171', haute:'#f59e0b', moyenne:'#60a5fa', basse:'#94a3b8'
}

export default function TasksPage() {
  const [tasks, setTasks]             = useState<Task[]>([])
  const [loading, setLoading]         = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm]       = useState(false)
  const [newTask, setNewTask]         = useState({ title:'', priority:'moyenne', due_date:'' })

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const data   = await api.get(`/tasks${params}`)
      setTasks(data.data)
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const toggleDone = async (task: Task) => {
    const newStatus = task.status === 'terminée' ? 'à_faire' : 'terminée'
    await api.patch(`/tasks/${task.id}`, { status: newStatus })
    fetchTasks()
  }

  const createTask = async () => {
    if (!newTask.title.trim()) return
    await api.post('/tasks', newTask)
    setShowForm(false)
    setNewTask({ title:'', priority:'moyenne', due_date:'' })
    fetchTasks()
  }

  const stats = {
    todo:       tasks.filter(t => t.status === 'à_faire').length,
    in_progress:tasks.filter(t => t.status === 'en_cours').length,
    done:       tasks.filter(t => t.status === 'terminée').length,
    overdue:    tasks.filter(t => isOverdue(t.due_date, t.status)).length,
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tâches</h1>
          <p className="text-sm text-gray-500">{tasks.length} tâches</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Nouvelle tâche</Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'À faire',   value:stats.todo,        color:'#6366f1', bg:'#eef2ff' },
          { label:'En cours',  value:stats.in_progress, color:'#f59e0b', bg:'#fffbeb' },
          { label:'Terminées', value:stats.done,        color:'#34d399', bg:'#f0fdf4' },
          { label:'En retard', value:stats.overdue,     color:'#f87171', bg:'#fef2f2' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtre */}
      <div className="flex gap-2">
        {['all', 'à_faire', 'en_cours', 'terminée'].map(s => (
          <button key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition border ${
              filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            {s === 'all' ? 'Toutes' : s}
          </button>
        ))}
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['', 'Tâche', 'Priorité', 'Statut', 'Échéance', 'Lié à'].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map(task => {
                const overdue = isOverdue(task.due_date, task.status)
                const scfg   = STATUS_CFG[task.status] ?? STATUS_CFG['à_faire']
                return (
                  <tr key={task.id} className={`hover:bg-gray-50 transition ${overdue ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 w-10">
                      <button onClick={() => toggleDone(task)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          task.status === 'terminée' ? 'border-green-400 bg-green-400' : 'border-gray-300 hover:border-indigo-400'
                        }`}>
                        {task.status === 'terminée' && <span className="text-white text-[10px]">✓</span>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium ${task.status === 'terminée' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: PRIORITY_COLOR[task.priority] }}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={task.status} color={scfg.color} bg={scfg.bg} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${overdue ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                        {overdue && '⚠ '}{formatDate(task.due_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.contact && (
                        <p className="text-xs text-indigo-600">{task.contact.first_name} {task.contact.last_name}</p>
                      )}
                      {task.lead && (
                        <p className="text-xs text-gray-400 truncate max-w-32">{task.lead.title}</p>
                      )}
                    </td>
                  </tr>
                )
              })}
              {tasks.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Aucune tâche</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal création */}
      {showForm && (
        <Modal title="Nouvelle tâche" onClose={() => setShowForm(false)}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input autoFocus value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Rappeler le client"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
                <input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button onClick={createTask}>Créer la tâche</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}