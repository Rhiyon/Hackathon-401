"use client";
import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/Sidebars.module.css";
import { FaHome, FaFileAlt, FaCog, FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";

export default function Sidebar() {
  // Use a state variable to manage the active path
  const [activePath, setActivePath] = useState("/");

  const navItems = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Applications", path: "/applications", icon: <FaFileAlt /> },
    { name: "Messaging", path: "/messages", icon: <FaEnvelope /> },
  ];

  const bottomNavItems = [
    { name: "Notifications", path: "/notifications", icon: <FaBell /> },
    { name: "Profile", path: "/profile", icon: <FaUserCircle /> },
    { name: "Settings", path: "/settings", icon: <FaCog /> },
  ];

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.logo}>Jopper</h2>
      <nav className={styles.mainNav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => setActivePath(item.path)} // Update the active path on click
            className={`${styles.navItem} ${
              activePath === item.path ? styles.active : ""
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
      <div className={styles.userNav}>
        {bottomNavItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => setActivePath(item.path)} // Update the active path on click
            className={`${styles.navItem} ${
              activePath === item.path ? styles.active : ""
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </div>
    </div>
  );
}