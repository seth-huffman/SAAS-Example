import api from './axios';
import type { JobPosting, PostingStatus } from '../types/job-posting.types';
import type { WorkExperience, Education } from '../types/job-application.types';

export interface JobApplicationRecord {
  id: string;
  jobPostingId: string;
  firstName: string | null;
  lastName: string | null;
  applicantEmail: string;
  phone: string | null;
  address: string | null;
  workExperience: WorkExperience[] | null;
  education: Education[] | null;
  resumeFileName: string | null;
  coverLetter: string | null;
  createdAt: string;
}

export interface ApplyPayload {
  firstName: string;
  lastName: string;
  applicantEmail: string;
  phone?: string;
  address?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
  resumeFileName?: string;
  resumeData?: string;
  coverLetter?: string;
}

export const jobPostingsApi = {
  list: async (): Promise<JobPosting[]> => {
    const res = await api.get('/job-postings');
    return res.data.data ?? res.data ?? [];
  },
  getById: async (id: string): Promise<JobPosting> => {
    const res = await api.get(`/job-postings/${id}`);
    return res.data.data ?? res.data;
  },
  create: async (data: { title: string; description: string; requirements?: string; department?: string; salaryMin?: number; salaryMax?: number }): Promise<JobPosting> => {
    const res = await api.post('/job-postings', data);
    return res.data.data ?? res.data;
  },
  update: async (id: string, data: { status?: PostingStatus; title?: string; department?: string; description?: string; requirements?: string; salaryMin?: number; salaryMax?: number }): Promise<JobPosting> => {
    const res = await api.patch(`/job-postings/${id}`, data);
    return res.data.data ?? res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/job-postings/${id}`);
  },
  apply: async (id: string, data: ApplyPayload): Promise<void> => {
    await api.post(`/job-postings/${id}/apply`, data);
  },
  getApplications: async (id: string) => {
    const res = await api.get(`/job-postings/${id}/applications`);
    return (res.data.data ?? res.data ?? []) as JobApplicationRecord[];
  },
};
