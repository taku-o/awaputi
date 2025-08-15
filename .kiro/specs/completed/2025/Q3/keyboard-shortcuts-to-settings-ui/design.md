# Design Document

## Overview

This design document outlines the approach for removing specific keyboard shortcuts and moving their functionality to the settings screen UI as specified in GitHub issue #170. The implementation will provide clear, accessible UI controls for features that were previously only available through keyboard shortcuts, making the game more user-friendly for casual players.

## Architecture

### Current System Analysis

The current keyboard shortcut system is implemented in `src/core/KeyboardShortcutManager.js` with the following shortcuts to be moved:

**Basic Game Operations:**
- F key: Fullscreen toggle (`handleFullscreen()`)
- M key: Audio mute toggle (`handleMute()`)

**Volume Control:**
- Ctrl+↑: Volume up (`handleVolumeUp()`)
- Ctrl+↓: Volume down (`handleVolumeDown()`)

**Accessibility Features:**
- Ctrl+Alt+H: High contrast toggle (`handleHighContrast()`)
- Ctrl+Alt+T: Large text toggle (`handleLargeText()`)
- Ctrl+Alt+M: Reduced motion toggle (`handleReducedMotion()`)

**Settings Management:**
- Ctrl+P: Profile switching (`showAccessibilityProfiles()`)
- Ctrl+E: Settings export (`exportAccessibilitySettings()`)
- Ctrl+I: Settings import (`importAccessibilitySettings()`)

### Target Architecture

The new architecture will move these functionalities to the settings screen UI while maintaining the same underlying functionality:

```
Settings Screen UI
├── General Category
│   ├── Fullscreen Toggle Button
│   ├── Audio Mute Toggle Button
│   ├── Volume Up Button
│   └── Volume Down Button
└── Accessibility Category
    ├── High Contrast Toggle Button
    ├── Large Text Toggle Button
    ├── Reduced Motion Toggle Button
    ├── Profile Switching Control
    ├── Export Settings Button
    └── Import Settings Button
```

## Components and Interfaces

### Modified Components

#### 1. CoreKeyboardShortcutManager (`src/core/KeyboardShortcutManager.js`)

**Shortcuts to Remove:**
```javascript
// Remove these shortcut registrations from initializeDefaultShortcuts()
this.addShortcut('fullscreen', ['KeyF'], () => this.handleFullscreen());
this.addShortcut('mute', ['KeyM'], () => this.handleMute());
this.addShortcut('volumeUp', ['ArrowUp+ControlLeft'], () => this.handleVolumeUp());
this.addShortcut('volumeDown', ['ArrowDown+ControlLeft'], () => this.handleVolumeDown());
this.addShortcut('highContrast', ['ControlLeft+AltLeft+KeyH'], () => this.handleHighContrast());
this.addShortcut('largeText', ['ControlLeft+AltLeft+KeyT'], () => this.handleLargeText());
this.addShortcut('reducedMotion', ['ControlLeft+AltLeft+KeyM'], () => this.handleReducedMotion());
```

**Methods to Remove:**
```javascript
handleFullscreen()
handleMute()
handleVolumeUp()
handleVolumeDown()
handleHighContrast()
handleLargeText()
handleReducedMotion()
```

**Note:** The underlying functionality will be preserved by moving the logic to the settings screen components.

#### 2. SettingsScene (`src/scenes/SettingsScene.js`)

**New UI Elements to Add:**

**General Settings Category:**
```javascript
// Add to settingItems.general array
{ key: 'ui.fullscreen', label: 'フルスクリーン', type: 'toggle', description: 'フルスクリーンモードのオン/オフを切り替えます' },
{ key: 'audio.muted', label: '音声ミュート', type: 'toggle', description: '全ての音声のミュート/ミュート解除を切り替えます' },
{ key: 'audio.volumeControls', label: '音量調整', type: 'custom', description: '音量を上げる/下げるボタン' }
```

**Accessibility Settings Category:**
```javascript
// Add to settingItems.accessibility array (if not already present)
{ key: 'accessibility.profileSwitching', label: 'プロファイル切り替え', type: 'custom', description: 'デフォルト、高コントラスト、運動機能配慮の3つのプロファイル' },
{ key: 'accessibility.exportSettings', label: '設定エクスポート', type: 'button', description: 'アクセシビリティ設定をJSON形式でエクスポート' },
{ key: 'accessibility.importSettings', label: '設定インポート', type: 'button', description: '以前エクスポートした設定をインポート' }
```

#### 3. New UI Components

