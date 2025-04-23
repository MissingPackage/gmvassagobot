import React, { useEffect, useState } from "react";

interface LogEntry {
  id: number;
  timestamp: string;
  event_type: string;
  details: string;
}

export const LogsSection: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[LogsSection] Inizio fetch dei log...');
    fetch("/api/logs/")
      .then((r) => {
        console.log('[LogsSection] Risposta fetch ricevuta');
        return r.json();
      })
      .then((data) => {
        console.log('[LogsSection] Log caricati:', data);
        setLogs(data);
      })
      .catch((err) => {
        console.error('[LogsSection] Errore nel fetch dei log:', err);
      })
      .finally(() => {
        setLoading(false);
        console.log('[LogsSection] Fine fetch, loading=false');
      });
  }, []);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Logs amministrativi</h3>
      {loading ? (
        <div>Caricamento logs...</div>
      ) : logs.length === 0 ? (
        <div>Nessun log disponibile.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-zinc-900 shadow rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Data/Ora</th>
                <th className="px-4 py-2 border-b">Tipo evento</th>
                <th className="px-4 py-2 border-b">Dettagli</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 border-b whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2 border-b">{log.event_type}</td>
                  <td className="px-4 py-2 border-b">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
