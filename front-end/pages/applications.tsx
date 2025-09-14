import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import router from "next/router";
import FilterTabs from "../components/FilterTabs";
import ApplicationCard from "../components/ApplicationCard";
import { JobApplication, FilterStatus } from "../types";

// API interface for backend response
interface ApiJobApplication {
  application_id: string;
  job_id: string;
  user_uid: string;
  resume_id: string;
  status: string;
  datetime: string;
  job_title?: string;
  company?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  date_posted?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/authPage");
    }
  }, []);

  // Convert API data to frontend format
  const convertApiToJobApplication = (apiApp: ApiJobApplication): JobApplication => {
    const salaryRange = apiApp.salary_min && apiApp.salary_max 
      ? `$${apiApp.salary_min}-${apiApp.salary_max}/hour`
      : 'Salary not specified';
    
    const datePosted = apiApp.date_posted 
      ? new Date(apiApp.date_posted).toLocaleDateString()
      : 'Date not available';

    return {
      id: apiApp.application_id,
      jobTitle: apiApp.job_title || 'Unknown Title',
      company: apiApp.company || 'Unknown Company',
      location: apiApp.location || 'Location not specified',
      payPerHour: salaryRange,
      datePosted: datePosted,
      status: apiApp.status as 'applied' | 'interview' | 'offer' | 'rejected'
    };
  };

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const user = localStorage.getItem("user");
        if (!user) {
          router.push("/authPage");
          return;
        }
        
        const userData = JSON.parse(user);
        const response = await fetch(`${API_BASE_URL}/applications/user/${userData.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const apiApplications: ApiJobApplication[] = await response.json();
        const convertedApplications = apiApplications.map(convertApiToJobApplication);
        setApplications(convertedApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter applications based on active filter
  const filteredApplications = applications.filter(app => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'applied') return app.status === 'applied';
    if (activeFilter === 'interviews') return app.status === 'interview';
    if (activeFilter === 'offers') return app.status === 'offer';
    return true;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ color: '#333', padding: '2rem' }}>Loading applications...</div>
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
      <div className={styles.applicationsContent}>
        <div className={styles.applicationsHeader}>
          <h1>My Applications</h1>
          <FilterTabs 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
        </div>
        <div className={styles.applicationsList}>
          {filteredApplications.map((application) => (
            <ApplicationCard 
              key={application.id} 
              application={application} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
