# Bubble Pop Web Game

**Welcome to the simple yet deep world of Bubble Pop Game!**

## Game Overview

An action game where you click and tap various types of bubbles that appear on the screen to earn points. Bubbles grow over time, and if left alone, they will burst and cause damage. Some bubbles have special effects, requiring strategic gameplay. Aim for the highest score possible within the time limit!

## Screenshots

### Main Menu
![Main Menu Screen](./docs/screenshots/main-menu.png)

### Gameplay
![Gameplay Screen](./docs/screenshots/gameplay.png)

### Stage Selection
![Stage Selection Screen](./docs/screenshots/stage-select.png)

### Item Shop
![Item Shop Screen](./docs/screenshots/item-shop.png)

*Note: Screenshots will be added after implementation is complete*

## Key Features

*   **Intuitive Controls:** Simple and easy-to-understand operation by clicking or tapping bubbles
*   **Diverse Bubble Types:** 18+ unique bubble types (Normal, Stone, Diamond, Rainbow, Electric, Boss bubbles, etc.)
*   **Strategic Gameplay:** Deep game mechanics where time and HP management are crucial
*   **Rich Stages:** 10 diverse stages from Tutorial to All-In Awawa challenge
*   **Persistent Progress System:** Collect AP and TAP to purchase items and advance your game
*   **Comprehensive Accessibility:** WCAG 2.1 AA compliant, full screen reader support, complete keyboard navigation
*   **Complete Multilingual Support:** 5 languages supported (Japanese, English, Simplified/Traditional Chinese, Korean) with cultural adaptation
*   **Advanced Performance Optimization:** 60FPS maintenance, memory optimization, mobile support
*   **Comprehensive Statistics & Achievement System:** Detailed play statistics, 30+ achievement types, progress tracking

## How to Play

1.  **Start the Game:** Open `index.html` in your browser to display the main menu.
2.  **User Registration:** Register your username when starting for the first time.
3.  **Select Stage:** Choose the stage you want to challenge from the "Stage Select" screen.
4.  **Pop Bubbles:**
    *   Click or tap bubbles that appear on the screen to pop them.
    *   Hard bubbles require multiple clicks.
    *   You can also drag bubbles to move them.
5.  **Special Bubble Effects:**
    *   Pink bubbles: HP recovery
    *   Poison bubbles: Take damage
    *   Rainbow bubbles: Activate bonus time
    *   Clock bubbles: Time stop effect
6.  **Game Over:** The game ends when HP reaches 0 or the time limit expires.
7.  **Progress System:** Earned scores are converted to AP, which can be used to purchase enhancement items in the item shop.

### Keyboard Controls

In addition to mouse and touch controls, you can comfortably operate the game with keyboard:

*   **Basic Controls:** ↑↓ for menu selection, Enter to confirm, Escape to go back
*   **During Game:** Space to pause, M to mute, F for fullscreen
*   **Accessibility:** Ctrl+Alt+H for high contrast toggle, etc.

For details, see **[Keyboard Shortcuts Reference](docs/keyboard-shortcuts.en.md)**.

## System Requirements

*   **Recommended Browsers:**
    *   Google Chrome (latest version)
    *   Mozilla Firefox (latest version)
    *   Safari (latest version)
    *   Microsoft Edge (latest version)

*   **Supported Languages:**
    *   🇯🇵 日本語 (Japanese) - Full support
    *   🇺🇸 English - Full support
    *   🇨🇳 中文简体 (Simplified Chinese) - Implemented, translation in progress
    *   🇹🇼 中文繁體 (Traditional Chinese) - Implemented, translation in progress
    *   🇰🇷 한국어 (Korean) - Implemented, translation in progress

*   **Accessibility Features:**
    *   WCAG 2.1 AA compliant
    *   Full screen reader support
    *   Complete keyboard navigation
    *   High contrast & large text support
    *   Color blindness support

## Installation & Setup

### For Players
Simply open `index.html` in your web browser. No installation required!

### For Developers
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Development

### Project Structure
```
├── src/                 # Source code
│   ├── core/           # Core game engine
│   ├── scenes/         # Game scenes
│   ├── bubbles/        # Bubble types
│   ├── managers/       # Game managers
│   └── utils/          # Utility functions
├── docs/               # Documentation
├── tests/              # Test files
└── dist/               # Built files
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run linter

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who helped make this game possible
- Special thanks to the open-source community for the tools and libraries used

---

Enjoy the game!

## Internationalization & Localization

This game features a comprehensive multilingual support system:

### Supported Languages
- 🇯🇵 [日本語版 README](./README.md)
- 🇺🇸 [English README](./README.en.md)
- 🇨🇳 [中文简体 README](./README.zh-CN.md)
- 🇹🇼 [中文繁體 README](./README.zh-TW.md)
- 🇰🇷 [한국어 README](./README.ko.md)

### Multilingual Features
- **Dynamic Language Switching:** Change language instantly during gameplay
- **Cultural Adaptation:** Number and date formatting adapted to each language/region
- **Localization Support:** Currency display, time display optimized for each region
- **Accessibility Translation:** Dedicated translations for screen reader support
- **RTL Language Preparation:** Foundation ready for future Arabic/Hebrew support

### Translation Quality Management
- Automated quality checking
- Translation consistency validation
- Cultural appropriateness checking
- Progress tracking system

### Documentation & Guides
- **[Keyboard Shortcuts Reference](docs/keyboard-shortcuts.en.md)** - Complete guide to all keyboard controls

### For Developers
Comprehensive internationalization documentation available:
- [Developer Guide](./docs/i18n-developer-guide.md)
- [Translation Tools Guide](./docs/i18n-translation-tools.md)
- [New Language Addition Guide](./docs/i18n-new-language-guide.md)
- [Troubleshooting Guide](./docs/i18n-troubleshooting-guide.md)
- [API Reference](./docs/i18n-system-api.md)