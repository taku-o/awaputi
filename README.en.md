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
*   **Diverse Bubble Types:** Over 10 types of bubbles, from regular bubbles to those with special effects
*   **Strategic Gameplay:** Deep game mechanics where time and HP management are crucial
*   **Rich Stages:** 10 different stages from tutorial to advanced levels
*   **Persistent Progress System:** Collect AP and TAP to purchase items and advance your game
*   **Accessibility Support:** Designed for everyone to enjoy, with keyboard controls and multi-language support

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

## System Requirements

*   **Recommended Browsers:**
    *   Google Chrome (latest version)
    *   Mozilla Firefox (latest version)
    *   Safari (latest version)
    *   Microsoft Edge (latest version)

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

## Language Versions

- [日本語版 README](./README.md)
- [English README](./README.en.md)