/**
 * Header Component Tests
 * Tests navigation, authentication UI, and user interactions
 */

import { screen, fireEvent } from '@testing-library/react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { render } from '../test-utils';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockLogout = jest.fn();

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  const renderHeader = () => {
    return render(<Header />);
  };

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
        loading: false,
        login: jest.fn(),
        register: jest.fn(),
      });
    });

    it('should render logo and brand name', () => {
      renderHeader();
      
      expect(screen.getByText('RE')).toBeInTheDocument();
      expect(screen.getByText('RealEstate World')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      renderHeader();
      
      expect(screen.getByText('Search Properties')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('should render Sign In button when not authenticated', () => {
      renderHeader();
      
      const signInButton = screen.getByText('Sign In');
      expect(signInButton).toBeInTheDocument();
      expect(signInButton.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should render Get Started button when not authenticated', () => {
      renderHeader();
      
      const getStartedButton = screen.getByText('Get Started');
      expect(getStartedButton).toBeInTheDocument();
      expect(getStartedButton.closest('a')).toHaveAttribute('href', '/register');
    });

    it('should not render Dashboard link when not authenticated', () => {
      renderHeader();
      
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should not render Logout button when not authenticated', () => {
      renderHeader();
      
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('should have correct link to home page', () => {
      renderHeader();
      
      const homeLink = screen.getByText('RealEstate World').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should have correct link to search page', () => {
      renderHeader();
      
      const searchLink = screen.getByText('Search Properties').closest('a');
      expect(searchLink).toHaveAttribute('href', '/search');
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user' as const,
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      personId: 'person-1',
    };

    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        logout: mockLogout,
        loading: false,
        login: jest.fn(),
        register: jest.fn(),
      });
    });

    it('should render Dashboard link when authenticated', () => {
      renderHeader();
      
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
    });

    it('should render user avatar when authenticated', () => {
      renderHeader();
      
      const avatar = screen.getByAltText(mockUser.email);
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', mockUser.avatarUrl);
    });

    it('should render default avatar when avatarUrl is null', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { ...mockUser, avatarUrl: null },
        logout: mockLogout,
        loading: false,
        login: jest.fn(),
        register: jest.fn(),
      });

      renderHeader();
      
      const avatar = screen.getByAltText(mockUser.email);
      expect(avatar).toHaveAttribute('src', 'https://via.placeholder.com/40');
    });

    it('should render Logout button when authenticated', () => {
      renderHeader();
      
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should not render Sign In button when authenticated', () => {
      renderHeader();
      
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('should not render Get Started button when authenticated', () => {
      renderHeader();
      
      expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    });

    it('should call logout and navigate to home when Logout is clicked', () => {
      renderHeader();
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Styling and Layout', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
        loading: false,
        login: jest.fn(),
        register: jest.fn(),
      });
    });

    it('should apply correct CSS classes to header', () => {
      const { container } = renderHeader();
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b');
    });

    it('should apply logo styles', () => {
      renderHeader();
      
      const logo = screen.getByText('RE');
      expect(logo).toHaveClass('text-white', 'font-bold', 'text-xl');
      
      const logoContainer = logo.parentElement;
      expect(logoContainer).toHaveClass('w-10', 'h-10', 'bg-blue-600', 'rounded-lg');
    });

    it('should apply Get Started button styles', () => {
      renderHeader();
      
      const getStartedButton = screen.getByText('Get Started');
      expect(getStartedButton).toHaveClass('text-white', 'bg-blue-600', 'rounded-lg');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
        loading: false,
        login: jest.fn(),
        register: jest.fn(),
      });
    });

    it('should have navigation landmark', () => {
      const { container } = renderHeader();
      
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should have clickable logo link', () => {
      renderHeader();
      
      const logoLink = screen.getByText('RealEstate World').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should have alt text for user avatar', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'user' as const,
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        personId: 'person-1',
      };

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        logout: mockLogout,
        loading: false,
        login: jest.fn(),
        register: jest.fn(),
      });

      renderHeader();
      
      const avatar = screen.getByAltText(mockUser.email);
      expect(avatar).toHaveAttribute('alt', mockUser.email);
    });
  });
});
