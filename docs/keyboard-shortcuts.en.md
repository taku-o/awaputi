# Keyboard Shortcuts Reference

Complete guide to keyboard shortcuts available in the Bubble Pop game.

> **🆕 Update**: Issue #163 introduced the Unified Navigation System with enhanced multilingual support and context-aware navigation.

## 📋 Table of Contents

- [Unified Navigation System](#unified-navigation-system)
- [Basic Game Controls](#basic-game-controls)
- [UI & Menu Navigation](#ui--menu-navigation)
- [Help & Settings Access](#help--settings-access)
- [Multilingual Keyboard Support](#multilingual-keyboard-support)
- [Volume Control](#volume-control)
- [Accessibility Features](#accessibility-features)
- [Debug & Developer Tools](#debug--developer-tools)
- [Scene-Specific Controls](#scene-specific-controls)
- [Usage Notes](#usage-notes)

## Unified Navigation System

### 🔄 Context-Aware Navigation
The Unified Navigation System enables seamless access to help and settings from any screen, with intelligent return navigation to the originating screen.

| Feature | Description |
|---------|-------------|
| **NavigationContextManager** | Manages screen transition history and automatically determines appropriate return destinations |
| **Unified Scene Routing** | Consistent access methods for help and settings screens |
| **Multilingual Support** | Keyboard mappings for 6 languages (Japanese, English, German, French, Arabic, Hebrew) |

### 🌐 RTL Language Support  
For Arabic and Hebrew languages, navigation keys are automatically adjusted:
- **← Key**: Moves right (in RTL language environment)
- **→ Key**: Moves left (in RTL language environment)

## Basic Game Controls

| Key | Function | Description |
|-----|----------|-------------|
| **Space** | Pause/Resume Game | Pauses or resumes the game during gameplay |
| **Escape** | Return to Menu/Close Screen | Returns to main menu during game or closes settings screens |
| **F** | Toggle Fullscreen | Toggles fullscreen mode on/off |
| **M** | Toggle Audio Mute | Toggles mute/unmute for all audio |
| **G** | Give Up | Available during gameplay only. Shows confirmation dialog |
| **R** | Restart Game | Available during gameplay only. Shows confirmation dialog |

## UI & Menu Navigation

| Key | Function | Description |
|-----|----------|-------------|
| **↑** | Move Up | Moves selection up in menus or lists |
| **↓** | Move Down | Moves selection down in menus or lists |
| **Enter** | Confirm/Execute | Executes the currently selected item |
| **I** | Open User Info | Opens player statistics screen |

## Help & Settings Access

### 🆕 Unified Access Methods

| Key | Function | Description | Return Behavior |
|-----|----------|-------------|----------------|
| **S** | Open Settings | Opens the unified settings screen | Automatically returns to originating screen |
| **H** | Standard Help | Opens general help and operation guide | Automatically returns to originating screen |
| **F1** | Contextual Help | Opens help specific to current screen | Automatically returns to originating screen |
| **Ctrl+H** | Documentation Help | Opens detailed documentation and API reference | Automatically returns to originating screen |

### 🔄 Navigation Features
- **Any Screen Access**: Available from menu, gameplay, and other settings screens
- **Automatic Return Destination**: Remembers originating screen and returns appropriately
- **Context Information Retention**: Records access method (keyboard, mouse) and source scene

## Multilingual Keyboard Support

### 🌍 Supported Languages and Key Mappings

| Language | Help Key | Settings Key | Notes |
|----------|----------|--------------|-------|
| **Japanese** | H (ヘルプ) | S (設定) | Standard QWERTY layout |
| **English** | H (help) | S (settings) | Standard QWERTY layout |
| **German** | H (hilfe) | E (einstellungen) | Optimized for QWERTZ layout |
| **French** | A (aide) | P (paramètres) | Optimized for AZERTY layout |
| **Arabic** | H (مساعدة) | S (اعدادات) | RTL support, auto-adjusted direction keys |
| **Hebrew** | H (עזרה) | S (הגדרות) | RTL support, auto-adjusted direction keys |

### ⚙️ Automatic Language Detection
- Automatic detection from system language settings
- Integration with LocalizationManager
- Automatic keyboard layout adjustment

### 🌐 RTL Language Support  
For Arabic and Hebrew languages, navigation keys are automatically adjusted:
- **← Key**: Moves right (in RTL language environment)
- **→ Key**: Moves left (in RTL language environment)

## Volume Control

| Key | Function | Description |
|-----|----------|-------------|
| **Ctrl + ↑** | Volume Up | Increases master volume by 10% |
| **Ctrl + ↓** | Volume Down | Decreases master volume by 10% |

## Accessibility Features

### 🆕 Integrated Accessibility Settings
Accessibility features have been integrated into the unified settings screen.

| Key | Function | Description |
|-----|----------|-------------|
| **S → Accessibility** | Unified Settings Screen | Open settings with S key, navigate to accessibility category for comprehensive settings |
| **Ctrl + Alt + H** | Toggle High Contrast | Toggles high contrast mode on/off |
| **Ctrl + Alt + T** | Toggle Large Text | Toggles between large and standard text size |
| **Ctrl + Alt + M** | Toggle Reduced Motion | Toggles between reduced and standard animation effects |

### 🆕 Settings Screen Accessibility Features
| Key | Function | Description |
|-----|----------|-------------|
| **Ctrl + P** | Profile Switching | Switch between Default, High Contrast, and Motor Accessibility profiles |
| **Ctrl + E** | Export Settings | Export accessibility settings in JSON format |
| **Ctrl + I** | Import Settings | Import previously exported settings |

## Debug & Developer Tools

| Key | Function | Description |
|-----|----------|-------------|
| **F12** | Show Debug Info | Outputs debug information to console |
| **Ctrl + Shift + D** | Toggle Debug Mode | Toggles debug mode on/off (requires page reload) |

## Scene-Specific Controls

### Stage Selection Screen

| Key | Function | Description |
|-----|----------|-------------|
| **↑↓** | Navigate Stages | Moves between available stages |
| **Enter** | Select Stage | Starts the game with the selected stage |
| **S** | Open Shop | Navigates to the item shop screen |

### Shop Screen

| Key | Function | Description |
|-----|----------|-------------|
| **↑↓** | Navigate Items | Moves between purchasable items |
| **Enter** | Purchase Item | Purchases the selected item |

### Settings Screen

| Key | Function | Description |
|-----|----------|-------------|
| **↑↓** | Navigate Settings | Moves between setting items |
| **←→** | Switch Categories | Moves between setting categories |
| **Enter** | Modify Setting | Changes the selected setting |

## Usage Notes

### ⚠️ Important Considerations

1. **🆕 Unified Navigation System**
   - **ESC Key**: The unified navigation system automatically returns to the appropriate screen
   - **NavigationContextManager**: Manages screen transition history and detects/prevents circular navigation
   - **Fallback Functionality**: Automatically falls back to legacy methods if unified scene switching fails

2. **Multilingual Support**
   - **Automatic Language Detection**: Detects language from system settings or in-game configuration
   - **RTL Languages**: Arabic and Hebrew automatically adjust direction key behavior
   - **Key Mapping**: Shortcuts optimized for each language's keyboard layout

3. **Username Input Limitations**
   - During username input, some shortcuts (especially the **S** key) may trigger unintended actions
   - Focus on text input and avoid using shortcuts during username entry

4. **Context-Dependent**
   - Some shortcuts are only available in specific screens
   - Available shortcuts differ between gameplay and menu screens

5. **Debug Features**
   - Debug-related shortcuts are only available in development mode
   - Some features may be restricted in production environments

### 💡 Usage Tips

- **🆕 Unified Access**: Use H, S, F1, Ctrl+H keys to access help and settings from any screen
- **🆕 Context Retention**: No matter which screen you open help/settings from, you'll return to the appropriate location
- **Efficient Navigation**: Combine arrow keys with Enter for complete mouse-free operation
- **Accessibility**: Use integrated accessibility settings for comprehensive visual and motor accessibility support
- **Volume Control**: Quickly adjust volume during gameplay with Ctrl+arrow keys
- **🆕 Multilingual**: Shortcuts automatically adjust based on your selected language

## Technical Details

### 🔧 Implementation Architecture
- **NavigationContextManager**: `src/core/navigation/NavigationContextManager.js`
- **KeyboardShortcutRouter**: `src/core/navigation/KeyboardShortcutRouter.js`  
- **CoreKeyboardShortcutManager**: `src/core/KeyboardShortcutManager.js`
- **LanguageSpecificAccessibility**: `src/accessibility/LanguageSpecificAccessibility.js`

### 📊 Statistics
- **Removed Duplicate Code**: 4,330 lines
- **Test Coverage**: 200+ test cases
- **Supported Languages**: 6 languages (multilingual keyboard mappings)
- **Integrated Components**: ContextualHelpSystem, AccessibilitySettingsUI

## Related Documentation

- [Accessibility Guide](accessibility-api-documentation.md)
- [Developer Guide](development-guide.md)
- [Troubleshooting Guide](troubleshooting-guide.md)
- [Issue #163: Duplicate Screen Consolidation Project](../work-progress-issue-163.md)
- [Keyboard Shortcut Implementation Analysis](keyboard-shortcut-mapping-analysis.md)

---

**🎉 Experience more intuitive and consistent keyboard operation with the Unified Navigation System!**

> **Version Information**: This update was implemented through the Unified Navigation System introduced in Issue #163. We removed 4,330 lines of duplicate code to provide a unified user experience.