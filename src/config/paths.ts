import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { DainelConfig } from "./types.js";

/**
 * Nix mode detection: When DAINEL_NIX_MODE=1, the gateway is running under Nix.
 * In this mode:
 * - No auto-install flows should be attempted
 * - Missing dependencies should produce actionable Nix-specific error messages
 * - Config is managed externally (read-only from Nix perspective)
 */
export function resolveIsNixMode(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.DAINEL_NIX_MODE === "1";
}

export const isNixMode = resolveIsNixMode();

const STATE_DIRNAME = ".dainel";
const CONFIG_FILENAME = "dainel.json";

// Legacy paths for migration support
const LEGACY_STATE_DIRNAMES = [".clawdbot", ".moltbot"];
const LEGACY_CONFIG_FILENAMES = ["clawdbot.json", "moltbot.json"];

function stateDir(homedir: () => string = os.homedir): string {
  return path.join(homedir(), STATE_DIRNAME);
}

export function resolveLegacyStateDir(homedir: () => string = os.homedir): string {
  // Check for legacy state directories
  for (const dirname of LEGACY_STATE_DIRNAMES) {
    const candidate = path.join(homedir(), dirname);
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // Continue to next candidate
    }
  }
  return stateDir(homedir);
}

export function resolveNewStateDir(homedir: () => string = os.homedir): string {
  // Always returns the canonical new state dir (ignores legacy paths)
  return path.join(homedir(), STATE_DIRNAME);
}

/**
 * State directory for mutable data (sessions, logs, caches).
 * Can be overridden via DAINEL_STATE_DIR.
 * Default: ~/.dainel
 */
export function resolveStateDir(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string {
  const override = env.DAINEL_STATE_DIR?.trim();
  if (override) return resolveUserPath(override);
  return stateDir(homedir);
}

function resolveUserPath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("~")) {
    const expanded = trimmed.replace(/^~(?=$|[\\/])/, os.homedir());
    return path.resolve(expanded);
  }
  return path.resolve(trimmed);
}

export const STATE_DIR = resolveStateDir();

/**
 * Config file path (JSON5).
 * Can be overridden via DAINEL_CONFIG_PATH.
 * Default: ~/.dainel/dainel.json (or $DAINEL_STATE_DIR/dainel.json)
 */
export function resolveCanonicalConfigPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDirPath: string = resolveStateDir(env, os.homedir),
): string {
  const override = env.DAINEL_CONFIG_PATH?.trim();
  if (override) return resolveUserPath(override);
  return path.join(stateDirPath, CONFIG_FILENAME);
}

/**
 * Resolve the active config path by preferring existing config candidates
 * before falling back to the canonical path.
 */
export function resolveConfigPathCandidate(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string {
  const candidates = resolveDefaultConfigCandidates(env, homedir);
  const existing = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
  if (existing) return existing;
  return resolveCanonicalConfigPath(env, resolveStateDir(env, homedir));
}

/**
 * Active config path (prefers existing config files).
 */
export function resolveConfigPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDirPath: string = resolveStateDir(env, os.homedir),
  homedir: () => string = os.homedir,
): string {
  const override = env.DAINEL_CONFIG_PATH?.trim();
  if (override) return resolveUserPath(override);
  const stateOverride = env.DAINEL_STATE_DIR?.trim();
  const candidates = [path.join(stateDirPath, CONFIG_FILENAME)];
  const existing = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
  if (existing) return existing;
  if (stateOverride) return path.join(stateDirPath, CONFIG_FILENAME);
  const defaultStateDir = resolveStateDir(env, homedir);
  if (path.resolve(stateDirPath) === path.resolve(defaultStateDir)) {
    return resolveConfigPathCandidate(env, homedir);
  }
  return path.join(stateDirPath, CONFIG_FILENAME);
}

export const CONFIG_PATH = resolveConfigPathCandidate();

/**
 * Resolve default config path candidates.
 * Order: explicit config path → state-dir-derived paths → legacy paths → default.
 */
export function resolveDefaultConfigCandidates(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string[] {
  const explicit = env.DAINEL_CONFIG_PATH?.trim();
  if (explicit) return [resolveUserPath(explicit)];

  const candidates: string[] = [];
  const dainelStateDirPath = env.DAINEL_STATE_DIR?.trim();
  if (dainelStateDirPath) {
    candidates.push(path.join(resolveUserPath(dainelStateDirPath), CONFIG_FILENAME));
  }

  // New canonical path
  candidates.push(path.join(stateDir(homedir), CONFIG_FILENAME));

  // Legacy paths for migration support
  for (const dirname of LEGACY_STATE_DIRNAMES) {
    for (const filename of [CONFIG_FILENAME, ...LEGACY_CONFIG_FILENAMES]) {
      candidates.push(path.join(homedir(), dirname, filename));
    }
  }

  return candidates;
}

export const DEFAULT_GATEWAY_PORT = 18789;

/**
 * Gateway lock directory (ephemeral).
 * Default: os.tmpdir()/dainel-<uid> (uid suffix when available).
 */
export function resolveGatewayLockDir(tmpdir: () => string = os.tmpdir): string {
  const base = tmpdir();
  const uid = typeof process.getuid === "function" ? process.getuid() : undefined;
  const suffix = uid != null ? `dainel-${uid}` : "dainel";
  return path.join(base, suffix);
}

const OAUTH_FILENAME = "oauth.json";

/**
 * OAuth credentials storage directory.
 *
 * Precedence:
 * - `DAINEL_OAUTH_DIR` (explicit override)
 * - `$DAINEL_STATE_DIR/credentials` (canonical server/default)
 * - `~/.dainel/credentials` (default)
 */
export function resolveOAuthDir(
  env: NodeJS.ProcessEnv = process.env,
  stateDirPath: string = resolveStateDir(env, os.homedir),
): string {
  const override = env.DAINEL_OAUTH_DIR?.trim();
  if (override) return resolveUserPath(override);
  return path.join(stateDirPath, "credentials");
}

export function resolveOAuthPath(
  env: NodeJS.ProcessEnv = process.env,
  stateDirPath: string = resolveStateDir(env, os.homedir),
): string {
  return path.join(resolveOAuthDir(env, stateDirPath), OAUTH_FILENAME);
}

export function resolveGatewayPort(
  cfg?: DainelConfig,
  env: NodeJS.ProcessEnv = process.env,
): number {
  const envRaw = env.DAINEL_GATEWAY_PORT?.trim();
  if (envRaw) {
    const parsed = Number.parseInt(envRaw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const configPort = cfg?.gateway?.port;
  if (typeof configPort === "number" && Number.isFinite(configPort)) {
    if (configPort > 0) return configPort;
  }
  return DEFAULT_GATEWAY_PORT;
}
