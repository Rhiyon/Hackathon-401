// components/Sidebar.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Sidebars.module.css";

export default function Sidebar() {
  const router = useRouter();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Applications", path: "/applications" },
    { name: "Profile", path: "/profile"},
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.logo}>Jopper</h2>
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${
              router.pathname === item.path ? styles.active : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
