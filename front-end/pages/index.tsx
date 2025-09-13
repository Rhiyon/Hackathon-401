import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { FaRegQuestionCircle, FaCog } from "react-icons/fa";

export default function Home() {
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]); // State to hold applications data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to handle errors
  const underlineRef = useRef(null);
  const navbarRef = useRef(null);

  // Animate the underline whenever the activeTab changes
  useEffect(() => {
    if (underlineRef.current && navbarRef.current) {
      const activeElement = navbarRef.current.querySelector(`.${styles.active}`);
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
  }, [activeTab]);

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("http://localhost:8000/applications"); // Use your backend URL
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApplications(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // You can now render a loading state, error message, or your data
  if (loading) {
    return <div>Loading applications...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <ul ref={navbarRef}>
          <li
            onClick={() => setActiveTab("contracts")}
            className={activeTab === "contracts" ? styles.active : ""}
          >
            <a href="#">Contracts</a>
          </li>
          <li
            onClick={() => setActiveTab("offers")}
            className={activeTab === "offers" ? styles.active : ""}
          >
            <a href="#">Offers</a>
          </li>
          <li
            onClick={() => setActiveTab("applications")}
            className={activeTab === "applications" ? styles.active : ""}
          >
            <a href="#">Applications</a>
          </li>
          <li
            onClick={() => setActiveTab("interviews")}
            className={activeTab === "interviews" ? styles.active : ""}
          >
            <a href="#">Interviews</a>
          </li>
          <div ref={underlineRef} className={styles.underline}></div>
        </ul>
        <div className={styles.navRight}>
          <a href="#">
            <FaRegQuestionCircle />
            Support
          </a>
          <a href="#">
            <FaCog />
            Settings
          </a>
        </div>
      </nav>
      {/* Example of how you can use the fetched data */}
      <div>
        <h2>Applications:</h2>
        <ul>
          {applications.map((app) => (
            <li key={app.application_id}>{app.company} - {app.job_title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}