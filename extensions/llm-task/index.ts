import type { DainelPluginApi } from "../../src/plugins/types.js";

import { createLlmTaskTool } from "./src/llm-task-tool.js";

export default function register(api: DainelPluginApi) {
  api.registerTool(createLlmTaskTool(api), { optional: true });
}
