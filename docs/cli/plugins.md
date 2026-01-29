---
summary: "CLI reference for `dainel plugins` (list, install, enable/disable, doctor)"
read_when:
  - You want to install or manage in-process Gateway plugins
  - You want to debug plugin load failures
---

# `dainel plugins`

Manage Gateway plugins/extensions (loaded in-process).

Related:
- Plugin system: [Plugins](/plugin)
- Plugin manifest + schema: [Plugin manifest](/plugins/manifest)
- Security hardening: [Security](/gateway/security)

## Commands

```bash
dainel plugins list
dainel plugins info <id>
dainel plugins enable <id>
dainel plugins disable <id>
dainel plugins doctor
dainel plugins update <id>
dainel plugins update --all
```

Bundled plugins ship with Dainel but start disabled. Use `plugins enable` to
activate them.

All plugins must ship a `dainel.plugin.json` file with an inline JSON Schema
(`configSchema`, even if empty). Missing/invalid manifests or schemas prevent
the plugin from loading and fail config validation.

### Install

```bash
dainel plugins install <path-or-spec>
```

Security note: treat plugin installs like running code. Prefer pinned versions.

Supported archives: `.zip`, `.tgz`, `.tar.gz`, `.tar`.

Use `--link` to avoid copying a local directory (adds to `plugins.load.paths`):

```bash
dainel plugins install -l ./my-plugin
```

### Update

```bash
dainel plugins update <id>
dainel plugins update --all
dainel plugins update <id> --dry-run
```

Updates only apply to plugins installed from npm (tracked in `plugins.installs`).
