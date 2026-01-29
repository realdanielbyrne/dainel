---
summary: "CLI reference for `dainel reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
---

# `dainel reset`

Reset local config/state (keeps the CLI installed).

```bash
dainel reset
dainel reset --dry-run
dainel reset --scope config+creds+sessions --yes --non-interactive
```

