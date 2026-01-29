import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs(["node", "dainel", "gateway", "--dev", "--allow-unconfigured"]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "dainel", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "dainel", "--dev", "gateway"]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "dainel", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "dainel", "--profile", "work", "status"]);
    if (!res.ok) throw new Error(res.error);
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "dainel", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "dainel", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (dev first)", () => {
    const res = parseCliProfileArgs(["node", "dainel", "--dev", "--profile", "work", "status"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (profile first)", () => {
    const res = parseCliProfileArgs(["node", "dainel", "--profile", "work", "--dev", "status"]);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join("/home/peter", ".dainel-dev");
    expect(env.DAINEL_PROFILE).toBe("dev");
    expect(env.DAINEL_STATE_DIR).toBe(expectedStateDir);
    expect(env.DAINEL_CONFIG_PATH).toBe(path.join(expectedStateDir, "dainel.json"));
    expect(env.DAINEL_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      DAINEL_STATE_DIR: "/custom",
      DAINEL_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.DAINEL_STATE_DIR).toBe("/custom");
    expect(env.DAINEL_GATEWAY_PORT).toBe("19099");
    expect(env.DAINEL_CONFIG_PATH).toBe(path.join("/custom", "dainel.json"));
  });
});

describe("formatCliCommand", () => {
  it("returns command unchanged when no profile is set", () => {
    expect(formatCliCommand("dainel doctor --fix", {})).toBe("dainel doctor --fix");
  });

  it("returns command unchanged when profile is default", () => {
    expect(formatCliCommand("dainel doctor --fix", { DAINEL_PROFILE: "default" })).toBe(
      "dainel doctor --fix",
    );
  });

  it("returns command unchanged when profile is Default (case-insensitive)", () => {
    expect(formatCliCommand("dainel doctor --fix", { DAINEL_PROFILE: "Default" })).toBe(
      "dainel doctor --fix",
    );
  });

  it("returns command unchanged when profile is invalid", () => {
    expect(formatCliCommand("dainel doctor --fix", { DAINEL_PROFILE: "bad profile" })).toBe(
      "dainel doctor --fix",
    );
  });

  it("returns command unchanged when --profile is already present", () => {
    expect(formatCliCommand("dainel --profile work doctor --fix", { DAINEL_PROFILE: "work" })).toBe(
      "dainel --profile work doctor --fix",
    );
  });

  it("returns command unchanged when --dev is already present", () => {
    expect(formatCliCommand("dainel --dev doctor", { DAINEL_PROFILE: "dev" })).toBe(
      "dainel --dev doctor",
    );
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("dainel doctor --fix", { DAINEL_PROFILE: "work" })).toBe(
      "dainel --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("dainel doctor --fix", { DAINEL_PROFILE: "  jbclawd  " })).toBe(
      "dainel --profile jbclawd doctor --fix",
    );
  });

  it("handles command with no args after dainel", () => {
    expect(formatCliCommand("dainel", { DAINEL_PROFILE: "test" })).toBe("dainel --profile test");
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm dainel doctor", { DAINEL_PROFILE: "work" })).toBe(
      "pnpm dainel --profile work doctor",
    );
  });
});
