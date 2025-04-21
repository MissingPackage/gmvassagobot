import { useQuery } from '@tanstack/react-query';
import { CalendarDays, List } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { listAppointments } from './appointments/api';
import AppointmentsTable from './appointments/AppointmentsTable';

// ── react‑big‑calendar + date‑fns localizer ─────────────────────────────
import { format, getDay, parse, startOfWeek } from 'date-fns';
import itLocale from 'date-fns/locale/it'; // ✅ percorso valido con Vite
import {
  Calendar as BigCalendar,
  Views,
  dateFnsLocalizer,
  type Event,
} from 'react-big-calendar';

const locales = { it: itLocale };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function AppointmentsSection() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const { data = [], isLoading } = useQuery({ queryKey: ['appointments'], queryFn: listAppointments });

  const events: Event[] = useMemo(
    () =>
      data.map((a) => ({
        title: a.title,
        start: new Date(a.start),
        end: new Date(a.end),
        allDay: false,
      })),
    [data]
  );

  if (isLoading) return <p className="text-center p-10">Caricamento…</p>;

  return (
    <section className="flex flex-col w-full h-full min-h-[600px] space-y-6">
      <div className="flex items-center gap-2">
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${view === 'list' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
          onClick={() => setView('list')}
        >
          <List className="h-4 w-4" /> Lista
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${view === 'calendar' ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
          onClick={() => setView('calendar')}
        >
          <CalendarDays className="h-4 w-4" /> Calendario
        </button>
      </div>

      {view === 'list' ? (
        <div className="flex-1 overflow-x-auto rounded-lg border border-zinc-800">
          <AppointmentsTable />
        </div>
      ) : (
        <div className="flex-1 h-[75vh] min-h-[550px] rounded-lg border border-zinc-800 w-full">
          <BigCalendar
            localizer={localizer}
            events={events}
            defaultView={Views.MONTH}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
          />
        </div>
      )}
    </section>
  );
}
