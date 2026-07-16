export type WorkType = 'onsite' | 'hybrid' | 'remote';
export type PostingStatus = 'open' | 'closed';

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  department: string | null;
  workType: WorkType | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: PostingStatus;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}
