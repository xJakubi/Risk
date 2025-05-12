/**
 * Multiplayer module for Risk game
 * Handles online multiplayer functionality using Firebase
 */

class RiskMultiplayer {
    constructor() {
        // Firebase configuration
        this.firebaseConfig = {
            apiKey: "AIzaSyDGOvRQe-KY7xO4c-4N20dIVxX_IUqiiDY",
            authDomain: "risk-board-game-online.firebaseapp.com",
            databaseURL: "https://risk-board-game-online-default-rtdb.firebaseio.com",
            projectId: "risk-board-game-online",
            storageBucket: "risk-board-game-online.appspot.com",
            messagingSenderId: "823456789012",
            appId: "1:823456789012:web:abcdef1234567890abcdef"
        };
        
        // Firebase references
        this.db = null;
        this.auth = null;
        this.gamesRef = null;
        this.currentGameRef = null;
        this.currentGameId = null;
        
        // Player info
        this.playerId = null;
        this.playerName = null;
        this.playerColor = null;
        
        // Game info
        this.gameOwner = false;
        this.connectedPlayers = [];
        
        // DOM elements
        this.lobbyModal = document.getElementById('lobby-modal');
        this.gameCodeDisplay = document.getElementById('game-code-display');
        this.playerNameInput = document.getElementById('player-name-input');
        this.createGameBtn = document.getElementById('create-game-btn');
        this.joinGameBtn = document.getElementById('join-game-btn');
        this.gameCodeInput = document.getElementById('game-code-input');
        this.playerListElement = document.getElementById('player-list');
        this.startGameBtn = document.getElementById('start-multiplayer-game-btn');
        
        // Game instance
        this.game = null;
        
        // Event callbacks
        this.onGameStart = null;
        this.onPlayerJoin = null;
        this.onPlayerLeave = null;
        this.onGameStateUpdate = null;
    }
    
