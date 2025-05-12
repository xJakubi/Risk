/**
 * Main script for Risk game
 * Initializes the game and handles global events
 */

// Initialize the game when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create the game instance
    const game = new RiskGame();
    
    // Create the multiplayer instance
    const multiplayer = new RiskMultiplayer();
    
    // Add multiplayer button to the UI
    addMultiplayerButton(game, multiplayer);
    
    // Add global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to end turn when it's enabled
        if (e.code === 'Space' && !game.endTurnBtn.disabled) {
            game.endTurn();
        }
        
        // 'N' to start a new game
        if (e.code === 'KeyN') {
            game.startNewGame();
        }
    });
    
    // Add explanation for game controls
    addGameInstructions();
});

// Add game instructions to the page
function addGameInstructions() {
    // Create instructions element
    const instructions = document.createElement('div');
    instructions.className = 'game-instructions';
    instructions.innerHTML = `
        <h2>How to Play</h2>
        <p><strong>Setup Phase:</strong> Place your initial armies on your territories.</p>
        <p><strong>Reinforcement Phase:</strong> Add new armies to your territories based on territory count and continent bonuses.</p>
        <p><strong>Attack Phase:</strong> Attack enemy territories from your own territories that have at least 2 armies.</p>
        <p><strong>Fortify Phase:</strong> Move armies between adjacent territories that you control.</p>
        
        <h3>Keyboard Shortcuts</h3>
        <p><strong>Space:</strong> End your turn or phase</p>
        <p><strong>N:</strong> Start a new game</p>
        
        <h3>Missions</h3>
        <p>Each player gets a secret mission. Complete your mission to win the game!</p>
        
        <button id="close-instructions" class="control-btn">Close</button>
    `;
    
    // Add to page
    document.body.appendChild(instructions);
    
    // Add close button functionality
    document.getElementById('close-instructions').addEventListener('click', () => {
        instructions.style.display = 'none';
    });
    
    // Add button to show instructions
    const showInstructionsBtn = document.createElement('button');
    showInstructionsBtn.className = 'control-btn';
    showInstructionsBtn.textContent = 'Game Instructions';
    showInstructionsBtn.style.position = 'absolute';
    showInstructionsBtn.style.top = '10px';
    showInstructionsBtn.style.right = '10px';
    showInstructionsBtn.addEventListener('click', () => {
        instructions.style.display = 'block';
    });
    
    document.body.appendChild(showInstructionsBtn);
    
    // Style the instructions
    const style = document.createElement('style');
    style.textContent = `
        .game-instructions {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 1000;
        }
        
        .game-instructions h2 {
            text-align: center;
            margin-top: 0;
        }
        
        .game-instructions h3 {
            margin-top: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .game-instructions p {
            margin: 10px 0;
        }
        
        .game-instructions button {
            display: block;
            margin: 20px auto 0;
        }
    `;
    
    document.head.appendChild(style);
}
