---
summary: "Uninstall Dainel completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Dainel from a machine
  - The gateway service is still running after uninstall
---

# Uninstall

Two paths:
- **Easy path** if `dainel` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
dainel uninstall
```

Non-interactive (automation / npx):

```bash
dainel uninstall --all --yes --non-interactive
npx -y dainel uninstall --all --yes --non-interactive
```

Manual steps (same result):

1) Stop the gateway service:

```bash
dainel gateway stop
```

2) Uninstall the gateway service (launchd/systemd/schtasks):

```bash
dainel gateway uninstall
```

3) Delete state + config:

```bash
rm -rf "${DAINEL_STATE_DIR:-$HOME/.dainel}"
```

If you set `DAINEL_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4) Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/clawd
```

5) Remove the CLI install (pick the one you used):

```bash
npm rm -g dainel
pnpm remove -g dainel
bun remove -g dainel
```

6) If you installed the macOS app:

```bash
rm -rf /Applications/Dainel.app
```

Notes:
- If you used profiles (`--profile` / `DAINEL_PROFILE`), repeat step 3 for each state dir (defaults are `~/.dainel-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `dainel` is missing.

### macOS (launchd)

Default label is `bot.molt.gateway` (or `bot.molt.<profile>`; legacy `com.dainel.*` may still exist):

```bash
launchctl bootout gui/$UID/bot.molt.gateway
rm -f ~/Library/LaunchAgents/bot.molt.gateway.plist
```

If you used a profile, replace the label and plist name with `bot.molt.<profile>`. Remove any legacy `com.dainel.*` plists if present.

### Linux (systemd user unit)

Default unit name is `dainel-gateway.service` (or `dainel-gateway-<profile>.service`):

```bash
systemctl --user disable --now dainel-gateway.service
rm -f ~/.config/systemd/user/dainel-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Dainel Gateway` (or `Dainel Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Dainel Gateway"
Remove-Item -Force "$env:USERPROFILE\.dainel\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.dainel-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://molt.bot/install.sh` or `install.ps1`, the CLI was installed with `npm install -g dainel@latest`.
Remove it with `npm rm -g dainel` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `dainel ...` / `bun run dainel ...`):

1) Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2) Delete the repo directory.
3) Remove state + workspace as shown above.
