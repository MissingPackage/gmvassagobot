import { useQuery } from '@tanstack/react-query';
import { CalendarDays, List } from 'lucide-react';
import { useMemo, useState } from 'react';
import { listAppointments } from './appointments/api';
import AppointmentsTable from './appointments/AppointmentsTable';
import EventDetailsModal from './EventDetailsModal';
import { Appointment } from './appointments/types';
import { deleteAppointment } from './appointments/api';
import AppointmentFormModal from './appointments/AppointmentFormModal';

// ── react‑big‑calendar + date‑fns localizer ─────────────────────────────
import { format, getDay, isAfter, parse, startOfToday, startOfWeek } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';
import {
  Calendar as BigCalendar,
  View,
  Views,
  dateFnsLocalizer,
  type Event
} from 'react-big-calendar';
import CustomToolbar from './calendar/CustomToolbar';

const locales = { it: itLocale };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Personalizzazione dei messaggi del calendario
const messages = {
  allDay: 'Tutto il giorno',
  month: 'Mese',
  week: 'Settimana',
  day: 'Giorno',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Ora',
  event: 'Evento',
  work_week: 'Settimana lavorativa',
  yesterday: 'Ieri',
  tomorrow: 'Domani',
  today: 'Oggi',
  previous: 'Indietro',
  next: 'Avanti',
  noEventsInRange: 'Nessun evento in questo periodo',
  showMore: (total: number) => `+${total} altri`,
};

type EventFilter = 'all' | 'past' | 'upcoming';

export type CalendarEvent = Event & {
  start: Date;
  end: Date;
};

const availableViews = {
  month: true,
  week: true,
  day: true,
};

export default function AppointmentsSection() {
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false); // per feedback loading

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<EventFilter>('all');
  const { data = [], isLoading, refetch } = useQuery({ queryKey: ['appointments'], queryFn: listAppointments });

  // Conversione per react-big-calendar
  const events: CalendarEvent[] = useMemo(
    () =>
      data.map((a) => ({
        ...a,
        title: a.title,
        start: new Date(a.start),
        end: new Date(a.end),
        allDay: false,
      })),
    [data]
  );

  const filteredEvents = useMemo(() => {
    const today = startOfToday();
    switch (filter) {
      case 'past':
        return events.filter(event => !isAfter(event.end, today));
      case 'upcoming':
        return events.filter(event => isAfter(event.end, today));
      default:
        return events;
    }
  }, [events, filter]);

  if (isLoading) return <p className="text-center p-10">Caricamento…</p>;

  return (
    <section className="flex flex-col w-full h-full min-h-[600px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'list' 
                ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100' 
                : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" /> Lista
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setView('calendar')}
          >
            <CalendarDays className="h-4 w-4" /> Calendario
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setFilter('all')}
          >
            Tutti
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === 'past'
                ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setFilter('past')}
          >
            Passati
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setFilter('upcoming')}
          >
            Futuri
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="flex-1 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <AppointmentsTable filter={filter} />
        </div>
      ) : (
        <div className="flex-1 h-[75vh] min-h-[550px] rounded-lg border border-zinc-200 dark:border-zinc-800 w-full">
          <BigCalendar<CalendarEvent>
            localizer={localizer}
            events={filteredEvents}
            view={calendarView}
            views={availableViews}
            date={currentDate}
            onNavigate={date => setCurrentDate(date)}
            onView={view => setCalendarView(view)}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={messages}
            culture="it"
            components={{
              toolbar: CustomToolbar
            }}
            className="h-full"
            min={new Date(0, 0, 0, 0, 0, 0)}
            max={new Date(0, 0, 0, 23, 59, 59)}
            step={60}
            timeslots={1}
            onSelectEvent={(event: any) => {
              // event è CalendarEvent, serve trovare Appointment completo
              const found = data.find((a: Appointment) => a.id === event.id);
              if (found) {
                setSelectedEvent(found);
                setShowDetails(true);
              }
            }}
          />
        </div>
      )}
      {/* MODALE DETTAGLI EVENTO */}
      <EventDetailsModal
        open={showDetails}
        event={selectedEvent}
        onClose={() => setShowDetails(false)}
        onEdit={(appt: Appointment) => {
          setEditingAppointment(appt);
          setShowDetails(false);
        }}
        onDelete={async (id: string) => {
          setDeleting(true);
          try {
            await deleteAppointment(id);
            setShowDetails(false);
            refetch();
          } finally {
            setDeleting(false);
          }
        }}
      />
    {/***** MODALE MODIFICA EVENTO *****/}
    {editingAppointment && (
      <AppointmentFormModal
        appointment={editingAppointment}
        onClose={() => {
          setEditingAppointment(null);
          refetch();
        }}
      />
    )}
    </section>
  );
}
