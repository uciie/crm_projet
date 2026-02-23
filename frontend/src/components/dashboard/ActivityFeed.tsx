import { formatDateTime } from '@/lib/utils'
import type { Communication } from '@/types'

const COMM_ICONS: Record<string, string> = {
  email:'📧', appel:'📞', réunion:'📅', note:'📝', sms:'💬', lead:'🏆'
}

interface ActivityItem {
  type:    string
  id:      string
  subtype: string
  title:   string
  date:    string
  actor:   string
  target:  string
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="font-semibold text-gray-900 mb-4">Activité récente</h2>
      <div className="space-y-0">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-sm shrink-0">
              {COMM_ICONS[item.subtype] ?? COMM_ICONS[item.type] ?? '📌'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">
                <span className="font-medium">{item.actor}</span>{' — '}{item.title}
              </p>
              <p className="text-xs text-gray-400 truncate">Sur : {item.target}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{formatDateTime(item.date)}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucune activité récente</p>}
      </div>
    </div>
  )
}