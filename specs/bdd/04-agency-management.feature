Feature: Agency Subscription and Team Management

Scenario: Agency creates account and subscribes
  Given I am a real estate agency
  When I click "Start Selling"
  Then signup form appears:
    | Field | Options |
    | Agency name | Text (required) |
    | Country | Belgium / Holland / Switzerland (required) |
    | Tier | Local / Regional / National (required) |
    | Geographic areas | Select from map (required) |
    | Payment method | Stripe (required) |
  And Tier Local shows: "1 area + 20 listings + 5 agents = €500/month"
  And Tier Regional shows: "3 areas + 100 listings + 15 agents = €1500/month"
  And Tier National shows: "All areas + unlimited listings + unlimited agents = €5000/month"
  And I select Tier Regional (3 areas in Belgium, €1500/month)
  And I complete Stripe payment
  Then account activated immediately
  And I receive welcome email with agent invite link
  And I can create agent accounts

Scenario: Agency creates agent accounts
  Given I am agency with Tier Regional (max 15 agents)
  When I click "Invite Agent"
  Then signup form appears with role selector:
    | Role | Permissions |
    | Lister | Create/edit listings |
    | Visitor | Schedule viewings |
    | Responder | Reply to inquiries |
    | All | All of above (default) |
  And I enter agent email "alice@myagency.com"
  And I select role "All"
  And I click Send Invite
  Then agent receives invite email
  And agent signs up via link
  And agent can start creating listings
  And my team page shows "1 / 15 agents used"

Scenario: Agent creates listing (covered by subscription)
  Given I am agent for "John's Real Estate"
  When I create property and listing (rent, €2000/month)
  And I click "Publish"
  Then listing appears on map immediately (no payment screen)
  And listing shows agency branding "Sold by John's Real Estate"
  And my agency dashboard shows "21 / 100 concurrent listings used"

Scenario: Agency exceeds listing allowance
  Given I have Tier Local (20 concurrent listings allowed)
  And I have 20 active listings
  When I try to create 21st listing
  Then system shows: "You've reached listing limit (20/20)"
  And offers options:
    | Option | Cost |
    | Pay overage | €5/listing/month |
    | Upgrade to Tier Regional | €1500/month |
  And I can still publish if I pay overage

Scenario: Agency views dashboard and analytics
  Given I am agency admin
  When I open dashboard
  Then I see:
    | Section | Includes |
    | Team | 8 agents, list with status/last activity |
    | Portfolio | 45 active listings, views, inquiries per listing |
    | Coverage | Listings per geographic area (heatmap) |
    | Inquiries | 150 incoming messages this month, response time |
    | Billing | Tier Regional, 3 areas, 45/100 listings used, 8/15 agents |
  And I can filter by agent, area, contract type
  And I can export reports (CSV) - Phase 2
