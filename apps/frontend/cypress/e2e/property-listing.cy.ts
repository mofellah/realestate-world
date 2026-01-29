/**
 * E2E Test: Property Listing Creation and Publication Flow
 * Maps to BDD scenarios from specs/bdd/02-property-listing.feature
 * Tests the full owner flow: create listing, set visibility, publish
 */
describe('Property Listing Management', () => {
  const baseUrl = 'http://localhost:5173';

  beforeEach(() => {
    // Login as property owner
    cy.visit(`${baseUrl}/login`);
    cy.get('[data-testid="email-input"]').type('owner@test.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    // Navigate to my properties
    cy.visit(`${baseUrl}/dashboard/properties`);
  });

  describe('Scenario: Property owner creates listing', () => {
    it('should display my properties dashboard', () => {
      // Then: My properties page is visible
      cy.get('[data-testid="my-properties-page"]').should('be.visible');

      // And: Properties list is displayed
      cy.get('[data-testid="property-list"]').should('exist');
    });

    it('should show property cards with actions', () => {
      // Then: Property cards show title
      cy.get('[data-testid="property-card"]').first().within(() => {
        cy.get('[data-testid="property-title"]').should('be.visible');

        // And: Show address
        cy.get('[data-testid="property-address"]').should('be.visible');

        // And: Show status
        cy.get('[data-testid="property-status"]').should('be.visible');

        // And: Show action buttons
        cy.get('[data-testid="view-property-button"]').should('be.visible');
        cy.get('[data-testid="edit-property-button"]').should('be.visible');
        cy.get('[data-testid="create-listing-button"]').should('be.visible');
      });
    });

    it('should open create listing form', () => {
      // When: User clicks "Create Listing" button
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      // Then: Create listing form appears
      cy.get('[data-testid="create-listing-form"]').should('be.visible');
    });

    it('should create listing with basic info', () => {
      // Given: Create listing form is open
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      // When: User fills listing form
      cy.get('[data-testid="listing-type-select"]').select('sale');
      cy.get('[data-testid="listing-price-input"]').type('250000');

      // And: User clicks Save as Draft
      cy.get('[data-testid="save-draft-button"]').click();

      // Then: Listing is created and form closes
      cy.get('[data-testid="create-listing-form"]').should('not.be.visible');

      // And: Success message appears
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Listing created');
    });

    it('should allow selecting listing type', () => {
      // Given: Create listing form is open
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      // When: User selects listing type
      cy.get('[data-testid="listing-type-select"]').should('exist');

      // Then: Options are available
      cy.get('[data-testid="listing-type-select"]').within(() => {
        cy.get('option').should('have.length.greaterThan', 1);
      });
    });

    it('should require price for sale listings', () => {
      // Given: Create listing form is open
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      // When: User selects sale type but leaves price empty
      cy.get('[data-testid="listing-type-select"]').select('sale');

      // And: User tries to save
      cy.get('[data-testid="save-draft-button"]').click();

      // Then: Validation error appears
      cy.get('[data-testid="error-toast"]').should('contain.text', 'Price required');
    });
  });

  describe('Scenario: Property owner sets listing visibility', () => {
    beforeEach(() => {
      // Create a listing first
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      cy.get('[data-testid="listing-type-select"]').select('sale');
      cy.get('[data-testid="listing-price-input"]').type('250000');
      cy.get('[data-testid="save-draft-button"]').click();

      // Navigate to listing details
      cy.get('[data-testid="listing-card"]').first().click();
    });

    it('should display listing detail with settings', () => {
      // Then: Listing detail page loads
      cy.get('[data-testid="listing-detail-page"]').should('be.visible');

      // And: Settings section is visible
      cy.get('[data-testid="listing-settings"]').should('be.visible');
    });

    it('should set visibility start date', () => {
      // When: User clicks on visibility settings
      cy.get('[data-testid="visibility-settings"]').click();

      // Then: Date picker appears
      cy.get('[data-testid="visibility-start-date"]').should('be.visible');

      // When: User selects start date
      cy.get('[data-testid="visibility-start-date"]').type('2026-02-01');

      // And: User saves
      cy.get('[data-testid="save-settings-button"]').click();

      // Then: Settings are saved
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Settings saved');
    });

    it('should set visibility duration', () => {
      // When: User opens visibility settings
      cy.get('[data-testid="visibility-settings"]').click();

      // And: User sets duration
      cy.get('[data-testid="visibility-days-input"]').clear().type('30');

      // And: User saves
      cy.get('[data-testid="save-settings-button"]').click();

      // Then: Duration is saved
      cy.get('[data-testid="visibility-days-input"]').should('have.value', '30');
    });

    it('should show visibility preview', () => {
      // When: User sets visibility dates
      cy.get('[data-testid="visibility-settings"]').click();
      cy.get('[data-testid="visibility-start-date"]').type('2026-02-01');
      cy.get('[data-testid="visibility-days-input"]').clear().type('30');

      // Then: Preview shows visibility period
      cy.get('[data-testid="visibility-preview"]').should('contain.text', 'Feb 1');
      cy.get('[data-testid="visibility-preview"]').should('contain.text', 'Mar 2');
    });
  });

  describe('Scenario: Property owner publishes listing', () => {
    beforeEach(() => {
      // Create and open listing
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      cy.get('[data-testid="listing-type-select"]').select('sale');
      cy.get('[data-testid="listing-price-input"]').type('250000');
      cy.get('[data-testid="save-draft-button"]').click();

      cy.get('[data-testid="listing-card"]').first().click();
    });

    it('should show publish button on draft listing', () => {
      // Given: Listing is in draft status
      cy.get('[data-testid="listing-status"]').should('contain.text', 'Draft');

      // Then: Publish button is visible
      cy.get('[data-testid="publish-button"]').should('be.visible');
    });

    it('should publish listing to make it visible', () => {
      // When: User clicks Publish
      cy.get('[data-testid="publish-button"]').click();

      // Then: Confirmation dialog appears
      cy.get('[data-testid="publish-confirmation"]').should('be.visible');

      // When: User confirms
      cy.get('[data-testid="publish-confirm-button"]').click();

      // Then: Listing status changes to Published
      cy.get('[data-testid="listing-status"]').should('contain.text', 'Published');

      // And: Success message appears
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Listing published');
    });

    it('should hide publish button after publishing', () => {
      // When: User publishes listing
      cy.get('[data-testid="publish-button"]').click();
      cy.get('[data-testid="publish-confirm-button"]').click();

      // Then: Publish button is no longer visible
      cy.get('[data-testid="publish-button"]').should('not.exist');
    });

    it('should show unpublish option for published listings', () => {
      // Given: Listing is published
      cy.get('[data-testid="publish-button"]').click();
      cy.get('[data-testid="publish-confirm-button"]').click();

      // Then: Unpublish button is visible
      cy.get('[data-testid="unpublish-button"]').should('be.visible');
    });

    it('should allow unpublishing listing', () => {
      // Given: Listing is published
      cy.get('[data-testid="publish-button"]').click();
      cy.get('[data-testid="publish-confirm-button"]').click();

      // When: User clicks Unpublish
      cy.get('[data-testid="unpublish-button"]').click();

      // Then: Status returns to Draft
      cy.get('[data-testid="listing-status"]').should('contain.text', 'Draft');
    });
  });

  describe('Scenario: Property owner edits published listing', () => {
    it('should allow editing draft listing details', () => {
      // Given: Listing is in draft
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      cy.get('[data-testid="listing-type-select"]').select('sale');
      cy.get('[data-testid="listing-price-input"]').type('250000');
      cy.get('[data-testid="save-draft-button"]').click();

      cy.get('[data-testid="listing-card"]').first().click();

      // When: User clicks Edit
      cy.get('[data-testid="edit-listing-button"]').click();

      // Then: Edit form appears
      cy.get('[data-testid="edit-listing-form"]').should('be.visible');

      // When: User changes price
      cy.get('[data-testid="listing-price-input"]').clear().type('280000');

      // And: User saves
      cy.get('[data-testid="save-changes-button"]').click();

      // Then: Changes are saved
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Listing updated');
    });

    it('should allow editing published listing visibility only', () => {
      // Given: Listing is published
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      cy.get('[data-testid="listing-type-select"]').select('sale');
      cy.get('[data-testid="listing-price-input"]').type('250000');
      cy.get('[data-testid="save-draft-button"]').click();

      cy.get('[data-testid="listing-card"]').first().click();
      cy.get('[data-testid="publish-button"]').click();
      cy.get('[data-testid="publish-confirm-button"]').click();

      // When: User tries to edit
      cy.get('[data-testid="edit-listing-button"]').click();

      // Then: Only visibility settings are editable
      cy.get('[data-testid="listing-price-input"]').should('be.disabled');
      cy.get('[data-testid="visibility-settings"]').should('not.be.disabled');
    });
  });

  describe('Scenario: Property owner deletes listing', () => {
    it('should delete draft listing', () => {
      // Given: Listing is in draft
      cy.get('[data-testid="property-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="create-listing-button"]').click();
        });

      cy.get('[data-testid="listing-type-select"]').select('sale');
      cy.get('[data-testid="listing-price-input"]').type('250000');
      cy.get('[data-testid="save-draft-button"]').click();

      cy.get('[data-testid="listing-card"]').first().click();

      // When: User clicks Delete
      cy.get('[data-testid="delete-listing-button"]').click();

      // Then: Confirmation dialog appears
      cy.get('[data-testid="delete-confirmation"]').should('be.visible');

      // When: User confirms
      cy.get('[data-testid="delete-confirm-button"]').click();

      // Then: Listing is deleted
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Listing deleted');

      // And: Returns to my properties
      cy.url().should('include', '/dashboard/properties');
    });
  });
});
