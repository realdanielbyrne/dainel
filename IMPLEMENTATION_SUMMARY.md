# Queue-VersionHistoryReports.ps1 - Implementation Summary

## Changes Implemented

### Problem Resolved
The script was failing with "file already exists" errors because old version history reports from 2018 were present in SharePoint sites. The `New-SPOSiteFileVersionExpirationReportJob` cmdlet does not overwrite existing reports by default.

### Solution Implemented
Added automatic cleanup of existing version history reports before queuing new jobs using PnP.PowerShell module.

---

## Code Changes

### 1. New Parameter Added
**Location:** Lines 43-54

```powershell
[Parameter(Mandatory=$false)]
[switch]$CleanupOldReports = $true
```

- **Default:** Enabled (`$true`)
- **Purpose:** Automatically delete existing version history reports before queuing new ones
- **Usage:** Set to `$false` to skip cleanup: `-CleanupOldReports:$false`

### 2. PnP.PowerShell Module Support
**Location:** Lines 87-94

Added module check and installation logic for PnP.PowerShell (similar to existing SPO module pattern):
- Checks if module is installed
- Installs if missing
- Imports the module
- Both modules work together in PowerShell 5.1

### 3. Cleanup Function Added
**Location:** Lines 103-158

New function: `Remove-ExistingVersionReports`

**Functionality:**
- Connects to each site using PnP
- Accesses the `/Reports` library
- Identifies ALL version expiration reports (files with "version" or "expiration" in filename)
- Deletes all found reports
- Returns cleanup status (success/failure, count of deleted reports)
- Properly disconnects PnP after operations

**Error Handling:**
- Gracefully handles sites without Reports library
- Always attempts to disconnect PnP (no connection leaks)
- Returns detailed status for tracking

### 4. Main Loop Integration
**Location:** Lines 205-220

Cleanup logic integrated before queuing new reports:
- Calls cleanup function if `-CleanupOldReports` is enabled
- Displays progress and results
- Logs number of reports deleted
- Continues even if cleanup fails (non-blocking)

### 5. Enhanced CSV Tracking
**Location:** Lines 236-237 (success) and 267-268 (failure)

Two new columns added to CSV output:
- **CleanupStatus:** "Success", "Failed", or "Skipped"
- **ReportsDeleted:** Count of reports removed (0 or more)

### 6. Improved Error Messages
**Location:** Lines 243-255

Enhanced error handling:
- Detects "file already exists" errors specifically
- Provides helpful guidance on using `-CleanupOldReports:$false`
- Differentiates between cleanup failures and other errors
- Includes actionable troubleshooting steps in error messages

### 7. Updated Documentation
**Location:** Lines 18-28, 33-37

- Added `.PARAMETER CleanupOldReports` documentation
- Added example showing how to disable cleanup
- Updated `.NOTES` section to mention both required modules
- Clarified that both modules auto-install if missing

---

## Expected Behavior

### Default Mode (Cleanup Enabled)
1. Script checks for and installs both PowerShell modules
2. For each site:
   - Connects to site with PnP
   - Searches for existing version history reports
   - Deletes ALL found reports (no age threshold)
   - Disconnects PnP
   - Queues new report via SPO cmdlet
3. CSV includes cleanup status and count
4. Performance: ~5-10 seconds overhead per site for cleanup

### Cleanup Disabled Mode
Run with `-CleanupOldReports:$false`:
1. Skips all cleanup operations
2. Directly queues new reports
3. If "file already exists" error occurs, provides helpful error message
4. CSV shows "Skipped" for CleanupStatus

---

## CSV Output Columns

| Column | Description |
|--------|-------------|
| Rank | Processing order (1, 2, 3...) |
| SiteTitle | SharePoint site display name |
| SiteUrl | Full URL to the site |
| StorageMB | Storage usage in megabytes |
| StorageGB | Storage usage in gigabytes (rounded) |
| Owner | Site owner |
| JobQueued | Timestamp when job was queued |
| Status | "Queued (check in 1-3 days)" or "Failed" |
| ReportLocation | Where report will be saved (e.g., `https://site.com/Reports`) |
| **CleanupStatus** | **NEW:** Success/Failed/Skipped |
| **ReportsDeleted** | **NEW:** Number of old reports removed |
| Notes | Additional details or error messages |

---

## Testing Recommendations

### 1. Module Installation Test
```powershell
# Run on a clean system or after removing modules
powershell.exe -File .\Queue-VersionHistoryReports.ps1 -TopSites 1
```
Verify both modules install correctly and no conflicts occur.

