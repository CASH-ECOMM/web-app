import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reset link");
      }

      const data = await response.json();
      setMessage(data.message || "Password reset link sent to your email!");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-heading">Forgot Password</h1>
        <p className="login-link">
          Remembered your password? <Link to="/login">Login</Link>
        </p>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}

        <form onSubmit={handleSubmit} className="signup-form" style={{ gridTemplateColumns: "1fr" }}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
