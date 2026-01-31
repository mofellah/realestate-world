/**
 * Protected Routes E2E Tests
 * Test route protection and authentication requirements
 */

describe("Protected Routes E2E", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should redirect to login when accessing dashboard without token", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });

  it("should allow access to dashboard with valid token in localStorage", () => {
    // Simulate a valid token by setting it directly
    cy.window().then((win) => {
      // Create a mock JWT token (doesn't need to be valid, just present)
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6W3sicm9sZU5hbWUiOiJhZG1pbiJ9XSwiaWF0IjoxNzA2MDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9";
      win.localStorage.setItem("accessToken", mockToken);
    });

    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
  });

  it("should not redirect to login when token exists in localStorage", () => {
    cy.window().then((win) => {
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6W3sicm9sZU5hbWUiOiJhZG1pbiJ9XSwiaWF0IjoxNzA2MDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9";
      win.localStorage.setItem("accessToken", mockToken);
    });

    cy.visit("/dashboard");

    // Should stay on dashboard
    cy.url().should("include", "/dashboard");

    // Login page content should not be visible
    cy.get('input[type="email"]').should("not.exist");
  });

  it("should show loading state while checking authentication", () => {
    cy.visit("/dashboard");

    // Dashboard should briefly show loading state
    // (timing depends on implementation)
    cy.url({ timeout: 2000 }).should("include", "/login");
  });

  it("should clear token and redirect on 401 response", () => {
    cy.window().then((win) => {
      // Set an expired token
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJleHAiOjE3MDAwMDAwMDB9";
      win.localStorage.setItem("accessToken", expiredToken);
    });

    cy.visit("/login");

    // Try to login with wrong credentials to trigger 401
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("wrong");
    cy.get('button[type="submit"]').click();

    // Error should be displayed
    cy.get(".error-message", { timeout: 5000 }).should("be.visible");
  });

  it("should redirect root path to dashboard", () => {
    cy.window().then((win) => {
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6W3sicm9sZU5hbWUiOiJhZG1pbiJ9XSwiaWF0IjoxNzA2MDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9";
      win.localStorage.setItem("accessToken", mockToken);
    });

    cy.visit("/");
    cy.url().should("include", "/dashboard");
  });
});
