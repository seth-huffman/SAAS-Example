import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { performanceReviewsApi } from '../../api/performance-reviews.api';
import { useAuthStore } from '../../store/auth.store';
import { useViewStore } from '../../store/view.store';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, ChevronRight } from 'lucide-react';
import type { PerformanceReview } from '../../types/performance-review.types';

const STATUS_BADGE: Record<string, string> = {
  submitted: 'badge--pending',
  reviewed:  'badge--approved',
};

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function ReviewRow({ r, onClick }: { r: PerformanceReview; onClick: () => void }) {
  return (
    <div className="review-row" onClick={onClick}>
      <div className="review-row__left">
        {r.employee && (
          <div className="review-row__emp">
            <div className="review-row__avatar">
              {r.employee.firstName[0]}{r.employee.lastName[0]}
            </div>
            <div>
              <p className="review-row__name">{r.employee.firstName} {r.employee.lastName}</p>
              <p className="review-row__job">{r.employee.jobTitle ?? '—'}</p>
            </div>
          </div>
        )}
        <div className="review-row__meta">
          <span className="review-row__period">{r.reviewPeriod}</span>
          <span className="review-row__stars" title={`Self-rating: ${r.selfRating}/5`}>{stars(r.selfRating)}</span>
        </div>
      </div>
      <div className="review-row__right">
        <Badge className={STATUS_BADGE[r.status]}>{r.status}</Badge>
        <ChevronRight size={16} className="review-row__arrow" />
      </div>
    </div>
  );
}

export function PerformanceReviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { viewMode } = useViewStore();
  const isManager = (user?.role === 'super_admin' || user?.role === 'hr_manager') && viewMode === 'manager';

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: performanceReviewsApi.list,
  });

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

      <Card>
        <CardContent className="card__content--flush">
          {isLoading ? (
            <p className="review-empty">Loading…</p>
          ) : reviews.length === 0 ? (
            <p className="review-empty">
              {isManager ? 'No reviews submitted yet.' : 'You have not submitted any reviews. Click "New Review" to get started.'}
            </p>
          ) : (
            <div className="review-list">
              {reviews.map((r) => (
                <ReviewRow key={r.id} r={r} onClick={() => navigate(`/performance-reviews/${r.id}`)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
