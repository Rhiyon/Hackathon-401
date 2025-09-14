import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { FaRegQuestionCircle, FaCog,FaSignOutAlt } from "react-icons/fa";
import router from "next/router";
import { JobPosting } from "../types";

// API interface for backend response
interface ApiJobPosting {
  job_id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  salary_min: number;
  salary_max: number;
  datetime: string;
  employer_id: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]); // State to hold job postings data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState<string | null>(null); // State to handle errors
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/authPage");
    }
  }, []);

  // Convert API data to frontend format
  const convertApiToJobPosting = (apiJob: ApiJobPosting): JobPosting => {
    const salaryRange = apiJob.salary_min && apiJob.salary_max 
      ? `$${apiJob.salary_min}-${apiJob.salary_max}/hour`
      : 'Salary not specified';
    
    const datePosted = apiJob.datetime 
      ? new Date(apiJob.datetime).toLocaleDateString()
      : 'Date not available';

    return {
      id: apiJob.job_id,
      jobTitle: apiJob.title,
      company: apiJob.company,
      location: apiJob.location,
      payPerHour: salaryRange,
      datePosted: datePosted,
      description: apiJob.description,
      employerId: apiJob.employer_id
    };
  };

  // Fetch job postings from API
  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setLoading(true);
        const user = localStorage.getItem("user");
        if (!user) {
          router.push("/authPage");
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/job_postings`);
        if (!response.ok) {
          throw new Error('Failed to fetch job postings');
        }
        const apiJobPostings: ApiJobPosting[] = await response.json();
        const convertedJobPostings = apiJobPostings.map(convertApiToJobPosting);
        setJobPostings(convertedJobPostings);
      } catch (error) {
        console.error('Error fetching job postings:', error);
        setError('Failed to load job postings');
      } finally {
        setLoading(false);
      }
    };

    fetchJobPostings();
  }, []);

  // You can now render a loading state, error message, or your data
  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ color: '#333', padding: '2rem' }}>Loading job postings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ color: '#333', padding: '2rem' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navRight}>
          <a href="#">
            <FaRegQuestionCircle />
            Support
          </a>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              router.push("/authPage");
            }}
            className={styles.logoutBtn}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </nav>
      
      <div className={styles.jobsContent}>
        <div className={styles.jobsHeader}>
          <h1>Job Postings</h1>
        </div>
        <div className={styles.jobsList}>
          {jobPostings.map((job) => (
            <div key={job.id} className={styles.jobCard}>
              <h3 className={styles.jobTitle}>{job.jobTitle}</h3>
              <p className={styles.company}>{job.company}</p>
              <p className={styles.location}>{job.location}</p>
              <p className={styles.salary}>{job.payPerHour}</p>
              <p className={styles.datePosted}>Posted: {job.datePosted}</p>
              <p className={styles.description}>{job.description}</p>
              <button 
                className={styles.applyBtn}
                onClick={() => {
                  // Navigate to job details or application page
                  router.push(`/jobs/${job.id}`);
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
