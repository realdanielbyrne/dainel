import path from "node:path";

import { describe, expect, it } from "vitest";

import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".dainel"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", DAINEL_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".dainel-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", DAINEL_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".dainel"));
  });

  it("uses DAINEL_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", DAINEL_STATE_DIR: "/var/lib/dainel" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/dainel"));
  });

  it("expands ~ in DAINEL_STATE_DIR", () => {
    const env = { HOME: "/Users/test", DAINEL_STATE_DIR: "~/dainel-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/dainel-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { DAINEL_STATE_DIR: "C:\\State\\dainel" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\dainel");
  });
});
