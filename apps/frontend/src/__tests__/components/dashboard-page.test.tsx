/**
 * DashboardPage Component Tests
 * Tests for user info display, logout functionality, and error handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/pages/dashboard';

// Mock dependencies
jest.mock('@/services/api-client');
jest.mock('@/services/auth-service');
jest.mock('@/services/users-service');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Import mocks after they're declared
import { authService } from '@/services/auth-service';
import { usersService } from '@/services/users-service';
import { useNavigate } from 'react-router-dom';

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockUsersService = usersService as jest.Mocked<typeof usersService>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

describe('DashboardPage Component', () => {
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockAuthService.logout.mockResolvedValue(undefined);
    mockUsersService.getCurrentUser.mockResolvedValue({
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    });
  });

  it('should fetch and display current user info', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
      expect(mockUsersService.getCurrentUser).toHaveBeenCalled();
    });
  });

  it('should display user roles as list items', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [
        { id: 'role-1', name: 'admin' },
        { id: 'role-2', name: 'moderator' },
      ],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('moderator')).toBeInTheDocument();
    });
  });

  it('should call authService.logout on logout click', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.logout.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<DashboardPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
    });

    // Act
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    // Assert
    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  it('should redirect to /login after logout', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.logout.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<DashboardPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
    });

    // Act
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should display loading while fetching user', () => {
    // Arrange
    mockUsersService.getCurrentUser.mockImplementation(
      () => new Promise(() => {
        /* never resolves */
      })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error message if user fetch fails', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch user data';
    mockUsersService.getCurrentUser.mockRejectedValue(new Error(errorMessage));

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display user ID on dashboard', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('user-123')).toBeInTheDocument();
    });
  });

  it('should display welcome message in header', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/welcome/i);
    });
  });

  it('should handle logout errors gracefully', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    const logoutError = 'Logout failed';
    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.logout.mockRejectedValue(new Error(logoutError));

    const user = userEvent.setup();
    render(<DashboardPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
    });

    // Act
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    // Assert - error should be displayed
    await waitFor(() => {
      expect(screen.getByText(logoutError)).toBeInTheDocument();
    });
  });

  it('should display user email on successful fetch', async () => {
    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
      expect(mockUsersService.getCurrentUser).toHaveBeenCalled();
    });
  });

  it('should display user roles as list items', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [
        { id: 'role-1', name: 'admin' },
        { id: 'role-2', name: 'moderator' },
      ],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('moderator')).toBeInTheDocument();
    });
  });

  it('should call authService.logout on logout click', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.logout.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<DashboardPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
    });

    // Act
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    // Assert
    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  it('should redirect to /login after logout', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.logout.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<DashboardPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
    });

    // Act
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should display loading while fetching user', () => {
    // Arrange
    mockUsersService.getCurrentUser.mockImplementation(
      () => new Promise(() => {
        /* never resolves */
      })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error message if user fetch fails', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch user data';
    mockUsersService.getCurrentUser.mockRejectedValue(new Error(errorMessage));

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display user ID on dashboard', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('user-123')).toBeInTheDocument();
    });
  });

  it('should display welcome message in header', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/welcome/i);
    });
  });

  it('should handle logout errors gracefully', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'admin' }],
      permissions: [],
    };

    const logoutError = 'Logout failed';
    mockUsersService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.logout.mockRejectedValue(new Error(logoutError));

    const user = userEvent.setup();
    render(<DashboardPage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getAllByText(/admin@example.com/).length).toBeGreaterThan(0);
    });

    // Act
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    // Assert - error should be displayed
    await waitFor(() => {
      expect(screen.getByText(logoutError)).toBeInTheDocument();
    });
  });
});