    // Initialize Firebase
    async initialize(game) {
        this.game = game;
        
        // Load Firebase scripts
        await this.loadFirebaseScripts();
        
        // Initialize Firebase
        firebase.initializeApp(this.firebaseConfig);
        this.db = firebase.database();
        this.auth = firebase.auth();
        this.gamesRef = this.db.ref('games');
        
        // Set up auth state changed listener
        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.playerId = user.uid;
                console.log('Logged in as:', user.uid);
            } else {
                console.log('Not logged in');
            }
        });
        
        // Sign in anonymously
        await this.auth.signInAnonymously();
        
        // Set up event listeners for lobby controls
        this.setupEventListeners();
        
        // Show the lobby modal
        this.showLobbyModal();
    }
    
    // Load Firebase scripts dynamically
    loadFirebaseScripts() {
        return new Promise((resolve, reject) => {
            // Load Firebase App
            const appScript = document.createElement('script');
            appScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
            appScript.onload = () => {
                // Load Firebase Auth
                const authScript = document.createElement('script');
                authScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js';
                authScript.onload = () => {
                    // Load Firebase Database
                    const dbScript = document.createElement('script');
                    dbScript.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js';
                    dbScript.onload = resolve;
                    dbScript.onerror = reject;
                    document.head.appendChild(dbScript);
                };
                authScript.onerror = reject;
                document.head.appendChild(authScript);
            };
            appScript.onerror = reject;
            document.head.appendChild(appScript);
        });
    }
    
    // Set up event listeners for lobby controls
    setupEventListeners() {
        // Create game button
        this.createGameBtn.addEventListener('click', () => {
            const playerName = this.playerNameInput.value.trim();
            if (playerName) {
                this.playerName = playerName;
                this.createGame();
            } else {
                alert('Please enter your name');
            }
        });
        
        // Join game button
        this.joinGameBtn.addEventListener('click', () => {
            const playerName = this.playerNameInput.value.trim();
            const gameCode = this.gameCodeInput.value.trim();
            
            if (!playerName) {
                alert('Please enter your name');
                return;
            }
            
            if (!gameCode) {
                alert('Please enter a game code');
                return;
            }
            
            this.playerName = playerName;
            this.joinGame(gameCode);
        });
        
        // Start game button
        this.startGameBtn.addEventListener('click', () => {
            if (this.gameOwner) {
                if (this.connectedPlayers.length < 2) {
                    alert('Wait for at least one more player to join');
                    return;
                }
                
                this.startMultiplayerGame();
            }
        });
    }
    
    // Show the lobby modal
    showLobbyModal() {
        // Create the lobby modal if it doesn't exist
        if (!this.lobbyModal) {
            this.createLobbyModal();
        }
        
        this.lobbyModal.style.display = 'flex';
    }
    
    // Create the lobby modal
    createLobbyModal() {
        // Create modal container
        this.lobbyModal = document.createElement('div');
        this.lobbyModal.id = 'lobby-modal';
        this.lobbyModal.className = 'modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content lobby-content';
        
        // Create modal title
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'Risk Online Multiplayer';
        
        // Create player name input
        const nameContainer = document.createElement('div');
        nameContainer.className = 'input-container';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Your Name:';
        nameLabel.setAttribute('for', 'player-name-input');
        
        this.playerNameInput = document.createElement('input');
        this.playerNameInput.type = 'text';
        this.playerNameInput.id = 'player-name-input';
        this.playerNameInput.placeholder = 'Enter your name';
        
        nameContainer.appendChild(nameLabel);
        nameContainer.appendChild(this.playerNameInput);
        
        // Create game creation section
        const createGameSection = document.createElement('div');
        createGameSection.className = 'lobby-section';
        
        const createGameTitle = document.createElement('h3');
        createGameTitle.textContent = 'Create a New Game';
        
        this.createGameBtn = document.createElement('button');
        this.createGameBtn.id = 'create-game-btn';
        this.createGameBtn.className = 'control-btn';
        this.createGameBtn.textContent = 'Create Game';
        
        createGameSection.appendChild(createGameTitle);
        createGameSection.appendChild(this.createGameBtn);
        
        // Create game join section
        const joinGameSection = document.createElement('div');
        joinGameSection.className = 'lobby-section';
        
        const joinGameTitle = document.createElement('h3');
        joinGameTitle.textContent = 'Join an Existing Game';
        
        const codeContainer = document.createElement('div');
        codeContainer.className = 'input-container';
        
        const codeLabel = document.createElement('label');
        codeLabel.textContent = 'Game Code:';
        codeLabel.setAttribute('for', 'game-code-input');
        
        this.gameCodeInput = document.createElement('input');
        this.gameCodeInput.type = 'text';
        this.gameCodeInput.id = 'game-code-input';
        this.gameCodeInput.placeholder = 'Enter game code';
        
        codeContainer.appendChild(codeLabel);
        codeContainer.appendChild(this.gameCodeInput);
        
        this.joinGameBtn = document.createElement('button');
        this.joinGameBtn.id = 'join-game-btn';
        this.joinGameBtn.className = 'control-btn';
        this.joinGameBtn.textContent = 'Join Game';
        
        joinGameSection.appendChild(joinGameTitle);
        joinGameSection.appendChild(codeContainer);
        joinGameSection.appendChild(this.joinGameBtn);
        
        // Create game waiting room (hidden initially)
        const waitingRoom = document.createElement('div');
        waitingRoom.id = 'waiting-room';
        waitingRoom.className = 'lobby-section waiting-room';
        waitingRoom.style.display = 'none';
        
        const waitingRoomTitle = document.createElement('h3');
        waitingRoomTitle.textContent = 'Game Lobby';
        
        const gameCodeContainer = document.createElement('div');
        gameCodeContainer.className = 'game-code-container';
        
        const gameCodeLabel = document.createElement('span');
        gameCodeLabel.textContent = 'Game Code: ';
        
        this.gameCodeDisplay = document.createElement('span');
        this.gameCodeDisplay.id = 'game-code-display';
        this.gameCodeDisplay.className = 'game-code';
        
        gameCodeContainer.appendChild(gameCodeLabel);
        gameCodeContainer.appendChild(this.gameCodeDisplay);
        
        const playersTitle = document.createElement('h4');
        playersTitle.textContent = 'Players:';
        
        this.playerListElement = document.createElement('ul');
        this.playerListElement.id = 'player-list';
        this.playerListElement.className = 'player-list';
        
        this.startGameBtn = document.createElement('button');
        this.startGameBtn.id = 'start-multiplayer-game-btn';
        this.startGameBtn.className = 'control-btn';
        this.startGameBtn.textContent = 'Start Game';
        this.startGameBtn.disabled = true;
        
        waitingRoom.appendChild(waitingRoomTitle);
        waitingRoom.appendChild(gameCodeContainer);
        waitingRoom.appendChild(playersTitle);
        waitingRoom.appendChild(this.playerListElement);
        waitingRoom.appendChild(this.startGameBtn);
        
        // Add all sections to modal content
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(nameContainer);
        modalContent.appendChild(document.createElement('hr'));
        modalContent.appendChild(createGameSection);
        modalContent.appendChild(document.createElement('hr'));
        modalContent.appendChild(joinGameSection);
        modalContent.appendChild(waitingRoom);
        
        // Add content to modal
        this.lobbyModal.appendChild(modalContent);
        
        // Add modal to page
        document.body.appendChild(this.lobbyModal);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .lobby-content {
                max-width: 500px;
            }
            
            .lobby-section {
                margin: 20px 0;
            }
            
            .input-container {
                margin: 15px 0;
                display: flex;
                flex-direction: column;
            }
            
            .input-container label {
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .input-container input {
                padding: 8px;
                border-radius: 4px;
                border: 1px solid #ccc;
                font-size: 16px;
            }
            
            .game-code-container {
                background-color: #f1f1f1;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
                text-align: center;
            }
            
            .game-code {
                font-weight: bold;
                font-size: 1.2em;
                color: #2c3e50;
            }
            
            .player-list {
                list-style-type: none;
                padding: 0;
                margin: 15px 0;
            }
            
            .player-list li {
                padding: 8px;
                margin: 5px 0;
                background-color: #f1f1f1;
                border-radius: 4px;
                display: flex;
                align-items: center;
            }
            
            .player-color {
                display: inline-block;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                margin-right: 10px;
            }
            
            .waiting-room {
                display: none;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Create a new multiplayer game
    async createGame() {
        // Generate a unique game code
        const gameCode = this.generateGameCode();
        this.currentGameId = gameCode;
        
        // Set up the game in Firebase
        this.currentGameRef = this.gamesRef.child(gameCode);
        
        // Initialize game state
        await this.currentGameRef.set({
            status: 'waiting',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            owner: this.playerId,
            players: {},
            gameState: null
        });
        
        // Join the game as the first player
        this.gameOwner = true;
        this.playerColor = CONFIG.playerColors[0]; // First player gets red
        
        await this.currentGameRef.child('players').child(this.playerId).set({
            name: this.playerName,
            color: this.playerColor,
            online: true,
            isReady: true,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Listen for player joins/leaves
        this.listenForPlayerChanges();
        
        // Show waiting room
        this.showWaitingRoom(gameCode);
    }
    
    // Join an existing game
    async joinGame(gameCode) {
        // Check if the game exists
        const gameSnapshot = await this.gamesRef.child(gameCode).once('value');
        const gameData = gameSnapshot.val();
        
        if (!gameData) {
            alert('Game not found. Check the code and try again.');
            return;
        }
        
        if (gameData.status === 'started') {
            alert('This game has already started. Create a new game or join another one.');
            return;
        }
        
        // Set current game reference
        this.currentGameId = gameCode;
        this.currentGameRef = this.gamesRef.child(gameCode);
        
        // Get existing players to determine color
        const playersSnapshot = await this.currentGameRef.child('players').once('value');
        const existingPlayers = playersSnapshot.val() || {};
        const playerCount = Object.keys(existingPlayers).length;
        
        if (playerCount >= CONFIG.maxPlayers) {
            alert('This game is full. Please join another game or create your own.');
            return;
        }
        
        // Assign next available color
        this.playerColor = CONFIG.playerColors[playerCount];
        
        // Join the game
        this.gameOwner = gameData.owner === this.playerId;
        
        await this.currentGameRef.child('players').child(this.playerId).set({
            name: this.playerName,
            color: this.playerColor,
            online: true,
            isReady: true,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Listen for player changes and game start
        this.listenForPlayerChanges();
        this.listenForGameStart();
        
        // Show waiting room
        this.showWaitingRoom(gameCode);
    }
    
    // Listen for player changes (joins/leaves)
    listenForPlayerChanges() {
        this.currentGameRef.child('players').on('value', snapshot => {
            const players = snapshot.val() || {};
            this.connectedPlayers = Object.entries(players).map(([id, data]) => ({
                id,
                ...data
            }));
            
            // Update the player list in UI
            this.updatePlayerList();
            
            // Enable start button if enough players for game owner
            if (this.gameOwner) {
                this.startGameBtn.disabled = this.connectedPlayers.length < 2;
            } else {
                this.startGameBtn.disabled = true;
            }
            
            // Call player join/leave callbacks
            if (this.onPlayerJoin) {
                this.onPlayerJoin(this.connectedPlayers);
            }
        });
    }
    
    // Listen for game start
    listenForGameStart() {
        this.currentGameRef.child('status').on('value', snapshot => {
            const status = snapshot.val();
            
            if (status === 'started') {
                // Hide lobby and start the game
                this.lobbyModal.style.display = 'none';
                
                if (this.onGameStart) {
                    this.onGameStart(this.connectedPlayers);
                }
            }
        });
    }
    
    // Update the player list in the UI
    updatePlayerList() {
        this.playerListElement.innerHTML = '';
        
        this.connectedPlayers.forEach(player => {
            const listItem = document.createElement('li');
            
            const colorSpan = document.createElement('span');
            colorSpan.className = 'player-color';
            colorSpan.style.backgroundColor = player.color;
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = player.name;
            
            if (player.id === this.playerId) {
                nameSpan.textContent += ' (You)';
            }
            
            if (this.currentGameRef && player.id === this.currentGameRef.owner) {
                nameSpan.textContent += ' (Host)';
            }
            
            listItem.appendChild(colorSpan);
            listItem.appendChild(nameSpan);
            
            this.playerListElement.appendChild(listItem);
        });
    }
    
    // Show the waiting room
    showWaitingRoom(gameCode) {
        // Show the waiting room
        document.getElementById('waiting-room').style.display = 'block';
        
        // Hide the create and join sections
        document.querySelectorAll('.lobby-section:not(.waiting-room)').forEach(section => {
            section.style.display = 'none';
        });
        
        // Display the game code
        this.gameCodeDisplay.textContent = gameCode;
    }
    
    // Start the multiplayer game
    async startMultiplayerGame() {
        if (!this.gameOwner) return;
        
        // Update game status to started
        await this.currentGameRef.update({
            status: 'started',
            startedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Hide the lobby
        this.lobbyModal.style.display = 'none';
        
        // Set up game with multiplayer players
        this.setupMultiplayerGame();
    }
    
    // Set up the game with multiplayer players
    setupMultiplayerGame() {
        // Reset game state
        this.game.players = [];
        this.game.territories = {};
        this.game.currentPhase = CONFIG.phases.SETUP;
        this.game.turnNumber = 0;
        this.game.selectedTerritory = null;
        
        // Create players from connected players
        this.connectedPlayers.forEach((player, index) => {
            if (player.id === this.playerId) {
                // Create human player for current user
                this.game.players.push(new Player(index + 1, player.name, player.color, true));
            } else {
                // Create remote players
                const remotePlayer = new Player(index + 1, player.name, player.color, false);
                remotePlayer.isRemote = true;
                this.game.players.push(remotePlayer);
            }
        });
        
        // Initialize territories
        this.game.initializeTerritories();
        
        // Assign territories
        this.game.assignTerritories();
        
        // Assign initial armies
        this.game.assignInitialArmies();
        
        // Set first player
        this.game.currentPlayer = this.game.players[0];
        
        // Update UI
        this.game.updateGameStatus(`Game started! ${this.game.currentPlayer.name}'s turn to place armies.`);
        this.game.updateCurrentPlayerDisplay();
        this.game.updatePhaseDisplay();
        
        // Enable end turn button
        this.game.endTurnBtn.disabled = false;
        
        // Let players choose missions
        this.game.assignMissions();
        
        // Sync initial game state
        this.syncGameState();
        
        // Set up listener for game state changes
        this.listenForGameStateChanges();
        
        this.game.gameStarted = true;
    }
    
    // Sync the current game state to Firebase
    syncGameState() {
        if (!this.currentGameRef) return;
        
        // Only the current player or game owner can update game state
        if (this.game.currentPlayer.id === this.playerId || this.gameOwner) {
            const gameState = {
                territories: this.game.territories,
                currentPlayerId: this.game.currentPlayer.id,
                currentPhase: this.game.currentPhase,
                turnNumber: this.game.turnNumber,
                lastUpdate: firebase.database.ServerValue.TIMESTAMP
            };
            
            this.currentGameRef.child('gameState').set(gameState);
        }
    }
    
    // Listen for game state changes
    listenForGameStateChanges() {
        this.currentGameRef.child('gameState').on('value', snapshot => {
            const gameState = snapshot.val();
            
            if (gameState && this.game.currentPlayer.id !== this.playerId) {
                // Update local game state with remote changes
                this.game.territories = gameState.territories;
                
                // Find the current player by ID
                const currentPlayer = this.game.players.find(p => p.id === gameState.currentPlayerId);
                if (currentPlayer) {
                    this.game.currentPlayer = currentPlayer;
                }
                
                this.game.currentPhase = gameState.currentPhase;
                this.game.turnNumber = gameState.turnNumber;
                
                // Update UI
                this.game.updateGameStatus(`${this.game.currentPlayer.name}'s turn - ${this.game.currentPhase} phase.`);
                this.game.updateCurrentPlayerDisplay();
                this.game.updatePhaseDisplay();
                
                // Update the map
                this.updateMapFromGameState();
                
                // Call the game state update callback
                if (this.onGameStateUpdate) {
                    this.onGameStateUpdate(gameState);
                }
            }
        });
    }
    
    // Update the map from the current game state
    updateMapFromGameState() {
        // Update all territories on the map
        for (const [territoryName, territory] of Object.entries(this.game.territories)) {
            this.game.map.setTerritoryOwner(territoryName, territory.owner);
            this.game.map.setTerritoryArmies(territoryName, territory.armies);
        }
    }
    
    // Leave the current game
    leaveGame() {
        if (this.currentGameRef) {
            // Remove player from the game
            this.currentGameRef.child('players').child(this.playerId).remove();
            
            // Clear references
            this.currentGameRef = null;
            this.currentGameId = null;
            this.gameOwner = false;
            this.connectedPlayers = [];
            
            // Show the lobby again
            this.showLobbyModal();
        }
    }
    
    // Generate a random game code
    generateGameCode() {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like 0/O, 1/I
        let code = '';
        
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        return code;
    }
    
    // Check if it's the local player's turn
    isLocalPlayerTurn() {
        return this.game.currentPlayer && 
               !this.game.currentPlayer.isRemote && 
               this.game.currentPlayer.id === this.connectedPlayers.find(p => p.id === this.playerId)?.id;
    }
    
    // Modify the regular game's endTurn method to sync state
    modifyGameEndTurn() {
        const originalEndTurn = this.game.endTurn;
        
        this.game.endTurn = () => {
            // Call the original end turn method
            originalEndTurn.call(this.game);
            
            // Sync the game state
            this.syncGameState();
        };
    }
}
