'use client'
import { useEffect, useState } from 'react'
import { api }                 from '@/lib/api'
import { useAuth }             from '@/hooks/useAuth'
import { Badge }               from '@/components/ui/Badge'
import { Button }              from '@/components/ui/Button'
import { Spinner }             from '@/components/ui/Spinner'
import { getInitials }         from '@/lib/utils'
import type { Profile }        from '@/types'

const ROLE_CFG = {
  admin:       { color:'#6366f1', bg:'#eef2ff' },
  commercial:  { color:'#f59e0b', bg:'#fffbeb' },
  utilisateur: { color:'#94a3b8', bg:'#f8fafc' },
}

export default function SettingsPage() {
  const { isAdmin, profile: me } = useAuth()
  const [users, setUsers]         = useState<Profile[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get('/auth/users').then(setUsers).finally(() => setLoading(false))
  }, [])

  const changeRole = async (userId: string, role: string) => {
    await api.patch(`/auth/users/${userId}/role`, { role })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as any } : u))
  }

  const toggleActive = async (userId: string, current: boolean) => {
    await api.patch(`/auth/users/${userId}/active`, { is_active: !current })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u))
  }

  if (!isAdmin) {
    return <div className="p-6 text-gray-500">Accès réservé aux administrateurs.</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500">{users.length} membres</p>
        </div>
        <Button>+ Inviter un utilisateur</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Utilisateur', 'Rôle', 'Statut', 'Membre depuis', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => {
                const rcfg = ROLE_CFG[user.role]
                const isSelf = user.id === me?.id
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(user.full_name.split(' ')[0], user.full_name.split(' ')[1] ?? '')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                          {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                        </div>
                        {isSelf && <Badge label="Vous" color="#6366f1" bg="#eef2ff" className="ml-2"/>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge label={user.role} color={rcfg.color} bg={rcfg.bg}/>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        label={user.is_active ? '● Actif' : '○ Inactif'}
                        color={user.is_active ? '#16a34a' : '#94a3b8'}
                        bg={user.is_active ? '#f0fdf4' : '#f8fafc'}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(user.created_at!).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-3.5">
                      {!isSelf && (
                        <div className="flex gap-3">
                          <select value={user.role}
                            onChange={e => changeRole(user.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-400">
                            <option value="utilisateur">Utilisateur</option>
                            <option value="commercial">Commercial</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button onClick={() => toggleActive(user.id, user.is_active ?? true)}
                            className={`text-xs px-2 py-1 rounded-lg border transition ${
                              user.is_active
                                ? 'text-red-500 border-red-200 hover:bg-red-50'
                                : 'text-green-600 border-green-200 hover:bg-green-50'
                            }`}>
                            {user.is_active ? 'Désactiver' : 'Activer'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}