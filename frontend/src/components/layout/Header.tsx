'use client'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Tableau de bord',
  '/contacts':   'Contacts',
  '/companies':  'Entreprises',
  '/pipeline':   'Pipeline de vente',
  '/leads':      'Leads',
  '/tasks':      'Tâches',
  '/campaigns':  'Campagnes email',
  '/settings':   'Paramètres',
}

export function Header() {
  const pathname = usePathname()
  const title    = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? 'CRM'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shrink-0">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
          ● Neon.tech
        </span>
      </div>
    </header>
  )
}