Feature: CRUD operations
  As an authenticated user
  I want to perform CRUD on a sample resource
  So that I can manage application data

  Scenario: Create resource
    Given I am authenticated
    When I submit a valid payload to create the resource
    Then the resource is persisted
    And the response returns the created resource

  Scenario: Read resource
    Given a resource exists
    When I fetch the resource by id
    Then the response returns the resource

  Scenario: Update resource
    Given a resource exists
    And I am authenticated with permission to update
    When I submit an updated payload
    Then the resource is updated

  Scenario: Delete resource
    Given a resource exists
    And I am authenticated with permission to delete
    When I delete the resource
    Then the resource is removed
