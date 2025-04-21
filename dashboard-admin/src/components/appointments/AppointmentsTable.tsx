import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { format } from 'date-fns';
import { Trash } from 'lucide-react';
import React from 'react';
import { deleteAppointment, listAppointments } from './api';

export default function AppointmentsTable() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: listAppointments,
  });

  const del = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => qc.invalidateQueries(['appointments']),
  });

  if (isLoading) return <p className="p-6 text-sm text-zinc-400">Caricamento…</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 shadow-sm">
      <table className="min-w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-950/40">
          <tr className="text-left uppercase tracking-wider text-zinc-400 text-xs">
            <th className="px-4 py-3">Titolo</th>
            <th className="px-4 py-3">Inizio</th>
            <th className="px-4 py-3">Fine</th>
            <th className="w-12 px-4 py-3 text-center">&nbsp;</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {data.map((a, idx) => (
            <tr
              key={a.id}
              className={clsx(idx % 2 === 0 && 'bg-zinc-900/40 hover:bg-zinc-800/40')}
            >
              <td className="whitespace-nowrap px-4 py-2 font-medium text-zinc-100">
                {a.title}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-zinc-200">
                {format(new Date(a.start), 'dd/MM/yyyy, HH:mm')}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-zinc-200">
                {format(new Date(a.end), 'dd/MM/yyyy, HH:mm')}
              </td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => del.mutate(a.id)}
                  className="rounded-md p-2 hover:bg-zinc-800/60"
                  title="Elimina"
                >
                  <Trash className="h-4 w-4 text-red-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}