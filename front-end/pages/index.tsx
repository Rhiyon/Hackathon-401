import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [activeTab, setActiveTab] = useState("applications");
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
  }, [activeTab]); // This effect runs every time activeTab changes

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
          <a href="#">Support</a>
          <a href="#">Settings</a>
        </div>
      </nav>
    </div>
  );
}