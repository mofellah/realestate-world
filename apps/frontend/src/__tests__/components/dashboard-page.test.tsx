/**
 * DashboardPage Component Tests
 * Tests for user info display and logout functionality
 */

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "@/pages/dashboard";
import { renderWithRouter } from "../test-utils";
import { useAuth } from "@/contexts/AuthContext";

// Mock dependencies
jest.mock("@/contexts/AuthContext", () => ({
  ...jest.requireActual("@/contexts/AuthContext"),
  useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Import mocks after they're declared
import { useNavigate } from "react-router-dom";

const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("DashboardPage Component", () => {
  let mockNavigate: jest.Mock;

  const mockUser = {
    id: "user-123",
    email: "admin@example.com",
    name: "Admin User",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [{ id: "role-1", name: "admin" }],
    permissions: [],
  };

  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);

    // Mock useAuth to return user data by default
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });
  });

  // Basic rendering and display tests
  it("should render dashboard with user info", async () => {
    renderWithRouter(<DashboardPage />);
    expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
  });

  it("should display user email", async () => {
    renderWithRouter(<DashboardPage />);
    expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
  });

  it("should display user ID", async () => {
    renderWithRouter(<DashboardPage />);
    expect(screen.getByText("user-123")).toBeInTheDocument();
  });

  it("should display user roles", async () => {
    renderWithRouter(<DashboardPage />);
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("should display multiple roles", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        ...mockUser,
        roles: [
          { id: "role-1", name: "admin" },
          { id: "role-2", name: "moderator" },
        ],
      },
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("moderator")).toBeInTheDocument();
  });

  it("should display welcome heading", async () => {
    renderWithRouter(<DashboardPage />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent(/welcome/i);
  });

  it("should display logout button", async () => {
    renderWithRouter(<DashboardPage />);
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  // Loading state tests
  it("should show loading state when loading is true", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should not show user info when user is null", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderWithRouter(<DashboardPage />);
    // Component should not show user info section
    expect(screen.queryByText(/admin@example.com/)).not.toBeInTheDocument();
  });

  // Logout functionality tests
  it("should call logout when logout button is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<DashboardPage />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it("should navigate to login after logout", async () => {
    const user = userEvent.setup();
    renderWithRouter(<DashboardPage />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    // After logout, component should navigate to login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  // Edge cases
  it("should handle empty roles array", async () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, roles: [] },
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getAllByText(/admin@example.com/)[0]).toBeInTheDocument();
  });

  it("should render with user having various email formats", async () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, email: "test.user+tag@example.co.uk" },
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getAllByText("test.user+tag@example.co.uk").length).toBeGreaterThan(0);
  });
});
