import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '../../api/departments.api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Building2 } from 'lucide-react';

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: dept, isLoading } = useQuery({ queryKey: ['departments', id], queryFn: () => departmentsApi.getById(id!), enabled: !!id });
  const { data: members } = useQuery({ queryKey: ['departments', id, 'members'], queryFn: () => departmentsApi.getMembers(id!), enabled: !!id });

  if (isLoading) return <p style={{ color: 'var(--muted-foreground)' }}>Loading…</p>;
  if (!dept) return <p style={{ color: 'var(--muted-foreground)' }}>Department not found</p>;

  return (
    <div className="page">
      <div className="page__back-row">
        <Button variant="ghost" size="icon" onClick={() => navigate('/departments')}><ArrowLeft size={16} /></Button>
        <div className="dept-page-header">
          <div className="dept-page-header__icon"><Building2 size={20} /></div>
          <div>
            <h1 className="dept-page-header__title">{dept.name}</h1>
            {dept.description && <p className="dept-page-header__subtitle">{dept.description}</p>}
          </div>
        </div>
      </div>

      {dept.manager && (
        <Card>
          <CardHeader><CardTitle className="card__title--sm">Manager</CardTitle></CardHeader>
          <CardContent>
            <div className="manager-row">
              <div className="manager-row__avatar">
                {dept.manager.firstName[0]}{dept.manager.lastName[0]}
              </div>
              <div>
                <p className="manager-row__name">{dept.manager.firstName} {dept.manager.lastName}</p>
                <p className="manager-row__title">{dept.manager.jobTitle ?? dept.manager.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="card__title--sm">Members {members ? `(${members.total})` : ''}</CardTitle></CardHeader>
        <CardContent className="card__content--flush">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!members || members.data.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="table-cell--center">No members in this department</TableCell></TableRow>
              ) : (
                members.data.map((emp) => (
                  <TableRow key={emp.id} className="table-row--clickable" onClick={() => navigate(`/employees/${emp.id}`)}>
                    <TableCell className="table-cell--medium">{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell>{emp.jobTitle ?? '—'}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Badge className={emp.status === 'active' ? 'badge--active' : 'badge--terminated'}>{emp.status}</Badge>
                    </TableCell>
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
