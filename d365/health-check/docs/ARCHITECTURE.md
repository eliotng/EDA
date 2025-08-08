# Architecture: EDA Health Check on Dynamics 365

Overview

-   Replace Salesforce LWC + Apex with a Dynamics 365 PCF + Dataverse schema + orchestration (Flow or Action).
-   Preserve key interactions:
    -   Fetch view model (last run date + definitions/groups/items)
    -   Run button updates last run date and refreshes results
    -   Highlights and navigation to settings

Components

-   UI: PCF control
    -   Inputs: endpoints/config, label keys or literal strings, showSettings toggle
    -   Events: onLoaded (fetch), onRunHealthCheck (update + refresh)
    -   Rendering: header (icon + Settings), run card (description + button), results (groups/items with pass/fail)
-   Data: Dataverse
    -   Tables:
        -   HealthCheckDefinition (Name, GroupName, Description, IsEnabled, Order, CheckType)
        -   HealthCheckGroup (Name, Status, PassedChecks, TotalChecks)
        -   HealthCheckItem (Name, Status, Details, Group (lookup), Definition (lookup), Sequence)
        -   HealthCheckRun (StartedOn, CompletedOn, Status, SummaryPassed, SummaryTotal)
        -   HealthCheckSettings (LastRunDate)
    -   Relationships:
        -   Group 1—N Item
        -   Definition 1—N Item
        -   Run 1—N ItemResult (optional if persisting each run)
    -   Option Sets:
        -   Status: Passed, Failed
-   Backend:
    -   Option A: Power Automate flows (low-code)
        -   Flow A (GetHealthCheckViewModel): Query tables, compute counts/status, shape payload as JSON
        -   Flow B (UpdateHealthCheckLastRunDate): Update settings.LastRunDate and return new date
    -   Option B: Dataverse custom actions + C# plugin or Azure Function
-   See docs/FLOWS.md for concrete steps and output schemas for Flow A/B.

          -   Actions new_GetHealthCheckViewModel / new_UpdateHealthCheckLastRunDate

Payload Contract (PCF <-> Backend)
{
"lastRunDate": "2025-08-08",
"healthCheckDefinitionList": [
{
"label": "Data Integrity",
"status": "Passed",
"passedChecks": 5,
"totalChecks": 5,
"expandedRowsList": [],
"healthCheckItemList": [
{ "name": "No orphan records", "status": "Passed", "details": "" }
]
}
]
}

Navigation (Settings)

-   Replace Salesforce NavigationMixin with:
    -   Model-driven: Xrm.Navigation.openForm/openUrl to a settings table form or custom page
    -   Canvas: Navigate() to a settings screen

Security

-   PCF calls Dataverse/Flow using the logged-in user context.
-   If using custom actions/plugins, restrict privileges via security roles.

Accessibility

-   Keyboard access for Run button and list navigation
-   Contrast and status annunciation for pass/fail state
    Deployment

-   See ../docs/DEPLOY.md for environment setup, adding the PCF to a form or custom page, and configuring Flow endpoints.
