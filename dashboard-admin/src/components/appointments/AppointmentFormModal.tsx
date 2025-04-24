import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMinutes, format, isAfter, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { updateAppointment } from './api';
import { Appointment } from './types';

interface AppointmentFormModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export default function AppointmentFormModal({ appointment, onClose }: AppointmentFormModalProps) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    title: appointment.title,
    start: format(new Date(appointment.start), "yyyy-MM-dd'T'HH:mm"),
    end: format(new Date(appointment.end), "yyyy-MM-dd'T'HH:mm"),
    customer: appointment.customer || '',
  });
  const [error, setError] = useState<string | null>(null);

  // Calculate initial duration
  const [duration, setDuration] = useState<number>(0);
  useEffect(() => {
    const start = parseISO(formData.start);
    const end = parseISO(formData.end);
    setDuration(end.getTime() - start.getTime());
  }, []);

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Appointment> }) => 
      updateAppointment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
    onError: (error: any) => {
      if (error.message?.includes('time range is empty')) {
        setError('Il range di date selezionato non è valido. La data di fine deve essere successiva alla data di inizio.');
      } else {
        setError('Si è verificato un errore durante il salvataggio. Riprova più tardi.');
      }
    }
  });

  const validateDates = () => {
    const start = parseISO(formData.start);
    const end = parseISO(formData.end);
    if (!isAfter(end, start)) {
      setError('La data di fine deve essere successiva alla data di inizio');
      return false;
    }
    setError(null);
    return true;
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    const newStartDate = parseISO(newStart);
    const newEndDate = addMinutes(newStartDate, duration / (1000 * 60));
    
    setFormData({
      ...formData,
      start: newStart,
      end: format(newEndDate, "yyyy-MM-dd'T'HH:mm")
    });
    setError(null);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setFormData({
      ...formData,
      end: newEnd
    });
    // Update duration when end time changes
    const start = parseISO(formData.start);
    const end = parseISO(newEnd);
    setDuration(end.getTime() - start.getTime());
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) {
      return;
    }
    update.mutate({
      id: appointment.id,
      payload: {
        title: formData.title,
        start: formData.start,
        end: formData.end,
        customer: formData.customer,
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Modifica Appuntamento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Titolo
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Inizio
            </label>
            <input
              type="datetime-local"
              value={formData.start}
              onChange={handleStartChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Fine
            </label>
            <input
              type="datetime-local"
              value={formData.end}
              onChange={handleEndChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Cliente
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={update.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50"
            >
              {update.isPending ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 