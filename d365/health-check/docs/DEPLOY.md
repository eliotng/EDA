# Deployment Guide

Goal

-   Deploy the Health Check feature (PCF + Dataverse schema + Flows) into a Dataverse environment and configure it on a model-driven form or custom page.

Prerequisites

-   Power Platform CLI (pac) installed and authenticated
-   Permissions to create/update solutions, tables, flows, and app components
-   Node.js LTS (18 or 20) for building PCF

Steps

1. Create or select a Solution

-   In Power Platform maker portal, create a new Solution (choose your Publisher and prefix).
-   All components below should be added to this solution to keep them solution-aware.

2. Dataverse schema

-   Create custom tables as per d365/health-check/schema/README.md:
    -   HealthCheckDefinition, HealthCheckGroup, HealthCheckItem, HealthCheckRun, HealthCheckSettings
-   Configure choice sets (Passed/Failed) and relationships
-   Optionally import seed data using schema/seed/healthcheck_seed.json (adjust logical names/prefixes)

3. Implement flows

-   Flow A: GetHealthCheckViewModel (HTTP POST trigger)
    -   Read HealthCheckSettings, Groups, Items; compute counts/status; return JSON payload
-   Flow B: UpdateHealthCheckLastRunDate (HTTP POST trigger)
    -   Update Settings last run date; return { lastRunDate }
-   Verify both flows using Postman or the Power Automate test runner
-   Store both HTTP URLs for the PCF configuration

4. Build and add the PCF control

-   cd d365/health-check/pcf/HealthCheckPcf
-   yarn install
-   yarn build
-   Add the control to your solution (pcf push for dev testing, or include it via solution import if pre-packaged)

5. Place PCF on a Model-driven form or Custom Page

-   Open the form designer or custom page
-   Insert the Health Check PCF control and set inputs:
    -   EndpointMode: Flow
    -   GetViewModelEndpoint: Flow A URL
    -   UpdateLastRunEndpoint: Flow B URL
    -   ShowSettings: Yes/No as desired
    -   SettingsNavigationTarget: entityLogicalName[:formId] or URL
    -   TitleText, DescriptionText, RunButtonText, LastRunTextTemplate: optional UI text overrides

6. Test end-to-end

-   Load the form/page and confirm initial view model is displayed
-   Click Run button; confirm Settings last run date updates and results refresh
-   Click Settings link; confirm it opens the configured target
-   Perform accessibility checks (keyboard nav, focus visibility, readable status text)

7. Promote to higher environments

-   Export unmanaged solution and then export as managed for test/production
-   Import managed solution into target environments
-   Re-configure PCF inputs (Flow URLs, texts) as needed per environment

Notes and Recommendations

-   Consider environment variables for URLs or configuration to avoid per-environment manual edits
-   For stricter security and ALM, replace Flow HTTP triggers with Dataverse custom actions + plugin; set PCF EndpointMode=Action and configure action names
-   Keep the PCF control and flows in the same solution for easier lifecycle management

Troubleshooting

-   If the PCF does not load, verify build output and control registration
-   If flow calls fail, check HTTP trigger accessibility and run history for errors
-   If results are empty, verify that groups/items exist and the flow constructs the payload properly

References

-   Architecture: d365/health-check/docs/ARCHITECTURE.md
-   Flows: d365/health-check/docs/FLOWS.md
-   Build: d365/health-check/docs/BUILD.md
-   Testing: d365/health-check/docs/TESTING.md
