import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Paperclip, X, Briefcase, GraduationCap, User, FileText } from 'lucide-react';
import { jobPostingsApi } from '../../api/job-postings.api';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';

const BACKEND_URL = 'http://localhost:3000/api';
const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2 MB

/* ── Zod schema ─────────────────────────────────────────────── */

const workExpSchema = z.object({
  company:     z.string().min(1, 'Company required'),
  jobTitle:    z.string().min(1, 'Job title required'),
  startDate:   z.string().min(1, 'Start date required'),
  endDate:     z.string().optional(),
  isCurrent:   z.boolean().optional(),
  description: z.string().optional(),
});

const educationSchema = z.object({
  institution:  z.string().min(1, 'Institution required'),
  degree:       z.string().min(1, 'Degree required'),
  fieldOfStudy: z.string().optional(),
  startDate:    z.string().optional(),
  endDate:      z.string().optional(),
});

const schema = z.object({
  firstName:      z.string().min(1, 'First name required'),
  lastName:       z.string().min(1, 'Last name required'),
  applicantEmail: z.string().email('Valid email required'),
  phone:          z.string().optional(),
  address:        z.string().optional(),
  workExperience: z.array(workExpSchema),
  education:      z.array(educationSchema),
  resumeFileName: z.string().optional(),
  resumeData:     z.string().optional(),
  coverLetter:    z.string().min(20, 'Please write at least 20 characters'),
});

type FormData = z.infer<typeof schema>;

/* ── LinkedIn SVG icon ──────────────────────────────────────── */

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

/* ── Page component ─────────────────────────────────────────── */

