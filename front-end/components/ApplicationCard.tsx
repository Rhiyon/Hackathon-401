import React, { useEffect, useState } from "react";
import { JobApplication, JobPosting } from "../types";
import styles from "../styles/ApplicationCard.module.css";

interface Props {
  application: JobApplication;
}

export default function ApplicationCard({ application }: Props) {
  const [job, setJob] = useState<JobPosting | null>(null);

  // Fetch job details for this application
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`http://localhost:8000/apply/${application.job_id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
      }
    };
    fetchJob();
  }, [application.job_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "#10b981"; // Green
      case "interview":
        return "#f59e0b"; // Orange
      case "offer":
        return "#3b82f6"; // Blue
      case "rejected":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "interview":
        return "Interview";
      case "offer":
        return "Offer";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.logoPlaceholder}></div>
        <div className={styles.jobInfo}>
          <h3 className={styles.jobTitle}>{job ? job.title : "Loading..."}</h3>
          <p className={styles.datePosted}>
            {new Date(application.applied_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className={styles.cardMiddle}>
        <div className={styles.tags}>
          <span className={styles.tag}>{job?.company || "—"}</span>
          <span className={styles.tag}>{job?.location || "—"}</span>
          <span className={styles.tag}>
            {job ? `$${job.salary_min} - $${job.salary_max}` : "—"}
          </span>
        </div>
      </div>

      <div className={styles.cardRight}>
        <div className={styles.statusContainer}>
          <div
            className={styles.statusIndicator}
            style={{ backgroundColor: getStatusColor(application.status) }}
          ></div>
          <span className={styles.statusLabel}>
            {getStatusLabel(application.status)}
          </span>
        </div>
      </div>
    </div>
  );
}
