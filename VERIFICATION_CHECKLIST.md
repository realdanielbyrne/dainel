# SharePoint Storage Investigation Enhancement - Verification Checklist

## Pre-Flight Checks

### 1. Module Installation
- [ ] Verify PnP.PowerShell is installed: `Get-Module -ListAvailable PnP.PowerShell`
- [ ] Verify ExchangeOnlineManagement is installed: `Get-Module -ListAvailable ExchangeOnlineManagement`
- [ ] Optional: Install Microsoft.Online.SharePoint.PowerShell: `Install-Module Microsoft.Online.SharePoint.PowerShell -Scope CurrentUser`

### 2. Authentication Setup
- [ ] Azure AD app registration exists (Client ID: ed6e79b0-8985-499d-8718-4a01cf6c9129)
- [ ] App has required permissions:
  - SharePoint: Sites.FullControl.All, User.Read.All
  - Exchange: Exchange.ManageAsApp (or similar)
- [ ] Admin consent granted for all permissions
- [ ] Certificate exists (if using cert auth): `SharePoint-Admin-Tool.pfx`

### 3. Script Integrity
- [x] Script syntax validated
- [x] All functions defined before use
- [x] Parameters properly declared
- [x] Error handling in place
- [x] Line count: 1,336 lines

## Functional Testing

### Phase 1: Basic Functionality (Existing Features)

#### Test 1: Standard Run (No Skip Flags)
```powershell
.\Investigate-SharePointStorage.ps1 -DaysBack 1
```

**Expected Results:**
- [ ] Connects to SharePoint Online successfully
- [ ] Connects to Exchange Online successfully
- [ ] Retrieves all sites and OneDrive accounts
- [ ] Displays top 25 sites by storage
- [ ] Displays top 25 OneDrive accounts by storage
- [ ] Generates fastest growing sites reports (1/3/6 months)
- [ ] Searches recent audit logs
- [ ] Displays uploader statistics
- [ ] Creates timestamped output directory
- [ ] Exports at least 13 CSV files (00-13)
- [ ] Displays summary with key findings
- [ ] Disconnects from services cleanly

**Files to verify (core):**
- [ ] `00_Metadata.csv` - Contains run metadata
- [ ] `01_AllSitesByStorage.csv` - Contains site data
- [ ] `02_AllOneDriveByStorage.csv` - Contains OneDrive data
- [ ] `03-05_FastestGrowing_*.csv` - Contains growth data
- [ ] `06-13_*.csv` - Contains recent activity data

### Phase 2: New Features - Period Analysis

#### Test 2: Period Analysis (1 Month Only - Quick Test)
```powershell
.\Investigate-SharePointStorage.ps1 -SkipRecycleBinAnalysis -SkipVersionReports
```

**Expected Results:**
- [ ] Displays "TOP UPLOADERS BY TIME PERIOD ANALYSIS" section
- [ ] Shows progress: "Analyzing top uploaders for last 1 month..."
- [ ] Shows progress: "Retrieved X records for 1 month period..."
- [ ] Displays top 20 uploaders by size (1 month)
- [ ] Displays top 20 uploaders by count (1 month)
- [ ] Repeats for 3 months
- [ ] Repeats for 6 months
- [ ] Summary includes top uploader for each period

**Files to verify (period analysis):**
- [ ] `14_UploadersBySize_1Month.csv` - Contains correct columns and data
- [ ] `15_UploadersBySize_3Months.csv` - Contains correct columns and data
- [ ] `16_UploadersBySize_6Months.csv` - Contains correct columns and data
- [ ] `17_UploadersByCount_1Month.csv` - Contains correct columns and data
- [ ] `18_UploadersByCount_3Months.csv` - Contains correct columns and data
- [ ] `19_UploadersByCount_6Months.csv` - Contains correct columns and data

**Data validation:**
- [ ] Rank column starts at 1 and increments
- [ ] User column contains email addresses
- [ ] FileCount is a positive integer
- [ ] TotalGB is greater than or equal to TotalMB/1024
- [ ] MeanFileSizeMB makes sense given TotalMB and FileCount
- [ ] MedianFileSizeMB is present
- [ ] StdDevMB is present
- [ ] Period column contains "1 month", "3 months", or "6 months"

#### Test 3: Skip Period Analysis
```powershell
.\Investigate-SharePointStorage.ps1 -SkipPeriodAnalysis
```

**Expected Results:**
- [ ] Does NOT display "TOP UPLOADERS BY TIME PERIOD ANALYSIS" section
- [ ] Shows skip message: "[Period uploader analysis skipped...]"
- [ ] Files 14-19 NOT created
- [ ] Script completes successfully
- [ ] Other features still work

### Phase 3: New Features - Recycle Bin Analysis

#### Test 4: Recycle Bin Analysis (Limited Scope)
```powershell
.\Investigate-SharePointStorage.ps1 -SkipPeriodAnalysis -SkipVersionReports -TopSitesForRecycleBin 5
```

