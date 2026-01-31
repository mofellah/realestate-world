/**
 * Auth Flow E2E Tests
 * Full authentication workflow: login, dashboard access, logout
 */

describe("Auth Flow E2E", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("should redirect unauthenticated user to login page", () => {
    cy.url().should("include", "/login");
    cy.contains("h1", "Login").should("be.visible");
  });

  it("should successfully login with admin credentials", () => {
    // Given: User on login page
    cy.url().should("include", "/login");

    // When: User fills login form with valid credentials
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("Admin123!");
    cy.get('button[type="submit"]').click();

    // Then: User is redirected to dashboard
    cy.url().should("include", "/dashboard");
    cy.contains("Welcome").should("be.visible");
  });

  it("should display user email on dashboard after login", () => {
    // Given: User logs in with admin credentials
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("Admin123!");
    cy.get('button[type="submit"]').click();

    // Then: Dashboard displays user email
    cy.url().should("include", "/dashboard");
    cy.contains("admin@example.com").should("be.visible");
  });

  it("should display user roles on dashboard", () => {
    // Given: User logs in
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("Admin123!");
    cy.get('button[type="submit"]').click();

    // Then: Dashboard displays roles
    cy.url().should("include", "/dashboard");
    cy.contains("Roles:").should("be.visible");
    cy.contains("Admin").should("be.visible");
  });

  it("should display error message on invalid login", () => {
    // Given: User on login page
    cy.get('input[type="email"]').type("invalid@example.com");
    cy.get('input[type="password"]').type("WrongPassword123!");

    // When: User submits form
    cy.get('button[type="submit"]').click();

    // Then: Error message is displayed
    cy.get(".error-message").should("be.visible");
  });

  it("should logout and redirect to login page", () => {
    // Given: User is logged in on dashboard
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("Admin123!");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");

    // When: User clicks logout button
    cy.contains("button", "Logout").click();

    // Then: User is redirected to login page
    cy.url().should("include", "/login");
  });

  it("should clear tokens on logout", () => {
    // Given: User is logged in
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("Admin123!");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");

    // When: User logs out
    cy.contains("button", "Logout").click();

    // Then: Tokens are cleared from localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem("accessToken")).to.be.null;
      expect(win.localStorage.getItem("refreshToken")).to.be.null;
    });
  });

  it("should display login button link from login page to register", () => {
    // Given: User on login page
    cy.url().should("include", "/login");

    // Then: Register link is visible
    cy.contains("a", /register here/i).should("be.visible");
    cy.contains("a", /register here/i).should("have.attr", "href", "/register");
  });
});
