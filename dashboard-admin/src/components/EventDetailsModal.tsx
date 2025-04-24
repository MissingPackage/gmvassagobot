import { Dialog, DialogContent, DialogHeader, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Appointment } from './appointments/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface EventDetailsModalProps {
  open: boolean;
  event: Appointment | null;
  onEdit: (appt: Appointment) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventDetailsModal({ open, event, onEdit, onDelete, onClose }: EventDetailsModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h3 className="text-lg font-semibold mb-2">Dettagli appuntamento</h3>
        </DialogHeader>
        <div className="space-y-2">
          <div><strong>Titolo:</strong> {event.title}</div>
          <div><strong>Cliente:</strong> {event.customer || '-'}</div>
          <div><strong>Inizio:</strong> {format(new Date(event.start), "EEEE d MMMM yyyy 'alle' HH:mm", { locale: it })}</div>
          <div><strong>Fine:</strong> {format(new Date(event.end), "EEEE d MMMM yyyy 'alle' HH:mm", { locale: it })}</div>
          <div><strong>Stato:</strong> {event.status}</div>
          <div><strong>Fonte:</strong> {event.source}</div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={() => onDelete(event.id)}>Elimina</Button>
          <Button variant="default" onClick={() => onEdit(event)}>Modifica</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
