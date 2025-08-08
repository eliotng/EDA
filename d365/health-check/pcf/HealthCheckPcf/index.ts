const enum EndpointModeEnum {
    Flow = "Flow",
    Action = "Action",
}
type Context = any;
type NotifyOutputChanged = () => void;

type HealthCheckItem = {
    name: string;
    status: string;
    details?: string;
};
type HealthCheckGroup = {
    label: string;
    status: string;
    passedChecks: number;
    totalChecks: number;
    expandedRowsList?: string[];
    healthCheckItemList: HealthCheckItem[];
};
type ViewModelPayload = {
    lastRunDate: string;
    healthCheckDefinitionList: HealthCheckGroup[];
};

export class HealthCheckPcf {
    private container: HTMLDivElement;
    private ctx: Context;
    private notifyChanged: NotifyOutputChanged;
    private props: Record<string, any>;
    private state: ViewModelPayload | null = null;

    init(context: Context, notifyOutputChanged: NotifyOutputChanged, state: any, container: HTMLDivElement) {
        this.ctx = context;
        this.notifyChanged = notifyOutputChanged;
        this.container = container;
        this.props = {};
        this.renderSkeleton();
        this.bindHandlers();
        this.fetchViewModel();
    }

    updateView(context: Context) {
        this.ctx = context;
        this.props.EndpointMode = context.parameters?.EndpointMode?.raw || "";
        this.props.GetViewModelEndpoint = context.parameters?.GetViewModelEndpoint?.raw || "";
        this.props.UpdateLastRunEndpoint = context.parameters?.UpdateLastRunEndpoint?.raw || "";
        this.props.ShowSettings = !!context.parameters?.ShowSettings?.raw;
        this.props.SettingsNavigationTarget = context.parameters?.SettingsNavigationTarget?.raw || "";
        this.props.TitleText = context.parameters?.TitleText?.raw || "Health Check";
        this.props.DescriptionText =
            context.parameters?.DescriptionText?.raw || "Run health checks and review results.";
        this.props.RunButtonText = context.parameters?.RunButtonText?.raw || "Run";
        this.props.LastRunTextTemplate = context.parameters?.LastRunTextTemplate?.raw || "Last run: {0}";
        this.updateHeader();
        this.updateLastRun();
        this.updateResults();
    }

    getOutputs(): any {
        return {};
    }

    destroy(): void {}

    private renderSkeleton() {
        this.container.innerHTML = "";
        const header = document.createElement("div");
        header.id = "hc-header";
        const title = document.createElement("h3");
        title.id = "hc-title";
        const desc = document.createElement("div");
        desc.id = "hc-desc";
        const settings = document.createElement("a");
        settings.href = "javascript:void(0)";
        settings.id = "hc-settings";
        settings.style.display = "none";
        settings.textContent = "Settings";
        const runCard = document.createElement("div");
        runCard.id = "hc-run-card";
        const lastRun = document.createElement("div");
        lastRun.id = "hc-last-run";
        const runBtn = document.createElement("button");
        runBtn.id = "hc-run-btn";
        runBtn.textContent = "Run";
        const results = document.createElement("div");
        results.id = "hc-results";
        header.appendChild(title);
        header.appendChild(desc);
        header.appendChild(settings);
        runCard.appendChild(lastRun);
        runCard.appendChild(runBtn);
        this.container.appendChild(header);
        this.container.appendChild(runCard);
        this.container.appendChild(results);
    }

    private bindHandlers() {
        const runBtn = this.container.querySelector("#hc-run-btn") as HTMLButtonElement;
        runBtn.onclick = () => this.onRunClick();
        const settings = this.container.querySelector("#hc-settings") as HTMLAnchorElement;
        settings.onclick = () => this.onSettingsClick();
    }

