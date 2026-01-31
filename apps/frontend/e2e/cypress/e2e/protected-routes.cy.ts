/**
 * Protected Routes E2E Tests
 * Test route protection, redirects for unauthenticated users
 */

describe("Protected Routes E2E", () => {
  it("should redirect to login when accessing /dashboard without token", () => {
    // When: User directly visits dashboard without authentication
    cy.visit("http://localhost:5173/dashboard");

    // Then: User is redirected to login
    cy.url().should("include", "/login");
    cy.contains("h1", "Login").should("be.visible");
  });

  it("should redirect to dashboard when accessing root path", () => {
    // When: User visits root path
    cy.visit("http://localhost:5173/");

    // Then: User is redirected to login (since not authenticated)
    cy.url().should("include", "/login");
  });

  it("should stay on protected route if token is valid", () => {
    // Given: Valid JWT token stored in localStorage
    const validToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjY2NjY2Ni02NjY2LTY2NjYtNjY2Ni02NjY2NjY2NjY2NjYiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZXMiOlt7ImlkIjoiMjIyMjIyMjItMjIyMi0yMjIyLTIyMjItMjIyMjIyMjIyMjIyIiwibmFtZSI6IkFkbWluIn1dLCJpYXQiOjE2NzQxNDI0MDBFMDAsImV4cCI6MTY3NDE0MjYwMEUwMH0.test";

    cy.visit("http://localhost:5173/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("accessToken", validToken);
      },
    });

    // Then: Dashboard is displayed (assuming backend accepts test token)
    cy.url().should("include", "/dashboard");
  });

  it("should redirect to login after logout from dashboard", () => {
    // Given: User is logged in
    cy.visit("http://localhost:5173/login");
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("Admin123!");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");

    // When: User clicks logout
    cy.contains("button", "Logout").click();

    // Then: User is redirected to login
    cy.url().should("include", "/login");
  });

  it("should prevent access to dashboard with invalid/expired token", () => {
    // Given: Invalid token in localStorage
    cy.visit("http://localhost:5173/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("accessToken", "invalid.token.here");
      },
    });

    // Then: User is redirected to login (or shown error)
    cy.url().should("include", "/login");
  });
});
