"use client";
import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/Sidebars.module.css";
import { FaHome, FaFileAlt, FaCog, FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";

export default function Sidebar() {
  // Use a state variable to manage the active path
  const [activePath, setActivePath] = useState("/");
  const [showNotifications, setShowNotifications] = useState(false);


  const navItems = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Applications", path: "/applications", icon: <FaFileAlt /> },
    { name: "Messaging", path: "/messages", icon: <FaEnvelope /> },
  ];

  const bottomNavItems = [
    { name: "Notifications", path: "/notifications", icon: <FaBell />, isNotification: true },
    { name: "Profile", path: "/profile", icon: <FaUserCircle /> },
  ];

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.logo}>Jopper</h2>
      <nav className={styles.mainNav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => {
              setActivePath(item.path);
              setShowNotifications(false);

            }} // Update the active path on click
            className={`${styles.navItem} ${
              activePath === item.path ? styles.active : ""
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </nav>


      <div className={styles.userNav}>
        {bottomNavItems.map((item) =>
          item.isNotification ? (
            // Notification button toggles popup
            <div
              key={item.path}
              className={`${styles.navItem} ${
                activePath === item.path ? styles.active : ""
              }`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {item.icon}
            </div>
          ) : (
            // Normal navigation buttons
            <Link
              key={item.path}
              href={item.path}
              onClick={() => {
                setActivePath(item.path);
                setShowNotifications(false); // close popup if open
              }}
              className={`${styles.navItem} ${
                activePath === item.path ? styles.active : ""
              }`}
            >
              {item.icon}
            </Link>
          )
        )}
      </div>

      {showNotifications && (
        <div className={styles.notificationPopup}>
          <h4>Notifications</h4>
          <ul>
            <li>You have a new message from Maria.</li>
            <li>You have a new message from Maria.</li>
            <li>You have a new message from Maria.</li>
            <li>You have a new message from Maria.</li>
          </ul>
        </div>
      )}

    </div>
  );
}