    private updateHeader() {
        const title = this.container.querySelector("#hc-title") as HTMLHeadingElement;
        const desc = this.container.querySelector("#hc-desc") as HTMLDivElement;
        const settings = this.container.querySelector("#hc-settings") as HTMLAnchorElement;
        title.textContent = this.props.TitleText || "Health Check";
        desc.textContent = this.props.DescriptionText || "";
        settings.style.display = this.props.ShowSettings ? "inline-block" : "none";
    }

    private updateLastRun() {
        const lastRun = this.container.querySelector("#hc-last-run") as HTMLDivElement;
        const template = this.props.LastRunTextTemplate || "Last run: {0}";
        const dateText = this.state?.lastRunDate || "";
        lastRun.textContent = template.replace("{0}", dateText);
        const runBtn = this.container.querySelector("#hc-run-btn") as HTMLButtonElement;
        runBtn.textContent = this.props.RunButtonText || "Run";
    }

    private updateResults() {
        const results = this.container.querySelector("#hc-results") as HTMLDivElement;
        results.innerHTML = "";
        if (!this.state || !this.state.healthCheckDefinitionList) return;
        this.state.healthCheckDefinitionList.forEach((group) => {
            const groupDiv = document.createElement("div");
            const header = document.createElement("div");
            header.textContent = `${group.label} — ${group.status} (${group.passedChecks}/${group.totalChecks})`;
            groupDiv.appendChild(header);
            const ul = document.createElement("ul");
            group.healthCheckItemList.forEach((item) => {
                const li = document.createElement("li");
                li.textContent = `${item.name}: ${item.status}${item.details ? " — " + item.details : ""}`;
                ul.appendChild(li);
            });
            groupDiv.appendChild(ul);
            results.appendChild(groupDiv);
        });
    }

    private async fetchViewModel() {
        try {
            const payload = await this.callEndpoint("get");
            this.state = payload as ViewModelPayload;
            this.updateLastRun();
            this.updateResults();
        } catch (e) {
            this.state = { lastRunDate: "", healthCheckDefinitionList: [] };
            this.updateLastRun();
            this.updateResults();
        }
    }

    private async onRunClick() {
        try {
            const updated = await this.callEndpoint("update");
            if (updated && typeof updated.lastRunDate === "string") {
                if (!this.state) this.state = { lastRunDate: "", healthCheckDefinitionList: [] };
                this.state.lastRunDate = updated.lastRunDate;
            }
        } catch (e) {}
        await this.fetchViewModel();
    }

    private onSettingsClick() {
        const target = this.props.SettingsNavigationTarget || "";
        const nav = (this.ctx as any)?.navigation || (window as any)?.Xrm?.Navigation;
        if (!nav) return;
        if (target.startsWith("http")) {
            if (nav.openUrl) nav.openUrl(target);
            else window.open(target, "_blank");
            return;
        }
        if (nav.openForm && target) {
            const parts = target.split(":");
            const entityName = parts[0];
            const formId = parts[1];
            const options: any = { entityName };
            if (formId) options["formId"] = formId;
            nav.openForm(options);
        }
    }

    private async callEndpoint(kind: "get" | "update") {
        const mode = (this.props.EndpointMode || "").trim();
        const getUrl = (this.props.GetViewModelEndpoint || "").trim();
        const updateUrl = (this.props.UpdateLastRunEndpoint || "").trim();
        if (mode === EndpointModeEnum.Flow) {
            const url = kind === "get" ? getUrl : updateUrl;
            if (!url) throw new Error("Missing Flow URL");
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}",
            });
            if (!resp.ok) throw new Error("HTTP error");
            return await resp.json();
        }
        if (mode === EndpointModeEnum.Action) {
            const webapi = (this.ctx as any)?.webAPI || (this.ctx as any)?.utils?.getWebAPI?.();
            if (!webapi) throw new Error("Web API unavailable");
            const actionName = kind === "get" ? getUrl : updateUrl;
            if (!actionName) throw new Error("Missing Action name");
            const result = await webapi.executeCustomAPI(actionName, {});
            return result;
        }
        throw new Error("Invalid Endpoint Mode");
    }
}
