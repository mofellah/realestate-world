/**
 * Authentication E2E Tests
 * Full auth flow: login, logout, error handling, redirects
 */

describe('Auth Flow E2E', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should redirect to login when not authenticated', () => {
    cy.visit('http://localhost:5173');
    cy.url().should('include', '/login');
  });

  it('should login successfully with admin credentials', () => {
    cy.visit('http://localhost:5173/login');

    // Fill form
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Admin123!');
    cy.get('button[type="submit"]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');

    // Verify dashboard content is visible
    cy.contains('Welcome').should('be.visible');
  });

  it('should display user email on dashboard after login', () => {
    cy.visit('http://localhost:5173/login');

    // Login
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Admin123!');
    cy.get('button[type="submit"]').click();

    // Verify email is displayed
    cy.url().should('include', '/dashboard');
    cy.contains('admin@example.com').should('be.visible');
  });

  it('should logout and redirect to login', () => {
    cy.visit('http://localhost:5173/login');

    // Login first
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Admin123!');
    cy.get('button[type="submit"]').click();

    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');

    // Logout
    cy.get('button').contains('Logout').click();

    // Verify redirect to login
    cy.url().should('include', '/login');
  });

  it('should display error on invalid login', () => {
    cy.visit('http://localhost:5173/login');

    // Try to login with wrong credentials
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrong');
    cy.get('button[type="submit"]').click();

    // Verify error message (401, Failed, Unauthorized, or custom message)
    cy.get('.error-message', { timeout: 5000 }).should('be.visible');
  });

  it('should preserve login state across page refreshes', () => {
    cy.visit('http://localhost:5173/login');

    // Login
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Admin123!');
    cy.get('button[type="submit"]').click();

    // Verify on dashboard
    cy.url().should('include', '/dashboard');

    // Refresh page
    cy.reload();

    // Should still be on dashboard (token is in localStorage)
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('should disable submit button during login', () => {
    cy.visit('http://localhost:5173/login');

    // Fill form
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('Admin123!');

    // Click submit
    cy.get('button[type="submit"]').click();

    // Button should be disabled with "Logging in..." text
    cy.get('button[type="submit"]')
      .should('be.disabled')
      .and('contain', 'Logging in...');
  });

  it('should allow switching between login and register', () => {
    cy.visit('http://localhost:5173/login');

    // Click register link
    cy.get('a').contains('Register here').click();

    // Should navigate to register page
    cy.url().should('include', '/register');
  });
});
