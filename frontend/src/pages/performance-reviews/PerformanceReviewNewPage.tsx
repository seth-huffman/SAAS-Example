import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { performanceReviewsApi } from '../../api/performance-reviews.api';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft } from 'lucide-react';

const PERIODS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

const schema = z.object({
  reviewPeriod: z.string().min(1, 'Select a period'),
  selfRating:   z.number().int().min(1).max(5),
  selfComments: z.string().min(10, 'Please write at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export function PerformanceReviewNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { selfRating: 3 },
  });

  const selfRating = watch('selfRating');

  const mutation = useMutation({
    mutationFn: (data: FormData) => performanceReviewsApi.create(data),
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

      <Card>
        <CardHeader><CardTitle>Self Evaluation</CardTitle></CardHeader>
        <CardContent>
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
              <Label>Self Rating</Label>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`star-btn${selfRating >= n ? ' star-btn--active' : ''}`}
                    onClick={() => setValue('selfRating', n)}
                  >
                    ★
                  </button>
                ))}
                <span className="star-label">{selfRating} / 5</span>
              </div>
              {errors.selfRating && <p className="field__error">{errors.selfRating.message}</p>}
            </div>

            <div className="field">
              <Label>Self Assessment</Label>
              <textarea
                className="textarea"
                rows={6}
                placeholder="Describe your accomplishments, strengths, and areas for improvement this period…"
                {...register('selfComments')}
              />
              {errors.selfComments && <p className="field__error">{errors.selfComments.message}</p>}
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting…' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