### 2. Default Behavior Test (Cleanup Enabled)
```powershell
powershell.exe -File .\Queue-VersionHistoryReports.ps1 -TopSites 3
```
Expected:
- Cleanup runs automatically
- Old reports are deleted
- New jobs queue successfully
- CSV shows cleanup status

### 3. Cleanup Disabled Test
```powershell
powershell.exe -File .\Queue-VersionHistoryReports.ps1 -TopSites 3 -CleanupOldReports:$false
```
Expected:
- Cleanup is skipped
- May encounter "file already exists" errors if old reports present
- Error message suggests trying with cleanup enabled

### 4. Site Without Reports Library
Test against a site that has never had version history reports:
- Cleanup should complete quickly with "No Reports library found" message
- Should not error or block report queueing

### 5. Full Production Run
```powershell
powershell.exe -File .\Queue-VersionHistoryReports.ps1 -TopSites 20
```
Monitor:
- Performance impact (expect ~5-10 seconds per site)
- Success rate for cleanup operations
- CSV completeness and accuracy

---

## Critical Fix Applied

### PnP.PowerShell Version Compatibility
**Issue:** PnP.PowerShell version 3.x requires PowerShell 7.4.6+, but this script requires PowerShell 5.1 for the Microsoft.Online.SharePoint.PowerShell module.

**Solution:** Script now installs PnP.PowerShell version 2.12.0, which is compatible with PowerShell 5.1.

**If you already have version 3.x installed:**
1. Run the helper script to remove it:
   ```powershell
   powershell.exe -File .\Fix-PnPModule.ps1
   ```
2. This will automatically:
   - Remove incompatible version 3.x
   - Install compatible version 2.12.0
   - Verify the installation

**Manual cleanup (if needed):**
```powershell
# Remove version 3.x
Uninstall-Module -Name "PnP.PowerShell" -RequiredVersion "3.1.0" -Force

# Install version 2.12.0
Install-Module -Name "PnP.PowerShell" -RequiredVersion "2.12.0" -Force -Scope CurrentUser
```

---

## Troubleshooting

### Issue: PnP connection prompts multiple times
**Cause:** PnP.PowerShell uses interactive authentication per site
**Solution:** This is expected behavior; authenticate when prompted

### Issue: Cleanup fails with permission errors
**Cause:** User may not have delete permissions on Reports library
**Solution:** Run with admin account or use `-CleanupOldReports:$false`

### Issue: "File already exists" error even with cleanup enabled
**Possible Causes:**
1. Cleanup failed silently (check CleanupStatus in CSV)
2. Permission issues prevented deletion
3. Reports are locked by SharePoint
**Solution:** Check CSV for CleanupStatus = "Failed" and investigate specific site

### Issue: Module conflicts or version errors
**Cause:** Both modules must run in PowerShell 5.1
**Solution:** Verify running in Windows PowerShell 5.1 (not PowerShell 7):
```powershell
$PSVersionTable
```
Should show `PSEdition: Desktop`

---

## Performance Considerations

### Expected Overhead
- **Per-site cleanup time:** ~5-10 seconds
- **With 20 sites:** ~2-5 additional minutes total
- **Network dependency:** PnP connections require internet access

### Optimization Options
If performance is a concern:
1. Use `-CleanupOldReports:$false` to skip cleanup entirely
2. Reduce `-TopSites` count
3. Run cleanup as a separate pre-processing step
4. Use `-TopSites` with a smaller number for testing, then scale up

---

## Files Modified

- **Queue-VersionHistoryReports.ps1:** Main script with all enhancements

## Files Created

- **IMPLEMENTATION_SUMMARY.md:** This document
- **Fix-PnPModule.ps1:** Helper script to fix PnP.PowerShell version conflicts

---

## Next Steps

1. **Test on a small subset first** (2-3 sites) to verify behavior
2. **Review CSV output** to confirm new columns are populated correctly
3. **Monitor first full run** for any unexpected behaviors
4. **Adjust TopSites parameter** based on performance and needs
5. **Schedule regular runs** to prevent old reports from accumulating

---

## Rollback Instructions

If issues occur, revert to previous version:
1. The script maintains backward compatibility
2. To disable new features: `-CleanupOldReports:$false`
3. To fully revert: use git to restore previous version

---

## Support

For issues or questions:
1. Check CSV output for detailed error messages
2. Review PowerShell execution output for warnings
3. Verify both modules are installed: `Get-Module -ListAvailable PnP.PowerShell, Microsoft.Online.SharePoint.PowerShell`
4. Ensure running in Windows PowerShell 5.1
