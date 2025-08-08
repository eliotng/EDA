# Build & Local Validation

Note: Do not install or deploy from this repository without approval.

PCF (when approved)

-   Ensure Power Platform CLI installed (pac --version)
-   Scaffold:
    -   pac pcf init --namespace org.healthcheck --name HealthCheckPcf --template field
-   Install deps:
    -   yarn install
-   Build:
    -   yarn build
-   Test harness:
    -   Use PCF test harness to load mock data (see ../schema/payload_sample.json)

Flows/Actions

-   Use Power Automate or Solution Designer to create components outlined in ../solution/README.md
-   Export solution to zip and store artifacts outside of this repo, or keep the unpacked folder under ./solution/src if using solution pack/unpack
-   Flows:
    -   Implement per docs/FLOWS.md and capture the HTTP URLs for Flow A and B.
    -   Configure these URLs in the PCF inputs (EndpointMode=Flow).

CI

-   If CI is enabled for this repo, ensure added files do not break existing linting
-   Keep changes isolated under /d365 to avoid interfering with Salesforce code
    Deployment

-   After local validation, follow docs/DEPLOY.md to import components into a Dataverse environment and configure the PCF inputs.
