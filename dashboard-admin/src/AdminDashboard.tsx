import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
  Menu,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import AppointmentsSection from './components/AppointmentsSection';
import FAQSection from './components/FaqSection';
import SidebarToggle from './components/ui/SidebarToggle';
import ConversationsSection from './components/ConversationsSection';
import { DashboardStats } from './components/DashboardStats';

import { LogsSection } from './components/LogsSection';

/**
 * Utility to concatenate class names conditionally
 */
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

import WhatsappSection from './components/WhatsappSection';
const primaryNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
  { id: 'faq', label: 'FAQ', icon: MessageSquare },
  { id: 'conversations', label: 'Conversazioni', icon: MessageSquare },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'whatsapp', label: 'Whatsapp', icon: MessageSquare },
];

const secondaryNav = [
  { id: 'theme', label: 'Tema', icon: Palette },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

export default function AdminDashboard() {
  const [current, setCurrent] = useState<string>('dashboard');
  const [isDark, setIsDark] = useState(() => {
    // Recupera il tema dal localStorage o usa il tema di sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Applica il tema all'avvio e quando cambia
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 relative">
      <SidebarToggle isOpen={isSidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      {/* Sidebar */}
      <aside
        className={
          `w-60 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col transition-transform duration-300`
          + (isSidebarOpen ? ' translate-x-0' : ' -translate-x-full')
        }
        style={{ position: 'relative', zIndex: 40, minHeight: '100vh' }}
      >
        <header className="flex items-center justify-between gap-2 mb-6 text-lg font-semibold">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-emerald-400" />
            <span>Admin</span>
          </div>
          <button
            className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
            aria-label="Nascondi sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Primary navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {primaryNav.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setCurrent(id)}
                  className={cn(
                    'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800',
                    current === id
                      ? 'bg-zinc-100 dark:bg-zinc-800'
                      : 'text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {current === 'dashboard' && <DashboardStats />}
        {current === 'appointments' && <AppointmentsSection />}
        {current === 'faq' && <FAQSection />}
        {current === 'conversations' && <ConversationsSection />}
        {current === 'logs' && <LogsSection />}
        {current === 'whatsapp' && <WhatsappSection />}
      </main>
    </div>
  );
}
/*
function Appointments() {
    // potrai gestire form/modal qui
    return (
      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Appuntamenti</h2>
          //{ <AppointmentFormModal />  <-- lo aggiungeremo dopo }
        </header>
  
        <AppointmentsTable />   {// 👈 tabella collegata a FastAPI }
      </section>
    );
}
*/