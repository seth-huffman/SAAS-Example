import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { employeesApi } from '../../api/employees.api';
import { departmentsApi } from '../../api/departments.api';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  hireDate: z.string().optional(),
  salary: z.number().min(0).optional(),
  departmentId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function EmployeeNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.list });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => employeesApi.create({ ...data, salary: data.salary ? Number(data.salary) : undefined, departmentId: data.departmentId || undefined }),
    onSuccess: (emp) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee hired successfully');
      navigate(`/employees/${emp.id}`);
    },
    onError: (e: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(e.response?.data?.message ?? 'Failed to create employee');
    },
  });

  return (
    <div className="page page--medium">
      <div className="page__back-row">
        <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}><ArrowLeft size={16} /></Button>
        <h1 className="page__title">Hire Employee</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Employee Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => mutate(d))} className="form">
            <div className="form-grid">
              <div className="field">
                <Label>First Name *</Label>
                <Input {...register('firstName')} />
                {errors.firstName && <p className="field__error">{errors.firstName.message}</p>}
              </div>
              <div className="field">
                <Label>Last Name *</Label>
                <Input {...register('lastName')} />
                {errors.lastName && <p className="field__error">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="field">
              <Label>Email *</Label>
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
              <Select onValueChange={(v: string | null) => setValue('departmentId', v ?? undefined)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="form-actions">
              <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Hire Employee'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/employees')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
