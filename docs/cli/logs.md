---
summary: "CLI reference for `dainel logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
---

# `dainel logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:
- Logging overview: [Logging](/logging)

## Examples

```bash
dainel logs
dainel logs --follow
dainel logs --json
dainel logs --limit 500
```

