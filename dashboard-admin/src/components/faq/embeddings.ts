import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const regenerateFaqEmbeddings = async () => {
  return api.post('/faq/embeddings/regenerate').then(r => r.data);
};
