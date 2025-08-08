# Testing Guide

Scope

-   Validate the Health Check PCF control and backend orchestration in a dev Dataverse environment.

Preconditions

-   Solution imported with tables, flows or actions, and PCF registered
-   Sample data imported from ../schema/seed/healthcheck_seed.json

Test Cases

1. Load control
    - Expected: Title and description render; last run date displays value from Settings
2. Run button
    - Action: Click Run
    - Expected: Update flow/action returns new lastRunDate; control refreshes and displays it
3. Results listing
    - Expected: Groups show pass/fail with correct passedChecks/totalChecks; items listed in sequence
4. Settings navigation
    - Action: Click Settings link
    - Expected: Navigates to configured target (form or page)
5. Error handling
    - Backend unavailable or error returns
    - Expected: Friendly error label; lastRunDate shows fallback string if configured
6. Accessibility
    - Expected: All interactive elements keyboard accessible, focus visible, status text readable

Artifacts

-   Capture screenshots of:
    -   Initial load
    -   After running health check
    -   Settings navigation
-   Attach to PR
