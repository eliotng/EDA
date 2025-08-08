# Solution Packaging and Deployment (Power Platform)

Purpose
- Package and deploy the Health Check feature (PCF + Dataverse schema + Power Automate flows) as a managed solution to your Dataverse environment.

Prerequisites
- Power Platform CLI installed (pac --version)
- Access to a Dataverse environment
- Power Automate permissions to create solution-aware flows
- Node.js LTS (18 or 20) for PCF build
- pcf-scripts installed locally via the PCF project (yarn install)

Structure
- ./src/ — Optional unpacked solution folder (for solution packer workflows)
- PCF control: d365/health-check/pcf/HealthCheckPcf
- Schema docs: d365/health-check/schema/README.md
- Flows spec: d365/health-check/docs/FLOWS.md

Option A: Build and import components natively in Power Platform
1) Dataverse tables
   - Create custom tables and columns per d365/health-check/schema/README.md
   - Use your publisher prefix (e.g., contoso_) instead of new_
   - Create choice sets: new_status (Passed, Failed), new_runstatus (InProgress, Completed, Failed)
   - Set up relationships (Group 1—N Item, Definition 1—N Item)

2) Power Automate flows
   - Implement Flow A (GetHealthCheckViewModel) and Flow B (UpdateHealthCheckLastRunDate) per d365/health-check/docs/FLOWS.md
   - Use solution-aware flows (create them within your solution)
   - Capture the HTTP trigger URLs (if using HTTP-based approach)

3) PCF control build and registration
   - cd d365/health-check/pcf/HealthCheckPcf
   - yarn install
   - yarn build
   - pac auth create --url https://YOUR-ENVIRONMENT.crm.dynamics.com
   - pac pcf push (for testing) or add the control to your solution using Power Platform tooling
   - In a model-driven app form or custom page, add the PCF control and configure inputs:
     - EndpointMode: Flow
     - GetViewModelEndpoint: Flow A HTTP URL
     - UpdateLastRunEndpoint: Flow B HTTP URL
     - ShowSettings: Yes/No
     - SettingsNavigationTarget: entityLogicalName[:formId] or full URL
     - TitleText, DescriptionText, RunButtonText, LastRunTextTemplate: optional overrides

4) Testing
   - Follow d365/health-check/docs/TESTING.md for manual testing steps
   - Seed example data via Data Import wizard or your preferred tool using schema/seed/healthcheck_seed.json (adjust to your publisher/system names)

Option B: Solution pack/unpack workflow
- Use the solution packer to manage your solution assets as source
- Create a solution in your environment (Publisher configured with your prefix)
- Export as unmanaged or managed to bootstrap the src folder

Unpack an exported solution zip
- Place exported solution ZIP at: d365/health-check/solution/HealthCheckSolution.zip
- Run:
  pac solution unpack --zipfile d365/health-check/solution/HealthCheckSolution.zip --folder d365/health-check/solution/src --packagetype Both
- The src folder will contain solution.xml, customizations.xml, Canvas/PCF artifacts, and references to flows

Pack a solution from src
- Run:
  pac solution pack --zipfile d365/health-check/solution/HealthCheckSolution.zip --folder d365/health-check/solution/src --packagetype Both
- Import the resulting ZIP into your target environment from Power Platform admin center or Solutions UI

Recommended Solution Contents
- Tables: HealthCheckDefinition, HealthCheckGroup, HealthCheckItem, HealthCheckRun, HealthCheckSettings
- Option sets: new_status, new_runstatus
- Flows: GetHealthCheckViewModel, UpdateHealthCheckLastRunDate
- PCF: org.healthcheck/HealthCheckPcf
- Model-driven app (optional) for hosting/preview
- Environment variables (optional) if using custom endpoints instead of flows

Environments and Security
- Configure security roles to ensure users can read the tables and run the flows
- If using HTTP triggers, consider IP allowances or front door/API Management
- Prefer custom actions + plugins for stricter enforcement if required; in that case, set EndpointMode=Action in PCF and configure action names

Versioning
- Set the control version in ControlManifest.Input.xml
- Use semantic versioning for your solution
- Track changes in your solution publisher and increment versions on each release

Troubleshooting
- PCF not rendering: check control registration in form designer, verify pcf-scripts build succeeds
- Flow call failing: test Flow URLs via Postman; ensure CORS/permissions are acceptable
- No data in results: ensure seed records exist and flow’s grouping logic maps to your actual entity names/fields

Next Steps
- After successful dev validation, export a managed solution for test/production
- Document any environment variables and application user requirements

# Solution Packaging (Dataverse)

This folder describes how to package the Health Check feature in a Power Platform solution.

Prerequisites
- Power Platform CLI (pac)
- Node 18+ and yarn
- A Dataverse environment and Solution Publisher

Suggested Structure
- Solution: HealthCheckSolution
  - Tables: HealthCheckDefinition, HealthCheckGroup, HealthCheckItem, HealthCheckRun, HealthCheckSettings
  - Choice sets: Status (Passed/Failed), RunStatus
  - Flows:
    - GetHealthCheckViewModel
    - UpdateHealthCheckLastRunDate
  - (Optional) Custom Actions:
    - new_GetHealthCheckViewModel
    - new_UpdateHealthCheckLastRunDate
  - App:
    - Model-driven test app with a form hosting the PCF control

Flows (low-code option)
- GetHealthCheckViewModel
  - Triggers: Instant (manually from PCF) or HTTP Request (if using custom connector)
  - Actions: List rows from Settings/Definitions/Groups/Items, compose JSON payload with lastRunDate and healthCheckDefinitionList
- UpdateHealthCheckLastRunDate
  - Triggers: as above
  - Actions: Update Settings.LastRunDate to utcNow(), optionally invoke evaluation, return new date

Custom Actions + Plugins (advanced option)
- Create actions with output parameters returning the same JSON shapes
- Implement C# plugin to query tables and compute payload

Solution Operations (examples)
- Pack:
  - pac solution pack --zipfile ./out/HealthCheckSolution.zip --folder ./src --packagetype Managed
- Import:
  - pac solution import --path ./out/HealthCheckSolution.zip
- Export:
  - pac solution export --name HealthCheckSolution --path ./out --managed true

Notes
- Do not include secrets in source control
- If using HTTP-triggered flows, secure endpoints with Azure AD / environment variables