**Expected Results:**
- [ ] Displays "RECYCLE BIN STORAGE ANALYSIS" section
- [ ] Shows progress: "Analyzing recycle bin storage..."
- [ ] Shows progress: "Checking top 5 sites by storage..."
- [ ] Shows progress: "[1/5] Checking: [Site Name]..."
- [ ] Shows progress: "Checking tenant recycle bin for deleted sites..."
- [ ] Displays total recycle bin storage
- [ ] Displays top 25 sites by recycle bin storage
- [ ] Summary includes total recycle bin storage

**Files to verify (recycle bin):**
- [ ] `20_RecycleBinStorage.csv` - Exists and contains data

**Data validation:**
- [ ] Rank column starts at 1
- [ ] SiteTitle contains site names or "[TENANT RECYCLE BIN - Deleted Sites]"
- [ ] SiteUrl contains valid URLs or "(Tenant Level)"
- [ ] FirstStageGB is zero or positive number
- [ ] SecondStageGB is zero or positive number
- [ ] TotalRecycleBinGB equals FirstStageGB + SecondStageGB
- [ ] TotalItemCount is a positive integer

**Error handling:**
- [ ] Script continues if a site is inaccessible
- [ ] Warning messages shown for failed sites
- [ ] Script reconnects to admin URL after site checks

#### Test 5: Skip Recycle Bin Analysis
```powershell
.\Investigate-SharePointStorage.ps1 -SkipRecycleBinAnalysis
```

**Expected Results:**
- [ ] Does NOT display "RECYCLE BIN STORAGE ANALYSIS" section
- [ ] Shows skip message: "[Recycle bin analysis skipped...]"
- [ ] File 20 NOT created
- [ ] Script completes successfully
- [ ] Other features still work

### Phase 4: New Features - Version History Reports

#### Test 6: Version History Reports (If Module Installed)
```powershell
.\Investigate-SharePointStorage.ps1 -SkipPeriodAnalysis -SkipRecycleBinAnalysis -TopSitesForVersionReports 3
```

**Expected Results (if module installed):**
- [ ] Module check passes: "Microsoft.Online.SharePoint.PowerShell v[version] found"
- [ ] Displays "VERSION HISTORY STORAGE ANALYSIS" section
- [ ] Shows progress: "Queueing version history reports..."
- [ ] Shows progress: "Queueing reports for top 3 sites..."
- [ ] Shows progress: "[1/3] Queueing report for: [Site Name]..."
- [ ] Shows success or failure for each job
- [ ] Displays report job status table
- [ ] Shows reminder: "IMPORTANT: These reports take 1-3 days to generate"
- [ ] Summary includes number of jobs queued

**Expected Results (if module NOT installed):**
- [ ] Module check shows: "Microsoft.Online.SharePoint.PowerShell not found..."
- [ ] Shows installation guidance
- [ ] Shows: "Skipping version history analysis..."
- [ ] Does NOT display "VERSION HISTORY STORAGE ANALYSIS" section
- [ ] File 21 NOT created
- [ ] Script continues with other features

**Files to verify (version history):**
- [ ] `21_VersionHistoryJobs.csv` - Exists (if module installed)

**Data validation:**
- [ ] SiteTitle contains site names
- [ ] SiteUrl contains valid URLs
- [ ] JobQueued contains timestamp
- [ ] Status contains "Queued (check in 1-3 days)" or "Failed"
- [ ] ReportLocation contains URL or "N/A"
- [ ] Notes contains helpful information

#### Test 7: Skip Version Reports
```powershell
.\Investigate-SharePointStorage.ps1 -SkipVersionReports
```

**Expected Results:**
- [ ] Shows skip message: "[Version history analysis skipped...]" or similar
- [ ] File 21 NOT created
- [ ] Script completes successfully
- [ ] Other features still work

### Phase 5: All Features Together

#### Test 8: Full Run (All Features Enabled)
```powershell
.\Investigate-SharePointStorage.ps1 -TopSitesForRecycleBin 10 -TopSitesForVersionReports 3
```

**Expected Results:**
- [ ] All sections display in correct order
- [ ] All 21 CSV files created (or 20 if version module not installed)
- [ ] Summary contains all key findings
- [ ] Script completes successfully
- [ ] No errors or warnings (except for expected module warnings)

**File count verification:**
```powershell
(Get-ChildItem -Path "SharePointReport_*" -Recurse -Filter "*.csv").Count
```
- [ ] Count is 21 (or 20 if no version module)

### Phase 6: Edge Cases and Error Handling

#### Test 9: No Audit Data Available
- [ ] Script handles no audit data gracefully
- [ ] Shows warning message
- [ ] Still exports site/OneDrive data
- [ ] Summary indicates no uploader data

#### Test 10: Connection Failures
- [ ] Interactive auth retry works
- [ ] Certificate auth fallback works (if cert available)
- [ ] Clear error messages if both fail
- [ ] Exit code is non-zero on failure

#### Test 11: Inaccessible Sites (Recycle Bin)
- [ ] Warning shown for inaccessible sites
- [ ] Script continues with remaining sites
- [ ] Accessible sites still analyzed
- [ ] CSV still exports

#### Test 12: Version Report Job Failures
- [ ] Failed jobs recorded in CSV
- [ ] Status set to "Failed"
- [ ] Error message captured in Notes
- [ ] Script continues with remaining jobs

