'use client'
import { useLeads }      from '@/hooks/useLeads'
import { Badge }         from '@/components/ui/Badge'
import { Spinner }       from '@/components/ui/Spinner'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_CFG: Record<string, { color:string; bg:string }> = {
  nouveau:     { color:'#94a3b8', bg:'#f8fafc' },
  contacté:    { color:'#60a5fa', bg:'#eff6ff' },
  qualifié:    { color:'#f59e0b', bg:'#fffbeb' },
  proposition: { color:'#a78bfa', bg:'#f5f3ff' },
  négociation: { color:'#f97316', bg:'#fff7ed' },
  gagné:       { color:'#34d399', bg:'#f0fdf4' },
  perdu:       { color:'#f87171', bg:'#fef2f2' },
}

export default function LeadsPage() {
  const { leads, loading } = useLeads()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">{leads.length} opportunités</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Opportunité', 'Contact', 'Valeur', 'Probabilité', 'Statut', 'Clôture'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map(lead => {
                const scfg = STATUS_CFG[lead.status] ?? STATUS_CFG.nouveau
                return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-800">{lead.title}</p>
                      {lead.company && <p className="text-xs text-gray-400">{lead.company.name}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
                      {lead.contact ? `${lead.contact.first_name} ${lead.contact.last_name}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{formatCurrency(lead.value)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${lead.probability}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{lead.probability}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={lead.status} color={scfg.color} bg={scfg.bg} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{formatDate(lead.expected_close_date)}</td>
                  </tr>
                )
              })}
              {leads.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Aucun lead trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}