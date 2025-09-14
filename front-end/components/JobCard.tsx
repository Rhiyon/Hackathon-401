import React from "react";
import { JobPosting } from "../types";
import styles from "../styles/JobCard.module.css";
import router from "next/router";

interface JobCardProps {
  job: JobPosting;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.logoPlaceholder}></div>
        <div className={styles.jobInfo}>
          <h3 className={styles.jobTitle}>{job.title}</h3>
          <p className={styles.company}>
            {job.company} — {job.location}
          </p>
          <p className={styles.datePosted}>
            Posted on {new Date(job.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className={styles.cardMiddle}>
        <p className={styles.description}>{job.description}</p>
        <div className={styles.tags}>
          <span className={styles.tag}>
            💰 {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} CAD
          </span>
        </div>
      </div>

      <div className={styles.cardRight}>
        <button
          className={styles.applyBtn}
          onClick={() => router.push(`/apply/${job.job_id}`)}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
