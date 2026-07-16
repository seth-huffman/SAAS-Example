import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { performanceReviewsApi } from '../../api/performance-reviews.api';
import { useAuthStore } from '../../store/auth.store';
import { useViewStore } from '../../store/view.store';
import { Button } from '../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { PerformanceReview } from '../../types/performance-review.types';

function ReviewCard({
  r,
  canDelete,
  onDelete,
  onClick,
}: {
  r: PerformanceReview;
  canDelete: boolean;
  onDelete: () => void;
  onClick: () => void;
}) {
  return (
    <div className="review-card" onClick={onClick}>
      <div className="review-card__footer">
        <div className="review-card__emp">
          {r.employee && (
            <div className="review-card__avatar">
              {r.employee.firstName[0]}{r.employee.lastName[0]}
            </div>
          )}
          <div className="review-card__footer-left">
            <span className="review-card__period">{r.reviewPeriod}</span>
            <span className="review-card__status">{r.status}</span>
          </div>
        </div>
        {canDelete && (
          <button
            type="button"
            className="review-row__delete"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Delete review"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export function PerformanceReviewsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { viewMode } = useViewStore();
  const isManager = (user?.role === 'super_admin' || user?.role === 'hr_manager') && viewMode === 'manager';

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: performanceReviewsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => performanceReviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Review deleted');
    },
    onError: () => toast.error('Failed to delete review'),
  });

  function handleDelete(r: PerformanceReview) {
    if (!window.confirm(`Delete your ${r.reviewPeriod} review? This cannot be undone.`)) return;
    deleteMutation.mutate(r.id);
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Performance Reviews</h1>
        {!isManager && (
          <Button onClick={() => navigate('/performance-reviews/new')}>
            <Plus size={16} /> New Review
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="review-empty">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="review-empty">
          {isManager ? 'No reviews submitted yet.' : 'You have not submitted any reviews. Click "New Review" to get started.'}
        </p>
      ) : (
        <div className="review-grid">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              r={r}
              canDelete={!isManager && r.status === 'submitted'}
              onDelete={() => handleDelete(r)}
              onClick={() => navigate(`/performance-reviews/${r.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
