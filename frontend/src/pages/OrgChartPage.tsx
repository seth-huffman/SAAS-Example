import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { departmentsApi } from '../api/departments.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import type { Employee } from '../types/employee.types';

function initials(e: Employee) {
  return `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();
}

export function OrgChartPage() {
  const { data: empData, isLoading: empLoading } = useQuery({
    queryKey: ['employees', { page: 1, limit: 100 }],
    queryFn: () => employeesApi.list({ page: 1, limit: 100 }),
  });
  const { data: departments, isLoading: deptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const employees: Employee[] = empData?.data ?? [];

  if (empLoading || deptLoading) {
    return <div className="page"><p className="text-muted">Loading…</p></div>;
  }

  const byDept = new Map<string, Employee[]>();
  departments?.forEach((d) => byDept.set(d.id, []));
  const unassigned: Employee[] = [];

  employees.forEach((e) => {
    if (e.departmentId && byDept.has(e.departmentId)) {
      byDept.get(e.departmentId)!.push(e);
    } else {
      unassigned.push(e);
    }
  });

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Org Chart</h1>
        <span className="text-muted" style={{ fontSize: '0.875rem' }}>{employees.length} employees</span>
      </div>

      <div className="org-chart">
        {departments?.map((dept) => {
          const emps = byDept.get(dept.id) ?? [];
          return (
            <Card key={dept.id} className="org-dept-card">
              <CardHeader>
                <div className="org-dept-card__header">
                  <CardTitle className="org-dept-card__name">{dept.name}</CardTitle>
                  <Badge className="badge--outline">{emps.length}</Badge>
                </div>
                {dept.description && <p className="org-dept-card__desc">{dept.description}</p>}
              </CardHeader>
              <CardContent>
                {emps.length === 0 ? (
                  <p className="org-empty">No employees</p>
                ) : (
                  <div className="org-emp-grid">
                    {emps.map((e) => (
                      <div key={e.id} className="org-emp-chip">
                        <div className="org-emp-chip__avatar">{initials(e)}</div>
                        <div>
                          <p className="org-emp-chip__name">{e.firstName} {e.lastName}</p>
                          <p className="org-emp-chip__title">{e.jobTitle ?? '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {unassigned.length > 0 && (
          <Card className="org-dept-card">
            <CardHeader>
              <div className="org-dept-card__header">
                <CardTitle className="org-dept-card__name">Unassigned</CardTitle>
                <Badge className="badge--outline">{unassigned.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="org-emp-grid">
                {unassigned.map((e) => (
                  <div key={e.id} className="org-emp-chip">
                    <div className="org-emp-chip__avatar">{initials(e)}</div>
                    <div>
                      <p className="org-emp-chip__name">{e.firstName} {e.lastName}</p>
                      <p className="org-emp-chip__title">{e.jobTitle ?? '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
