import axios from 'axios';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const api = axios.create({ baseURL: '/api/faq' });

export async function listFaq(): Promise<FAQ[]> {
  const { data } = await api.get('/');
  return data;
}

export async function createFaq(values: { question: string; answer: string }): Promise<FAQ> {
  const { data } = await api.post('/', values);
  return data;
}

export async function updateFaq(id: string, values: { question: string; answer: string }): Promise<FAQ> {
  const { data } = await api.put(`/${id}`, values);
  return data;
}

export async function deleteFaq(id: string): Promise<void> {
  await api.delete(`/${id}`);
}
