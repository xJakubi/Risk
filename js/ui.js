/**
 * Adds a multiplayer button to the game UI
 * @param {RiskGame} game - The game instance
 * @param {RiskMultiplayer} multiplayer - The multiplayer instance
 */
function addMultiplayerButton(game, multiplayer) {
    // Create the multiplayer button
    const multiplayerBtn = document.createElement('button');
    multiplayerBtn.id = 'multiplayer-btn';
    multiplayerBtn.className = 'control-btn';
    multiplayerBtn.textContent = 'Play Online';
    
    // Add button to control panel
    const controlPanel = document.querySelector('.control-panel');
    if (controlPanel) {
        // Insert after the new game button
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            controlPanel.insertBefore(multiplayerBtn, newGameBtn.nextSibling);
        } else {
            controlPanel.appendChild(multiplayerBtn);
        }
    } else {
        // Create a control panel if it doesn't exist
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';
        controlPanel.appendChild(multiplayerBtn);
        document.body.appendChild(controlPanel);
    }
    
    // Add event listener for multiplayer button
    multiplayerBtn.addEventListener('click', async () => {
        try {
            // Initialize multiplayer
            await multiplayer.initialize(game);
            
            // Set callbacks
            multiplayer.onGameStart = (players) => {
                console.log('Multiplayer game started with players:', players);
            };
            
            multiplayer.onPlayerJoin = (players) => {
                console.log('Player joined, current players:', players);
            };
            
            multiplayer.onPlayerLeave = (players) => {
                console.log('Player left, current players:', players);
            };
            
            multiplayer.onGameStateUpdate = (gameState) => {
                console.log('Game state updated:', gameState);
            };
            
            // Patch the game's endTurn method to sync game state
            multiplayer.modifyGameEndTurn();
        } catch (error) {
            console.error('Failed to initialize multiplayer:', error);
            alert('Failed to initialize multiplayer. Please try again.');
        }
    });
    
    // Add multiplayer button styles
    const style = document.createElement('style');
    style.textContent = `
        #multiplayer-btn {
            background-color: #3498db;
            color: white;
        }
        
        #multiplayer-btn:hover {
            background-color: #2980b9;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);
}
