export interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  customer?: string;
  status: string;
  source: string;
} 