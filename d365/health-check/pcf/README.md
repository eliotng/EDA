# PCF Control: Health Check

Goal
- Recreate the Salesforce LWC Health Check UI/behavior in a PCF control.

Features
- Header:
  - Icon and Settings link text (configurable)
- Run Card:
  - Description text and Run button
  - Last run date text (computed from backend response)
- Results:
  - Group panels/rows with status (Passed/Failed), counts, and item list
  - Refresh after Run completes

Inputs (manifest ControlManifest.Inputs)
- EndpointMode (Choice: Flow, Action)
- GetViewModelEndpoint (Text) — Flow HTTP URL or Action name
- UpdateLastRunEndpoint (Text) — Flow HTTP URL or Action name
- ShowSettings (TwoOptions)
- SettingsNavigationTarget (Text) — app/page/table to open
- TitleText, DescriptionText, RunButtonText, LastRunTextTemplate — optional overrides

Outputs
- None required; state is internal to control

Backend Contract (JSON)
- See ../docs/ARCHITECTURE.md payload example

Scaffold (Power Platform CLI)
- pac pcf init --namespace org.healthcheck --name HealthCheckPcf --template field
- cd HealthCheckPcf
- yarn install
- Build: yarn build

Rendering Notes
- Use React + Fluent UI (or plain CSS) to mimic layout similar to the LWC
- Ensure accessibility: keyboard nav, aria labels, focus states
- Use color/labels for status instead of Salesforce-specific icon names

Navigation
- For Model-driven: use Xrm.Navigation.openForm/openUrl based on SettingsNavigationTarget
- For Canvas: expose a property to allow parent app to navigate
Build & Configure
- Install: yarn install
- Build: yarn build
- Add the control to a model-driven form or custom page and set inputs:
  - EndpointMode: Flow
  - GetViewModelEndpoint: Flow A URL
  - UpdateLastRunEndpoint: Flow B URL
  - ShowSettings: true/false
  - SettingsNavigationTarget: entityLogicalName[:formId] or full URL
- See ../docs/FLOWS.md and ../docs/DEPLOY.md for backend and deployment steps.
