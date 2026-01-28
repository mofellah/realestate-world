Feature: Contact and Messaging

Scenario: Logged-in searcher sends inquiry to owner
  Given I am viewing property details
  And I am logged in
  When I click "Contact Owner"
  Then message form appears with:
    | Field | Pre-filled |
    | My name | Yes (from profile) |
    | My rating | Yes (read-only) |
    | Message | No (required) |
  And I don't see email field (owner won't see my email)
  And I type "Hi, interested in viewing this weekend?"
  And I click Send
  Then message appears in my inbox
  And owner receives email notification
  And owner's inbox shows my thread (marked as new)

Scenario: Logged-out searcher sends inquiry
  Given I am viewing property details
  And I am NOT logged in
  When I click "Contact Owner"
  Then I am redirected to login/register page
  And after login, I return to property
  And message form is ready for my inquiry

Scenario: Searcher contacts agency (multiple agents)
  Given I am viewing property listed by agency "John's Real Estate"
  When I click "Contact Agency"
  And I send message "Available for viewing?"
  Then message appears in agency's inbox
  And ALL agency members see the message (distribution list: all_members)
  And any agent can read and respond
  And I see responses from any agent (thread shows all messages)

Scenario: Owner/Agent responds to searcher inquiry
  Given I received searcher inquiry "Interested in viewing"
  When I click on conversation thread
  And I see full message history
  And I type "Yes, we can arrange viewing Sunday 2pm"
  And I click Reply
  Then my response appears in thread
  And searcher receives email with my reply
  And conversation continues (all messages in one thread)

Scenario: View count tracking
  Given property has preview card viewed 5 times
  And full detail page viewed 8 times
  When I view dashboard
  Then I see "5 preview views, 8 detail views" separately
  And total shows 13 unique viewers (not double-counted)
