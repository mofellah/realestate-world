Feature: Authentication and authorization
  As a user of the boilerplate
  I want to authenticate and access protected resources
  So that only authorized users perform actions

  Scenario: Successful login
    Given a user exists with valid credentials
    When the user submits correct email and password
    Then the user receives an access token and refresh token

  Scenario: Access protected endpoint with valid token
    Given the user has a valid access token
    When the user requests a protected endpoint
    Then the response is successful
    And the response includes the expected data

  Scenario: Access protected endpoint with insufficient role
    Given the user has a valid access token with limited permissions
    When the user requests an admin-only endpoint
    Then the response is forbidden
  Scenario: Successful user registration
    Given no user exists with the email "newuser@example.com"
    When the user submits email "newuser@example.com" and password "ValidPass123!" and password confirmation
    Then the user is created with "user" role
    And the response includes access token and refresh token
    And the response includes the newly created user

  Scenario: Registration with duplicate email
    Given a user exists with email "existing@example.com"
    When the user submits email "existing@example.com" and valid password
    Then the response is conflict (409)
    And the response includes error message "Email already in use"

  Scenario: Registration with weak password
    Given no user exists with the email "newuser@example.com"
    When the user submits email "newuser@example.com" and password "weak"
    Then the response is bad request (400)
    And the response includes error message about password requirements

  Scenario: Registration with mismatched password confirmation
    Given no user exists with the email "newuser@example.com"
    When the user submits email "newuser@example.com" and password "ValidPass123!" with non-matching confirmation
    Then the response is bad request (400)
    And the response includes error message "Passwords do not match"