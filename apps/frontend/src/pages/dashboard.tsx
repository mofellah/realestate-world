import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import "../styles/dashboard.scss";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    }
  };

  if (loading)
    return (
      <div className="dashboard-container">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="dashboard-container">
        <p className="error-message">{error}</p>
      </div>
    );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      {user && (
        <div className="user-info">
          <h2>Welcome, {user.email}</h2>
          <div className="user-details">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            {user.roles && user.roles.length > 0 && (
              <div className="roles-section">
                <strong>Roles:</strong>
                <ul className="role-list">
                  {user.roles.map((role) => (
                    <li key={role.id}>{role.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
