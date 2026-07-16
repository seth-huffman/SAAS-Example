import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { employeesApi } from '../api/employees.api';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Briefcase, MapPin, Mail } from 'lucide-react';

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
    <div className="page profile-detail">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="page__header">
        <h1 className="page__title">My Profile</h1>
      </div>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="jobs-detail__header">
        <div className="profile-avatar-header">
          <Avatar style={{ width: 52, height: 52 }}>
            <AvatarFallback style={{ fontSize: '1.1rem', fontWeight: 600 }}>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="jobs-detail__title">{fullName}</h2>
            <div className="jobs-detail__meta">
              {emp?.jobTitle && (
                <span><Briefcase size={13} />{emp.jobTitle}</span>
              )}
              {emp?.department?.name && (
                <span><MapPin size={13} />{emp.department.name}</span>
              )}
              <span><Mail size={13} />{me?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal Information ──────────────────────────── */}
      <div className="jobs-detail__body">
        <div>
          <p className="jobs-detail__req-heading">Personal Information</p>
          <div className="profile-grid profile-grid--2">
            <Field label="Date of Birth" value={fmtDate(emp?.birthDate)} />
            <Field label="Phone"         value={fmt(emp?.phone)} />
          </div>
        </div>

        {/* ── Work Information ──────────────────────────── */}
        {!loadingEmp && (
          <div>
            <p className="jobs-detail__req-heading">Work Information</p>
            <div className="profile-grid">
              <Field label="Job Title"         value={fmt(emp?.jobTitle)} />
              <Field label="Department"        value={fmt(emp?.department?.name)} />
              <Field label="Work Arrangement"  value={emp?.workType ? WORK_TYPE_LABELS[emp.workType] : '—'} />
              <Field label="Supervisor"        value={fmt(supervisorName)} />
              <Field label="Hire Date"         value={fmtDate(emp?.hireDate)} />
              <Field label="Status"            value={emp?.status ? emp.status.charAt(0).toUpperCase() + emp.status.slice(1) : '—'} />
              <Field label="Role"              value={roleLabel} />
              <Field label="Member Since"      value={fmtDate(me?.createdAt)} />
            </div>
          </div>
        )}

        {/* ── Compensation ──────────────────────────────── */}
        {!loadingEmp && (
          <div>
            <p className="jobs-detail__req-heading">Compensation</p>
            <div className="profile-grid">
              <Field label="Annual Salary" value={fmtMoney(emp?.salary)} />
              <Field label="Bonus"         value={fmtMoney(emp?.bonus)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
