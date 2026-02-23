interface StatsCardProps {
  label:  string
  value:  string | number
  sub?:   string
  icon:   string
  color:  string
}

export function StatsCard({ label, value, sub, icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
           style={{ background: color + '20' }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}