---
name: Testing Task
about: Create a testing task (unit, integration, E2E, BDD)
title: '[TEST] '
labels: ['test']
assignees: ''
---

## Testing Scope
<!-- What needs to be tested -->


## Test Type
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests
- [ ] BDD Scenario Automation
- [ ] Performance Tests
- [ ] Security Tests

## Related Feature/Module
<!-- Link to the feature this tests -->
Related to: #

## BDD Scenarios (if applicable)
<!-- Reference scenarios from specs/bdd/ -->
**File**: `specs/bdd/[feature-name].feature`

```gherkin
Scenario: [Scenario name]
  Given [precondition]
  When [action]
  Then [expected result]
```

## Test Cases
<!-- List specific test cases to implement -->
1. **Test**: 
   - **Input**: 
   - **Expected**: 
   - **Coverage**: <!-- e.g., happy path, edge case, error handling -->

2. **Test**: 
   - **Input**: 
   - **Expected**: 
   - **Coverage**: 

## Test Files to Create/Update
- [ ] `[path/to/test-file].spec.ts`
- [ ] `[path/to/test-file].cy.ts`
- [ ] `[path/to/test-file].e2e.ts`

## Coverage Target
**Minimum Coverage**:
- Backend: **80%**
- Frontend: **70%**

**Current Coverage**: __%

## Test Data/Fixtures
<!-- Describe test data needed -->
- [ ] Fixtures created in `[location]`
- [ ] Mocks created in `[location]`
- [ ] Seed data available

## Acceptance Criteria
- [ ] All test cases implemented
- [ ] All tests pass
- [ ] Coverage target met
- [ ] BDD scenarios automated (if applicable)
- [ ] No skipped tests (all `.skip` removed)
- [ ] CI pipeline includes these tests

## Additional Notes


## Definition of Done
- [ ] Tests written and passing
- [ ] Coverage meets or exceeds target
- [ ] CI integration verified
- [ ] Code reviewed
