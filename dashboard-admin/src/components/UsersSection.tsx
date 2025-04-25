import React,{ useEffect, useState } from 'react';

export default function UsersSection() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<{email?: string, phone?: string}>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    if (editingUser) {
      setForm({ name: editingUser.name || '', email: editingUser.email || '', phone: editingUser.phone || '' });
    } else {
      setForm({ name: '', email: '', phone: '' });
    }
  }, [editingUser, showModal]);

  return (
    <section className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Utenti</h2>
      <div className="flex justify-between items-center mb-2">
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded shadow"
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
        >
          + Aggiungi utente
        </button>
        {/* Spazio per eventuali filtri futuri */}
      </div>
      <input
        type="text"
        placeholder="Cerca per nome, email o telefono..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full mb-4 p-3 border border-zinc-400 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-white text-lg placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          letterSpacing: '0.02em',
        }}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-900 rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Telefono</th>
              <th className="px-4 py-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.name || '-'}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.phone}</td>
                <td className="px-4 py-2 flex gap-2 items-center">
                  <a
                    href={`mailto:${user.email}`}
                    className="text-blue-600 hover:underline"
                    title="Invia email"
                  >📧</a>
                  <a
                    href={`https://wa.me/${user.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                    title="Contatta su WhatsApp"
                  >💬</a>
                  <a
                    href={`sms:${user.phone}`}
                    className="text-emerald-600 hover:underline"
                    title="Invia SMS"
                  >📱</a>
                  <button
                    className="ml-2 text-yellow-500 hover:text-yellow-700"
                    title="Modifica utente"
                    onClick={() => { setEditingUser(user); setShowModal(true); }}
                  >✏️</button>
                  <button
                    className="ml-1 text-red-600 hover:text-red-800"
                    title="Elimina utente"
                    onClick={() => handleDelete(user)}
                  >🗑️</button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8">Nessun utente trovato.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {loading && <div className="text-center py-4">Caricamento...</div>}

      {/* Modal per aggiunta/modifica utente */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg min-w-[320px]">
            <h3 className="text-lg font-bold mb-4">{editingUser ? 'Modifica utente' : 'Aggiungi utente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                className="w-full p-2 border rounded bg-white text-black dark:bg-white dark:text-black"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className={`w-full p-2 border rounded bg-white text-black dark:bg-white dark:text-black${errors.email ? ' border-red-500' : ''}`}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
              <input
                type="tel"
                placeholder="Telefono"
                className={`w-full p-2 border rounded bg-white text-black dark:bg-white dark:text-black${errors.phone ? ' border-red-500' : ''}`}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
              {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-800">Annulla</button>
                <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white font-semibold">{editingUser ? 'Salva' : 'Aggiungi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validazione frontend
    const newErrors: {email?: string, phone?: string} = {};
    // Email regex base
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Inserisci una email valida';
    }
    // Telefono: solo cifre e deve essere esattamente di 12 caratteri
    if (!/^\d{12}$/.test(form.phone)) {
      newErrors.phone = 'Il numero deve essere di 12 cifre esatte (solo numeri)';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (editingUser) {
      // Modifica utente
      fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(res => res.json())
        .then(updated => {
          setUsers(users => users.map(u => u.id === updated.id ? updated : u));
          setShowModal(false);
          setEditingUser(null);
        })
        .catch(() => alert('Errore durante la modifica'));
    } else {
      // Crea utente
      fetch('/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(res => res.json())
        .then(newUser => {
          setUsers(users => [...users, newUser]);
          setShowModal(false);
        })
        .catch(() => alert('Errore durante la creazione'));
    }
  }

  function handleDelete(user: any) {
    if (window.confirm(`Sei sicuro di voler eliminare l'utente ${user.email}?`)) {
      fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      })
        .then(res => {
          if (!res.ok) throw new Error('Errore eliminazione');
          setUsers(users => users.filter(u => u.id !== user.id));
        })
        .catch(() => alert('Errore durante l\'eliminazione'));
    }
  }
}
