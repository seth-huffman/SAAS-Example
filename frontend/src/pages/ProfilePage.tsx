import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { employeesApi } from '../api/employees.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  hr_manager:  'HR Manager',
  employee:    'Employee',
};

const WORK_TYPE_LABELS: Record<string, string> = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
};

function fmt(value: string | number | null | undefined, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function fmtDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

interface FieldProps { label: string; value: string }
function Field({ label, value }: FieldProps) {
  return (
    <div>
      <p className="profile-field__label">{label}</p>
      <p className="profile-field__value">{value}</p>
    </div>
  );
}

export function ProfilePage() {
  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
  });

  const { data: emp, isLoading: loadingEmp } = useQuery({
    queryKey: ['employees', 'me'],
    queryFn: employeesApi.me,
    retry: false,
  });

  if (loadingMe) return <p style={{ color: 'var(--muted-foreground)' }}>Loading…</p>;

  const roleLabel = ROLE_LABELS[me?.role ?? ''] ?? me?.role ?? '';
  const fullName  = emp
    ? [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(' ')
    : me?.email ?? '';
  const initials  = emp
    ? `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase()
    : me?.email.slice(0, 2).toUpperCase() ?? 'HR';

  const supervisorName = emp?.supervisor
    ? `${emp.supervisor.firstName} ${emp.supervisor.lastName}`
    : null;

  return (
    <div className="page profile-page">
      <h1 className="page__title">My Profile</h1>

      {/* ── Header card ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="profile-avatar-header">
            <Avatar className="avatar--xl">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{fullName}</CardTitle>
              {emp?.jobTitle && (
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: 2 }}>
                  {emp.jobTitle}
                  {emp.department ? ` · ${emp.department.name}` : ''}
                </p>
              )}
              <div className="profile-badge" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                <Badge>{roleLabel}</Badge>
                {emp?.workType && (
                  <Badge variant="outline">{WORK_TYPE_LABELS[emp.workType]}</Badge>
                )}
                {emp?.status && (
                  <Badge className={emp.status === 'active' ? 'badge--active' : 'badge--terminated'}>
                    {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── Personal Information ──────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <Separator style={{ marginBottom: 16 }} />
          <div className="profile-grid profile-grid--3">
            <Field label="First Name"   value={fmt(emp?.firstName)} />
            <Field label="Middle Name"  value={fmt(emp?.middleName)} />
            <Field label="Last Name"    value={fmt(emp?.lastName)} />
            <Field label="Date of Birth" value={fmtDate(emp?.birthDate)} />
            <Field label="Email"        value={fmt(emp?.email ?? me?.email)} />
            <Field label="Phone"        value={fmt(emp?.phone)} />
          </div>
        </CardContent>
      </Card>

      {/* ── Work Information ──────────────────────────────── */}
      {!loadingEmp && (
        <Card>
          <CardHeader><CardTitle>Work Information</CardTitle></CardHeader>
          <CardContent>
            <Separator style={{ marginBottom: 16 }} />
            <div className="profile-grid">
              <Field label="Job Title"    value={fmt(emp?.jobTitle)} />
              <Field label="Department"   value={fmt(emp?.department?.name)} />
              <Field label="Work Arrangement" value={emp?.workType ? WORK_TYPE_LABELS[emp.workType] : '—'} />
              <Field label="Supervisor"   value={fmt(supervisorName)} />
              <Field label="Hire Date"    value={fmtDate(emp?.hireDate)} />
              <Field label="Status"       value={emp?.status ? emp.status.charAt(0).toUpperCase() + emp.status.slice(1) : '—'} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Compensation ──────────────────────────────────── */}
      {!loadingEmp && (
        <Card>
          <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
          <CardContent>
            <Separator style={{ marginBottom: 16 }} />
            <div className="profile-grid">
              <Field label="Annual Salary" value={fmtMoney(emp?.salary)} />
              <Field label="Bonus"         value={fmtMoney(emp?.bonus)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Account ───────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent>
          <Separator style={{ marginBottom: 16 }} />
          <div className="profile-grid">
            <Field label="Email"          value={fmt(me?.email)} />
            <Field label="Role"           value={roleLabel} />
            <Field label="Account Status" value={me?.isActive ? 'Active' : 'Inactive'} />
            <Field label="Member Since"   value={fmtDate(me?.createdAt)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
