# Deployment Procedures for Multilingual Help System

This document outlines deployment procedures for the multilingual help system implemented for GitHub Issue #112.

## Pre-Deployment Checklist

### Content Validation
- [ ] All validation scripts pass: `npm run help:validate`
- [ ] Consistency check passes: `npm run help:consistency`  
- [ ] Health monitoring shows green status: `npm run help:health`
- [ ] No critical or blocking warnings in validation reports

### Quality Assurance
- [ ] All 5 languages have complete content coverage
- [ ] JSON files are syntactically correct
- [ ] Character encoding is UTF-8 throughout
- [ ] Version numbers are consistent across languages
- [ ] `lastUpdated` fields reflect current changes

### Testing Requirements
- [ ] Unit tests pass: `npm test -- tests/help/content/`
- [ ] Integration tests pass: `npm test -- tests/help/integration/`  
- [ ] Error handling tests pass: `npm test -- tests/help/error-handling/`
- [ ] Manual functionality testing complete

## Validation Commands

Add these NPM scripts to package.json for streamlined validation:

```json
{
  "scripts": {
    "help:validate": "node scripts/validate-help-content.js",
    "help:consistency": "node scripts/check-help-content-consistency.js",
    "help:health": "node scripts/monitor-help-content-health.js",
    "help:test": "npm test -- tests/help/",
    "help:all": "npm run help:validate && npm run help:consistency && npm run help:health && npm run help:test"
  }
}
```

## Build Process Integration

### Pre-Build Validation
Add validation step to build pipeline:

```bash
# Before build
npm run help:validate
if [ $? -ne 0 ]; then
  echo "Help content validation failed"
  exit 1
fi
```

### CI/CD Integration
Add to GitHub Actions workflow:

```yaml
- name: Validate Help Content
  run: |
    node scripts/validate-help-content.js
    node scripts/check-help-content-consistency.js
    
- name: Test Help System  
  run: npm run help:test
```

## Deployment Steps

### 1. Pre-Deployment Validation
```bash
# Run full validation suite
npm run help:all

# Generate validation reports
node scripts/validate-help-content.js --output=reports/help-validation.json
node scripts/check-help-content-consistency.js --output=reports/help-consistency.json
node scripts/monitor-help-content-health.js --output=reports/help-health.json
```

### 2. Content Staging
```bash
# Verify all content files are present
find src/core/help/content/help -name "*.json" | wc -l  # Should be 25

# Check file sizes are reasonable
find src/core/help/content/help -name "*.json" -exec ls -la {} \; | awk '{sum+=$5} END {print "Total size:", sum/1024, "KB"}'
```

### 3. Deployment Execution
```bash
# Standard deployment process
npm run build
npm run deploy

# Post-deployment verification
curl -s https://your-domain.com/src/core/help/content/help/en/bubbles.json | jq .title
curl -s https://your-domain.com/src/core/help/content/help/ja/bubbles.json | jq .title
```

### 4. Post-Deployment Verification
```bash
# Verify content accessibility
for lang in en ja ko zh-CN zh-TW; do
  for cat in bubbles controls settings troubleshooting gameplay; do
    echo "Testing $lang/$cat..."
    curl -f -s "https://your-domain.com/src/core/help/content/help/$lang/$cat.json" > /dev/null
    if [ $? -eq 0 ]; then
      echo "✅ $lang/$cat.json - OK"
    else
      echo "❌ $lang/$cat.json - FAILED"
    fi
  done
done
```

## Rollback Procedures

### Issue Detection
Monitor for:
- 404 errors on help content requests
- JSON parsing errors in browser console
- Fallback content being served unexpectedly
- User reports of missing help content

### Rollback Decision Matrix

| Issue Severity | Response Time | Action |
|---------------|---------------|---------|
| Critical (No help content loading) | Immediate | Full rollback |
| High (Major language missing) | Within 1 hour | Partial rollback |
| Medium (Minor content issues) | Within 4 hours | Hotfix or rollback |
| Low (Cosmetic issues) | Next deployment | Schedule fix |

### Rollback Execution

