import { useState } from 'react';

export default function WhatsappSection() {
  const [to, setTo] = useState('');
  const [text, setText] = useState('Ciao! Sono GMVassagoBot, ti scrivo io per primo.');
  const [sendType, setSendType] = useState<'text' | 'template'>('text');
  const [templateName, setTemplateName] = useState('hello_world');
  const [templateLang, setTemplateLang] = useState('en_US');
  const [templateComponents, setTemplateComponents] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      let url = `/api/whatsapp/send_test_message?to=${encodeURIComponent(to)}`;
      if (sendType === 'text') {
        url += `&text=${encodeURIComponent(text)}`;
      } else {
        url += `&template_name=${encodeURIComponent(templateName)}`;
        url += `&template_lang=${encodeURIComponent(templateLang)}`;
        if (templateComponents.trim()) {
          url += `&template_components=${encodeURIComponent(templateComponents)}`;
        }
      }
      const response = await fetch(url, {
        method: 'POST',
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('Errore nell\'invio: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 max-w-lg mx-auto mt-10">
      <div className="bg-white dark:bg-zinc-900 shadow-lg rounded-lg p-8 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Invia un messaggio WhatsApp di test</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-zinc-800 dark:text-zinc-100">Numero destinatario (internazionale)</label>
            <input
              type="text"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="39xxxxxxxxxx"
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-zinc-800 dark:text-zinc-100">Tipo invio</label>
            <select
              value={sendType}
              onChange={e => setSendType(e.target.value as 'text' | 'template')}
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="text">Testo libero</option>
              <option value="template">Template WhatsApp</option>
            </select>
          </div>
          {sendType === 'text' && (
            <div>
              <label className="block font-medium text-zinc-800 dark:text-zinc-100">Testo messaggio</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
                required
              />
            </div>
          )}
          {sendType === 'template' && (
            <>
              <div>
                <label className="block font-medium text-zinc-800 dark:text-zinc-100">Nome template</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="hello_world"
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-800 dark:text-zinc-100">Lingua template</label>
                <input
                  type="text"
                  value={templateLang}
                  onChange={e => setTemplateLang(e.target.value)}
                  placeholder="en_US"
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-800 dark:text-zinc-100">Componenti JSON (opzionale)</label>
                <textarea
                  value={templateComponents}
                  onChange={e => setTemplateComponents(e.target.value)}
                  placeholder='[{"type": "body", "parameters": [{"type": "text", "text": "Mario"}]}]'
                  className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                />
              </div>
            </>
          )}
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow" disabled={loading}>
            {loading ? 'Invio...' : 'Invia'}
          </button>
        </form>
        {result && (
          <pre className="bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2 rounded text-xs mt-4 whitespace-pre-wrap border border-zinc-200 dark:border-zinc-700 overflow-x-auto">
            {result}
          </pre>
        )}
      </div>
    </section>
  );
}
