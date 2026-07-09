import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { employeesApi } from '../../api/employees.api';
import { departmentsApi } from '../../api/departments.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { EmployeeStatus } from '../../types/employee.types';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  hireDate: z.string().optional(),
  salary: z.number().min(0).optional(),
  departmentId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STATUS_BADGE = {
  active: 'badge--active',
  inactive: 'badge--inactive',
  terminated: 'badge--terminated',
} as const;

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);

  const { data: employee, isLoading } = useQuery({ queryKey: ['employees', id], queryFn: () => employeesApi.getById(id!), enabled: !!id });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.list });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: employee ? {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone ?? '',
      jobTitle: employee.jobTitle ?? '',
      hireDate: employee.hireDate ? String(employee.hireDate).split('T')[0] : '',
      salary: employee.salary ?? undefined,
      departmentId: employee.departmentId ?? '',
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => employeesApi.update(id!, { ...data, departmentId: data.departmentId || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee updated'); },
    onError: () => toast.error('Failed to update employee'),
  });

  const terminateMutation = useMutation({
    mutationFn: () => employeesApi.terminate(id!),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee terminated'); setShowTerminateDialog(false); },
    onError: () => toast.error('Failed to terminate employee'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: EmployeeStatus) => employeesApi.update(id!, { status }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`Status changed to ${updated.status}`);
    },
    onError: () => toast.error('Failed to update status'),
  });

  function handleStatusChange(newStatus: EmployeeStatus) {
    if (newStatus === 'terminated') {
      setShowTerminateDialog(true);
    } else {
      statusMutation.mutate(newStatus);
    }
  }

  if (isLoading) return <p style={{ color: 'var(--muted-foreground)' }}>Loading…</p>;
  if (!employee) return <p style={{ color: 'var(--muted-foreground)' }}>Employee not found</p>;

  return (
    <div className="page page--medium">
      <div className="page__header">
        <div className="page__back-row">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}><ArrowLeft size={16} /></Button>
          <div>
            <h1 className="page__title">{employee.firstName} {employee.lastName}</h1>
            <div className="emp-status-row">
              <Badge className={STATUS_BADGE[employee.status]}>{employee.status}</Badge>
              <Select
                value=""
                onValueChange={(v) => handleStatusChange(v as EmployeeStatus)}
                disabled={statusMutation.isPending || terminateMutation.isPending}
              >
                <SelectTrigger className="status-change-trigger">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {employee.status !== 'active'     && <SelectItem value="active">Set Active</SelectItem>}
                  {employee.status !== 'inactive'   && <SelectItem value="inactive">Set Inactive</SelectItem>}
                  {employee.status !== 'terminated' && (
                    <SelectItem value="terminated" className="select-item--destructive">
                      <AlertTriangle size={13} /> Terminate
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terminate Employee</DialogTitle>
              <DialogDescription>
                Are you sure you want to terminate {employee.firstName} {employee.lastName}? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => terminateMutation.mutate()} disabled={terminateMutation.isPending}>
                {terminateMutation.isPending ? 'Terminating…' : 'Terminate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Edit Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="form">
            <div className="form-grid">
              <div className="field">
                <Label>First Name</Label>
                <Input {...register('firstName')} />
                {errors.firstName && <p className="field__error">{errors.firstName.message}</p>}
              </div>
              <div className="field">
                <Label>Last Name</Label>
                <Input {...register('lastName')} />
              </div>
            </div>
            <div className="field">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="field__error">{errors.email.message}</p>}
            </div>
            <div className="form-grid">
              <div className="field"><Label>Phone</Label><Input {...register('phone')} /></div>
              <div className="field"><Label>Job Title</Label><Input {...register('jobTitle')} /></div>
            </div>
            <div className="form-grid">
              <div className="field"><Label>Hire Date</Label><Input type="date" {...register('hireDate')} /></div>
              <div className="field"><Label>Salary</Label><Input type="number" min={0} step={0.01} {...register('salary', { valueAsNumber: true })} /></div>
            </div>
            <div className="field">
              <Label>Department</Label>
              <Select defaultValue={employee.departmentId ?? ''} onValueChange={(v: string | null) => setValue('departmentId', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No department</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
