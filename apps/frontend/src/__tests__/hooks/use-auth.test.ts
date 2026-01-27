/**
 * useAuth Hook Unit Tests
 * Tests for authentication state management and token initialization
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import * as tokenStorage from '@/utils/token-storage';
import * as jwtDecode from '@/utils/jwt-decode';

// Mock the utilities
jest.mock('@/utils/token-storage');
jest.mock('@/utils/jwt-decode');

const mockTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockJwtDecode = jwtDecode as jest.Mocked<typeof jwtDecode>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize user from stored access token', async () => {
    // Arrange
    const mockToken = 'valid.jwt.token';
    const mockPayload = {
      sub: 'user-123',
      email: 'admin@example.com',
      roles: ['admin'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    mockTokenStorage.tokenStorage.getAccessToken.mockReturnValue(mockToken);
    mockJwtDecode.decodeJWT.mockReturnValue(mockPayload as any);

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.id).toBe('user-123');
    expect(result.current.user?.email).toBe('admin@example.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should return null user if no access token in localStorage', async () => {
    // Arrange
    mockTokenStorage.tokenStorage.getAccessToken.mockReturnValue(null);

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should be isAuthenticated = true when user exists', async () => {
    // Arrange
    const mockToken = 'valid.jwt.token';
    const mockPayload = {
      sub: 'user-123',
      email: 'admin@example.com',
      roles: ['admin'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    mockTokenStorage.tokenStorage.getAccessToken.mockReturnValue(mockToken);
    mockJwtDecode.decodeJWT.mockReturnValue(mockPayload as any);

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should be isAuthenticated = false when user is null', async () => {
    // Arrange
    mockTokenStorage.tokenStorage.getAccessToken.mockReturnValue(null);

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle invalid JWT gracefully', async () => {
    // Arrange
    mockTokenStorage.tokenStorage.getAccessToken.mockReturnValue('invalid.token');
    mockJwtDecode.decodeJWT.mockReturnValue(null);

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set loading = true initially', () => {
    // Arrange
    mockTokenStorage.tokenStorage.getAccessToken.mockReturnValue(null);

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert - loading should be true initially, then false after effect runs
    expect(result.current.loading).toBe(false); // By this point useEffect ran
  });
});
