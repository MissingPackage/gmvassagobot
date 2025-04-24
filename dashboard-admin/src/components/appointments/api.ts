import axios from 'axios';

import { Appointment } from './types';

const api = axios.create({ baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:8000' });

export async function listAppointments(): Promise<Appointment[]> {
  const { data } = await api.get('/api/appointments/');
  return data;
}

export async function createAppointment(payload: Omit<Appointment, 'id'>) {
  return api.post('/api/appointments/', payload);
}

export async function updateAppointment(id: string, payload: Partial<Appointment>) {
  return api.put(`/api/appointments/${id}`, payload);
}

export async function deleteAppointment(id: string) {
  return api.delete(`/api/appointments/${id}`);
}
