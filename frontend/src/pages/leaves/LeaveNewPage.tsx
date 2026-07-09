import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { leaveRequestsApi } from '../../api/leave-requests.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  leaveType: z.enum(['vacation', 'sick', 'personal', 'other']),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  reason: z.string().optional(),
}).refine((d) => new Date(d.startDate) <= new Date(d.endDate), { message: 'End date must be after start date', path: ['endDate'] });

type FormData = z.infer<typeof schema>;

export function LeaveNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => leaveRequestsApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leave-requests'] }); toast.success('Leave request submitted'); navigate('/leaves'); },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => { toast.error(e.response?.data?.message ?? 'Failed to submit request'); },
  });

  return (
    <div className="page page--narrow">
      <div className="page__back-row">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leaves')}><ArrowLeft size={16} /></Button>
        <h1 className="page__title">Request Leave</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Leave Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => mutate(d))} className="form">
            <div className="field">
              <Label>Leave Type *</Label>
              <Controller
                name="leaveType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.leaveType && <p className="field__error">{errors.leaveType.message}</p>}
            </div>
            <div className="form-grid">
              <div className="field">
                <Label>Start Date *</Label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && <p className="field__error">{errors.startDate.message}</p>}
              </div>
              <div className="field">
                <Label>End Date *</Label>
                <Input type="date" {...register('endDate')} />
                {errors.endDate && <p className="field__error">{errors.endDate.message}</p>}
              </div>
            </div>
            <div className="field">
              <Label>Reason (optional)</Label>
              <Input {...register('reason')} placeholder="Brief description…" />
            </div>
            <div className="form-actions">
              <Button type="submit" disabled={isPending}>{isPending ? 'Submitting…' : 'Submit Request'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/leaves')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
