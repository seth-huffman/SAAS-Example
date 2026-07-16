import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { performanceReviewsApi } from '../../api/performance-reviews.api';
import { employeesApi } from '../../api/employees.api';
import { useAuthStore } from '../../store/auth.store';
import { useViewStore } from '../../store/view.store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, Pencil, Plus, X } from 'lucide-react';

const PERIODS = ['2026', '2025', '2024', '2023', '2022'];

const STATUS_BADGE: Record<string, string> = {
  submitted: 'badge--pending',
  reviewed:  'badge--approved',
};

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function parseWorkItems(selfComments: string) {
  return selfComments
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .map((text) => ({ text }));
}

/* ── Manager review form schema ── */
const managerSchema = z.object({
  managerRating:   z.number().int().min(1).max(5),
  managerComments: z.string().min(5, 'Please add feedback'),
});
type ManagerFormData = z.infer<typeof managerSchema>;

/* ── Self edit schema ── */
const selfSchema = z.object({
  reviewPeriod: z.string().min(1, 'Select a period'),
  workItems:    z.array(z.object({ text: z.string().min(1, 'Required') })).min(1, 'Add at least one item'),
});
type SelfFormData = z.infer<typeof selfSchema>;

export function PerformanceReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { viewMode } = useViewStore();
  const isManager = (user?.role === 'super_admin' || user?.role === 'hr_manager') && viewMode === 'manager';

  const [editingSelf, setEditingSelf] = useState(false);

  const { data: review, isLoading } = useQuery({
    queryKey: ['performance-reviews', id],
    queryFn: () => performanceReviewsApi.getById(id!),
    enabled: !!id,
  });

  const { data: me } = useQuery({
    queryKey: ['employees', 'me'],
    queryFn: employeesApi.me,
    retry: false,
  });

  /* ── Manager form ── */
  const {
    register: regMgr,
    handleSubmit: submitMgr,
    setValue: setMgr,
    watch: watchMgr,
    formState: { errors: errMgr },
  } = useForm<ManagerFormData>({
    resolver: zodResolver(managerSchema),
    defaultValues: { managerRating: 3 },
  });
  const managerRating = watchMgr('managerRating');

  const managerMutation = useMutation({
    mutationFn: (data: ManagerFormData) =>
      performanceReviewsApi.review(id!, { ...data, status: 'reviewed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Review submitted');
      navigate('/performance-reviews');
    },
    onError: () => toast.error('Failed to submit review'),
  });

  /* ── Self-edit form ── */
  const {
    register: regSelf,
    handleSubmit: submitSelf,
    setValue: setSelf,
    control,
    formState: { errors: errSelf },
    reset: resetSelf,
  } = useForm<SelfFormData>({
    resolver: zodResolver(selfSchema),
    defaultValues: { workItems: [{ text: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'workItems' });

  const selfMutation = useMutation({
    mutationFn: (data: SelfFormData) =>
      performanceReviewsApi.updateSelf(id!, {
        reviewPeriod: data.reviewPeriod,
        selfComments: data.workItems.map((item, i) => `${i + 1}. ${item.text}`).join('\n'),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews', id] });
      toast.success('Review updated');
      setEditingSelf(false);
    },
    onError: () => toast.error('Failed to update review'),
  });

  function startEditing() {
    if (!review) return;
    const items = parseWorkItems(review.selfComments);
    resetSelf({
      reviewPeriod: review.reviewPeriod,
      workItems:    items.length ? items : [{ text: '' }],
    });
    setSelf('reviewPeriod', review.reviewPeriod);
    setEditingSelf(true);
  }

  if (isLoading) return <p style={{ color: 'var(--muted-foreground)' }}>Loading…</p>;
  if (!review)  return <p style={{ color: 'var(--muted-foreground)' }}>Review not found</p>;

  const emp = review.employee;
  const isOwner = !!me && review.employeeId === me.id;
  const canEdit = isOwner && review.status === 'submitted' && !isManager;

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
          <div className="review-header-meta">
            <Badge className={`review-header-badge ${STATUS_BADGE[review.status]}`}>{review.status}</Badge>
            <span className="review-header-period">{review.reviewPeriod}</span>
          </div>
        </div>
      </div>

      {/* ── Self Assessment ── */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div className="review-header-stack">
              <CardTitle>Self Assessment</CardTitle>
              <span className="review-detail-label">Work Completed</span>
            </div>
            {canEdit && !editingSelf && (
              <Button variant="ghost" size="sm" onClick={startEditing}>
                <Pencil size={14} style={{ marginRight: 6 }} />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingSelf ? (
            <form onSubmit={submitSelf((d) => selfMutation.mutate(d))} className="form">
              <div className="field">
                <Label>Review Period</Label>
                <Select
                  defaultValue={review.reviewPeriod}
                  onValueChange={(v) => setSelf('reviewPeriod', v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select period…" /></SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errSelf.reviewPeriod && <p className="field__error">{errSelf.reviewPeriod.message}</p>}
              </div>

              <div className="field">
                <div className="work-complete__list">
                  {fields.map((field, index) => (
                    <div key={field.id} className="work-complete__row">
                      <span className="work-complete__num">{index + 1}</span>
                      <Input
                        placeholder="Describe what you completed…"
                        {...regSelf(`workItems.${index}.text`)}
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
                {errSelf.workItems && !Array.isArray(errSelf.workItems) && (
                  <p className="field__error">{(errSelf.workItems as { message?: string }).message}</p>
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

              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="submit" disabled={selfMutation.isPending}>
                  {selfMutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditingSelf(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
              <ol className="review-work-list">
                {parseWorkItems(review.selfComments).map((item, i) => (
                  <li key={i}>{item.text}</li>
                ))}
              </ol>
          )}
        </CardContent>
      </Card>

      {/* ── Manager Feedback — rating only shown after manager reviews ── */}
      {review.status === 'reviewed' && review.managerRating !== null && (
        <Card>
          <CardHeader><CardTitle>Manager Feedback</CardTitle></CardHeader>
          <CardContent>
            <div className="review-detail-section">
              <div className="review-detail-row">
                <span className="review-detail-label">Rating</span>
                <span className="review-stars">
                  {stars(review.managerRating)}
                  <span className="review-stars__num">{review.managerRating}/5</span>
                </span>
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

      {/* ── Manager review form ── */}
      {isManager && review.status === 'submitted' && (
        <Card>
          <CardHeader><CardTitle>Add Your Review</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submitMgr((d) => managerMutation.mutate(d))} className="form">
              <div className="field">
                <Label>Rating</Label>
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`star-btn${managerRating >= n ? ' star-btn--active' : ''}`}
                      onClick={() => setMgr('managerRating', n)}
                    >★</button>
                  ))}
                  <span className="star-label">{managerRating} / 5</span>
                </div>
                {errMgr.managerRating && <p className="field__error">{errMgr.managerRating.message}</p>}
              </div>

              <div className="field">
                <Label>Feedback</Label>
                <textarea
                  className="textarea"
                  rows={5}
                  placeholder="Provide constructive feedback for this employee…"
                  {...regMgr('managerComments')}
                />
                {errMgr.managerComments && <p className="field__error">{errMgr.managerComments.message}</p>}
              </div>

              <Button type="submit" disabled={managerMutation.isPending}>
                {managerMutation.isPending ? 'Submitting…' : 'Submit Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
