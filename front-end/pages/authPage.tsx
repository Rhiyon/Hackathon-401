import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/AuthPage.module.css";
import { useRouter } from "next/router";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [userType, setUserType] = useState<"employee" | "employer">("employee"); // switch state
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
      const res = await axios.post("http://localhost:8000/users", {
        ...formData,
        age: parseInt(formData.age, 10),
        employerFlag: userType === "employer",
      });
      setMessage(
        `Registered successfully as ${res.data.name}. Please log in.`
      );
      setIsRegister(false);
      setFormData({
        name: "",
        age: "",
        email: "",
        company: "",
        password: "",
      });
    } else {
      // ✅ Here is the key change: validateStatus
      const res = await axios.post(
        "http://localhost:8000/login",
        {
          email: formData.email,
          password: formData.password,
          user_type: userType,
        },
        {
          validateStatus: () => true, // ← all responses, including 401/403, are returned as normal
        }
      );

      // Now handle status manually
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        router.push(userType === "employer" ? "/employer/dashboard" : "/");
      } else if (res.status === 401) {
        setMessage("User not found or incorrect password.");
      } else if (res.status === 403) {
        setMessage(`Try Again!`);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  } catch (err) {
    // this will only catch network errors or other unexpected exceptions
    console.error("Unexpected error:", err);
    setMessage("Unexpected error. Please try again.");
  }
};


  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
        <p className={styles.subText}>
          {isRegister
            ? "Join us and start applying today!"
            : "Log in to continue."}
        </p>

        {/* 👇 User Type Switch */}
        <div className={styles.userTypeSwitch}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={userType === "employer"}
              onChange={() =>
                setUserType(userType === "employee" ? "employer" : "employee")
              }
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.switchLabel}>{userType}</span>
        </div>

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
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
                required
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
  );
}
