# Dataverse Schema: Health Check

Tables (prefix with your Publisher, e.g., new_)
- new_HealthCheckDefinition
  - new_name (Text, required)
  - new_groupname (Text)
  - new_description (Multiline Text)
  - new_checktype (Choice) — optional
  - new_isenabled (Yes/No)
  - new_order (Whole Number)
- new_HealthCheckGroup
  - new_name (Text, required)
  - new_status (Choice: Passed, Failed)
  - new_passedchecks (Whole Number)
  - new_totalchecks (Whole Number)
- new_HealthCheckItem
  - new_name (Text, required)
  - new_status (Choice: Passed, Failed)
  - new_details (Multiline Text)
  - new_group (Lookup to new_HealthCheckGroup)
  - new_definition (Lookup to new_HealthCheckDefinition)
  - new_sequence (Whole Number)
- new_HealthCheckRun
  - new_startedon (Date and Time)
  - new_completedon (Date and Time)
  - new_status (Choice: InProgress, Completed, Failed)
  - new_summarypassed (Whole Number)
  - new_summarytotal (Whole Number)
- new_HealthCheckSettings
  - new_lastrundate (Date Only)

Relationships
- new_HealthCheckGroup (1) — (N) new_HealthCheckItem
- new_HealthCheckDefinition (1) — (N) new_HealthCheckItem
- Optional: new_HealthCheckRun (1) — (N) new_HealthCheckItemResult (if you decide to persist historical outcomes)

Choice Sets
- new_status (items)
  - Passed
  - Failed
- new_runstatus (runs)
  - InProgress
  - Completed
  - Failed

Seed Data
- See ./seed/healthcheck_seed.json for an example of initial definitions/groups/items.
