export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  payPerHour: string;
  datePosted: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  logo?: string;
}

export interface JobPosting {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  payPerHour: string;
  datePosted: string;
  description: string;
  employerId: string;
}

export type FilterStatus = 'all' | 'applied' | 'interviews' | 'offers';

export interface FilterTabsProps {
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

export interface ApplicationCardProps {
  application: JobApplication;
}
