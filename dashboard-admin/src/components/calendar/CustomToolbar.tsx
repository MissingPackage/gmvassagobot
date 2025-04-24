import { endOfWeek, format, isSameMonth, isSameYear, startOfWeek } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigate, ToolbarProps, View, Views } from 'react-big-calendar';
import type { CalendarEvent } from '../AppointmentsSection';

const viewNames: Record<View, string> = {
  month: 'Mese',
  week: 'Settimana',
  day: 'Giorno',
  agenda: 'Agenda',
  work_week: 'Settimana lavorativa',
};

const formatDate = (date: Date, view: View) => {
  const month = format(date, 'MMMM yyyy', { locale: itLocale });
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  
  switch (view) {
    case Views.MONTH:
      return capitalizedMonth;
    case Views.WEEK: {
      const start = startOfWeek(date, { locale: itLocale, weekStartsOn: 1 });
      const end = endOfWeek(date, { locale: itLocale, weekStartsOn: 1 });
      
      let startStr, endStr;

      if (isSameYear(start, end)) {
        // Stesso anno
        if (isSameMonth(start, end)) {
          // Stesso mese
          startStr = format(start, 'd', { locale: itLocale });
          endStr = format(end, 'd MMMM yyyy', { locale: itLocale });
        } else {
          // Mesi diversi, stesso anno
          startStr = format(start, 'd MMMM', { locale: itLocale });
          endStr = format(end, 'd MMMM yyyy', { locale: itLocale });
        }
      } else {
        // Anni diversi
        startStr = format(start, 'd MMMM yyyy', { locale: itLocale });
        endStr = format(end, 'd MMMM yyyy', { locale: itLocale });
      }
      
      // Capitalize month names
      const formattedDate = `${startStr} - ${endStr}`
        .split(' ')
        .map(word => {
          // Capitalize month names (they start with lowercase in Italian)
          if (word.match(/^[a-z]/)) {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
          return word;
        })
        .join(' ');
      
      return formattedDate;
    }
    case Views.DAY:
      return format(date, "d MMMM yyyy", { locale: itLocale })
        .replace(/^\w/, c => c.toUpperCase())
        .replace(/\b[a-z]/g, c => c.toUpperCase());
    default:
      return capitalizedMonth;
  }
};

export default function CustomToolbar(props: ToolbarProps<CalendarEvent, object>) {
  const { date, onNavigate, onView, view: currentView } = props;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate(Navigate.TODAY)}
          className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Oggi
        </button>
        <button
          onClick={() => onNavigate(Navigate.PREVIOUS)}
          className="p-1 rounded-full transition-colors text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => onNavigate(Navigate.NEXT)}
          className="p-1 rounded-full transition-colors text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <span className="text-base font-medium flex-1 text-center">
        {formatDate(date, currentView)}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(Views.MONTH)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentView === Views.MONTH
              ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          {viewNames[Views.MONTH]}
        </button>
        <button
          onClick={() => onView(Views.WEEK)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentView === Views.WEEK
              ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          {viewNames[Views.WEEK]}
        </button>
        <button
          onClick={() => onView(Views.DAY)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentView === Views.DAY
              ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          {viewNames[Views.DAY]}
        </button>
      </div>
    </div>
  );
} 