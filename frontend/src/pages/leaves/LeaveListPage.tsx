import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leaveRequestsApi } from '../../api/leave-requests.api';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Check, X } from 'lucide-react';
import type { LeaveStatus } from '../../types/leave-request.types';

const STATUS_BADGE: Record<LeaveStatus, string> = {
  pending: 'badge--pending',
  approved: 'badge--approved',
  rejected: 'badge--rejected',
};

const LEAVE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  other: 'Other',
};

export function LeaveListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isHR = user?.role === 'super_admin' || user?.role === 'hr_manager';

  const { data, isLoading } = useQuery({ queryKey: ['leave-requests'], queryFn: () => leaveRequestsApi.list() });

  const approveMutation = useMutation({
    mutationFn: (id: string) => leaveRequestsApi.approve(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leave-requests'] }); toast.success('Leave request approved'); },
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => leaveRequestsApi.reject(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leave-requests'] }); toast.success('Leave request rejected'); },
  });

  const cols = isHR ? 7 : 5;

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Leave Requests</h1>
        {!isHR && <Button onClick={() => navigate('/leaves/new')}><Plus size={16} /> Request Leave</Button>}
      </div>

      <Card>
        <CardContent className="card__content--flush">
          <Table>
            <TableHeader>
              <TableRow>
                {isHR && <TableHead>Employee</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                {isHR && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={cols} className="table-cell--center">Loading…</TableCell></TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={cols} className="table-cell--center">No leave requests found</TableCell></TableRow>
              ) : (
                data?.data.map((lr) => (
                  <TableRow key={lr.id}>
                    {isHR && <TableCell className="table-cell--medium">{lr.employee ? `${lr.employee.firstName} ${lr.employee.lastName}` : '—'}</TableCell>}
                    <TableCell>{LEAVE_LABELS[lr.leaveType] ?? lr.leaveType}</TableCell>
                    <TableCell>{new Date(lr.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(lr.endDate).toLocaleDateString()}</TableCell>
                    <TableCell><Badge className={STATUS_BADGE[lr.status]}>{lr.status}</Badge></TableCell>
                    <TableCell className="table-cell--muted">{new Date(lr.createdAt).toLocaleDateString()}</TableCell>
                    {isHR && (
                      <TableCell>
                        {lr.status === 'pending' && (
                          <div className="leave-actions">
                            <Button size="sm" onClick={() => approveMutation.mutate(lr.id)} disabled={approveMutation.isPending}>
                              <Check size={12} /> Approve
                            </Button>
                            <Button size="sm" className="btn--green" onClick={() => rejectMutation.mutate(lr.id)} disabled={rejectMutation.isPending}>
                              <X size={12} /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
