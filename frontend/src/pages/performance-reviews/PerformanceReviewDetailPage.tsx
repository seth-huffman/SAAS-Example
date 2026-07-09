import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { performanceReviewsApi } from '../../api/performance-reviews.api';
import { useAuthStore } from '../../store/auth.store';
import { useViewStore } from '../../store/view.store';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  submitted: 'badge--pending',
  reviewed:  'badge--approved',
};

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

const schema = z.object({
  managerRating:   z.number().int().min(1).max(5),
  managerComments: z.string().min(5, 'Please add feedback'),
});
type FormData = z.infer<typeof schema>;

export function PerformanceReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { viewMode } = useViewStore();
  const isManager = (user?.role === 'super_admin' || user?.role === 'hr_manager') && viewMode === 'manager';

  const { data: review, isLoading } = useQuery({
    queryKey: ['performance-reviews', id],
    queryFn: () => performanceReviewsApi.getById(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { managerRating: 3 },
  });

  const managerRating = watch('managerRating');

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      performanceReviewsApi.review(id!, { ...data, status: 'reviewed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Review submitted');
      navigate('/performance-reviews');
    },
    onError: () => toast.error('Failed to submit review'),
  });

  if (isLoading) return <p style={{ color: 'var(--muted-foreground)' }}>Loading…</p>;
  if (!review)  return <p style={{ color: 'var(--muted-foreground)' }}>Review not found</p>;

  const emp = review.employee;

  return (
    <div className="page page--medium">
      <div className="page__back-row">
        <Button variant="ghost" size="icon" onClick={() => navigate('/performance-reviews')}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="page__title">
            {emp ? `${emp.firstName} ${emp.lastName}` : 'Performance Review'}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <Badge className={STATUS_BADGE[review.status]}>{review.status}</Badge>
            <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{review.reviewPeriod}</span>
          </div>
        </div>
      </div>

      {/* Employee self-assessment */}
      <Card>
        <CardHeader><CardTitle>Self Assessment</CardTitle></CardHeader>
        <CardContent>
          <div className="review-detail-section">
            <div className="review-detail-row">
              <span className="review-detail-label">Rating</span>
              <span className="review-stars">{stars(review.selfRating)} <span className="review-stars__num">{review.selfRating}/5</span></span>
            </div>
            <div className="review-detail-row review-detail-row--block">
              <span className="review-detail-label">Comments</span>
              <p className="review-detail-text">{review.selfComments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager feedback — show existing if reviewed */}
      {review.status === 'reviewed' && review.managerRating !== null && (
        <Card>
          <CardHeader><CardTitle>Manager Feedback</CardTitle></CardHeader>
          <CardContent>
            <div className="review-detail-section">
              <div className="review-detail-row">
                <span className="review-detail-label">Rating</span>
                <span className="review-stars">{stars(review.managerRating)} <span className="review-stars__num">{review.managerRating}/5</span></span>
              </div>
              {review.managerComments && (
                <div className="review-detail-row review-detail-row--block">
                  <span className="review-detail-label">Feedback</span>
                  <p className="review-detail-text">{review.managerComments}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manager review form — only if manager and not yet reviewed */}
      {isManager && review.status === 'submitted' && (
        <Card>
          <CardHeader><CardTitle>Add Your Review</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="form">
              <div className="field">
                <Label>Manager Rating</Label>
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`star-btn${managerRating >= n ? ' star-btn--active' : ''}`}
                      onClick={() => setValue('managerRating', n)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-label">{managerRating} / 5</span>
                </div>
                {errors.managerRating && <p className="field__error">{errors.managerRating.message}</p>}
              </div>

              <div className="field">
                <Label>Feedback</Label>
                <textarea
                  className="textarea"
                  rows={5}
                  placeholder="Provide constructive feedback for this employee…"
                  {...register('managerComments')}
                />
                {errors.managerComments && <p className="field__error">{errors.managerComments.message}</p>}
              </div>

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Submitting…' : 'Submit Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
