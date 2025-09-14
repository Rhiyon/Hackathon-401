import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { FaRegQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import router from "next/router";
import FilterTabs from "../components/FilterTabs";
import ApplicationCard from "../components/ApplicationCard";
import JobCard from "../components/JobCard"; // ✅ new component for job postings
import { JobApplication, FilterStatus, JobPosting } from "../types";

interface User {
  _id: string;
  name: string;
  email: string;
  company?: string;
}

// Example mock users
const mockUsers: User[] = [
  { _id: "1", name: "Maria Smith", email: "maria@example.com", company: "Trouvay" },
  { _id: "2", name: "John Doe", email: "john@example.com" },
  { _id: "3", name: "Alice Johnson", email: "alice@example.com", company: "Acme Inc" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const[searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLUListElement>(null);

  // Redirect if user not logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/authPage");
    }
  }, []);

  // Animate underline for navbar
  useEffect(() => {
    if (underlineRef.current && navbarRef.current) {
      const activeElement = navbarRef.current.querySelector(
        `.${styles.active}`
      );
      if (activeElement) {
        const activeRect = activeElement.getBoundingClientRect();
        const parentRect = navbarRef.current.getBoundingClientRect();
        const transformValue = activeRect.left - parentRect.left;
        underlineRef.current.style.transform = `translateX(${transformValue}px)`;
        underlineRef.current.style.width = `${activeRect.width}px`;
      }
    }
  }, [activeTab]);

  // Fetch jobs + applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user || !user._id) {
          router.push("/authPage");
          return;
        }

        // Fetch jobs
        const jobsRes = await fetch("http://localhost:8000/jobs");
        if (!jobsRes.ok) throw new Error("Failed to fetch jobs");
        const jobsData = await jobsRes.json();
        setJobs(jobsData);

        // Fetch applications
        const appsRes = await fetch(
          `http://localhost:8000/applications/user/${user._id}`
        );
        if (!appsRes.ok) throw new Error("Failed to fetch applications");
        const appsData = await appsRes.json();
        setApplications(appsData);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (activeFilter === "all") return true; // ✅ "all" only matters for jobs
    if (activeFilter === "applied") return app.status === "applied";
    if (activeFilter === "interviews") return app.status === "interview";
    if (activeFilter === "offers") return app.status === "offer";
    return true;
  });

  // SEARCH
  // Clicking outside closes the search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/search-users?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setSearchLoading(false);
      }
    };

    // ✅ Debounce the search so we don't spam the server
    const timeout = setTimeout(fetchUsers, 300);

    // ✅ Cleanup timeout when searchQuery changes
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ color: "#333", padding: "2rem" }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ color: "#333", padding: "2rem" }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navRight}>
          {/* Search */}
          <div className={styles.searchContainer} ref={searchRef}>
            <button
              className={styles.searchIcon}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <FaSearch />
            </button>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${styles.searchInput} ${searchOpen ? styles.active : ""}`}
            />
          
          
          
              {/* 🔽 SEARCH RESULTS DROPDOWN */}
              {searchOpen && searchQuery && (
              <div className={styles.searchResults}>
                {searchLoading && <div className={styles.searchMessage}>Searching...</div>}

                {!searchLoading && searchResults.length === 0 && (
                  <div className={styles.searchMessage}>No users found</div>
                )}

                {!searchLoading &&
                  searchResults.map((user) => (
                    <div
                      key={user._id} // unique key
                      className={styles.searchResultItem}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                        router.push(`/profile/${user._id}`); // navigate to profile page
                      }}
                    >
                      <strong>{user.name}</strong>  {/* Show name */}
                      <span style={{ color: "#666" }}> — {user.email}</span>
                      {user.company && <span> ({user.company})</span>}
                    </div>
                  ))}
              </div>
            )}
          </div>

          
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

      {activeTab === "applications" && (
        <div className={styles.applicationsContent}>
          <div className={styles.applicationsHeader}>
            <h1>
              {activeFilter === "all" ? "All Jobs" : "Your Applications"}
            </h1>
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          <div className={styles.applicationsList}>
            {activeFilter === "all"
              ? jobs.map((job) => (
                  <JobCard key={job.job_id} job={job} /> // ✅ show jobs
                ))
              : filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.application_id}
                    application={application}
                  />
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
