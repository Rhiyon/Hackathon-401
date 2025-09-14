import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { JobPosting } from "../../types";
import styles from "../../styles/ApplyPage.module.css";

export default function ApplyPage() {
  const router = useRouter();
  const { jobId } = router.query;
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      try {
        const res = await fetch(`http://localhost:8000/apply/${jobId}`);
        if (!res.ok) throw new Error("Failed to fetch job");
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    if (!job) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user._id) {
      router.push("/authPage");
      return;
    }

    setSubmitting(true);
    try {
      // 🔹 Use the new endpoint /apply/{job_id}
      const res = await fetch(`http://localhost:8000/apply/${job.job_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user._id,
          resume_id: "default_resume_id", // replace with actual resume later
        }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      alert("Application submitted successfully!");
      router.push("/"); // back to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading job...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Apply for {job?.title}</h1>

      <div className={styles.meta}>
        <p className={styles.metaItem}>
          <span className={styles.label}>Company:</span> {job?.company}
        </p>
        <p className={styles.metaItem}>
          <span className={styles.label}>Location:</span> {job?.location}
        </p>
        <p className={styles.metaItem}>
          <span className={styles.label}>Salary:</span> {job?.salary_min} - {job?.salary_max}
        </p>
      </div>

      <div className={styles.description}>
        <strong className={styles.label}>Description:</strong>
        <div>{job?.description}</div>
      </div>

      <button
        className={styles.applyBtn}
        onClick={handleApply}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Confirm Application"}
      </button>
    </div>
  );
}
