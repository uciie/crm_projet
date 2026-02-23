'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactForm } from '@/components/contacts/ContactForm'

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  job_title?: string
  city?: string
  is_subscribed: boolean
  avatar_url?: string
  company?: { id: string; name: string; logo_url?: string }
  assigned_to?: { id: string; full_name: string }
}

interface Pagination {
  page: number
  totalPages: number
  total: number
}

export default function ContactsPage() {
  const { isCommercial } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 20 })

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      search: filters.search,
      page: String(filters.page),
      limit: String(filters.limit),
    })
    const data = await api.get(`/contacts?${params}`)
    setContacts(data.data)
    setPagination(data.pagination)
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce contact ?')) return
    await api.delete(`/contacts/${id}`)
    fetchContacts()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500">{pagination.total} contacts au total</p>
        </div>
        {isCommercial && (
          <button
            onClick={() => { setEditContact(null); setShowForm(true) }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Nouveau contact
          </button>
        )}
      </div>

      // Barre de recherche
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Rechercher un contact..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      // Tableau des contacts
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email marketing</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{contact.company?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{contact.job_title ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{contact.city ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                      contact.is_subscribed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {contact.is_subscribed ? 'Abonné' : 'Désabonné'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setEditContact(contact); setShowForm(true) }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm mr-4"
                    >
                      Modifier
                    </button>
                    {isCommercial && (
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          // Pagination
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ← Précédent
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      )}

      // Modal formulaire contact
      {showForm && (
        <ContactForm
          contact={editContact}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchContacts() }}
        />
      )}
    </div>
  )
}