export function JobApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: posting, isLoading } = useQuery({
    queryKey: ['job-postings', id],
    queryFn: () => jobPostingsApi.getById(id!),
    enabled: !!id,
  });

  const {
    register, control, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      applicantEmail: user?.email ?? '',
      workExperience: [],
      education: [],
    },
  });

  const { fields: workFields, append: appendWork, remove: removeWork } =
    useFieldArray({ control, name: 'workExperience' });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } =
    useFieldArray({ control, name: 'education' });

  const resumeFileName = watch('resumeFileName');
  const workEntries    = watch('workExperience');

  /* ── Resume upload ───────────────────────────────────────── */

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_RESUME_BYTES) {
      toast.error('Resume must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setValue('resumeFileName', file.name);
      setValue('resumeData', base64);
    };
    reader.readAsDataURL(file);
  }

  function clearResume() {
    setValue('resumeFileName', '');
    setValue('resumeData', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ── LinkedIn autofill ───────────────────────────────────── */

  function handleLinkedIn() {
    const popup = window.open(
      `${BACKEND_URL}/linkedin/auth`,
      'linkedin-oauth',
      'width=600,height=640,scrollbars=yes,resizable=yes',
    );

    function onMessage(event: MessageEvent) {
      if (event.data?.type === 'linkedin-profile') {
        const p = event.data.profile;
        if (p.given_name)  setValue('firstName',      p.given_name);
        if (p.family_name) setValue('lastName',       p.family_name);
        if (p.email)       setValue('applicantEmail', p.email);
        // Populate work experience if available (best-effort mapping)
        try {
          const positions = p.positions || p.elements || p.workExperience || p.positionsHistory || [];
          if (Array.isArray(positions) && positions.length > 0) {
            // clear existing entries then append
            // setValue for full array ensures react-hook-form updates properly
            const mapped = positions.map((pos: any) => ({
              company:  pos.company?.name || pos.organization?.name || pos.employer || pos.companyName || '',
              jobTitle: pos.title || pos.jobTitle || pos.position || '',
              startDate: pos.startDate ? (pos.startDate.year && pos.startDate.month ? `${pos.startDate.year}-${String(pos.startDate.month).padStart(2,'0')}` : pos.startDate) : (pos.start || ''),
              endDate: pos.endDate ? (pos.endDate.year && pos.endDate.month ? `${pos.endDate.year}-${String(pos.endDate.month).padStart(2,'0')}` : pos.endDate) : (pos.end || ''),
              isCurrent: !!pos.isCurrent || !!pos.current || false,
              description: pos.description || pos.summary || '',
            }));
            setValue('workExperience', mapped);
          }
        } catch (e) {
          // keep best-effort — ignore errors
        }

        // Populate education if available
        try {
          const schools = p.education || p.educations || p.schools || [];
          if (Array.isArray(schools) && schools.length > 0) {
            const mappedEdu = schools.map((s: any) => ({
              institution: s.schoolName || s.institution || s.institutionName || '',
              degree: s.degree || s.degreeName || s.qualification || '',
              fieldOfStudy: s.fieldOfStudy || s.major || '',
              startDate: s.startDate || '',
              endDate: s.endDate || '',
            }));
            setValue('education', mappedEdu);
          }
        } catch (e) {}

        toast.success('LinkedIn profile imported');
      } else if (event.data?.type === 'linkedin-error') {
        toast.error('LinkedIn sign-in failed');
      }
      window.removeEventListener('message', onMessage);
      popup?.close();
    }

    window.addEventListener('message', onMessage);
  }

  /* ── Submit ──────────────────────────────────────────────── */

  const applyMutation = useMutation({
    mutationFn: (data: FormData) => jobPostingsApi.apply(id!, {
      firstName:      data.firstName,
      lastName:       data.lastName,
      applicantEmail: data.applicantEmail,
      phone:          data.phone          || undefined,
      address:        data.address        || undefined,
      workExperience: data.workExperience.length ? data.workExperience : undefined,
      education:      data.education.length      ? data.education      : undefined,
      resumeFileName: data.resumeFileName || undefined,
      resumeData:     data.resumeData     || undefined,
      coverLetter:    data.coverLetter,
    }),
    onSuccess: () => {
      toast.success('Application submitted!');
      navigate('/job-postings');
    },
    onError: () => toast.error('Failed to submit application'),
  });

  if (isLoading) return <div className="page"><p style={{ color: 'var(--muted-foreground)' }}>Loading…</p></div>;
  if (!posting)  return <div className="page"><p style={{ color: 'var(--muted-foreground)' }}>Posting not found.</p></div>;

  return (
    <div className="page apply-page">
      {/* Back nav */}
      <button className="apply-page__back" onClick={() => navigate('/job-postings')}>
        <ArrowLeft size={15} /> Back to Job Postings
      </button>

      {/* Header */}
      <div className="apply-page__header">
        <div>
          <h1 className="apply-page__title">Apply — {posting.title}</h1>
          {posting.department && (
            <p className="apply-page__subtitle">{posting.department}</p>
          )}
        </div>
        {/* LinkedIn autofill */}
        <button type="button" className="btn-linkedin" onClick={handleLinkedIn}>
          <LinkedInIcon />
          Autofill with LinkedIn
        </button>
      </div>

      <form onSubmit={handleSubmit((d) => applyMutation.mutate(d))} className="apply-form">

        {/* ── Personal Information ─────────────────────────── */}
        <Card>
          <CardContent className="apply-section">
            <div className="apply-section__heading">
              <User size={16} />
              <h2>Personal Information</h2>
            </div>

            <div className="form-grid">
              <div className="field">
                <Label>First Name</Label>
                <Input placeholder="Jane" {...register('firstName')} />
                {errors.firstName && <p className="field__error">{errors.firstName.message}</p>}
              </div>
              <div className="field">
                <Label>Last Name</Label>
                <Input placeholder="Smith" {...register('lastName')} />
                {errors.lastName && <p className="field__error">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <Label>Email</Label>
                <Input type="email" placeholder="jane@example.com" {...register('applicantEmail')} />
                {errors.applicantEmail && <p className="field__error">{errors.applicantEmail.message}</p>}
              </div>
              <div className="field">
                <Label>Phone <span className="field__optional">(optional)</span></Label>
                <Input type="tel" placeholder="+1 555 000 0000" {...register('phone')} />
              </div>
            </div>

            <div className="field">
              <Label>Address <span className="field__optional">(optional)</span></Label>
              <Input placeholder="123 Main St, City, State, ZIP" {...register('address')} />
            </div>
          </CardContent>
        </Card>

        {/* ── Work Experience ──────────────────────────────── */}
        <Card>
          <CardContent className="apply-section">
            <div className="apply-section__heading apply-section__heading--between">
              <div className="apply-section__heading">
                <Briefcase size={16} />
                <h2>Work Experience</h2>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => appendWork({ company: '', jobTitle: '', startDate: '', isCurrent: false })}
              >
                <Plus size={14} /> Add Experience
              </Button>
            </div>

            {workFields.length === 0 && (
              <p className="apply-section__empty">No work experience added yet.</p>
            )}

            {workFields.map((field, index) => (
              <div key={field.id} className="apply-entry">
                <div className="apply-entry__header">
                  <span className="apply-entry__label">Experience {index + 1}</span>
                  <button
                    type="button"
                    className="apply-entry__remove"
                    onClick={() => removeWork(index)}
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <Label>Company</Label>
                    <Input placeholder="Acme Corp" {...register(`workExperience.${index}.company`)} />
                    {errors.workExperience?.[index]?.company && (
                      <p className="field__error">{errors.workExperience[index]?.company?.message}</p>
                    )}
                  </div>
                  <div className="field">
                    <Label>Job Title</Label>
                    <Input placeholder="Software Engineer" {...register(`workExperience.${index}.jobTitle`)} />
                    {errors.workExperience?.[index]?.jobTitle && (
                      <p className="field__error">{errors.workExperience[index]?.jobTitle?.message}</p>
                    )}
                  </div>
                </div>

                <div className="form-grid form-grid--3">
                  <div className="field">
                    <Label>Start Date</Label>
                    <Input type="month" {...register(`workExperience.${index}.startDate`)} />
                    {errors.workExperience?.[index]?.startDate && (
                      <p className="field__error">{errors.workExperience[index]?.startDate?.message}</p>
                    )}
                  </div>
                  <div className="field">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      disabled={workEntries[index]?.isCurrent}
                      {...register(`workExperience.${index}.endDate`)}
                    />
                  </div>
                  <div className="field apply-entry__current">
                    <label className="apply-entry__current-label">
                      <input
                        type="checkbox"
                        {...register(`workExperience.${index}.isCurrent`)}
                      />
                      Currently working here
                    </label>
                  </div>
                </div>

                <div className="field">
                  <Label>Description <span className="field__optional">(optional)</span></Label>
                  <textarea
                    className="textarea"
                    rows={2}
                    placeholder="Key responsibilities and achievements…"
                    {...register(`workExperience.${index}.description`)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Education ────────────────────────────────────── */}
        <Card>
          <CardContent className="apply-section">
            <div className="apply-section__heading apply-section__heading--between">
              <div className="apply-section__heading">
                <GraduationCap size={16} />
                <h2>Education</h2>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => appendEdu({ institution: '', degree: '' })}
              >
                <Plus size={14} /> Add Education
              </Button>
            </div>

            {eduFields.length === 0 && (
              <p className="apply-section__empty">No education added yet.</p>
            )}

            {eduFields.map((field, index) => (
              <div key={field.id} className="apply-entry">
                <div className="apply-entry__header">
                  <span className="apply-entry__label">Education {index + 1}</span>
                  <button
                    type="button"
                    className="apply-entry__remove"
                    onClick={() => removeEdu(index)}
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <Label>Institution</Label>
                    <Input placeholder="University of…" {...register(`education.${index}.institution`)} />
                    {errors.education?.[index]?.institution && (
                      <p className="field__error">{errors.education[index]?.institution?.message}</p>
                    )}
                  </div>
                  <div className="field">
                    <Label>Degree</Label>
                    <Input placeholder="Bachelor of Science" {...register(`education.${index}.degree`)} />
                    {errors.education?.[index]?.degree && (
                      <p className="field__error">{errors.education[index]?.degree?.message}</p>
                    )}
                  </div>
                </div>

                <div className="form-grid form-grid--3">
                  <div className="field">
                    <Label>Field of Study <span className="field__optional">(optional)</span></Label>
                    <Input placeholder="Computer Science" {...register(`education.${index}.fieldOfStudy`)} />
                  </div>
                  <div className="field">
                    <Label>Start Year</Label>
                    <Input type="month" {...register(`education.${index}.startDate`)} />
                  </div>
                  <div className="field">
                    <Label>End Year</Label>
                    <Input type="month" {...register(`education.${index}.endDate`)} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Resume ───────────────────────────────────────── */}
        <Card>
          <CardContent className="apply-section">
            <div className="apply-section__heading">
              <Paperclip size={16} />
              <h2>Resume</h2>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {resumeFileName ? (
              <div className="resume-file">
                <Paperclip size={14} />
                <span className="resume-file__name">{resumeFileName}</span>
                <button type="button" className="resume-file__remove" onClick={clearResume}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="resume-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={15} />
                Upload Resume
                <span className="resume-upload-btn__hint">PDF, DOC, DOCX — max 2 MB</span>
              </button>
            )}
          </CardContent>
        </Card>

        {/* ── Submit ───────────────────────────────────────── */}
        <div className="apply-form__footer">
          <Button type="button" variant="outline" onClick={() => navigate('/job-postings')}>
            Cancel
          </Button>
          <Button type="submit" disabled={applyMutation.isPending}>
            {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
          </Button>
        </div>

      </form>
    </div>
  );
}
