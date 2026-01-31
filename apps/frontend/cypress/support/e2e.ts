/**
 * Cypress E2E Support File
 * Configure commands, hooks, and global setup for E2E tests
 */

// Import testing library commands
import "@testing-library/cypress/add-commands";

// Custom command for login (reusable across tests)
Cypress.Commands.add(
  "login",
  (email: string = "admin@example.com", password: string = "Admin123!") => {
    cy.visit("http://localhost:5173/login");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
  },
);

// Custom command for logout
Cypress.Commands.add("logout", () => {
  cy.get("button").contains("Logout").click();
});

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

// Declare custom commands for TypeScript
declare global {
  interface Cypress {
    login(email?: string, password?: string): void;
    logout(): void;
  }
}

export {};