**VolumeControlComponent:**
```javascript
class VolumeControlComponent {
    constructor(settingsManager, audioManager) {
        this.settingsManager = settingsManager;
        this.audioManager = audioManager;
    }
    
    render(context, x, y, width) {
        // Render volume up/down buttons
        // Show current volume level
        // Handle button clicks
    }
    
    handleVolumeUp() {
        // Move logic from KeyboardShortcutManager.handleVolumeUp()
    }
    
    handleVolumeDown() {
        // Move logic from KeyboardShortcutManager.handleVolumeDown()
    }
}
```

**AccessibilityProfileComponent:**
```javascript
class AccessibilityProfileComponent {
    constructor(accessibilitySettingsManager) {
        this.accessibilitySettingsManager = accessibilitySettingsManager;
        this.profiles = ['default', 'highContrast', 'motorAccessibility'];
    }
    
    render(context, x, y, width) {
        // Render profile selection buttons/dropdown
        // Show current active profile
    }
    
    switchProfile(profileName) {
        // Move logic from SettingsScene.showAccessibilityProfiles()
    }
}
```

**SettingsImportExportComponent:**
```javascript
class SettingsImportExportComponent {
    constructor(accessibilitySettingsManager) {
        this.accessibilitySettingsManager = accessibilitySettingsManager;
    }
    
    render(context, x, y, width) {
        // Render export/import buttons
    }
    
    exportSettings() {
        // Move logic from SettingsScene.exportAccessibilitySettings()
    }
    
    importSettings() {
        // Move logic from SettingsScene.importAccessibilitySettings()
    }
}
```

### Interface Changes

#### SettingsScene Interface Extensions

**New Methods:**
```javascript
// Fullscreen control
handleFullscreenToggle(): void

// Audio control
handleMuteToggle(): void
handleVolumeUp(): void
handleVolumeDown(): void

// Accessibility control
handleHighContrastToggle(): void
handleLargeTextToggle(): void
handleReducedMotionToggle(): void
handleProfileSwitch(profileName: string): void
handleSettingsExport(): void
handleSettingsImport(): void

// Custom rendering for new UI elements
renderVolumeControls(context, x, y, width): void
renderAccessibilityProfiles(context, x, y, width): void
renderSettingsImportExport(context, x, y, width): void
```

## Data Models

### Settings Data Model Extensions

**New Settings Keys:**
```javascript
// UI settings
'ui.fullscreen': boolean

// Audio settings (if not already present)
'audio.muted': boolean

// Accessibility settings (ensure these exist)
'accessibility.highContrast': boolean
'accessibility.largeText': boolean
'accessibility.reducedMotion': boolean
'accessibility.currentProfile': string
```

### UI State Model

**SettingsScene State Extensions:**
```javascript
{
    // Existing state...
    
    // New UI state
    volumeControlsState: {
        currentVolume: number,
        canVolumeUp: boolean,
        canVolumeDown: boolean
    },
    
    accessibilityProfileState: {
        currentProfile: string,
        availableProfiles: string[]
    },
    
    importExportState: {
        isExporting: boolean,
        isImporting: boolean,
        lastExportTime: Date,
        lastImportTime: Date
    }
}
```

## Error Handling

### UI Error Handling

**Fullscreen Errors:**
```javascript
handleFullscreenToggle() {
    try {
        if (this.gameEngine.responsiveCanvasManager) {
            this.gameEngine.responsiveCanvasManager.toggleFullscreen();
        } else {
            throw new Error('ResponsiveCanvasManager not available');
        }
    } catch (error) {
        console.error('Fullscreen toggle failed:', error);
        // Show user-friendly error message
        this.showErrorMessage('フルスクリーンの切り替えに失敗しました');
    }
}
```

**Volume Control Errors:**
```javascript
handleVolumeUp() {
    try {
        const current = this.gameEngine.settingsManager.get('masterVolume');
        const newVolume = Math.min(1, current + 0.1);
        this.gameEngine.settingsManager.set('masterVolume', newVolume);
        this.updateVolumeControlsState();
    } catch (error) {
        console.error('Volume up failed:', error);
        this.showErrorMessage('音量の調整に失敗しました');
    }
}
```

**Settings Import/Export Errors:**
```javascript
handleSettingsExport() {
    try {
        const settings = this.accessibilitySettingsManager.exportSettings();
        this.downloadSettingsFile(settings);
    } catch (error) {
        console.error('Settings export failed:', error);
        this.showErrorMessage('設定のエクスポートに失敗しました');
    }
}

handleSettingsImport() {
    try {
        // File selection and import logic
        this.accessibilitySettingsManager.importSettings(fileData);
    } catch (error) {
        console.error('Settings import failed:', error);
        this.showErrorMessage('設定のインポートに失敗しました');
    }
}
```

### Graceful Degradation