#### Full System Rollback
```bash
# Revert to previous deployment
git revert <commit-hash>
npm run build
npm run deploy

# Verify rollback success
npm run help:validate
```

#### Partial Content Rollback  
```bash
# Restore specific language from backup
git checkout HEAD~1 -- src/core/help/content/help/ja/
npm run help:validate
npm run build
npm run deploy
```

#### Emergency Hotfix
```bash
# Quick fix for critical issues
git checkout -b hotfix/help-content-fix
# Make minimal necessary changes
git commit -m "hotfix: critical help content issue"
# Deploy hotfix branch
```

## Monitoring and Alerting

### Health Metrics to Monitor
- Content file availability (should be 100%)
- JSON parsing success rate (should be 100%)
- Fallback usage frequency (should be minimal)
- Help system load times (should be <200ms)

### Alert Conditions

**Critical Alerts:**
- Any help content file returns 404
- JSON parsing fails for any file
- All fallback mechanisms failing

**Warning Alerts:**  
- Fallback usage increases above baseline
- Content health score drops below 90%
- Validation failures in staging

**Info Alerts:**
- Content updates deployed successfully
- Health monitoring reports generated
- Usage patterns changing significantly

### Monitoring Dashboard Integration

Health monitoring data can be integrated with existing dashboards:

```bash
# Generate dashboard data
node scripts/monitor-help-content-health.js --dashboard=dashboard-data.json

# Send to monitoring system
curl -X POST https://your-monitoring.com/api/metrics \
  -H "Content-Type: application/json" \
  -d @dashboard-data.json
```

## Maintenance Windows

### Scheduled Maintenance
- **Frequency**: Monthly  
- **Duration**: 30 minutes
- **Activities**: 
  - Full content validation
  - Translation updates
  - System health assessment
  - Backup verification

### Emergency Maintenance
- **Trigger**: Critical system issues
- **Communication**: Notify users if help system will be unavailable
- **Rollback Plan**: Always prepared before starting

## Content Backup Strategy

### Automated Backups
```bash
# Daily backup of all help content
tar -czf "help-content-backup-$(date +%Y%m%d).tar.gz" src/core/help/content/help/

# Retain backups for 30 days
find backups/ -name "help-content-backup-*.tar.gz" -mtime +30 -delete
```

### Backup Verification
```bash
# Verify backup integrity
tar -tzf help-content-backup-$(date +%Y%m%d).tar.gz | head -10

# Test restore process monthly
mkdir test-restore
tar -xzf help-content-backup-$(date +%Y%m%d).tar.gz -C test-restore/
node scripts/validate-help-content.js --path=test-restore/src/core/help/content/help/
```

## Performance Considerations

### Content Optimization
- Keep individual files under 100KB
- Minimize nested object depth
- Use consistent field ordering
- Avoid redundant translations

### Caching Strategy
- Browser cache: 24 hours for content files
- CDN cache: 1 hour with purge capability
- Service worker: Cache with update strategy

### Load Testing
```bash
# Test concurrent access to help content
ab -n 1000 -c 10 https://your-domain.com/src/core/help/content/help/en/bubbles.json

# Monitor performance during deployment
while true; do
  curl -s -w "%{time_total}\n" https://your-domain.com/src/core/help/content/help/ja/settings.json -o /dev/null
  sleep 1
done
```

## Documentation Updates

### Deployment Checklist Documentation
- Update this document with any procedure changes
- Document any new validation steps
- Record lessons learned from deployments

### User Communication
- Prepare release notes for significant updates
- Notify translators of deployment schedule
- Update help system changelog

## Support and Escalation

### Deployment Support
- **Primary**: Development team
- **Secondary**: DevOps team  
- **Emergency**: On-call engineer

### Issue Escalation Path
1. **Level 1**: Standard deployment issues
2. **Level 2**: Content corruption or major failures
3. **Level 3**: System-wide help system outage

### Contact Information
- Development Team: #dev-team
- DevOps: #devops
- Emergency: On-call rotation

---

**Created**: 2025-01-27 (GitHub Issue #112)  
**Last Updated**: 2025-01-27  
**Review Schedule**: After each deployment