# Power Automate Flows: Health Check

Purpose

-   Replace Salesforce Apex calls (getHealthCheckViewModel, updateHealthCheckLastRunDate) with two Power Automate flows returning/accepting the same payload shape expected by the PCF.

PCF Contract

-   EndpointMode: Flow
-   GetViewModelEndpoint: The HTTP trigger URL for Flow A (POST)
-   UpdateLastRunEndpoint: The HTTP trigger URL for Flow B (POST)
-   Response JSON must align to:
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

Flow A: GetHealthCheckViewModel

-   Trigger: When an HTTP request is received (POST)
-   Inputs: None (body can be empty)
-   Steps:

    1. Dataverse: List rows from new_HealthCheckSettings, select new_lastrundate (use the most recent/only record).
    2. Dataverse: List rows from new_HealthCheckDefinition (optional filters on new_isenabled).
    3. Dataverse: List rows from new_HealthCheckGroup.
    4. Dataverse: List rows from new_HealthCheckItem (include lookups to group/definition).
    5. Compose groups:
        - For each group, compute:
            - passedChecks: count(items with new_status == "Passed")
            - totalChecks: total items in group
            - status: "Passed" if passedChecks == totalChecks else "Failed"
            - expandedRowsList: optionally empty array []
            - healthCheckItemList: map to [{ name, status, details }]
    6. Format lastRunDate: UtcNow or value from settings record, formatted as yyyy-MM-dd (or preferred string).
    7. Response: Return JSON body matching the PCF ViewModelPayload.

-   Output Schema (example):
    {
    "lastRunDate": "string",
    "healthCheckDefinitionList": [
    {
    "label": "string",
    "status": "Passed|Failed",
    "passedChecks": 0,
    "totalChecks": 0,
    "expandedRowsList": [],
    "healthCheckItemList": [
    { "name": "string", "status": "Passed|Failed", "details": "string" }
    ]
    }
    ]
    }

Flow B: UpdateHealthCheckLastRunDate

-   Trigger: When an HTTP request is received (POST)
-   Inputs: None (body can be empty)
-   Steps:

    1. Dataverse: Upsert/Update the single new_HealthCheckSettings record’s new_lastrundate = utcNow().
    2. Response: Return { "lastRunDate": "<same format used in Flow A>" }.
    3. Optional extension: Also recompute results or kick off a background process; PCF will immediately call Flow A to refresh.

-   Output Schema (example):
    { "lastRunDate": "2025-08-08" }

Security/Environment Notes

-   Use solution-aware flows; store them within the same solution as the PCF and Dataverse tables.
-   If feasible, restrict the HTTP triggers by enabling “Enable Schema Validation” and/or protecting access behind environment variables or API Management.
-   Alternatively, implement Dataverse custom actions instead of HTTP; then configure PCF EndpointMode=Action and wire up action names.

Testing the Flows

-   Use Postman or Power Automate’s built-in testing to POST {} to both flow URLs.
-   Verify Flow A returns ViewModelPayload compatible JSON.
-   Verify Flow B returns { lastRunDate } and PCF subsequently refreshes via Flow A.

Mapping to Dataverse Schema

-   new_HealthCheckSettings: new_lastrundate
-   new_HealthCheckGroup: new_name, new_status, new_passedchecks, new_totalchecks
-   new_HealthCheckItem: new_name, new_status, new_details, new_group, new_definition, new_sequence
-   new_HealthCheckDefinition: new_name, new_groupname, new_description, new_isenabled, new_order
-   Use new_status (choice) with values Passed/Failed for consistency.

Known Differences vs Salesforce

-   Salesforce formatting/labels may differ; PCF exposes TitleText, DescriptionText, RunButtonText, LastRunTextTemplate overrides.
-   Navigation to settings relies on Xrm.Navigation (entityLogicalName[:formId]) or URL, rather than Salesforce’s NavigationMixin.
