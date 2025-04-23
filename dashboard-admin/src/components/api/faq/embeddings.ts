import axios from 'axios';

export async function regenerateFaqEmbeddings() {
  const { data } = await axios.post('/api/faq/embeddings/regenerate');
  return data;
}
