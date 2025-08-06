# Configuration Monitoring Dashboard

**Real-time configuration monitoring with interactive web interface**

## Overview

The Configuration Monitoring Dashboard provides a web-based interface for real-time monitoring of game configuration changes, validation status tracking, and interactive data visualization. Built with Main Controller Pattern architecture for maintainable and scalable monitoring capabilities.

## Architecture

### Main Controller Pattern
```
dashboard.js (Main Controller - 802 words)
├── DashboardDataManager.js      - Data fetching and management
├── DashboardVisualization.js    - Charts and visual components  
├── DashboardValidation.js       - Validation and analysis
└── DashboardReporting.js        - Report generation
```

### Component Responsibilities

#### DashboardDataManager
- Fetch configuration data from multiple sources
- Manage change history and versioning
- Handle data refresh and caching
- Real-time data synchronization

#### DashboardVisualization  
- Initialize and manage Chart.js visualizations
- Render interactive charts and graphs
- Handle responsive UI rendering
- Manage chart animations and transitions

#### DashboardValidation
- Update validation status indicators
- Perform impact analysis on configuration changes
- Configuration comparison and diff generation
- Validation rule processing

#### DashboardReporting
- Generate comprehensive validation reports
- Create configuration comparison reports  
- Export reports in multiple formats
- Report scheduling and distribution

## Getting Started

### Web Interface Access
```
http://localhost:8000/tools/dashboard/dashboard.html
```

### Local Development
```bash
# Start development server
python -m http.server 8000
# or
npx serve .

# Open dashboard in browser
open http://localhost:8000/tools/dashboard/dashboard.html
```

### Production Deployment  
```bash
# Build optimized version
npm run build:dashboard

# Deploy to web server
cp -r tools/dashboard/dist/* /var/www/html/dashboard/
```

## Features

### Real-time Monitoring
- **Configuration Changes**: Live tracking of all configuration modifications
- **Validation Status**: Real-time validation results with color-coded indicators
- **Performance Metrics**: System performance monitoring and alerts
- **Change History**: Timeline view of all configuration changes

### Interactive Visualizations
- **Trend Charts**: Line graphs showing configuration changes over time
- **Impact Analysis**: Bar charts displaying change impact severity  
- **Validation Status**: Pie charts showing pass/fail distribution
- **Performance Metrics**: Gauge charts for system performance indicators

### Data Management
- **Multi-source Integration**: Supports multiple configuration sources
- **Change Detection**: Automatic detection of configuration modifications
- **Data Validation**: Real-time validation with immediate feedback
- **Historical Analysis**: Trend analysis and pattern recognition

## Dashboard Interface

### Navigation Tabs

#### Scoring Configuration
- Monitor scoring system settings
- Track point values for different bubble types
- Visualize score balance changes
- Validate scoring algorithms

#### Bubble Configuration  
- Monitor bubble behavior settings
- Track health, size, and special properties
- Visualize bubble type distributions
- Validate bubble mechanics

#### Stage Configuration
- Monitor level difficulty settings  
- Track progression and balancing
- Visualize difficulty curves
- Validate stage transitions

#### Performance Configuration
- Monitor system performance settings
- Track FPS targets and quality levels
- Visualize performance metrics
- Validate performance thresholds

### Chart Types

#### Line Charts
- Configuration value trends over time
- Performance metrics historical data
- Validation score progression
- User engagement metrics

#### Bar Charts
- Configuration change impact analysis
- Validation results by category
- Performance comparison across versions
- Error frequency distribution

#### Pie Charts
- Validation status distribution
- Configuration category breakdown
- Error type classification
- System resource utilization

#### Gauge Charts
- Real-time performance metrics
- System health indicators
- Validation score displays
- Resource utilization levels

## Data Sources

### Configuration Files
```javascript
// Monitored configuration files
const configSources = [
  'src/config/GameBalance.js',
  'src/config/PerformanceConfig.js', 
  'src/config/StageConfig.js',
  'src/config/BubbleConfig.js'
];
```

### External APIs
```javascript
// API endpoints for real-time data
const apiEndpoints = {
  validation: '/api/validation/status',
  performance: '/api/performance/metrics',
  changes: '/api/config/changes',
  history: '/api/config/history'
};
```

