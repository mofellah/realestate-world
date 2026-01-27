Feature: Health check
  As a platform operator
  I want to verify the service is healthy
  So that monitoring can detect outages

  Scenario: Health endpoint returns OK
    When the health endpoint is requested
    Then the response status is 200
    And the response body reports service is healthy
