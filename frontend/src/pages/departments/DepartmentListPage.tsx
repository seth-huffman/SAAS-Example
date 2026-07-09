import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { departmentsApi } from '../../api/departments.api';
import { employeesApi } from '../../api/employees.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Building2, Plus, Trash2, Users } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  managerId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function DepartmentListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isHR = user?.role === 'super_admin' || user?.role === 'hr_manager';
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: departments, isLoading } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.list });
  const { data: employees } = useQuery({ queryKey: ['employees', { limit: 100 }], queryFn: () => employeesApi.list({ status: 'active', limit: 100 }) });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => departmentsApi.create({ ...data, managerId: data.managerId || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); toast.success('Department created'); reset(); setOpen(false); },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => { toast.error(e.response?.data?.message ?? 'Failed to create department'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete department'),
  });

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Departments</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus size={16} /> New Department
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit((d) => mutate(d))} className="form">
              <div className="field">
                <Label>Name *</Label>
                <Input {...register('name')} />
                {errors.name && <p className="field__error">{errors.name.message}</p>}
              </div>
              <div className="field">
                <Label>Description</Label>
                <Input {...register('description')} />
              </div>
              <div className="field">
                <Label>Manager</Label>
                <Select onValueChange={(v: string | null) => setValue('managerId', v ?? undefined)}>
                  <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                  <SelectContent>
                    {employees?.data.map((e) => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="form-actions">
                <Button type="submit" disabled={isPending}>{isPending ? 'Creating…' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="three-col-grid">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent><div className="skeleton" style={{ height: '128px', margin: '16px' }} /></CardContent></Card>
          ))}
        </div>
      ) : departments?.length === 0 ? (
        <div className="empty-state">
          <Building2 />
          <p>No departments yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="three-col-grid">
          {departments?.map((dept) => (
            <Card key={dept.id} className="dept-card" onClick={() => navigate(`/departments/${dept.id}`)}>
              <CardHeader>
                <div className="dept-card__header">
                  <div className="dept-card__icon"><Building2 size={20} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <CardTitle className="card__title--sm">{dept.name}</CardTitle>
                    {dept.manager && (
                      <CardDescription style={{ fontSize: '0.75rem' }}>
                        Manager: {dept.manager.firstName} {dept.manager.lastName}
                      </CardDescription>
                    )}
                  </div>
                  {isHR && (
                    <button
                      className="dept-card__delete-btn"
                      title="Delete department"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: dept.id, name: dept.name }); }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="dept-card__desc">{dept.description ?? 'No description'}</p>
                <div className="dept-card__footer">
                  <Users size={12} /><span>View members</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--foreground)' }}>{deleteTarget?.name}</strong>?
            Employees in this department will be unassigned. This cannot be undone.
          </p>
          <div className="form-actions">
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteTarget!.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Department'}
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
