Feature: Property Search and Discovery

Scenario: Searcher browses map and discovers properties
  Given I am on the search page
  And I am not logged in
  When I view the interactive map
  Then I see property markers in my current location
  And markers are color-coded by contract type (sale=blue, rent=green, airbnb=orange)
  And I can pan and zoom the map
  And I can see a marker cluster when 50+ properties are visible

Scenario: Searcher filters properties by criteria
  Given I have 100 properties visible on map
  And I open the filter panel
  When I set price range 200000-300000 EUR
  And I select property type "Apartment"
  And I select contract type "Sale"
  And I click Apply
  Then the map updates showing only matching properties
  And URL changes to reflect filters (sharable link)

Scenario: Searcher searches with proximity filter (schools)
  Given I am searching for rentals
  When I add filter "Primary schools within 1km + rating >4"
  And I apply filters
  Then map shows rentals near primary schools with good ratings
  And I can toggle distance metric (walking/driving/bird-flight)

Scenario: Searcher clicks property marker and sees preview
  Given I see property markers on map
  When I click on a marker
  Then preview card appears showing:
    | Field | Value |
    | Price | €250,000 |
    | Type | Apartment |
    | Bedrooms | 2 |
    | Address | Brussels, Belgium |
  And I can click "View Details" to open full page

Scenario: Searcher views full property details
  Given I clicked "View Details" on property
  When page loads
  Then I see:
    | Item | Present |
    | Photo carousel | Yes |
    | Property description | Yes |
    | Owner/agency profile | Yes |
    | View count (# people viewed) | Yes |
    | Contact button | Yes |
  And photos load progressively
  And property location shows on map (zoomed)
