import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/AuthPage.module.css";
import { useRouter } from "next/router";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    company: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        // ✅ Register new user
        const res = await axios.post("http://localhost:8000/users", {
          ...formData,
          age: parseInt(formData.age, 10),
        });
        setMessage(`✅ Registered successfully as ${res.data.name}. Please log in.`);
        setIsRegister(false); // 👈 switch back to login mode
        setFormData({ name: "", age: "", email: "", company: "", password: "" });
      } else {
        // ✅ Login user
        const res = await axios.post("http://localhost:8000/login", {
          email: formData.email,
          password: formData.password,
        });

        // Save user info in localStorage
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Redirect to index page
        router.push("/");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setMessage(
        err.response?.data?.detail ||
          "❌ Something went wrong. Please try again."
      );
    }
  };

  return (
    <>
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
        <p className={styles.subText}>
          {isRegister
            ? "Join us and start applying today!"
            : "Log in to continue."}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isRegister && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="company"
                placeholder="Company"
                value={formData.company}
                onChange={handleChange}
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className={styles.submitBtn}>
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className={styles.switchText}>
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login here" : "Register here"}
          </span>
        </p>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
    </>
  );
}