### WebSocket Integration
```javascript
// Real-time updates via WebSocket
const wsConnection = new WebSocket('ws://localhost:8080/dashboard');
wsConnection.onmessage = (event) => {
  const update = JSON.parse(event.data);
  dashboard.handleRealTimeUpdate(update);
};
```

## Configuration

### Dashboard Settings
```javascript
// dashboard-config.js
export const dashboardConfig = {
  refreshInterval: 5000,        // 5 seconds
  maxHistoryEntries: 1000,      // Keep last 1000 changes
  chartAnimationDuration: 750,  // Chart transition time
  validationThresholds: {
    critical: 0.95,             // 95% validation pass rate
    warning: 0.85,              // 85% warning threshold
    error: 0.70                 // 70% error threshold
  }
};
```

### Chart Configuration
```javascript
// Chart.js configuration
export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  },
  scales: {
    x: { type: 'time', time: { unit: 'minute' } },
    y: { beginAtZero: true }
  }
};
```

### Validation Rules
```javascript
// Custom validation configuration
export const validationRules = {
  'scoring.bubble.normal': {
    min: 1, max: 100, type: 'integer',
    validation: 'range'
  },
  'performance.targetFPS': {
    min: 30, max: 120, type: 'integer',
    validation: 'performance'
  }
};
```

## API Integration

### REST API Endpoints

#### Configuration Data
```javascript
// GET /api/config/{category}
fetch('/api/config/scoring')
  .then(response => response.json())
  .then(data => dashboard.updateConfigData('scoring', data));
```

#### Validation Results
```javascript  
// GET /api/validation/results
fetch('/api/validation/results')
  .then(response => response.json())
  .then(results => dashboard.updateValidationStatus(results));
```

#### Change History
```javascript
// GET /api/config/history?since={timestamp}
fetch(`/api/config/history?since=${lastUpdate}`)
  .then(response => response.json())
  .then(changes => dashboard.addChangeHistory(changes));
```

### WebSocket Events
```javascript
// Configuration change events
{
  type: 'config-change',
  category: 'scoring',
  field: 'bubble.normal', 
  oldValue: 10,
  newValue: 15,
  timestamp: '2025-01-20T14:30:22Z'
}

// Validation result events  
{
  type: 'validation-result',
  category: 'performance',
  passed: 45,
  failed: 3,
  warnings: 7,
  timestamp: '2025-01-20T14:30:25Z'
}
```

## Customization

### Adding New Charts
```javascript
// Register new chart type
dashboard.visualization.registerChart('custom-metric', {
  type: 'doughnut',
  data: {
    labels: ['Pass', 'Fail', 'Warning'],
    datasets: [{
      data: [85, 10, 5],
      backgroundColor: ['#4CAF50', '#F44336', '#FF9800']
    }]
  },
  options: customChartOptions
});
```

### Custom Data Sources
```javascript
// Add custom data source
dashboard.dataManager.addDataSource('custom-api', {
  url: 'https://api.example.com/config',
  refreshInterval: 10000,
  parser: (data) => ({
    category: 'custom',
    values: data.metrics,
    timestamp: new Date()
  })
});
```

### Validation Rules
```javascript
// Add custom validation
dashboard.validation.addRule('custom-rule', {
  category: 'performance',
  validator: (value, context) => {
    return value > 0 && value < context.maxLimit;
  },
  message: 'Value must be between 0 and maximum limit'
});
```

## Reporting

### Automated Reports
```javascript
// Schedule daily validation report
dashboard.reporting.scheduleReport('daily-validation', {
  type: 'validation-summary',
  schedule: '0 9 * * *', // 9 AM daily
  recipients: ['dev-team@company.com'],
  format: 'html'
});
```

### Export Formats

#### HTML Reports
```javascript
// Generate HTML report
const htmlReport = await dashboard.reporting.generateReport('html', {
  title: 'Configuration Validation Report',
  period: 'last-24-hours',
  includeCharts: true,
  theme: 'professional'
});
```

#### JSON Data Export
```javascript
// Export raw data as JSON
const jsonData = await dashboard.reporting.exportData('json', {
  categories: ['scoring', 'performance'],
  timeRange: { start: startDate, end: endDate },
  includeMetadata: true
});
```

#### CSV Export  
```javascript
// Export for spreadsheet analysis
const csvData = await dashboard.reporting.exportData('csv', {
  format: 'tabular',
  headers: true,
  delimiter: ',',
  encoding: 'utf-8'
});
```

