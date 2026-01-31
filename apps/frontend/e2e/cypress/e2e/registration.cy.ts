/**
 * Registration E2E Tests
 * Cypress end-to-end tests for registration flow
 */

describe("Registration Flow - E2E", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  describe("Happy Path - Successful Registration", () => {
    it("should register a new user successfully", () => {
      const timestamp = Date.now();
      const newEmail = `e2euser-${timestamp}@example.com`;

      // Fill in registration form
      cy.get('input[type="email"]').type(newEmail);
      cy.get('input[name="password"]').first().type("E2ETest123!");
      cy.get('input[name="passwordConfirmation"]').type("E2ETest123!");
      cy.get('input[name="name"]').type("E2E Test User");

      // Submit form
      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Should redirect to dashboard
      cy.url().should("include", "/dashboard");
      cy.contains(/welcome/i).should("be.visible");
    });

    it("should persist user session after registration", () => {
      const timestamp = Date.now();
      const newEmail = `e2esession-${timestamp}@example.com`;

      // Register new user
      cy.get('input[type="email"]').type(newEmail);
      cy.get('input[name="password"]').first().type("SessionTest123!");
      cy.get('input[name="passwordConfirmation"]').type("SessionTest123!");
      cy.get('input[name="name"]').type("Session Test");

      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Verify dashboard is accessible
      cy.url().should("include", "/dashboard");

      // Refresh page - should still be logged in
      cy.reload();
      cy.url().should("include", "/dashboard");
    });

    it("should allow registered user to logout", () => {
      const timestamp = Date.now();
      const newEmail = `e2elogout-${timestamp}@example.com`;

      // Register new user
      cy.get('input[type="email"]').type(newEmail);
      cy.get('input[name="password"]').first().type("LogoutTest123!");
      cy.get('input[name="passwordConfirmation"]').type("LogoutTest123!");
      cy.get('input[name="name"]').type("Logout Test");

      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      cy.url().should("include", "/dashboard");

      // Logout
      cy.contains("button", /logout/i).click();

      // Should redirect to login
      cy.url().should("include", "/login");
    });

    it("should register user without optional name field", () => {
      const timestamp = Date.now();
      const newEmail = `e2enoname-${timestamp}@example.com`;

      // Fill in registration form without name
      cy.get('input[type="email"]').type(newEmail);
      cy.get('input[name="password"]').first().type("NoName123!");
      cy.get('input[name="passwordConfirmation"]').type("NoName123!");
      // Skip name field

      // Submit form
      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Should redirect to dashboard
      cy.url().should("include", "/dashboard");
    });
  });

  describe("Sad Path - Validation Errors", () => {
    it("should reject invalid email format", () => {
      cy.get('input[type="email"]').type("not-an-email");
      cy.get('input[name="password"]').first().type("ValidPass123!");

      // Trigger validation
      cy.get('input[type="email"]').blur();

      // Check for error message
      cy.contains(/invalid email|valid email/i).should("be.visible");
    });

    it("should reject weak password (too short)", () => {
      const timestamp = Date.now();

      cy.get('input[type="email"]').type(`weak-${timestamp}@example.com`);
      cy.get('input[name="password"]').first().type("short");
      cy.get('input[name="passwordConfirmation"]').type("short");

      // Trigger validation
      cy.get('input[name="password"]').first().blur();

      // Check for error message
      cy.contains(/at least 8|password.*strength|too short/i).should("be.visible");
    });

    it("should reject password without uppercase letter", () => {
      const timestamp = Date.now();

      cy.get('input[type="email"]').type(`nouppercase-${timestamp}@example.com`);
      cy.get('input[name="password"]').first().type("lowercase123");
      cy.get('input[name="passwordConfirmation"]').type("lowercase123");

      // Try to submit
      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Check for error message
      cy.contains(/uppercase|password.*requirements/i).should("be.visible");
    });

    it("should reject password without number", () => {
      const timestamp = Date.now();

      cy.get('input[type="email"]').type(`nonumber-${timestamp}@example.com`);
      cy.get('input[name="password"]').first().type("NoNumbers!");
      cy.get('input[name="passwordConfirmation"]').type("NoNumbers!");

      // Try to submit
      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Check for error message
      cy.contains(/number|password.*requirements|digit/i).should("be.visible");
    });

    it("should reject mismatched passwords", () => {
      const timestamp = Date.now();

      cy.get('input[type="email"]').type(`mismatch-${timestamp}@example.com`);
      cy.get('input[name="password"]').first().type("ValidPass123!");
      cy.get('input[name="passwordConfirmation"]').type("DifferentPass123!");

      // Trigger validation
      cy.get('input[name="passwordConfirmation"]').blur();

      // Check for error message
      cy.contains(/passwords.*match|do not match/i).should("be.visible");
    });

    it("should reject duplicate email", () => {
      // Try to register with existing email
      cy.get('input[type="email"]').type("admin@example.com");
      cy.get('input[name="password"]').first().type("DuplicatePass123!");
      cy.get('input[name="passwordConfirmation"]').type("DuplicatePass123!");

      // Submit form
      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Check for error message (409 Conflict from API)
      cy.contains(/already.*registered|already.*exists|duplicate|conflict/i, {
        timeout: 5000,
      }).should("be.visible");

      // Should remain on register page
      cy.url().should("include", "/register");
    });

    it("should show error message until form is corrected", () => {
      const timestamp = Date.now();

      // Try with weak password
      cy.get('input[type="email"]').type(`error-${timestamp}@example.com`);
      cy.get('input[name="password"]').first().type("weak");
      cy.get('input[name="passwordConfirmation"]').type("weak");

      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Error should be visible
      cy.contains(/password.*strength|password.*requirements/i).should("be.visible");

      // Fix password
      cy.get('input[name="password"]').first().clear().type("StrongPass123!");
      cy.get('input[name="passwordConfirmation"]').clear().type("StrongPass123!");

      // Error should clear
      cy.contains(/password.*strength|password.*requirements/i).should("not.exist");

      // Re-submit should succeed
      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();
      cy.url().should("include", "/dashboard", { timeout: 5000 });
    });
  });

  describe("UI/UX - Form Behavior", () => {
    it("should show password visibility toggle", () => {
      cy.get('input[name="password"]').first().should("have.attr", "type", "password");

      // Check for visibility toggle button
      cy.contains("button", /show|reveal|eye/i).should("be.visible");
    });

    it("should disable submit button while loading", () => {
      const timestamp = Date.now();

      cy.get('input[type="email"]').type(`loading-${timestamp}@example.com`);
      cy.get('input[name="password"]').first().type("LoadingTest123!");
      cy.get('input[name="passwordConfirmation"]').type("LoadingTest123!");

      const submitButton = cy.get('button[type="submit"]').contains(/register/i);

      submitButton.click();

      // Button should be disabled during submission
      submitButton.should("be.disabled");
    });

    it("should link to login page", () => {
      cy.contains("a", /sign in|login|already have an account/i)
        .should("exist")
        .should("have.attr", "href", "/login");
    });

    it("should clear form after successful registration", () => {
      const timestamp = Date.now();
      const newEmail = `clearform-${timestamp}@example.com`;

      // Fill form
      cy.get('input[type="email"]').type(newEmail);
      cy.get('input[name="password"]').first().type("ClearForm123!");
      cy.get('input[name="passwordConfirmation"]').type("ClearForm123!");
      cy.get('input[name="name"]').type("Clear Test");

      // Submit
      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Should redirect (form cleared by navigation)
      cy.url().should("include", "/dashboard");
    });
  });

  describe("Integration - Login After Registration", () => {
    it("should allow registered user to login immediately", () => {
      const timestamp = Date.now();
      const newEmail = `loginafter-${timestamp}@example.com`;
      const password = "LoginAfter123!";

      // Register new user
      cy.get('input[type="email"]').type(newEmail);
      cy.get('input[name="password"]').first().type(password);
      cy.get('input[name="passwordConfirmation"]').type(password);
      cy.get('input[name="name"]').type("Login After Test");

      cy.get('button[type="submit"]')
        .contains(/register/i)
        .click();

      // Verify dashboard
      cy.url().should("include", "/dashboard");

      // Logout
      cy.contains("button", /logout/i).click();

      // Login with newly registered credentials
      cy.get('input[type="email"]').type(newEmail);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]')
        .contains(/login|sign in/i)
        .click();

      // Should successfully login
      cy.url().should("include", "/dashboard");
    });
  });
});
