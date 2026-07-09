import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { leaveRequestsApi } from '../api/leave-requests.api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import type { HalfDayPeriod, LeaveRequest, LeaveStatus, LeaveType } from '../types/leave-request.types';

/* ── Schema ──────────────────────────────────────────────── */

const schema = z.object({
  leaveType:     z.enum(['vacation', 'sick', 'personal', 'other']),
  startDate:     z.string().min(1, 'Start date required'),
  endDate:       z.string().optional(),
  isHalfDay:     z.boolean(),
  halfDayPeriod: z.enum(['morning', 'afternoon']).optional(),
  reason:        z.string().optional(),
}).refine((d) => {
  if (d.isHalfDay) return true;
  if (!d.endDate) return false;
  return new Date(d.endDate) >= new Date(d.startDate);
}, { message: 'End date must be on or after start date', path: ['endDate'] })
 .refine((d) => !d.isHalfDay || !!d.halfDayPeriod, {
  message: 'Select morning or afternoon',
  path: ['halfDayPeriod'],
});

type FormData = z.infer<typeof schema>;

/* ── Helpers ─────────────────────────────────────────────── */

const TYPE_LABELS: Record<LeaveType, string> = {
  vacation: 'Vacation',
  sick:     'Sick Leave',
  personal: 'Personal',
  other:    'Other',
};

const STATUS_CLASS: Record<LeaveStatus, string> = {
  pending:  'badge--pending',
  approved: 'badge--active',
  rejected: 'badge--terminated',
};

function fmtDateRange(r: LeaveRequest) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const start = new Date(r.startDate + 'T00:00:00').toLocaleDateString(undefined, opts);
  if (r.isHalfDay) {
    const period = r.halfDayPeriod === 'morning' ? 'Morning' : 'Afternoon';
    return `${start} · ${period} only`;
  }
  const end = new Date(r.endDate + 'T00:00:00').toLocaleDateString(undefined, opts);
  return r.startDate === r.endDate ? start : `${start} – ${end}`;
}

/* ── Request card ────────────────────────────────────────── */

