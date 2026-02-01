import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth-form.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call password reset API endpoint
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      setSubmitted(true);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset email. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h1>Check Your Email</h1>
          <div className="success-message">
            <p>
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <p>
              Click the link in the email to reset your password. The link will expire in 24 hours.
            </p>
            <p>
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="link-button"
              >
                try again
              </button>
              .
            </p>
          </div>
          <Link to="/login" className="btn-secondary">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Reset Your Password</h1>
        <p className="form-subtitle">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              data-testid="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            data-testid="submit-button"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="form-footer">
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
