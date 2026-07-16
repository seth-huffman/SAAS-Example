import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { leaveRequestsApi } from '../api/leave-requests.api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import type { HalfDayPeriod, LeaveRequest, LeaveType } from '../types/leave-request.types';

/* ── Schema ──────────────────────────────────────────────── */

const schema = z.object({
  leaveType:      z.enum(['vacation', 'sick', 'personal', 'other']),
  startDate:      z.string().min(1, 'Start date required'),
  endDate:        z.string().optional(),
  isHalfDay:      z.boolean(),
  halfDayPeriod:  z.enum(['morning', 'afternoon']).optional(),
  hoursRequested: z.string().optional(),
  reason:         z.string().optional(),
}).refine((d) => !d.hoursRequested || (Number(d.hoursRequested) >= 0.5 && Number(d.hoursRequested) <= 24), {
  message: 'Enter a value between 0.5 and 24',
  path: ['hoursRequested'],
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

function RequestCard({ r, onDelete }: { r: LeaveRequest; onDelete?: (r: LeaveRequest) => void }) {
  return (
    <div className="timeoff-request-card">
      <div className="timeoff-request-card__top">
        <span className="timeoff-request-card__type">{TYPE_LABELS[r.leaveType]}</span>
        {r.status === 'pending' && onDelete && (
          <button
            type="button"
            className="timeoff-request-card__delete-btn"
            title="Delete request"
            onClick={() => onDelete(r)}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <p className="timeoff-request-card__dates">
        {fmtDateRange(r)}
        {r.hoursRequested != null && ` · ${r.hoursRequested} hrs`}
      </p>
      {r.reason && <p className="timeoff-request-card__reason">{r.reason}</p>}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export function TimeOffPage() {
  const queryClient = useQueryClient();
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LeaveRequest | null>(null);

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
      hoursRequested: data.hoursRequested ? Number(data.hoursRequested) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Time off request submitted');
      reset();
      setIsHalfDay(false);
    },
    onError: () => toast.error('Failed to submit request'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leaveRequestsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Request deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete request'),
  });

  return (
    <div className="page">

      {/* ── Request form card ────────────────────────────── */}
      <Card className="timeoff-form-card">
        <CardHeader><CardTitle>Request Time Off</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="form">

            <div className="form-grid form-grid--5">
              <div className="field">
                <Select onValueChange={(v) => setValue('leaveType', v as FormData['leaveType'])}>
                  <SelectTrigger aria-label="Type"><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.leaveType && <p className="field__error">{errors.leaveType.message}</p>}
              </div>

              <div className="field">
                <Select value={isHalfDay ? 'yes' : 'no'} onValueChange={(v) => handleHalfDayToggle(v === 'yes')}>
                  <SelectTrigger aria-label="Half Day"><SelectValue placeholder="Half Day?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Half Day: No</SelectItem>
                    <SelectItem value="yes">Half Day: Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="field">
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  aria-label="Hours Off"
                  placeholder="Hours Off (optional)"
                  {...register('hoursRequested')}
                />
                {errors.hoursRequested && <p className="field__error">{errors.hoursRequested.message}</p>}
              </div>

              {isHalfDay ? (
                <>
                  <div className="field">
                    <Input type="date" aria-label="Date" {...register('startDate')} />
                    {errors.startDate && <p className="field__error">{errors.startDate.message}</p>}
                  </div>
                  <div className="field">
                    <Select onValueChange={(v) => setValue('halfDayPeriod', v as 'morning' | 'afternoon')}>
                      <SelectTrigger aria-label="Period"><SelectValue placeholder="Select period…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.halfDayPeriod && <p className="field__error">{errors.halfDayPeriod.message}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="field">
                    <Input type="date" aria-label="Start Date" {...register('startDate')} />
                    {errors.startDate && <p className="field__error">{errors.startDate.message}</p>}
                  </div>
                  <div className="field">
                    <Input type="date" aria-label="End Date" min={startDate} {...register('endDate')} />
                    {errors.endDate && <p className="field__error">{errors.endDate.message}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="timeoff-form-row2">
              <div className="field timeoff-form-row2__message">
                <textarea
                  className="textarea"
                  aria-label="Reason"
                  placeholder="Reason (optional) — briefly describe the reason for your time off…"
                  {...register('reason')}
                />
              </div>

              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting…' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <h1 className="page__title">Time Off</h1>
      
      {/* ── Requests history ─────────────────────────────── */}
      <div className="timeoff-layout__history">
        <h2 className="timeoff-history__heading">My Pending Requests</h2>

        {isLoading ? (
          <p className="timeoff-history__empty">Loading…</p>
        ) : myRequests.length === 0 ? (
          <p className="timeoff-history__empty">No requests submitted yet.</p>
        ) : (
          <>
            <div className="timeoff-history__row">
              <div className="timeoff-history__section timeoff-history__section--pending">
                <div className="timeoff-history__section-header">
                  <span className="timeoff-history__section-title">Pending</span>
                </div>
                {pending.length === 0 ? (
                  <p className="timeoff-history__empty-sub">No pending requests</p>
                ) : (
                  <div className="timeoff-history__list">
                    {pending.map((r) => <RequestCard key={r.id} r={r} onDelete={setDeleteTarget} />)}
                  </div>
                )}
              </div>

              <div className="timeoff-history__section timeoff-history__section--approved">
                <div className="timeoff-history__section-header">
                  <span className="timeoff-history__section-title">Approved</span>
                </div>
                {approved.length === 0 ? (
                  <p className="timeoff-history__empty-sub">No approved requests</p>
                ) : (
                  <div className="timeoff-history__list">
                    {approved.map((r) => <RequestCard key={r.id} r={r} />)}
                  </div>
                )}
              </div>
            </div>

            {rejected.length > 0 && (
              <div className="timeoff-history__section timeoff-history__section--rejected">
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

      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            Are you sure you want to delete this {deleteTarget && TYPE_LABELS[deleteTarget.leaveType].toLowerCase()} request?
            This cannot be undone.
          </p>
          <div className="form-actions">
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteTarget!.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Request'}
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
