import type { DainelPluginApi } from "dainel/plugin-sdk";
import { emptyPluginConfigSchema } from "dainel/plugin-sdk";

import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: DainelPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
