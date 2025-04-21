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
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createFaq, deleteFaq, Faq, listFaq, updateFaq } from './faq/api';

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
    onSuccess: () => qc.invalidateQueries(['faq']),
  });
  const update = useMutation({
    mutationFn: (v: { id: string; values: FaqFormValues }) => updateFaq(v.id, v.values),
    onSuccess: () => qc.invalidateQueries(['faq']),
  });
  const remove = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => qc.invalidateQueries(['faq']),
  });

  const [editing, setEditing] = useState<Faq | null>(null);

  return (
    <section className="flex flex-col w-full h-full space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Nuova FAQ
            </Button>
          </DialogTrigger>
          <FAQForm
            title="Crea FAQ"
            defaultValues={{ question: '', answer: '' }}
            onSubmit={(v) => create.mutateAsync(v)}
          />
        </Dialog>
      </header>

      {isLoading ? (
        <p>Caricamento…</p>
      ) : (
        <ul className="space-y-2">
          {faqs.map((faq) => (
            <li key={faq.id} className="rounded-lg border border-zinc-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-zinc-200">{faq.question}</p>
                  <p className="text-zinc-400 mt-1 whitespace-pre-line">{faq.answer}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditing(faq)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {editing?.id === faq.id && (
                      <FAQForm
                        title="Modifica FAQ"
                        defaultValues={{ question: faq.question, answer: faq.answer }}
                        onSubmit={(v) => update.mutateAsync({ id: faq.id, values: v })}
                      />
                    )}
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove.mutate(faq.id)}
                    className="hover:text-red-500"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
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
