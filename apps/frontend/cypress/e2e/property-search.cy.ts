/**
 * E2E Test: Property Search and Discovery Flow
 * Maps to BDD scenarios from specs/bdd/01-property-search.feature
 * Tests the full user flow: search, filter, view details
 */
describe("Property Search and Discovery", () => {
  const baseUrl = "http://localhost:5173";

  beforeEach(() => {
    cy.visit(`${baseUrl}/search`);
  });

  describe("Scenario: Searcher browses map and discovers properties", () => {
    it("should display search page with property listings", () => {
      // Given: User is on the search page
      cy.get('[data-testid="search-page"]').should("be.visible");

      // When: Page loads
      cy.get('[data-testid="listing-grid"]').should("exist");

      // Then: User sees property listings
      cy.get('[data-testid="listing-card"]').should("have.length.greaterThan", 0);
    });

    it("should display property preview cards with essential info", () => {
      // Given: Property listings are visible
      cy.get('[data-testid="listing-card"]')
        .first()
        .within(() => {
          // Then: Card shows price
          cy.get('[data-testid="property-price"]').should("be.visible");

          // And: Card shows property type
          cy.get('[data-testid="property-type"]').should("be.visible");

          // And: Card shows address
          cy.get('[data-testid="property-address"]').should("be.visible");

          // And: Card shows bedrooms
          cy.get('[data-testid="property-bedrooms"]').should("be.visible");
        });
    });

    it("should toggle between list and map view", () => {
      // When: User clicks map view toggle
      cy.get('[data-testid="view-toggle-map"]').click();

      // Then: Map view is displayed
      cy.get('[data-testid="property-map"]').should("be.visible");

      // When: User clicks list view toggle
      cy.get('[data-testid="view-toggle-list"]').click();

      // Then: List view is displayed
      cy.get('[data-testid="listing-grid"]').should("be.visible");
    });
  });

  describe("Scenario: Searcher filters properties by criteria", () => {
    it("should open and close filter panel", () => {
      // When: User clicks filter toggle
      cy.get('[data-testid="filter-toggle"]').click();

      // Then: Filter panel opens
      cy.get('[data-testid="filter-panel"]').should("be.visible");

      // When: User clicks filter toggle again
      cy.get('[data-testid="filter-toggle"]').click();

      // Then: Filter panel closes
      cy.get('[data-testid="filter-panel"]').should("not.be.visible");
    });

    it("should filter by price range", () => {
      // Given: Filter panel is open
      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="filter-panel"]').should("be.visible");

      // When: User sets price range
      cy.get('[data-testid="price-min-input"]').clear().type("200000");
      cy.get('[data-testid="price-max-input"]').clear().type("300000");

      // And: User clicks Apply
      cy.get('[data-testid="filter-apply-button"]').click();

      // Then: Results update to show filtered properties
      cy.get('[data-testid="listing-card"]').each(($card) => {
        cy.wrap($card)
          .get('[data-testid="property-price"]')
          .then(($price) => {
            const priceText = $price.text();
            const price = parseInt(priceText.replace(/[^0-9]/g, ""));
            expect(price).to.be.greaterThanOrEqual(200000);
            expect(price).to.be.lessThanOrEqual(300000);
          });
      });
    });

    it("should filter by property type", () => {
      // Given: Filter panel is open
      cy.get('[data-testid="filter-toggle"]').click();

      // When: User selects property type
      cy.get('[data-testid="property-type-filter"]').click();
      cy.get('[data-testid="type-option-apartment"]').click();

      // And: User clicks Apply
      cy.get('[data-testid="filter-apply-button"]').click();

      // Then: Results show only apartments
      cy.get('[data-testid="listing-card"]').each(($card) => {
        cy.wrap($card).get('[data-testid="property-type"]').should("contain.text", "Apartment");
      });
    });

    it("should filter by bedrooms", () => {
      // Given: Filter panel is open
      cy.get('[data-testid="filter-toggle"]').click();

      // When: User selects bedrooms filter
      cy.get('[data-testid="bedrooms-filter"]').click();
      cy.get('[data-testid="bedrooms-option-2"]').click();

      // And: User clicks Apply
      cy.get('[data-testid="filter-apply-button"]').click();

      // Then: Results show only 2+ bedroom properties
      cy.get('[data-testid="listing-card"]').each(($card) => {
        cy.wrap($card).get('[data-testid="property-bedrooms"]').should("contain.text", "2");
      });
    });

    it("should update URL with filter parameters (shareable link)", () => {
      // Given: Filter panel is open
      cy.get('[data-testid="filter-toggle"]').click();

      // When: User applies filters
      cy.get('[data-testid="price-min-input"]').clear().type("200000");
      cy.get('[data-testid="filter-apply-button"]').click();

      // Then: URL contains filter parameters
      cy.url().should("include", "priceMin=200000");
    });
  });

  describe("Scenario: Searcher clicks property marker and sees preview", () => {
    it("should open preview on marker click", () => {
      // Given: Map is displayed
      cy.get('[data-testid="view-toggle-map"]').click();
      cy.get('[data-testid="property-map"]').should("be.visible");

      // When: User clicks on property marker
      cy.get('[data-testid="property-marker"]').first().click();

      // Then: Preview card appears
      cy.get('[data-testid="property-preview"]').should("be.visible");
    });

    it("should show property details in preview", () => {
      // Given: Preview is open
      cy.get('[data-testid="view-toggle-map"]').click();
      cy.get('[data-testid="property-marker"]').first().click();

      // Then: Preview shows price
      cy.get('[data-testid="property-preview"]').within(() => {
        cy.get('[data-testid="property-price"]').should("contain.text", "€");

        // And: Shows property type
        cy.get('[data-testid="property-type"]').should("be.visible");

        // And: Shows bedrooms
        cy.get('[data-testid="property-bedrooms"]').should("be.visible");

        // And: Shows address
        cy.get('[data-testid="property-address"]').should("be.visible");
      });
    });

    it("should navigate to details page from preview", () => {
      // Given: Preview is open
      cy.get('[data-testid="view-toggle-map"]').click();
      cy.get('[data-testid="property-marker"]').first().click();
      cy.get('[data-testid="property-preview"]').should("be.visible");

      // When: User clicks "View Details"
      cy.get('[data-testid="preview-view-details-button"]').click();

      // Then: Property detail page loads
      cy.url().should("include", "/property/");
      cy.get('[data-testid="property-detail-page"]').should("be.visible");
    });
  });

  describe("Scenario: Searcher views full property details", () => {
    it("should display property detail page", () => {
      // Given: User clicks on property listing
      cy.get('[data-testid="listing-card"]').first().click();

      // Then: Detail page loads
      cy.get('[data-testid="property-detail-page"]').should("be.visible");
    });

    it("should show photo carousel", () => {
      // Given: Detail page is loaded
      cy.get('[data-testid="listing-card"]').first().click();

      // Then: Photo carousel is visible
      cy.get('[data-testid="photo-carousel"]').should("be.visible");

      // And: Main photo is displayed
      cy.get('[data-testid="main-photo"]').should("be.visible");

      // And: Thumbnail navigation exists
      cy.get('[data-testid="photo-thumbnail"]').should("have.length.greaterThan", 0);
    });

    it("should show property description", () => {
      // Given: Detail page is loaded
      cy.get('[data-testid="listing-card"]').first().click();

      // Then: Description section is visible
      cy.get('[data-testid="property-description"]').should("be.visible");
    });

    it("should show owner/agency profile", () => {
      // Given: Detail page is loaded
      cy.get('[data-testid="listing-card"]').first().click();

      // Then: Owner profile card is visible
      cy.get('[data-testid="owner-profile-card"]').should("be.visible");

      // And: Shows owner name
      cy.get('[data-testid="owner-name"]').should("be.visible");

      // And: Shows response time
      cy.get('[data-testid="owner-response-time"]').should("contain.text", "under 24h");
    });

    it("should show view and inquiry stats", () => {
      // Given: Detail page is loaded
      cy.get('[data-testid="listing-card"]').first().click();

      // Then: View count is displayed
      cy.get('[data-testid="view-count"]').should("be.visible");

      // And: Inquiry count is displayed
      cy.get('[data-testid="inquiry-count"]').should("be.visible");
    });

    it("should show contact button", () => {
      // Given: Detail page is loaded
      cy.get('[data-testid="listing-card"]').first().click();

      // Then: Contact button is visible
      cy.get('[data-testid="contact-button"]').should("be.visible");
    });

    it("should show location on map", () => {
      // Given: Detail page is loaded
      cy.get('[data-testid="listing-card"]').first().click();

      // Then: Property location map is visible
      cy.get('[data-testid="property-location-map"]').should("be.visible");
    });

    it("should have progressively loading photos", () => {
      // Given: Detail page is loaded
      cy.get('[data-testid="listing-card"]').first().click();

      // When: User waits for images
      cy.get('[data-testid="main-photo"]').should("have.attr", "src");

      // Then: Images load with alt text
      cy.get('[data-testid="main-photo"]').should("have.attr", "alt");
    });
  });

  describe("Scenario: Searcher performs multi-filter search", () => {
    it("should combine multiple filters", () => {
      // Given: Filter panel is open
      cy.get('[data-testid="filter-toggle"]').click();

      // When: User applies multiple filters
      cy.get('[data-testid="price-min-input"]').clear().type("150000");
      cy.get('[data-testid="property-type-filter"]').click();
      cy.get('[data-testid="type-option-apartment"]').click();

      // And: User clicks Apply
      cy.get('[data-testid="filter-apply-button"]').click();

      // Then: Results are filtered by all criteria
      cy.get('[data-testid="listing-card"]').should("have.length.greaterThan", 0);

      // And: All results match filters
      cy.get('[data-testid="listing-card"]').each(($card) => {
        cy.wrap($card)
          .get('[data-testid="property-price"]')
          .then(($price) => {
            const priceText = $price.text();
            const price = parseInt(priceText.replace(/[^0-9]/g, ""));
            expect(price).to.be.greaterThanOrEqual(150000);
          });

        cy.wrap($card).get('[data-testid="property-type"]').should("contain.text", "Apartment");
      });
    });
  });
});
