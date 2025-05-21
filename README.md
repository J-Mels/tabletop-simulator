# Tabletop Simulator

A lightweight, desktop-based tabletop simulator built with Electron and React, designed to bring the tabletop gaming experience to your computer. This app allows users to load custom board images, place and manipulate tokens, draw on the board, measure distances with a ruler, and save/load game states for seamless gameplay.

See the Roadmap section at the end of this document for a list of planned features.

## Features

- **_Custom Boards_**: Load any image as your game board.

- **_Token Management_**: Add, move, resize, duplicate, and delete tokens with ease. Tokens automatically receive labels when multiple instances of the same image are added.

- **_Drawing Tools_**: Draw on the board with multiple colors and erase as needed.

- **_Ruler Tool_**: Measure distances on the board with a simple drag-and-drop ruler.

- **_Save/Load Games_**: Save your game state to a JSON file and load it later to resume where you left off.

- **_Reset Board_**: Clear the board, tokens, and drawings with a single click.

- **_Cross-Platform_**: Built with Electron, the app can be packaged for Windows, macOS, and Linux.

## Screenshots

(TODO: Add screenshots of the app in action, such as the main interface, a board with tokens, and the drawing/ruler tools.)

## Installation

### Prerequisites

Node.js (version 22 or higher)

npm (comes with Node.js)

### Steps

- **_Clone the repository_**: git clone https://github.com/J-Mels/tabletop-simulator.git
  cd tabletop-simulator

- **_Install dependencies_**: npm install

- **_Run the app in development mode_**: npm run dev

- **_Packaged Version (Coming Soon)_**:
  A pre-built installer for Windows, macOS, and Linux will be available in the Releases section. This will allow you to run the app without setting up a development environment.

## Usage

- **_Launch the App_**: Start the app using npm run dev (or use the packaged installer once available).

- **_Choose a Board_**: Click "Choose Board" to load a custom board image (supports .jpg, .png, .gif, .webp, .bmp).

- **_Add Tokens_**: Click "Choose Tokens" to add one or more token images. Drag to move, right-click for options like resize, duplicate, or delete.

- **_Use Tools_**:

  - Ruler (📐): Click the ruler icon to measure distances on the board.

  - Draw (✏️): Select the draw tool, choose a color, and draw on the board.

  - Erase (🖌️): Use the erase tool to remove drawings or clear all drawings.

- **_Save/Load Game_**: Use the "Save Game" button to save your current state to a .json file, and "Load Game" to restore a previous state.

- **_Reset Board_**: Click "Reset Board" to clear everything and start fresh.

## Project Structure

**_main.cjs_**: The Electron main process script, handling window creation and file system interactions.

**_preload.js_**: Exposes safe APIs to the renderer process for file operations.

**_src/App.jsx_**: The main React component, containing the app's logic and UI.

**_src/App.css_**: Styles for the app.

## License

This project is licensed under the MIT License.

## Contact

For questions or suggestions, feel free to open an issue on GitHub. Feedback and constructive criticism are much appreciated!

## Roadmap

- Deployment

  - Add support for pre-built installers in the GitHub Releases section.
  - Implement auto-update functionality using electron-updater.

- App Features

  - Add more drawing tools (e.g., shapes, additional colors).
  - Support for undo/redo actions.
  - Enhance token management with custom labels and rotation.

- Styling / UI / UX
  - When in ruler, draw and erase modes, replace default cursor on canvas with a custom icon.
  - Add better support for a range of viewport widths. As of now the app UI is only optimized for larger screens.
