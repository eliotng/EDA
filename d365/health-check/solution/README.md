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
