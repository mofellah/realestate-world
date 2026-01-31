import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { usePropertyStore } from "./stores/propertyStore";

// Theme Provider
import { ThemeProvider } from "./contexts/ThemeContext";

// Components
import ProtectedRoute from "./components/protected-route";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Layouts
import MainLayout from "./components/layouts/MainLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Public Pages
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

// Dashboard Pages
import DashboardPage from "./pages/dashboard";
import MyPropertiesPage from "./pages/dashboard/MyPropertiesPage";
import CreatePropertyPage from "./pages/dashboard/CreatePropertyPage";
import EditPropertyPage from "./pages/dashboard/EditPropertyPage";
import MyListingsPage from "./pages/dashboard/MyListingsPage";
import CreateListingPage from "./pages/dashboard/CreateListingPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import ProfilePage from "./pages/dashboard/ProfilePage";

// Agency Pages
import AgencyDashboardPage from "./pages/agency/AgencyDashboardPage";
import AgencyTeamPage from "./pages/agency/AgencyTeamPage";
import AgencyListingsPage from "./pages/agency/AgencyListingsPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

import "./styles/layout.scss";

// Root redirect component
function RootRedirect() {
  // Check localStorage directly to avoid race condition with auth context initialization
  const hasToken = !!localStorage.getItem("accessToken");
  return <Navigate to={hasToken ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  const { fetchListings, fetchProperties } = usePropertyStore();

  useEffect(() => {
    // Load initial data
    fetchListings();
    fetchProperties();
  }, [fetchListings, fetchProperties]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Routes>
          {/* Root redirect based on auth status */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes with Main Layout */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
          </Route>

          {/* Auth Routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="properties" element={<MyPropertiesPage />} />
            <Route path="properties/create" element={<CreatePropertyPage />} />
            <Route path="properties/:id/edit" element={<EditPropertyPage />} />
            <Route path="listings" element={<MyListingsPage />} />
            <Route path="listings/create" element={<CreateListingPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Protected Agency Routes */}
          <Route
            path="/agency"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgencyDashboardPage />} />
            <Route path="team" element={<AgencyTeamPage />} />
            <Route path="listings" element={<AgencyListingsPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
