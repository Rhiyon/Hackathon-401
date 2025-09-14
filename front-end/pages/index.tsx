import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { FaSearch,FaSignOutAlt } from "react-icons/fa";
import router from "next/router";
import FilterTabs from "../components/FilterTabs";
import ApplicationCard from "../components/ApplicationCard";
import { mockApplications } from "../data/mockApplications";
import { JobApplication, FilterStatus } from "../types";

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
  const [applications, setApplications] = useState<JobApplication[]>([]); // State to hold applications data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const[searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLUListElement>(null);
  // const underlineRef = useRef(null);
  // const navbarRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/authPage");
    }
  }, []);

  // Animate the underline whenever the activeTab changes
  useEffect(() => {
    if (underlineRef.current && navbarRef.current) {
      const activeElement = navbarRef.current.querySelector(
        `.${styles.active}`
      );
      if (activeElement) {
        // Get the position and width relative to the parent ul
        const activeRect = activeElement.getBoundingClientRect();
        const parentRect = navbarRef.current.getBoundingClientRect();

        // Calculate the translateX value to move the underline
        const transformValue = activeRect.left - parentRect.left;

        // Apply the styles to the underline
        underlineRef.current.style.transform = `translateX(${transformValue}px)`;
        underlineRef.current.style.width = `${activeRect.width}px`;
      }
    }
  }, [activeTab]); // This effect runs every time activeTab changes

  // Use mock data for now
  useEffect(() => {
    setApplications(mockApplications);
    setLoading(false);
  }, []);

  // Filter applications based on active filter
  const filteredApplications = applications.filter(app => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'applied') return app.status === 'applied';
    if (activeFilter === 'interviews') return app.status === 'interview';
    if (activeFilter === 'offers') return app.status === 'offer';
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

  // You can now render a loading state, error message, or your data
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
            <h1>Applications</h1>
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
      )}
    </div>
  );
}
