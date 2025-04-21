import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
} from 'lucide-react';
import React, { useState } from 'react';

import AppointmentsSection from './components/AppointmentsSection';
import FAQSection from './components/FaqSection';
/**
 * Utility to concatenate class names conditionally
 */
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

const primaryNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, // Added "Dashboard" entry
  { id: 'appointments', label: 'Appuntamenti', icon: CalendarDays },
  { id: 'faq', label: 'FAQ', icon: MessageSquare },
  { id: 'logs', label: 'Logs', icon: FileText },
];

const secondaryNav = [
  { id: 'theme', label: 'Tema', icon: Palette },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

export default function AdminDashboard() {
  const [current, setCurrent] = useState<string>('dashboard');

  return (
    <div className="flex min-h-screen bg-zinc-900 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-60 bg-zinc-950 border-r border-zinc-800 p-4 flex flex-col">
        <header className="flex items-center gap-2 mb-6 text-lg font-semibold">
          <LayoutDashboard className="h-5 w-5 text-emerald-400" />
          <span>Admin</span>
        </header>

        {/* Primary navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {primaryNav.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setCurrent(id)}
                  className={cn(
                    'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-800',
                    current === id ? 'bg-zinc-800' : 'text-zinc-400'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Secondary navigation */}
        <div className="pt-4 mt-auto border-t border-zinc-800">
          <ul className="space-y-1">
            {secondaryNav.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => {
                    if (id === 'theme') {
                      document.documentElement.classList.toggle('dark');
                    }
                    if (id === 'logout') {
                      // TODO: add real logout flow
                      alert('Logout!');
                    }
                  }}
                  className="group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-800 text-zinc-400"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-10 overflow-hidden">
        {current === 'appointments' && <AppointmentsSection />}
        {current === 'faq' && <FAQSection />}
        {current === 'logs' && <Logs />}
        {current === 'dashboard' && (
          <section className="prose dark:prose-invert">
            <h1>👋 Benvenuto nel pannello di controllo</h1>
            <p>Da qui puoi gestire tutto il sistema chatbot.</p>
            <ul>
              <li>📅 Controllare e modificare appuntamenti</li>
              <li>💬 Rispondere alle FAQ</li>
              <li>📄 Visualizzare i log</li>
            </ul>
          </section>
        )}
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

function Appointments() {
    return <AppointmentsSection />
}

function FAQ() {
  return <FAQSection />;
}
function Logs() {
  return <div className="text-lg">TODO: implement logs viewer</div>;
}