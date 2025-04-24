import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isAfter, startOfToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Edit, Trash } from 'lucide-react';
import { useState } from 'react';
import { deleteAppointment, listAppointments } from './api';
import AppointmentFormModal from './AppointmentFormModal';
import { Appointment } from './types';

type EventFilter = 'all' | 'past' | 'upcoming';

interface AppointmentsTableProps {
  filter: EventFilter;
}

export default function AppointmentsTable({ filter }: AppointmentsTableProps) {
  const qc = useQueryClient();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: listAppointments,
  });

  const filteredData = (() => {
    const today = startOfToday();
    switch (filter) {
      case 'past':
        return appointments.filter(event => !isAfter(new Date(event.end), today));
      case 'upcoming':
        return appointments.filter(event => isAfter(new Date(event.end), today));
      default:
        return appointments;
    }
  })();

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p className="text-center p-4">Caricamento…</p>;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Titolo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Data e Ora</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-zinc-500 dark:text-zinc-400">
                  Nessun appuntamento trovato
                </td>
              </tr>
            ) : (
              filteredData.map((appt) => (
                <tr key={appt.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-300">{appt.title}</td>
                  <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-300">
                    {format(new Date(appt.start), "EEEE d MMMM yyyy 'alle' HH:mm", { locale: it })}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-300">{appt.customer || '-'}</td>
                  <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-300">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingAppointment(appt)}
                        className="p-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md text-zinc-900 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-300 dark:border-zinc-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(appt.id)}
                        className="p-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md text-zinc-900 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-300 dark:border-zinc-700 transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingAppointment && (
        <AppointmentFormModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
        />
      )}
    </div>
  );
}