export type ReviewStatus = 'submitted' | 'reviewed';

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string | null;
    department?: { name: string } | null;
  };
  reviewPeriod: string;
  selfRating: number;
  selfComments: string;
  managerRating: number | null;
  managerComments: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}
