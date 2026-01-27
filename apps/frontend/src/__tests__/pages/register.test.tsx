/**
 * RegisterPage Component Tests
 * React Testing Library tests for registration form
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../../pages/register';
import { authService } from '../../services/auth-service';

// Mock the auth service
jest.mock('../../services/auth-service');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('should render register form with all fields', () => {
      renderComponent();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderComponent();

      const loginLink = screen.getByRole('link', { name: /login here/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should have empty initial input values', () => {
      renderComponent();

      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/^password/i)).toHaveValue('');
      expect(screen.getByLabelText(/confirm password/i)).toHaveValue('');
    });
  });

  describe('form validation', () => {
    it('should reject weak password on submit', async () => {
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmInput, { target: { value: 'weak' } });
      
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should reject password mismatch on submit', async () => {
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPass123!' } });
      
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should allow valid form submission', async () => {
      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900,
        user: {
          id: 'user-id',
          email: 'newuser@example.com',
          name: 'New User',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      (authService.register as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderComponent();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'ValidPass123!' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'ValidPass123!' },
      });
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'New User' },
      });

      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'ValidPass123!',
          passwordConfirmation: 'ValidPass123!',
          name: 'New User',
        });
      });
    });
  });

  describe('form submission', () => {
    it('should call authService.register with form data', async () => {
      const mockResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
        user: { id: 'id', email: 'test@example.com', name: null, isActive: true, createdAt: '', updatedAt: '' },
      };

      (authService.register as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderComponent();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'TestPass123!' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'TestPass123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            password: 'TestPass123!',
          })
        );
      });
    });

    it('should show loading state while submitting', async () => {
      (authService.register as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderComponent();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'TestPass123!' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'TestPass123!' },
      });

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('should redirect to dashboard on successful registration', async () => {
      const mockResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
        user: { id: 'id', email: 'test@example.com', name: null, isActive: true, createdAt: '', updatedAt: '' },
      };

      (authService.register as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderComponent();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'TestPass123!' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'TestPass123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('error handling', () => {
    it('should display conflict error for duplicate email', async () => {
      const errorMessage = 'Email already registered';
      (authService.register as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      renderComponent();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'ValidPass123!' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'ValidPass123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
      });
    });

    it('should display validation error from API', async () => {
      const errorMessage = 'Password does not meet complexity requirements';
      (authService.register as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      renderComponent();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'WeakPass' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'WeakPass' },
      });

      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
      });
    });

    it('should clear error on retry', async () => {
      (authService.register as jest.Mock).mockRejectedValueOnce(
        new Error('Registration failed')
      );

      renderComponent();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'ValidPass123!' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'ValidPass123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });

      // Now mock success for retry
      (authService.register as jest.Mock).mockResolvedValueOnce({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
        user: { id: 'id', email: 'test@example.com', name: null, isActive: true, createdAt: '', updatedAt: '' },
      });

      // Retry submission - error should clear on submit
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper label associations', () => {
      renderComponent();

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/^password/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');
    });

    it('should have submit button with accessible name', () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: /register/i });
      expect(submitButton).toBeInTheDocument();
    });
  });
});
