/**
 * LoginPage Component Tests
 * Tests for login form submission, validation, error handling, and navigation
 */

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/pages/login";
import { render } from "../test-utils";

// Mock dependencies
jest.mock("@/services/api-client");
jest.mock("@/services/auth-service");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Import mocks after they're declared
import { authService } from "@/services/auth-service";
import { useNavigate } from "react-router-dom";

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

describe("LoginPage Component", () => {
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockAuthService.login.mockReset();
    mockAuthService.logout.mockReset();
    mockAuthService.refreshToken.mockReset();
    // Provide a default successful login response; individual tests override as needed
    mockAuthService.login.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
    } as any);
  });

  it("should render email and password input fields", () => {
    // Act
    render(<LoginPage />);

    // Assert
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("should submit form with email/password and call authService.login", async () => {
    // Arrange
    mockAuthService.login.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
    } as any);

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Act
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "Admin123!");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith("admin@example.com", "Admin123!");
    });
  });

  it("should redirect to /dashboard on successful login", async () => {
    // Arrange
    mockAuthService.login.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
    } as any);

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Act
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "Admin123!");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should display error message on login failure", async () => {
    // Arrange
    const errorMessage = "Invalid credentials";
    mockAuthService.login.mockRejectedValue(new Error(errorMessage));

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Act
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "wrong");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
    });
  });

  it("should disable submit button while loading", async () => {
    // Arrange
    let resolveLogin: any;
    mockAuthService.login.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i }) as HTMLButtonElement;

    // Act
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "Admin123!");
    await user.click(submitButton);

    // Assert - button should be disabled and show "Logging in..."
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Logging in...");

    // Resolve the promise and check button is re-enabled
    resolveLogin({ accessToken: "token", refreshToken: "refresh" });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("should clear error message on new submission attempt", async () => {
    // Arrange
    mockAuthService.login
      .mockRejectedValueOnce(new Error("First error"))
      .mockResolvedValueOnce({ accessToken: "token", refreshToken: "refresh" } as any);

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // First attempt - should show error
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "wrong");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Clear and try again
    await user.clear(passwordInput);
    await user.type(passwordInput, "Admin123!");
    await user.click(submitButton);

    // Assert - error should be cleared
    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });
  });

  it("should have a link to register page", () => {
    // Act
    render(<LoginPage />);

    // Assert
    const registerLink = screen.getByRole("link", { name: /register here/i });
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("should render email and password input fields", () => {
    // Act
    render(<LoginPage />);

    // Assert
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("should submit form with email/password and call authService.login", async () => {
    // Arrange
    mockAuthService.login.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
    } as any);

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Act
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "Admin123!");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith("admin@example.com", "Admin123!");
    });
  });

  it("should redirect to /dashboard on successful login", async () => {
    // Arrange
    mockAuthService.login.mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
    } as any);

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Act
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "Admin123!");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should display error message on login failure", async () => {
    // Arrange
    const errorMessage = "Invalid credentials";
    mockAuthService.login.mockRejectedValue(new Error(errorMessage));

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Act
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "wrong");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
    });
  });

  it("should disable submit button while loading", async () => {
    // Arrange
    let resolveLogin: any;
    mockAuthService.login.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i }) as HTMLButtonElement;

    // Act
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "Admin123!");
    await user.click(submitButton);

    // Assert - button should be disabled and show "Logging in..."
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Logging in...");

    // Resolve the promise and check button is re-enabled
    resolveLogin({ accessToken: "token", refreshToken: "refresh" });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("should clear error message on new submission attempt", async () => {
    // Arrange
    mockAuthService.login
      .mockRejectedValueOnce(new Error("First error"))
      .mockResolvedValueOnce({ accessToken: "token", refreshToken: "refresh" } as any);

    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    // First attempt - should show error
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "wrong");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Clear and try again
    await user.clear(passwordInput);
    await user.type(passwordInput, "Admin123!");
    await user.click(submitButton);

    // Assert - error should be cleared
    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });
  });

  it("should have a link to register page", () => {
    // Act
    render(<LoginPage />);

    // Assert
    const registerLink = screen.getByRole("link", { name: /register here/i });
    expect(registerLink).toHaveAttribute("href", "/register");
  });
});
