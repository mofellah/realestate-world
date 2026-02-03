import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { usePropertyStore } from "./stores/propertyStore";

// Theme Provider
import { ThemeProvider } from "./contexts/ThemeContext";

// Components (eagerly loaded - small)
import ProtectedRoute from "./components/protected-route";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingPage } from "./components/LoadingPage";

// Layouts (eagerly loaded - required for all routes)
import MainLayout from "./components/layouts/MainLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Lazy load all page components for code splitting
// Public Pages
const HomePage = lazy(() => import("./pages/HomePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailPage"));
const LoginPage = lazy(() => import("./pages/login"));
const RegisterPage = lazy(() => import("./pages/register"));
const ForgotPasswordPage = lazy(() => import("./pages/forgot-password"));
const BoundarySearchDemo = lazy(() => import("./pages/BoundarySearchDemo"));

// Dashboard Pages
const DashboardPage = lazy(() => import("./pages/dashboard"));
const MyPropertiesPage = lazy(() => import("./pages/dashboard/MyPropertiesPage"));
const CreatePropertyPage = lazy(() => import("./pages/dashboard/CreatePropertyPage"));
const EditPropertyPage = lazy(() => import("./pages/dashboard/EditPropertyPage"));
const MyListingsPage = lazy(() => import("./pages/dashboard/MyListingsPage"));
const CreateListingPage = lazy(() => import("./pages/dashboard/CreateListingPage"));
const MessagesPage = lazy(() => import("./pages/dashboard/MessagesPage"));
const ProfilePage = lazy(() => import("./pages/dashboard/ProfilePage"));

// Agency Pages
const AgencyDashboardPage = lazy(() => import("./pages/agency/AgencyDashboardPage"));
const AgencyTeamPage = lazy(() => import("./pages/agency/AgencyTeamPage"));
const AgencyListingsPage = lazy(() => import("./pages/agency/AgencyListingsPage"));

// Admin Pages
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));

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
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            {/* Root redirect based on auth status */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Routes with Main Layout */}
            <Route element={<MainLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
              <Route path="/boundary-search-demo" element={<BoundarySearchDemo />} />
            </Route>

            {/* Auth Routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
              <Route path="properties/:id/create-listing" element={<CreateListingPage />} />
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
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