function RequestCard({ r }: { r: LeaveRequest }) {
  return (
    <div className="timeoff-request-card">
      <div className="timeoff-request-card__top">
        <span className="timeoff-request-card__type">{TYPE_LABELS[r.leaveType]}</span>
        <Badge className={`timeoff-request-card__badge ${STATUS_CLASS[r.status]}`}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </Badge>
      </div>
      <p className="timeoff-request-card__dates">{fmtDateRange(r)}</p>
      {r.reason && <p className="timeoff-request-card__reason">{r.reason}</p>}
      {r.reviewNote && (
        <p className="timeoff-request-card__note">
          <span className="timeoff-request-card__note-label">Note:</span> {r.reviewNote}
        </p>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export function TimeOffPage() {
  const queryClient = useQueryClient();
  const [isHalfDay, setIsHalfDay] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isHalfDay: false },
  });

  const startDate = watch('startDate');

  const { data: myRequests = [], isLoading } = useQuery({
    queryKey: ['leave-requests', 'mine'],
    queryFn: leaveRequestsApi.listMine,
  });

  const pending  = myRequests.filter((r) => r.status === 'pending');
  const approved = myRequests.filter((r) => r.status === 'approved');
  const rejected = myRequests.filter((r) => r.status === 'rejected');

  function handleHalfDayToggle(checked: boolean) {
    setIsHalfDay(checked);
    setValue('isHalfDay', checked);
    if (checked) setValue('halfDayPeriod', undefined);
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => leaveRequestsApi.create({
      leaveType:     data.leaveType as LeaveType,
      startDate:     data.startDate,
      endDate:       data.isHalfDay ? data.startDate : data.endDate!,
      reason:        data.reason || undefined,
      isHalfDay:     data.isHalfDay,
      halfDayPeriod: data.halfDayPeriod as HalfDayPeriod | undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Time off request submitted');
      reset();
      setIsHalfDay(false);
    },
    onError: () => toast.error('Failed to submit request'),
  });

  return (
    <div className="page">
      <h1 className="page__title">Time Off</h1>

      <div className="timeoff-layout">

        {/* ── Left: Request form ──────────────────────────── */}
        <Card className="timeoff-layout__form">
          <CardHeader><CardTitle>Request Time Off</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="form">

              <div className="field">
                <Label>Type</Label>
                <Select onValueChange={(v) => setValue('leaveType', v as FormData['leaveType'])}>
                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.leaveType && <p className="field__error">{errors.leaveType.message}</p>}
              </div>

              <div className="half-day-toggle">
                <label className="half-day-toggle__label">
                  <input
                    type="checkbox"
                    className="half-day-toggle__checkbox"
                    checked={isHalfDay}
                    onChange={(e) => handleHalfDayToggle(e.target.checked)}
                  />
                  <span className="half-day-toggle__track" />
                  Half Day
                </label>
              </div>

              {isHalfDay ? (
                <div className="form-grid">
                  <div className="field">
                    <Label>Date</Label>
                    <Input type="date" {...register('startDate')} />
                    {errors.startDate && <p className="field__error">{errors.startDate.message}</p>}
                  </div>
                  <div className="field">
                    <Label>Period</Label>
                    <Select onValueChange={(v) => setValue('halfDayPeriod', v as 'morning' | 'afternoon')}>
                      <SelectTrigger><SelectValue placeholder="Select period…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.halfDayPeriod && <p className="field__error">{errors.halfDayPeriod.message}</p>}
                  </div>
                </div>
              ) : (
                <div className="form-grid">
                  <div className="field">
                    <Label>Start Date</Label>
                    <Input type="date" {...register('startDate')} />
                    {errors.startDate && <p className="field__error">{errors.startDate.message}</p>}
                  </div>
                  <div className="field">
                    <Label>End Date</Label>
                    <Input type="date" min={startDate} {...register('endDate')} />
                    {errors.endDate && <p className="field__error">{errors.endDate.message}</p>}
                  </div>
                </div>
              )}

              <div className="field">
                <Label>Reason <span className="field__optional">(optional)</span></Label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Briefly describe the reason for your time off…"
                  {...register('reason')}
                />
              </div>

              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting…' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Right: My Requests ──────────────────────────── */}
        <div className="timeoff-layout__history">
          <h2 className="timeoff-history__heading">My Requests</h2>

          {isLoading ? (
            <p className="timeoff-history__empty">Loading…</p>
          ) : myRequests.length === 0 ? (
            <p className="timeoff-history__empty">No requests submitted yet.</p>
          ) : (
            <>
              {/* Pending */}
              <div className="timeoff-history__section">
                <div className="timeoff-history__section-header">
                  <span className="timeoff-history__section-title">Pending</span>
                  {pending.length > 0 && (
                    <span className="timeoff-history__count timeoff-history__count--pending">
                      {pending.length}
                    </span>
                  )}
                </div>
                {pending.length === 0 ? (
                  <p className="timeoff-history__empty-sub">No pending requests</p>
                ) : (
                  <div className="timeoff-history__list">
                    {pending.map((r) => <RequestCard key={r.id} r={r} />)}
                  </div>
                )}
              </div>

              {/* Approved */}
              <div className="timeoff-history__section">
                <div className="timeoff-history__section-header">
                  <span className="timeoff-history__section-title">Approved</span>
                  {approved.length > 0 && (
                    <span className="timeoff-history__count timeoff-history__count--approved">
                      {approved.length}
                    </span>
                  )}
                </div>
                {approved.length === 0 ? (
                  <p className="timeoff-history__empty-sub">No approved requests</p>
                ) : (
                  <div className="timeoff-history__list">
                    {approved.map((r) => <RequestCard key={r.id} r={r} />)}
                  </div>
                )}
              </div>

              {/* Rejected — only show if there are some */}
              {rejected.length > 0 && (
                <div className="timeoff-history__section">
                  <div className="timeoff-history__section-header">
                    <span className="timeoff-history__section-title">Rejected</span>
                    <span className="timeoff-history__count timeoff-history__count--rejected">
                      {rejected.length}
                    </span>
                  </div>
                  <div className="timeoff-history__list">
                    {rejected.map((r) => <RequestCard key={r.id} r={r} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
