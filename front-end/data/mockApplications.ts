import { JobApplication } from '../types';

export const mockApplications: JobApplication[] = [
  {
    id: '1',
    jobTitle: 'Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    payPerHour: '$45/hour',
    datePosted: '2 days ago',
    status: 'applied'
  },
  {
    id: '2',
    jobTitle: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    payPerHour: '$40/hour',
    datePosted: '1 week ago',
    status: 'interview'
  },
  {
    id: '3',
    jobTitle: 'Full Stack Developer',
    company: 'BigTech Inc',
    location: 'Seattle, WA',
    payPerHour: '$50/hour',
    datePosted: '3 days ago',
    status: 'rejected'
  },
  {
    id: '4',
    jobTitle: 'React Developer',
    company: 'WebAgency',
    location: 'Austin, TX',
    payPerHour: '$35/hour',
    datePosted: '5 days ago',
    status: 'interview'
  },
  {
    id: '5',
    jobTitle: 'Node.js Developer',
    company: 'CloudTech',
    location: 'Remote',
    payPerHour: '$42/hour',
    datePosted: '1 day ago',
    status: 'interview'
  },
  {
    id: '6',
    jobTitle: 'Senior Developer',
    company: 'Enterprise Corp',
    location: 'Chicago, IL',
    payPerHour: '$60/hour',
    datePosted: '4 days ago',
    status: 'offer'
  }
];
