import axios from 'axios';
import { z } from 'zod';

export const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5),
  answer: z.string().min(5),
  tags: z.array(z.string()).optional(),
});
export type Faq = z.infer<typeof faqSchema>;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const listFaq = async (): Promise<Faq[]> =>
  api.get('/faq').then(r => r.data);

export const createFaq = async (payload: Omit<Faq, 'id'>) =>
  api.post('/faq', payload).then(r => r.data);

export const updateFaq = async (id: string, payload: Partial<Faq>) =>
  api.put(`/faq/${id}`, payload).then(r => r.data);

export const deleteFaq = async (id: string) =>
  api.delete(`/faq/${id}`).then(r => r.data);