/**
 * ProtectedRoute Component Tests
 * Tests for authentication-based route protection and redirects
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/protected-route';
import { useAuth } from '@/hooks/use-auth';

// Mock the useAuth hook
jest.mock('@/hooks/use-auth');

// Mock react-router-dom Navigate
jest.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate-mock" data-to={to}>
      Navigate to {to}
    </div>
  ),
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        permissions: [],
      },
      loading: false,
      isAuthenticated: true,
    });

    // Act
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Dashboard Content</div>
      </ProtectedRoute>
    );

    // Assert
    const content = screen.getByTestId('protected-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Dashboard Content');
  });

  it('should render Navigate to /login when user is not authenticated', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });

    // Act
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Dashboard Content</div>
      </ProtectedRoute>
    );

    // Assert
    const navigateMock = screen.getByTestId('navigate-mock');
    expect(navigateMock).toBeInTheDocument();
    expect(navigateMock).toHaveAttribute('data-to', '/login');
  });

  it('should show loading while checking authentication', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
    });

    // Act
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Dashboard Content</div>
      </ProtectedRoute>
    );

    // Assert
    const loadingContainer = screen.getByText('Loading...');
    expect(loadingContainer).toBeInTheDocument();
  });

  it('should not display protected content while loading', () => {
    // Arrange
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
    });

    // Act
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Dashboard Content</div>
      </ProtectedRoute>
    );

    // Assert
    const protectedContent = screen.queryByTestId('protected-content');
    expect(protectedContent).not.toBeInTheDocument();
  });
});