**Missing Dependencies:**
- If AudioManager is not available, disable audio-related controls
- If ResponsiveCanvasManager is not available, disable fullscreen control
- If AccessibilitySettingsManager is not available, disable accessibility controls

## Testing Strategy

### Unit Tests

**Settings UI Component Tests:**
```javascript
describe('Settings UI Components', () => {
    describe('VolumeControlComponent', () => {
        it('should increase volume when volume up button is clicked', () => {
            // Test volume up functionality
        });
        
        it('should decrease volume when volume down button is clicked', () => {
            // Test volume down functionality
        });
        
        it('should disable volume up button when at maximum volume', () => {
            // Test button state management
        });
    });
    
    describe('AccessibilityProfileComponent', () => {
        it('should switch profiles when profile button is clicked', () => {
            // Test profile switching
        });
        
        it('should show current active profile', () => {
            // Test profile display
        });
    });
});
```

**Keyboard Shortcut Removal Tests:**
```javascript
describe('Keyboard Shortcut Removal', () => {
    it('should not respond to F key press', () => {
        // Test F key has no effect
    });
    
    it('should not respond to M key press', () => {
        // Test M key has no effect
    });
    
    it('should not respond to Ctrl+Up/Down key press', () => {
        // Test volume shortcuts have no effect
    });
    
    it('should not respond to accessibility shortcut key presses', () => {
        // Test accessibility shortcuts have no effect
    });
});
```

### Integration Tests

**Settings Screen Integration:**
```javascript
describe('Settings Screen Integration', () => {
    it('should display all new UI controls in correct categories', () => {
        // Test UI element presence and placement
    });
    
    it('should maintain settings persistence when using UI controls', () => {
        // Test settings save/load functionality
    });
    
    it('should update UI state when settings change', () => {
        // Test UI reactivity to settings changes
    });
});
```

### Browser Tests (Playwright)

**End-to-End UI Tests:**
```javascript
describe('Settings UI E2E Tests', () => {
    it('should toggle fullscreen when fullscreen button is clicked', async () => {
        // Navigate to settings
        // Click fullscreen toggle
        // Verify fullscreen state change
    });
    
    it('should adjust volume when volume buttons are clicked', async () => {
        // Navigate to settings
        // Click volume up/down buttons
        // Verify volume changes
    });
    
    it('should export/import settings successfully', async () => {
        // Navigate to accessibility settings
        // Click export button
        // Verify file download
        // Click import button
        // Verify settings applied
    });
});
```

## Implementation Phases

### Phase 1: UI Component Development
1. Create VolumeControlComponent
2. Create AccessibilityProfileComponent  
3. Create SettingsImportExportComponent
4. Add new setting items to SettingsScene

### Phase 2: Functionality Migration
1. Move keyboard shortcut logic to UI components
2. Update SettingsScene to handle new UI interactions
3. Implement custom rendering for new components
4. Add error handling and user feedback

### Phase 3: Keyboard Shortcut Removal
1. Remove shortcut registrations from KeyboardShortcutManager
2. Remove handler methods from KeyboardShortcutManager
3. Clean up any references to removed shortcuts
4. Update help text generation

### Phase 4: Documentation and Testing
1. Update keyboard shortcuts documentation
2. Create comprehensive test suite
3. Perform manual testing and validation
4. Update any inline help or tooltips

## Success Criteria

### Functional Success
1. All removed keyboard shortcuts have no effect when pressed
2. All functionality is accessible through settings screen UI
3. Settings persistence works correctly with new UI controls
4. No regression in existing settings functionality

### User Experience Success
1. New UI controls are intuitive and clearly labeled
2. Settings are organized logically in appropriate categories
3. Visual feedback is provided for all user actions
4. Error messages are user-friendly and helpful

### Technical Success
1. Code is clean and follows existing patterns
2. No dead code remains from removed shortcuts
3. All tests pass and coverage is maintained
4. Documentation accurately reflects current functionality

## Risk Mitigation

### Potential Risks

1. **UI Complexity**: Adding many new controls might clutter the settings screen
   - Mitigation: Organize controls logically in categories, use clear labeling

2. **Functionality Loss**: Users might not find moved functionality
   - Mitigation: Update documentation, provide clear UI labels and descriptions

3. **Performance Impact**: Additional UI rendering might affect performance
   - Mitigation: Optimize rendering, use efficient UI patterns

4. **Accessibility Concerns**: New UI might not be as accessible as keyboard shortcuts
   - Mitigation: Ensure all UI controls are keyboard navigable and screen reader friendly

### Rollback Plan

If critical issues are discovered:
1. Restore keyboard shortcut registrations
2. Revert SettingsScene changes
3. Restore original documentation
4. Deploy rollback version with full testing