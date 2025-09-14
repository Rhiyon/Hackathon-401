import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { FaRegQuestionCircle, FaCog,FaSignOutAlt } from "react-icons/fa";
import router from "next/router";
import FilterTabs from "../components/FilterTabs";
import ApplicationCard from "../components/ApplicationCard";
import { mockApplications } from "../data/mockApplications";
import { JobApplication, FilterStatus } from "../types";

export default function Home() {
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<JobApplication[]>([]); // State to hold applications data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
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
