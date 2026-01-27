Feature: User Registration
  As a new user
  I want to register an account
  So that I can access the application with my own credentials

  Background:
    Given the database has the default roles (admin, user, moderator)
    And the database has the default permissions

  Scenario: Successful registration with valid credentials
    Given I am on the registration page
    When I enter a valid email "newuser@example.com"
    And I enter a password "SecurePass123!"
    And I confirm the password "SecurePass123!"
    And I submit the registration form
    Then I should see a success message
    And I should be redirected to the login page
    And a new user should be created in the database
    And the user should have the "user" role assigned
    And the password should be hashed with bcrypt

  Scenario: Registration fails with duplicate email
    Given a user exists with email "existing@example.com"
    And I am on the registration page
    When I enter the email "existing@example.com"
    And I enter a password "SecurePass123!"
    And I confirm the password "SecurePass123!"
    And I submit the registration form
    Then I should see an error "Email already registered"
    And no new user should be created

  Scenario: Registration fails with weak password
    Given I am on the registration page
    When I enter a valid email "newuser@example.com"
    And I enter a weak password "123"
    And I confirm the password "123"
    And I submit the registration form
    Then I should see an error "Password must be at least 8 characters"
    And no new user should be created

  Scenario: Registration fails with mismatched passwords
    Given I am on the registration page
    When I enter a valid email "newuser@example.com"
    And I enter a password "SecurePass123!"
    And I confirm the password "DifferentPass456!"
    And I submit the registration form
    Then I should see an error "Passwords do not match"
    And the form should not be submitted to the backend

  Scenario: Registration fails with invalid email format
    Given I am on the registration page
    When I enter an invalid email "not-an-email"
    And I enter a password "SecurePass123!"
    And I confirm the password "SecurePass123!"
    And I submit the registration form
    Then I should see an error "Invalid email format"
    And no new user should be created

  Scenario: Newly registered user can log in
    Given I successfully registered with email "newuser@example.com" and password "SecurePass123!"
    When I navigate to the login page
    And I enter email "newuser@example.com"
    And I enter password "SecurePass123!"
    And I submit the login form
    Then I should be authenticated
    And I should see the dashboard
    And I should see my email "newuser@example.com" displayed
    And I should have the "user" role
