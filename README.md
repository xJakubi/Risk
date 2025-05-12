.github/
    copilot-instructions.md
    workflows/
        azure-static-web-apps.yml

This repository contains a Risk board game implementation with the following features:
- Extended map with more territories than traditional Risk
- Interactive gameplay with fancy dice animations
- Mission system with 50 different missions to choose from
- Ability for the defender to roll their own dice
- Support for both human and AI players
- Online multiplayer functionality
- Deployment to Azure Static Web Apps

## Getting Started
1. Clone the repository
2. Open index.html in your browser
3. Click "New Game" to start a local game, or "Play Online" to play with friends

## Online Multiplayer
The game supports online multiplayer using Firebase:
1. Click the "Play Online" button
2. Enter your name
3. Choose to create a new game or join an existing one
4. Share the game code with friends to let them join
5. Start the game when everyone is ready

## Deployment
The game is automatically deployed to Azure Static Web Apps when changes are pushed to the main branch.

## Development
- `index.html` - Main game page
- `css/` - Stylesheets for the game
- `js/` - JavaScript files for game logic
- `assets/` - Images and sounds

## Game Rules
The game follows standard Risk rules with the addition of missions:
1. Each player chooses a mission at the start of the game
2. Players take turns placing armies, attacking, and fortifying
3. The game ends when a player completes their mission or eliminates all other players
