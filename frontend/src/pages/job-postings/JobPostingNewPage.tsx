import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jobPostingsApi } from '../../api/job-postings.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  title:        z.string().min(1, 'Title is required'),
  description:  z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(),
  department:   z.string().optional(),
  salaryMin:    z.number().min(0).optional().or(z.nan().transform(() => undefined)),
  salaryMax:    z.number().min(0).optional().or(z.nan().transform(() => undefined)),
});

type FormData = z.infer<typeof schema>;

export function JobPostingNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => jobPostingsApi.create({
      title:        data.title,
      description:  data.description,
      requirements: data.requirements || undefined,
      department:   data.department   || undefined,
      salaryMin:    data.salaryMin,
      salaryMax:    data.salaryMax,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Job posting created');
      navigate('/job-postings');
    },
    onError: () => toast.error('Failed to create posting'),
  });

  return (
    <div className="page page--medium">
      <div className="page__back-row">
        <Button variant="ghost" size="icon" onClick={() => navigate('/job-postings')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="page__title">New Job Posting</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Posting Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="form">
            <div className="field">
              <Label>Job Title</Label>
              <Input placeholder="e.g. Senior Software Engineer" {...register('title')} />
              {errors.title && <p className="field__error">{errors.title.message}</p>}
            </div>

            <div className="field">
              <Label>Department</Label>
              <Input placeholder="e.g. Engineering" {...register('department')} />
            </div>

            <div className="field">
              <Label>Description</Label>
              <textarea
                className="textarea"
                rows={5}
                placeholder="Describe the role, responsibilities, and what makes it a great opportunity…"
                {...register('description')}
              />
              {errors.description && <p className="field__error">{errors.description.message}</p>}
            </div>

            <div className="field">
              <Label>Requirements</Label>
              <textarea
                className="textarea"
                rows={4}
                placeholder="List qualifications, experience, and skills needed…"
                {...register('requirements')}
              />
            </div>

            <div className="form-grid">
              <div className="field">
                <Label>Min Salary ($)</Label>
                <Input type="number" min={0} placeholder="e.g. 80000" {...register('salaryMin', { valueAsNumber: true })} />
              </div>
              <div className="field">
                <Label>Max Salary ($)</Label>
                <Input type="number" min={0} placeholder="e.g. 120000" {...register('salaryMax', { valueAsNumber: true })} />
              </div>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Publishing…' : 'Publish Posting'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
