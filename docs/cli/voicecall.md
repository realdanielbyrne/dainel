---
summary: "CLI reference for `dainel voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
---

# `dainel voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:
- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
dainel voicecall status --call-id <id>
dainel voicecall call --to "+15555550123" --message "Hello" --mode notify
dainel voicecall continue --call-id <id> --message "Any questions?"
dainel voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
dainel voicecall expose --mode serve
dainel voicecall expose --mode funnel
dainel voicecall unexpose
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.

