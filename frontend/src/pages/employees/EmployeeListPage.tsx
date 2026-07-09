import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees.api';
import { departmentsApi } from '../../api/departments.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Plus, Search } from 'lucide-react';
import type { EmployeeStatus } from '../../types/employee.types';

const STATUS_BADGE: Record<EmployeeStatus, string> = {
  active: 'badge--active',
  inactive: 'badge--inactive',
  terminated: 'badge--terminated',
};

export function EmployeeListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const status = (searchParams.get('status') ?? '') as EmployeeStatus | '';
  const departmentId = searchParams.get('departmentId') ?? '';
  const page = Number(searchParams.get('page') ?? 1);
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', { search, status, departmentId, page }],
    queryFn: () => employeesApi.list({ search: search || undefined, status: (status as EmployeeStatus) || undefined, departmentId: departmentId || undefined, page, limit: 20 }),
  });

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.list });

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Employees</h1>
        <Button onClick={() => navigate('/employees/new')}>
          <Plus size={16} /> Hire Employee
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="card__title--sm">Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="filter-row">
            <div className="search-group">
              <Input
                placeholder="Search name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setFilter('search', searchInput)}
              />
              <Button variant="outline" size="icon" onClick={() => setFilter('search', searchInput)}>
                <Search size={16} />
              </Button>
            </div>
            <Select value={status || 'all'} onValueChange={(v: string | null) => setFilter('status', !v || v === 'all' ? '' : v)}>
              <SelectTrigger style={{ width: '160px' }}><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentId || 'all'} onValueChange={(v: string | null) => setFilter('departmentId', !v || v === 'all' ? '' : v)}>
              <SelectTrigger style={{ width: '192px' }}><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="card__content--flush">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hire Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="table-cell--center">Loading…</TableCell></TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="table-cell--center">No employees found</TableCell></TableRow>
              ) : (
                data?.data.map((emp) => (
                  <TableRow key={emp.id} className="table-row--clickable" onClick={() => navigate(`/employees/${emp.id}`)}>
                    <TableCell className="table-cell--medium">{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.jobTitle ?? '—'}</TableCell>
                    <TableCell>{emp.department?.name ?? '—'}</TableCell>
                    <TableCell><Badge className={STATUS_BADGE[emp.status]}>{emp.status}</Badge></TableCell>
                    <TableCell>{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && data.total > 20 && (
        <div className="pagination">
          <p className="pagination__info">{data.total} total employees</p>
          <div className="pagination__btns">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setFilter('page', String(page - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page * 20 >= data.total} onClick={() => setFilter('page', String(page + 1))}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
