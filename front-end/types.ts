export interface JobApplication {
  application_id: string;
  job_id: string;
  employer_id: string;
  employee_id: string;
  resume_id?: string;
  status: string;
  applied_at: string; // ISO date string
}

export interface JobPosting {
  job_id: string;
  employer_id: string;
  title: string;
  description: string;
  requirements: string;
  salary_min: number;
  salary_max: number;
  company: string;
  location: string;
  created_at: string; // ISO string
}

export type FilterStatus = 'all' | 'applied' | 'interviews' | 'offers';

export interface FilterTabsProps {
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

export interface ApplicationCardProps {
  application: JobApplication;
}