## Performance Optimization

### Caching Strategy
```javascript
// Client-side caching configuration
const cacheConfig = {
  configData: { ttl: 300 },      // 5 minutes
  validationResults: { ttl: 60 }, // 1 minute  
  changeHistory: { ttl: 900 },    // 15 minutes
  charts: { ttl: 1800 }           // 30 minutes
};
```

### Lazy Loading
```javascript
// Load chart libraries on demand
const loadChart = async (chartType) => {
  if (!window.Chart) {
    await import('chart.js');
  }
  if (!chartLibraries[chartType]) {
    await import(`./chart-types/${chartType}.js`);
  }
};
```

### Data Throttling
```javascript
// Throttle high-frequency updates
const throttledUpdate = throttle((data) => {
  dashboard.updateCharts(data);
}, 1000); // Maximum once per second
```

## Monitoring and Alerts

### Health Checks
```javascript
// Dashboard health monitoring
const healthCheck = {
  dataConnectivity: () => testAPIConnection(),
  chartRendering: () => validateChartElements(), 
  memoryUsage: () => performance.memory.usedJSHeapSize,
  errorRate: () => errorCount / totalRequests
};
```

### Alert Configuration
```javascript
// Configure monitoring alerts
const alertConfig = {
  validationFailures: {
    threshold: 10, // failures per hour
    action: 'email-notification'
  },
  apiErrors: {
    threshold: 5,  // errors per minute
    action: 'slack-notification' 
  },
  performanceDegradation: {
    threshold: 2000, // 2 second response time
    action: 'dashboard-warning'
  }
};
```

## Troubleshooting

### Common Issues

#### Charts Not Displaying
```javascript
// Debug chart rendering
console.log('Chart.js loaded:', typeof Chart !== 'undefined');
console.log('Canvas context:', document.getElementById('chart').getContext('2d'));

// Check data format
console.log('Chart data:', dashboard.visualization.getChartData('scoring'));
```

#### Data Not Updating
```javascript
// Verify API connections
fetch('/api/config/scoring')
  .then(response => {
    console.log('API Status:', response.status);
    return response.json();
  })
  .catch(error => console.error('API Error:', error));

// Check WebSocket connection
console.log('WebSocket State:', websocket.readyState);
```

#### Performance Issues
```javascript
// Monitor memory usage
setInterval(() => {
  if (performance.memory) {
    console.log('Memory Usage:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576)
    });
  }
}, 5000);
```

### Log Analysis
```javascript
// Dashboard logging configuration
const logger = {
  level: 'info',
  outputs: ['console', 'local-storage'],
  maxLogs: 1000,
  categories: {
    'data-fetch': 'debug',
    'chart-render': 'info', 
    'validation': 'warn',
    'errors': 'error'
  }
};
```

## Browser Support

### Minimum Requirements
- Chrome 60+ (recommended)
- Firefox 55+
- Safari 12+
- Edge 79+

### Feature Detection
```javascript
// Check for required features
const isSupported = () => {
  return (
    window.fetch &&              // Fetch API
    window.WebSocket &&          // WebSocket support
    window.CanvasRenderingContext2D && // Canvas support
    window.localStorage &&       // Local storage
    CSS.supports('display', 'grid') // CSS Grid
  );
};
```

## Version History

- **v1.3.0** (Phase F.4): Main Controller Pattern implementation, enhanced architecture
- **v1.2.0**: Real-time WebSocket integration, performance optimizations  
- **v1.1.0**: Advanced reporting and export capabilities
- **v1.0.0**: Initial dashboard with basic monitoring
- **v0.9.0**: Chart.js integration and interactive visualizations
- **v0.8.0**: API integration and data management

## Contributing

### Development Environment
```bash
cd tools/dashboard
npm install
npm run dev
```

### Adding New Features
1. Follow Main Controller Pattern architecture
2. Add appropriate sub-component in `/components/` directory
3. Update main controller delegation methods
4. Add comprehensive unit and integration tests
5. Update documentation and examples

### Testing
```bash
# Unit tests for sub-components
npm run test:unit

# Integration tests for dashboard
npm run test:integration

# Browser compatibility tests
npm run test:browser

# Performance tests
npm run test:performance
```