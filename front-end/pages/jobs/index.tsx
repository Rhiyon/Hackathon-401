// pages/jobs/index.tsx
import type { GetStaticProps } from 'next';
import Link from 'next/link';
import type { JobPosting } from '@/types'; // Assuming you have your types.ts file

interface JobsPageProps {
  jobs: JobPosting[];
}

export const getStaticProps: GetStaticProps<JobsPageProps> = async () => {
  const res = await fetch('http://localhost:8000/job_postings');
  const jobs = await res.json();
  return {
    props: {
      jobs,
    },
    revalidate: 60, // Re-generate the page every 60 seconds
  };
};

export default function JobsPage({ jobs }: JobsPageProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Job Postings</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <div key={job.job_id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{job.company_name} - {job.location}</p>
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{job.description}</p>
            <Link href={`/jobs/${job.job_id}`} className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}