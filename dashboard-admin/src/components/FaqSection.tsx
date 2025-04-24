import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createFaq, deleteFaq, FAQ, listFaq,updateFaq } from './api/faq/api';
import { regenerateFaqEmbeddings } from './api/faq/embeddings';
import { Toast } from '@/components/ui/toast';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  question: z.string().min(3, 'Min 3 caratteri'),
  answer: z.string().min(3, 'Min 3 caratteri'),
});

type FaqFormValues = z.infer<typeof schema>;

export default function FAQSection() {
  const qc = useQueryClient();
  const { data: faqs = [], isLoading } = useQuery({ queryKey: ['faq'], queryFn: listFaq });

  const create = useMutation({
    mutationFn: createFaq,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq'] }),
  });
  const update = useMutation({
    mutationFn: (v: { id: string; values: FaqFormValues }) => updateFaq(v.id, v.values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq'] }),
  });
  const remove = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq'] }),
  });

  const [editing, setEditing] = useState<FAQ | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; state: 'success' | 'error' | 'info' } | null>(null);
  const [search, setSearch] = useState('');

  // Filtro FAQ in base alla ricerca
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question?.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <section className="flex flex-col w-full h-full space-y-6">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">FAQ</h2>
          <Button
            variant="outline"
            className="mr-4"
            onClick={async () => {
              try {
                const res = await regenerateFaqEmbeddings();
                if (res.message && res.message.toLowerCase().includes('nessuna')) {
                  setToast({ msg: res.message, state: 'info' });
                } else {
                  setToast({ msg: res.message || 'Embeddings FAQ rigenerati con successo!', state: 'success' });
                }
              } catch {
                setToast({ msg: 'Errore nella rigenerazione degli embeddings!', state: 'error' });
              }
            }}
          >
            Rigenera embeddings FAQ
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Nuova FAQ
              </Button>
            </DialogTrigger>
            <FAQForm
              title="Crea FAQ"
              defaultValues={{ question: '', answer: '' }}
              onSubmit={async (v) => {
                await create.mutateAsync(v);
                setCreateOpen(false);
              }}
            />
          </Dialog>
        </header>

        {/* Barra di ricerca FAQ - UNICA */}
        <div className="w-full max-w-md mb-2">
          <Input
            type="text"
            placeholder="Cerca tra le FAQ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {isLoading ? (
          <p>Caricamento…</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {filteredFaqs.length === 0 ? (
                <motion.li
                  key="no-results"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-zinc-400"
                >
                  Nessuna FAQ trovata.
                </motion.li>
              ) : (
                filteredFaqs.map((faq) => (
                  <motion.li
                    key={faq.id}
                    layout // permette animazioni fluide al riordinamento
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-zinc-800 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-200">
                          {faq.question ?? ''}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-gray-700 dark:text-zinc-300">
                          {faq.answer ?? ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={editing?.id === faq.id} onOpenChange={(open) => { if (!open) setEditing(null); }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditing(faq)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {editing?.id === faq.id && (
                            <FAQForm
                              title="Modifica FAQ"
                              defaultValues={{
                                question: faq.question || '',
                                answer: faq.answer || '',
                              }}
                              onSubmit={async (v) => {
                                await update.mutateAsync({ id: faq.id, values: v });
                                setEditing(null);
                              }}
                            />
                          )}
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove.mutate(faq.id!)}
                          className="hover:text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.li>
                ))
              )}
            </AnimatePresence>
          </ul>
        )}

      </section>
      <Toast message={toast?.msg ?? ''} show={!!toast} state={toast?.state} onClose={() => setToast(null)} />
    </>
  );
}

function FAQForm({
  title,
  defaultValues,
  onSubmit,
}: {
  title: string;
  defaultValues: FaqFormValues;
  onSubmit: (v: FaqFormValues) => Promise<unknown>;
}) {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={handleSubmit(async (v) => {
          await onSubmit(v);
        })}
        className="space-y-4"
      >
        <div>
          <Input placeholder="Domanda" {...register('question')} />
          {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message}</p>}
        </div>
        <div>
          <Textarea rows={4} placeholder="Risposta" {...register('answer')} />
          {errors.answer && <p className="text-red-500 text-xs mt-1">{errors.answer.message}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Annulla
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            Salva
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
