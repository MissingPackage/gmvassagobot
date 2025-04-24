import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function SidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  // Il bottone è sempre in alto a destra della sidebar (sia aperta che chiusa), sempre con icona Menu (hamburger)
  if (isOpen) {
    // Sidebar aperta: bottone accanto a Admin, in alto a destra della sidebar
    return null; // il bottone sarà ora inserito direttamente nella header della sidebar da AdminDashboard.tsx
  }
  // Sidebar chiusa: bottone in alto a sinistra dello schermo
  return (
    <button
      className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none fixed left-4 top-6 z-50 shadow-lg"
      aria-label="Mostra sidebar"
      onClick={onToggle}
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

