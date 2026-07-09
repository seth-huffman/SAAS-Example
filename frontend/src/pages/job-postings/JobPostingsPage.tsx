import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { jobPostingsApi, type JobApplicationRecord } from '../../api/job-postings.api';
import { useAuthStore } from '../../store/auth.store';
import { useViewStore } from '../../store/view.store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import {
  Plus, Briefcase, DollarSign, X, Search, Layers,
  Pencil, ChevronDown, ChevronUp, Paperclip, Users,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { JobPosting } from '../../types/job-posting.types';

/* ── Helpers ─────────────────────────────────────────────── */

function fmtSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Edit dialog schema ──────────────────────────────────── */

const editSchema = z.object({
  title:        z.string().min(1, 'Title required'),
  department:   z.string().optional(),
  description:  z.string().min(1, 'Description required'),
  requirements: z.string().optional(),
  salaryMin:    z.string().optional(),
  salaryMax:    z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

/* ── Applicant card ──────────────────────────────────────── */

function ApplicantCard({ a }: { a: JobApplicationRecord }) {
  const [open, setOpen] = useState(false);
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ') || a.applicantEmail;
  const latestJob = a.workExperience?.[0];

  return (
    <div className={`applicant-card${open ? ' applicant-card--open' : ''}`}>
      <button className="applicant-card__header" onClick={() => setOpen((v) => !v)}>
        <div className="applicant-card__info">
          <span className="applicant-card__name">{name}</span>
          <span className="applicant-card__email">{a.applicantEmail}</span>
          {latestJob && (
            <span className="applicant-card__job">
              {latestJob.jobTitle} at {latestJob.company}
            </span>
          )}
        </div>
        <div className="applicant-card__right">
          {a.resumeFileName && (
            <span className="applicant-card__resume-chip">
              <Paperclip size={11} /> {a.resumeFileName}
            </span>
          )}
          <span className="applicant-card__date">{fmtDate(a.createdAt)}</span>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {open && (
        <div className="applicant-card__body">
          {a.phone && (
            <div className="applicant-card__field">
              <span className="applicant-card__field-label">Phone</span>
              <span>{a.phone}</span>
            </div>
          )}
          {a.address && (
            <div className="applicant-card__field">
              <span className="applicant-card__field-label">Address</span>
              <span>{a.address}</span>
            </div>
          )}

          {a.workExperience && a.workExperience.length > 0 && (
            <div className="applicant-card__section">
              <p className="applicant-card__section-title">Work Experience</p>
              {a.workExperience.map((w, i) => (
                <div key={i} className="applicant-card__exp">
                  <span className="applicant-card__exp-title">{w.jobTitle} · {w.company}</span>
                  <span className="applicant-card__exp-dates">
                    {w.startDate} – {w.isCurrent ? 'Present' : (w.endDate ?? '—')}
                  </span>
                  {w.description && <p className="applicant-card__exp-desc">{w.description}</p>}
                </div>
              ))}
            </div>
          )}

          {a.education && a.education.length > 0 && (
            <div className="applicant-card__section">
              <p className="applicant-card__section-title">Education</p>
              {a.education.map((e, i) => (
                <div key={i} className="applicant-card__exp">
                  <span className="applicant-card__exp-title">{e.degree} — {e.institution}</span>
                  {e.fieldOfStudy && <span className="applicant-card__exp-dates">{e.fieldOfStudy}</span>}
                </div>
              ))}
            </div>
          )}

          {a.coverLetter && (
            <div className="applicant-card__section">
              <p className="applicant-card__section-title">Cover Letter</p>
              <p className="applicant-card__cover">{a.coverLetter}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Left-panel list item ─────────────────────────────────── */

function JobListItem({ p, selected, onClick }: {
  p: JobPosting; selected: boolean; onClick: () => void;
}) {
  const salary = fmtSalary(p.salaryMin, p.salaryMax);
  return (
    <button
      className={`jobs-list-item${selected ? ' jobs-list-item--selected' : ''}${p.status === 'closed' ? ' jobs-list-item--closed' : ''}`}
      onClick={onClick}
    >
      <div className="jobs-list-item__body">
        <span className="jobs-list-item__title">{p.title}</span>
        <div className="jobs-list-item__meta">
          {p.department && <span><Briefcase size={11} />{p.department}</span>}
          {salary        && <span><DollarSign size={11} />{salary}</span>}
        </div>
      </div>
      <Badge className={`jobs-list-item__badge ${p.status === 'open' ? 'badge--active' : 'badge--terminated'}`}>
        {p.status}
      </Badge>
    </button>
  );
}

/* ── Right-panel detail ───────────────────────────────────── */

function JobDetail({ p, isManager, onEdit, onClose, onApply }: {
  p: JobPosting;
  isManager: boolean;
  onEdit: () => void;
  onClose: (id: string) => void;
  onApply: (id: string) => void;
}) {
  const salary = fmtSalary(p.salaryMin, p.salaryMax);

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['job-applications', p.id],
    queryFn: () => jobPostingsApi.getApplications(p.id),
    enabled: isManager,
  });

  return (
    <div className="jobs-detail">
      {/* Header */}
      <div className="jobs-detail__header">
        <div>
          <h2 className="jobs-detail__title">{p.title}</h2>
          <div className="jobs-detail__meta">
            {p.department && <span><Briefcase size={14} />{p.department}</span>}
            {salary        && <span><DollarSign size={14} />{salary}</span>}
          </div>
        </div>
        <div className="jobs-detail__header-right">
          <Badge className={p.status === 'open' ? 'badge--active' : 'badge--terminated'}>
            {p.status}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Body */}
      <div className="jobs-detail__body">
        <p className="jobs-detail__desc">{p.description}</p>
        {p.requirements && (
          <div>
            <p className="jobs-detail__req-heading">Requirements</p>
            <p className="jobs-detail__req-text">{p.requirements}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="jobs-detail__actions">
        {!isManager && p.status === 'open' && (
          <Button onClick={() => onApply(p.id)}>Apply Now</Button>
        )}
        {isManager && (
          <>
            <Button variant="outline" onClick={onEdit}>
              <Pencil size={14} /> Edit Listing
            </Button>
            {p.status === 'open' && (
              <Button variant="outline" className="btn--reject" onClick={() => onClose(p.id)}>
                <X size={13} /> Close Posting
              </Button>
            )}
          </>
        )}
      </div>

      {/* Applicants — manager only */}
      {isManager && (
        <>
          <Separator />
          <div className="applicants-section">
            <div className="applicants-section__heading">
              <Users size={15} />
              <h3 className="applicants-section__title">
                Applicants
                {applications.length > 0 && (
                  <span className="applicants-section__count">{applications.length}</span>
                )}
              </h3>
            </div>

            {loadingApps ? (
              <p className="applicants-empty">Loading applicants…</p>
            ) : applications.length === 0 ? (
              <p className="applicants-empty">No applications yet.</p>
            ) : (
              <div className="applicants-list">
                {applications.map((a) => (
                  <ApplicantCard key={a.id} a={a} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export function JobPostingsPage() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const { user }     = useAuthStore();
  const { viewMode } = useViewStore();
  const isManager    = (user?.role === 'super_admin' || user?.role === 'hr_manager') && viewMode === 'manager';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<JobPosting | null>(null);
  const [search, setSearch]         = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const { data: postings = [], isLoading } = useQuery({
    queryKey: ['job-postings'],
    queryFn: jobPostingsApi.list,
  });

  /* ── Mutations ─────────────────────────────────────────── */

  const closeMutation = useMutation({
    mutationFn: (id: string) => jobPostingsApi.update(id, { status: 'closed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Posting closed');
    },
    onError: () => toast.error('Failed to close posting'),
  });

  const editMutation = useMutation({
    mutationFn: (data: EditForm) =>
      jobPostingsApi.update(editTarget!.id, {
        title:        data.title,
        department:   data.department   || undefined,
        description:  data.description,
        requirements: data.requirements || undefined,
        salaryMin:    data.salaryMin ? Number(data.salaryMin) : undefined,
        salaryMax:    data.salaryMax ? Number(data.salaryMax) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Listing updated');
      setEditTarget(null);
    },
    onError: () => toast.error('Failed to update listing'),
  });

  /* ── Edit form ─────────────────────────────────────────── */

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  function openEdit(p: JobPosting) {
    setEditTarget(p);
    reset({
      title:        p.title,
      department:   p.department   ?? '',
      description:  p.description,
      requirements: p.requirements ?? '',
      salaryMin:    p.salaryMin != null ? String(p.salaryMin) : '',
      salaryMax:    p.salaryMax != null ? String(p.salaryMax) : '',
    });
  }

  /* ── Filtering ─────────────────────────────────────────── */

  const departments = Array.from(new Set(postings.map((p) => p.department).filter(Boolean))) as string[];

  const filtered = postings.filter((p) => {
    // Managers only see their own postings
    if (isManager && p.createdById !== user?.userId) return false;

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.department ?? '').toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    const matchesDept = deptFilter === 'all' || p.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const open   = filtered.filter((p) => p.status === 'open');
  const closed = filtered.filter((p) => p.status === 'closed');
  const selectedPosting = filtered.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="page jobs-page">
      {/* ── Page header ──────────────────────────────────── */}
      <div className="page__header">
        <h1 className="page__title">Job Postings</h1>
        {isManager && (
          <Button onClick={() => navigate('/job-postings/new')}>
            <Plus size={16} /> New Posting
          </Button>
        )}
      </div>

      {/* ── Two-panel layout ─────────────────────────────── */}
      <div className="jobs-layout">

        {/* Left panel */}
        <div className="jobs-layout__list">
          <div className="jobs-list-filters">
            <div className="job-filters__search">
              <Search size={14} className="job-filters__icon" />
              <Input
                placeholder="Search postings…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="job-filters__input"
              />
              {search && (
                <button className="job-filters__clear" onClick={() => setSearch('')}>
                  <X size={13} />
                </button>
              )}
            </div>
            <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="jobs-list-scroll">
            {isLoading ? (
              <p className="jobs-list-empty">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="jobs-list-empty">
                {isManager ? 'No postings created by you yet.' : 'No postings match your search.'}
              </p>
            ) : (
              <>
                {open.length > 0 && (
                  <>
                    <p className="jobs-list-section">Open · {open.length}</p>
                    {open.map((p) => (
                      <JobListItem
                        key={p.id} p={p}
                        selected={selectedId === p.id}
                        onClick={() => setSelectedId(p.id)}
                      />
                    ))}
                  </>
                )}
                {closed.length > 0 && (
                  <>
                    <p className="jobs-list-section">Closed · {closed.length}</p>
                    {closed.map((p) => (
                      <JobListItem
                        key={p.id} p={p}
                        selected={selectedId === p.id}
                        onClick={() => setSelectedId(p.id)}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="jobs-layout__detail">
          {selectedPosting ? (
            <JobDetail
              p={selectedPosting}
              isManager={isManager}
              onEdit={() => openEdit(selectedPosting)}
              onClose={(id) => closeMutation.mutate(id)}
              onApply={(id) => navigate(`/job-postings/${id}/apply`)}
            />
          ) : (
            <div className="jobs-detail__empty">
              <Layers size={40} className="jobs-detail__empty-icon" />
              <p className="jobs-detail__empty-text">Select a posting to view details</p>
              <p className="jobs-detail__empty-sub">
                {open.length > 0 ? `${open.length} open position${open.length !== 1 ? 's' : ''}` : 'No open postings'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit dialog ──────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null); }}>
        <DialogContent style={{ maxWidth: 580 }}>
          <DialogHeader>
            <DialogTitle>Edit Listing — {editTarget?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => editMutation.mutate(d))} className="form">
            <div className="form-grid">
              <div className="field">
                <Label>Title</Label>
                <Input {...register('title')} />
                {errors.title && <p className="field__error">{errors.title.message}</p>}
              </div>
              <div className="field">
                <Label>Department <span className="field__optional">(optional)</span></Label>
                <Input {...register('department')} />
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <Label>Salary Min <span className="field__optional">(optional)</span></Label>
                <Input type="number" placeholder="e.g. 90000" {...register('salaryMin')} />
              </div>
              <div className="field">
                <Label>Salary Max <span className="field__optional">(optional)</span></Label>
                <Input type="number" placeholder="e.g. 120000" {...register('salaryMax')} />
              </div>
            </div>

            <div className="field">
              <Label>Description</Label>
              <textarea className="textarea" rows={8} {...register('description')} />
              {errors.description && <p className="field__error">{errors.description.message}</p>}
            </div>

            <div className="field">
              <Label>Requirements <span className="field__optional">(optional)</span></Label>
              <textarea className="textarea" rows={3} {...register('requirements')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
