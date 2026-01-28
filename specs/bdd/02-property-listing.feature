Feature: Property Listing and Publishing

Scenario: Owner creates property asset
  Given I am logged in as property owner
  When I click "Create New Property"
  Then I see form with fields:
    | Field | Required |
    | Property type | Yes |
    | Address | Yes |
    | Photos (5-20) | Yes |
    | Description | Yes |
    | Bedrooms | No |
    | Bathrooms | No |
    | Surface area (sqm) | No |
    | Amenities | No |
  And I can upload photos (drag to reorder)
  And I can save as draft

Scenario: Owner creates listing on property
  Given I have created property asset
  And I click "Create Listing"
  When I select contract type "Rent"
  And I enter monthly price "2500 EUR"
  And I set availability dates (from/to)
  And I click "Publish"
  Then system asks for payment option:
    | Option | Cost | Duration |
    | Pay per listing (30 days) | €20 | 30 days |
    | Pay per listing (90 days) | €50 | 90 days |
    | Use subscription credit | 1 credit | varies |

Scenario: Owner publishes listing with payment
  Given I chose "Pay per listing (30 days)" for €20
  When I complete Stripe payment
  Then listing appears on map within 5 minutes
  And I receive confirmation email
  And my dashboard shows listing as "Active" with expiry date

Scenario: Owner renews expiring listing
  Given my listing expires in 7 days
  When I click "Renew" from dashboard
  And I pay €20 for another 30 days
  Then listing extends for 30 more days from today
  And expiry date updates in dashboard

Scenario: Owner disables listing temporarily
  Given I have active listing
  When I click "Pause"
  Then listing hidden from map
  And I can click "Resume" anytime for free
  And no payment charged for pause period

Scenario: Owner's property becomes unavailable
  Given I have property with 3 active listings (sale, long-term rent, airbnb)
  When I set property status to "Rented" (unavailable)
  Then all 3 listings hidden from map
  And searchers see 404 if they try to access listing
  And I see listings in dashboard with status "Hidden (asset unavailable)"
  And when I set property back to "Available", I can choose to re-publish old listings
