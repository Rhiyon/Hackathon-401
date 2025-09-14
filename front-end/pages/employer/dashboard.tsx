import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../../styles/EmployerDashboard.module.css";

interface JobPosting {
  job_id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  salary_min: number;
  salary_max: number;
  employer_id: string;
  created_at: string;
}

export default function EmployerDashboard() {
  const router = useRouter();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    salary_min: 0,
    salary_max: 0,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/authPage");
    }
  }, []);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  // ---------------------
  // Fetch jobs posted by this employer
  // ---------------------
  const fetchJobs = async () => {
    try {
      if (!user || !user._id) return;
      const res = await axios.get(
        `http://localhost:8000/job_postings/employer/${user._id}`
      );
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ---------------------
  // Handle form input change
  // ---------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  // ---------------------
  // Submit new job
  // ---------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user._id) {
      setMessage("❌ Could not find user info. Please log in again.");
      return;
    }

    try {
      const payload = {
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        company: user.company || "",
        employer_id: user._id,
        salary_min: parseFloat(newJob.salary_min as any),
        salary_max: parseFloat(newJob.salary_max as any),
      };

      await axios.post("http://localhost:8000/job_postings", payload);

      setMessage("✅ Job posted successfully!");
      setTimeout(() => setMessage(""), 2000);

      setNewJob({
        title: "",
        description: "",
        location: "",
        salary_min: 0,
        salary_max: 0,
      });

      fetchJobs();
    } catch (err: any) {
      console.error("Job post error:", err.response?.data || err);
      if (err.response?.data?.detail) {
        setMessage(`❌ ${err.response.data.detail}`);
      } else {
        setMessage("❌ Failed to post job. Check console for details.");
      }
    }
  };

  // ---------------------
  // Delete job
  // ---------------------
  const handleDelete = async (job_id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;

    try {
      await axios.delete(`http://localhost:8000/job_postings/${job_id}`);
      setMessage("✅ Job deleted successfully!");
      setTimeout(() => setMessage(""), 2000);
      fetchJobs(); // refresh list
    } catch (err: any) {
      console.error("Job delete error:", err.response?.data || err);
      setMessage("❌ Failed to delete job. Check console for details.");
    }
  };

  // ---------------------
  // Logout
  // ---------------------
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/authPage"); // redirect to login page
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Employer Dashboard</h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <section className={styles.addJob}>
        <h2 className={styles.subheading}>Add New Job</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={newJob.title}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
          <textarea
            name="description"
            placeholder="Job Description"
            value={newJob.description}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={newJob.location}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
          <input
            type="number"
            name="salary_min"
            placeholder="Minimum Salary"
            value={newJob.salary_min}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
          <input
            type="number"
            name="salary_max"
            placeholder="Maximum Salary"
            value={newJob.salary_max}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
          <button type="submit" className={styles.submitBtn}>
            Post Job
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </section>

      <section className={styles.myJobs}>
        <h2>My Job Postings</h2>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          <ul className={styles.jobList}>
            {jobs.map((job) => (
              <li key={job.job_id} className={styles.jobItem}>
                <div>
                  <strong className={styles.jobTitle}>{job.title}</strong> -{" "}
                  {job.description} <br />
                  Location: {job.location} <br />
                  Company: {job.company} <br />
                  Salary: ${job.salary_min} - ${job.salary_max} <br />
                  Posted on: {new Date(job.created_at).toLocaleString()}
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(job.job_id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
