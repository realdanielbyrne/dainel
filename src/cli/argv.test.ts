import { describe, expect, it } from "vitest";

import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "dainel", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "dainel", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "dainel", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "dainel", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "dainel", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "dainel", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "dainel", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "dainel"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "dainel", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "dainel", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "dainel", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "dainel", "status", "--timeout=2500"], "--timeout")).toBe("2500");
    expect(getFlagValue(["node", "dainel", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "dainel", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "dainel", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "dainel", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "dainel", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "dainel", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "dainel", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "dainel", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "dainel", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "dainel", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["node", "dainel", "status"],
    });
    expect(nodeArgv).toEqual(["node", "dainel", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["node-22", "dainel", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "dainel", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["node-22.2.0.exe", "dainel", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "dainel", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["node-22.2", "dainel", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "dainel", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["node-22.2.exe", "dainel", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "dainel", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["/usr/bin/node-22.2.0", "dainel", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "dainel", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["nodejs", "dainel", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "dainel", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["node-dev", "dainel", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "dainel", "node-dev", "dainel", "status"]);

    const directArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["dainel", "status"],
    });
    expect(directArgv).toEqual(["node", "dainel", "status"]);

    const bunArgv = buildParseArgv({
      programName: "dainel",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "dainel",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "dainel", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "dainel", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "dainel", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "dainel", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "dainel", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "dainel", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "dainel", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "dainel", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