## Performance Testing

### Test 13: Performance with Different Scopes

Small scope:
```powershell
Measure-Command { .\Investigate-SharePointStorage.ps1 -DaysBack 1 -SkipPeriodAnalysis -SkipRecycleBinAnalysis -SkipVersionReports }
```
- [ ] Completes in under 5 minutes (small tenant) or 10 minutes (large tenant)

Medium scope:
```powershell
Measure-Command { .\Investigate-SharePointStorage.ps1 -TopSitesForRecycleBin 10 -SkipVersionReports }
```
- [ ] Completes in under 15 minutes (small tenant) or 30 minutes (large tenant)

Full scope:
```powershell
Measure-Command { .\Investigate-SharePointStorage.ps1 }
```
- [ ] Completes in under 30 minutes (small tenant) or 60 minutes (large tenant)

### Test 14: Memory Usage
- [ ] Script doesn't consume excessive memory (monitor with Task Manager/Activity Monitor)
- [ ] No memory leaks during long runs
- [ ] Large CSV files export successfully

## Data Quality Testing

### Test 15: Statistical Accuracy

Pick a user from `14_UploadersBySize_1Month.csv` and verify:
- [ ] TotalGB = TotalMB / 1024 (approximately)
- [ ] MeanFileSizeMB = TotalMB / FileCount (approximately)
- [ ] MedianFileSizeMB is reasonable compared to Mean
- [ ] StdDevMB indicates variance in file sizes

### Test 16: Data Consistency

Compare files:
- [ ] `06_UploadersBySize.csv` (recent) vs `14_UploadersBySize_1Month.csv` (1 month)
- [ ] Recent data is subset of 1-month data (if DaysBack < 30)
- [ ] Rankings make sense

### Test 17: Metadata Accuracy

Check `00_Metadata.csv`:
- [ ] ReportGeneratedAt has current timestamp
- [ ] AdminEmail matches parameter
- [ ] TenantDomain is correct
- [ ] DaysBackAnalyzed matches parameter
- [ ] UploaderPeriodAnalysisEnabled reflects skip flag
- [ ] RecycleBinAnalysisEnabled reflects skip flag
- [ ] VersionReportsEnabled reflects module availability and skip flag

## Documentation Testing

### Test 18: Help Text
```powershell
Get-Help .\Investigate-SharePointStorage.ps1
```
- [ ] Synopsis displays correctly
- [ ] Description is comprehensive
- [ ] All parameters listed
- [ ] Examples are helpful
- [ ] Notes section is informative

### Test 19: Parameter Help
```powershell
Get-Help .\Investigate-SharePointStorage.ps1 -Parameter *
```
- [ ] All parameters have descriptions
- [ ] Default values shown correctly
- [ ] Parameter types are correct

## Integration Testing

### Test 20: Jupyter Notebook Compatibility
If using `SharePointStorageReport.ipynb`:
- [ ] Notebook can read all CSV files
- [ ] New CSV files (14-21) don't break existing visualizations
- [ ] Consider adding new visualizations for period/recycle bin data

## Final Checklist

### Code Quality
- [x] All functions have proper documentation
- [x] Variable names are descriptive
- [x] Error handling is consistent
- [x] No hardcoded values (use parameters)
- [x] Comments explain complex logic
- [x] Code follows PowerShell best practices

### User Experience
- [ ] Clear progress indicators during long operations
- [ ] Meaningful warning messages
- [ ] Summary provides actionable insights
- [ ] CSV files are well-named and organized
- [ ] Skip flags work as expected

### Documentation
- [x] Script header updated with new parameters
- [x] Usage examples provided
- [x] SHAREPOINT_ENHANCEMENT_SUMMARY.md created
- [x] SHAREPOINT_USAGE_GUIDE.md created
- [x] VERIFICATION_CHECKLIST.md created (this file)

### Ready for Production
- [ ] All tests passed
- [ ] Performance is acceptable
- [ ] No critical errors
- [ ] Documentation is complete
- [ ] User is comfortable running the script

## Sign-Off

**Tested by:** _________________

**Date:** _________________

**Test environment:** _________________

**Tenant size:** _____ sites, _____ users

**Notes:**
```
[Add any observations, issues, or recommendations here]
```

## Known Limitations

1. **Version history reports:** Take 1-3 days to generate (asynchronous)
2. **Audit log retention:** Limited to 90 days (E3) or 365 days (E5)
3. **Recycle bin analysis:** Can be slow for large tenants (connects to each site)
4. **Period analysis:** Retrieves up to 50,000 audit records per query
5. **Rate limiting:** May hit throttling limits on very large tenants

## Recommended Next Steps

After successful verification:

1. **Schedule regular runs:** Weekly or monthly
2. **Baseline storage:** Run with all features to establish baseline
3. **Monitor trends:** Compare reports over time
4. **Set alerts:** Define thresholds for action
5. **Document procedures:** How to act on findings
6. **Train admins:** Share usage guide with team
7. **Integrate with monitoring:** Feed data into existing systems
8. **Version history follow-up:** Check back in 3 days for first reports
