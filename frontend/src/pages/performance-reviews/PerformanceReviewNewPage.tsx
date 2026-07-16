import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { performanceReviewsApi } from '../../api/performance-reviews.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Plus, X } from 'lucide-react';

const PERIODS = ['2026', '2025', '2024', '2023', '2022'];

const schema = z.object({
  reviewPeriod: z.string().min(1, 'Select a period'),
  workItems:    z.array(z.object({ text: z.string().min(1, 'Required') })).min(1, 'Add at least one item'),
});

type FormData = z.infer<typeof schema>;

export function PerformanceReviewNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      workItems: [{ text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'workItems' });

  const mutation = useMutation({
    mutationFn: (data: FormData) => performanceReviewsApi.create({
      reviewPeriod: data.reviewPeriod,
      selfRating:   1,
      selfComments: data.workItems.map((item, i) => `${i + 1}. ${item.text}`).join('\n'),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Review submitted');
      navigate('/performance-reviews');
    },
    onError: () => toast.error('Failed to submit review — make sure your account is linked to an employee record'),
  });

  return (
    <div className="page page--medium">
      <div className="page__back-row">
        <Button variant="ghost" size="icon" onClick={() => navigate('/performance-reviews')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="page__title">New Performance Review</h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="form">
        <div className="field">
          <Label>Review Period</Label>
          <Select onValueChange={(v: string | null) => setValue('reviewPeriod', v ?? '')}>
            <SelectTrigger><SelectValue placeholder="Select period…" /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.reviewPeriod && <p className="field__error">{errors.reviewPeriod.message}</p>}
        </div>

        <div className="field">
          <Label>Work Complete</Label>
          <div className="work-complete__list">
            {fields.map((field, index) => (
              <div key={field.id} className="work-complete__row">
                <span className="work-complete__num">{index + 1}</span>
                <Input
                  placeholder="Describe what you completed…"
                  {...register(`workItems.${index}.text`)}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="work-complete__remove"
                    onClick={() => remove(index)}
                    aria-label="Remove"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.workItems && !Array.isArray(errors.workItems) && (
            <p className="field__error">{(errors.workItems as { message?: string }).message}</p>
          )}
          <button
            type="button"
            className="work-complete__add"
            onClick={() => append({ text: '' })}
          >
            <Plus size={14} />
            Add another
          </button>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting…' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}
