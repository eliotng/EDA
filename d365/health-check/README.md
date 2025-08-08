# Dynamics 365 Migration: EDA Health Check

Target: Microsoft Dynamics 365 (Power Apps/Dataverse)
Scope: Recreate the Salesforce EDA Health Check LWC experience as a Dynamics-native implementation.

This folder contains the solution skeleton, data model mapping, and implementation guidelines for:
- A PCF control that mirrors the Health Check UI and behavior
- Dataverse tables and relationships for definitions, groups, items, runs, and settings
- Backend orchestration via Power Automate flows or Dataverse custom actions (plugins) that replaces Apex calls

Contents
- ./pcf/ — PCF control scaffolding guidance and structure
- ./solution/ — Dataverse solution structure and deployment steps
- ./schema/ — Dataverse table design and sample seed data
- ./docs/FLOWS.md — Power Automate flows to replace Apex calls
- ./docs/DEPLOY.md — Deployment guide for adding the solution to a Dataverse environment
- ./solution/README.md — Solution packaging (pack/unpack) and environment setup


- ./docs/ — Architecture and testing guides

Quick Overview
- Source feature (Salesforce):
  - force-app/main/default/lwc/healthCheck/*
  - force-app/main/default/lwc/healthCheckRun/*
  - force-app/main/default/lwc/healthCheckHighlightsPanel/*
  - force-app/main/default/classes/HealthCheckController.cls (getHealthCheckViewModel, updateHealthCheckLastRunDate)
  - force-app/main/default/classes/HealthCheck*VModel.cls (view model shapes)
- Target feature (Dynamics):
  - PCF control hosted on a Model-driven app form or used in a custom page
  - Dataverse tables: HealthCheckDefinition, HealthCheckGroup, HealthCheckItem, HealthCheckRun, HealthCheckSettings
  - Backend: Power Automate flow(s) or Dataverse custom actions to return a view model payload and update LastRunDate

Recommended Approach
- UI: PCF control (React + TypeScript) to closely match LWC behavior
- Backend: Power Automate flows inside a solution (low code) or custom actions with C# plugin (more control/perf)
- Data: Dataverse tables mirroring the EDA view models, with option sets for pass/fail and relationships for roll-ups

High-level Flow
1) On load, PCF calls GetHealthCheckViewModel (Flow or Action) to retrieve:
   - lastRunDate: string
   - healthCheckDefinitionList: array of groups/definitions/items
2) On Run button, PCF calls UpdateHealthCheckLastRunDate (Flow or Action), then refreshes view model
3) The PCF renders highlights, run card, and results table/grid with pass/fail counts

Next Steps
- Implement the solution components per the READMEs under ./pcf, ./solution, and ./schema
- Open a PR with these artifacts; do not modify Salesforce code
