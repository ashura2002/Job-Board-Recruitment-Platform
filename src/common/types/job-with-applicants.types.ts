import { JobStatus } from 'src/generated/prisma/enums';

export type JobWithApplicants = {
  id: number;
  userId: number;
  jobId: number;
  status: JobStatus;
  resumePath: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    email: string;
    fullname: string;
  };
};
