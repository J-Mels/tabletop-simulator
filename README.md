# Tabletop Simulator

A lightweight, desktop-based tabletop simulator built with Electron and React, designed to bring the tabletop gaming experience to your computer. This app allows users to load custom board images, place and manipulate tokens, draw on the board, measure distances with a ruler, and save/load game states for seamless gameplay.

## Features

Custom Boards: Load any image as your game board.
Token Management: Add, move, resize, duplicate, and delete tokens with ease. Tokens automatically receive labels when multiple instances of the same image are added.
Drawing Tools: Draw on the board with multiple colors and erase as needed.
Ruler Tool: Measure distances on the board with a simple drag-and-drop ruler.
Save/Load Games: Save your game state to a JSON file and load it later to resume where you left off.
Reset Board: Clear the board, tokens, and drawings with a single click.
Cross-Platform: Built with Electron, the app can be packaged for Windows, macOS, and Linux.

## Screenshots

(TODO: Add screenshots of the app in action, such as the main interface, a board with tokens, and the drawing/ruler tools.)

## Installation

### Prerequisites

Node.js (version 16 or higher)
npm (comes with Node.js)

### Steps

Clone the repository: git clone https://github.com/your-username/tabletop-simulator.git
cd tabletop-simulator

Install dependencies: npm install

Run the app in development mode: npm run dev

Packaged Version (Coming Soon)
A pre-built installer for Windows, macOS, and Linux will be available in the Releases section. This will allow you to run the app without setting up a development environment.

## Usage

Launch the App: Start the app using npm run dev (or use the packaged installer once available).

Choose a Board: Click "Choose Board" to load a custom board image (supports .jpg, .png, .gif, .webp, .bmp).

Add Tokens: Click "Choose Tokens" to add one or more token images. Drag to move, right-click for options like resize, duplicate, or delete.

Use Tools:
Ruler (📐): Click the ruler icon to measure distances on the board.
Draw (✏️): Select the draw tool, choose a color, and draw on the board.
Erase (🖌️): Use the erase tool to remove drawings or clear all drawings.

Save/Load Game: Use the "Save Game" button to save your current state to a .json file, and "Load Game" to restore a previous state.

Reset Board: Click "Reset Board" to clear everything and start fresh.

## Project Structure

main.cjs: The Electron main process script, handling window creation and file system interactions.
preload.js: Exposes safe APIs to the renderer process for file operations.
src/App.jsx: The main React component, containing the app's logic and UI.
src/App.css: Styles for the app.

Roadmap

Add support for pre-built installers in the GitHub Releases section.
Implement auto-update functionality using electron-updater.
Add more drawing tools (e.g., shapes, additional colors).
Support for undo/redo actions.
Enhance token management with custom labels and rotation.

## License

This project is licensed under the MIT License.

## Contact

For questions or suggestions, feel free to open an issue on GitHub. Feedback and constructive criticism would be much appreciated!
