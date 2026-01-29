// Legacy names kept for potential migration support
export const LEGACY_PROJECT_NAME = "clawdbot" as const;
export const LEGACY2_PROJECT_NAME = "moltbot" as const;

export const LEGACY_MANIFEST_KEY = LEGACY_PROJECT_NAME;
export const LEGACY2_MANIFEST_KEY = LEGACY2_PROJECT_NAME;

export const LEGACY_PLUGIN_MANIFEST_FILENAME = `${LEGACY_PROJECT_NAME}.plugin.json` as const;
export const LEGACY2_PLUGIN_MANIFEST_FILENAME = `${LEGACY2_PROJECT_NAME}.plugin.json` as const;

export const LEGACY_CANVAS_HANDLER_NAME = `${LEGACY_PROJECT_NAME}CanvasA2UIAction` as const;

export const LEGACY_MACOS_APP_SOURCES_DIR = "apps/macos/Sources/Clawdbot" as const;
export const LEGACY2_MACOS_APP_SOURCES_DIR = "apps/macos/Sources/Moltbot" as const;

export const MACOS_APP_SOURCES_DIR = "apps/macos/Sources/Dainel" as const;
