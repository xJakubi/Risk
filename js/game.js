/**
 * Main game logic for Risk
 * Handles game state, turns, and rules
 */

class RiskGame {
    constructor() {
        // Game map
        this.map = new GameMap('map-container');
        
        // Game state
        this.players = [];
        this.territories = {};
        this.currentPlayer = null;
        this.currentPhase = CONFIG.phases.SETUP;
        this.turnNumber = 0;
        this.selectedTerritory = null;
        this.gameStarted = false;
        
        // DOM elements
        this.gameStatusElement = document.getElementById('game-status');
        this.currentPlayerElement = document.getElementById('current-player');
        this.playerArmiesElement = document.getElementById('player-armies');
        this.phaseDisplayElement = document.getElementById('phase-display');
        this.playerMissionElement = document.getElementById('player-mission');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.endTurnBtn = document.getElementById('end-turn-btn');
        
        // Mission selection modal
        this.missionSelectModal = document.getElementById('mission-select-modal');
        this.missionOptionsElement = document.getElementById('mission-options');
        
        // Bind event handlers
        this.newGameBtn.addEventListener('click', this.startNewGame.bind(this));
        this.endTurnBtn.addEventListener('click', this.endTurn.bind(this));
        
        // Initialize map with callbacks
        this.map.onTerritoryClick = this.handleTerritoryClick.bind(this);
        this.map.onTerritoryHover = this.handleTerritoryHover.bind(this);
        this.map.initialize();
    }
    
    // Start a new game
    startNewGame() {
        // Reset game state
        this.players = [];
        this.territories = {};
        this.currentPhase = CONFIG.phases.SETUP;
        this.turnNumber = 0;
        this.selectedTerritory = null;
        
        // Clear map selections and highlights
        this.map.clearSelections();
        this.map.clearHighlights();
        
        // Create players
        this.createPlayers();
        
        // Initialize territories
        this.initializeTerritories();
        
        // Randomly assign territories
        this.assignTerritories();
        
        // Set initial armies for each player
        this.assignInitialArmies();
        
        // Randomly select first player
        this.currentPlayer = this.players[Math.floor(Math.random() * this.players.length)];
        
        // Update UI
        this.updateGameStatus(`Game started! ${this.currentPlayer.name}'s turn to place armies.`);
        this.updateCurrentPlayerDisplay();
        this.updatePhaseDisplay();
        
        // Enable end turn button
        this.endTurnBtn.disabled = false;
        
        // Let human players choose missions
        this.assignMissions();
        
        this.gameStarted = true;
    }
    
    // Create players (human and AI)
    createPlayers() {
        // Create 1 human player and 3 AI players by default
        // Human player
        this.players.push(new Player(1, 'Player 1', CONFIG.playerColors[0], true));
        
        // AI players
        for (let i = 1; i < CONFIG.defaultPlayers; i++) {
            this.players.push(new AIPlayer(i + 1, `AI ${i}`, CONFIG.playerColors[i]));
        }
    }
    
    // Initialize territories
    initializeTerritories() {
        for (const territoryName in TERRITORIES_DATA) {
            this.territories[territoryName] = {
                name: territoryName,
                owner: null,
                armies: 0
            };
        }
    }
    
    // Randomly assign territories to players
    assignTerritories() {
        const territoryNames = Object.keys(this.territories);
        const shuffledTerritories = this.shuffleArray([...territoryNames]);
        
        // Evenly distribute territories among players
        let playerIndex = 0;
        
        for (const territory of shuffledTerritories) {
            const player = this.players[playerIndex];
            
            // Assign territory to player
            this.territories[territory].owner = player.id;
            this.territories[territory].armies = 1;
            
            // Add territory to player's list
            player.addTerritory(territory);
            
            // Update map
            this.map.setTerritoryOwner(territory, player.id);
            this.map.setTerritoryArmies(territory, 1);
            
            // Move to next player
            playerIndex = (playerIndex + 1) % this.players.length;
        }
    }
    
    // Assign initial armies to players
    assignInitialArmies() {
        for (const player of this.players) {
            // Determine initial armies based on player count
            const initialArmies = CONFIG.initialArmies[this.players.length];
            
            // Subtract armies already placed (1 per territory)
            player.armies = initialArmies - player.territories.length;
        }
        
        this.updatePlayerArmiesDisplay();
    }
    
    // Assign missions to players
    assignMissions() {
        // For AI players, just assign random missions
        for (const player of this.players) {
            if (!player.isHuman) {
                const randomMissions = getRandomMissions(1);
                player.assignMission(randomMissions[0]);
            }
        }
        
        // For human player, show mission selection modal
        this.showMissionSelectionModal();
    }
    
    // Show mission selection modal
    showMissionSelectionModal() {
        const humanPlayer = this.players.find(p => p.isHuman);
        if (!humanPlayer) return;
        
        // Get random missions to choose from
        const missionOptions = getRandomMissions(CONFIG.missionsPerPlayer);
        
        // Clear previous options
        this.missionOptionsElement.innerHTML = '';
        
        // Create mission option elements
        for (const mission of missionOptions) {
            const missionElement = document.createElement('div');
            missionElement.className = 'mission-option';
            missionElement.textContent = mission.description;
            missionElement.dataset.missionId = mission.id;
            
            missionElement.addEventListener('click', () => {
                // Select this mission
                const selectedMission = MISSIONS.find(m => m.id === mission.id);
                humanPlayer.assignMission(selectedMission);
                
                // Update mission display
                this.updateMissionDisplay();
                
                // Hide modal
                this.missionSelectModal.style.display = 'none';
            });
            
            this.missionOptionsElement.appendChild(missionElement);
        }
        
        // Show modal
        this.missionSelectModal.style.display = 'flex';
    }
      // Handle territory click
    handleTerritoryClick(territoryName) {
        if (!this.gameStarted) return;
        
        // Get the current player and territory
        const player = this.currentPlayer;
        const territory = this.territories[territoryName];
        
        // If it's not a controllable player's turn, don't allow clicks
        if (!this.isCurrentPlayerControllable()) return;
        
        switch (this.currentPhase) {
            case CONFIG.phases.SETUP:
                this.handleSetupPhaseClick(territoryName);
                break;
                
            case CONFIG.phases.REINFORCEMENT:
                this.handleReinforcementPhaseClick(territoryName);
                break;
                
            case CONFIG.phases.ATTACK:
                this.handleAttackPhaseClick(territoryName);
                break;
                
            case CONFIG.phases.FORTIFY:
                this.handleFortifyPhaseClick(territoryName);
                break;
        }
    }
    
    // Handle clicks during setup phase
    handleSetupPhaseClick(territoryName) {
        const player = this.currentPlayer;
        const territory = this.territories[territoryName];
        
        // Can only place armies on own territories
        if (territory.owner !== player.id) {
            this.updateGameStatus("You can only place armies on your own territories.");
            return;
        }
        
        // Place an army
        territory.armies++;
        player.armies--;
        
        // Update map
        this.map.setTerritoryArmies(territoryName, territory.armies);
        
        // Update UI
        this.updatePlayerArmiesDisplay();
        this.updateGameStatus(`Placed an army in ${territoryName}. ${player.armies} armies left to place.`);
        
        // Check if done with setup
        if (player.armies === 0) {
            this.updateGameStatus(`No more armies to place. Click "End Turn" to continue.`);
        }
    }
    
    // Handle clicks during reinforcement phase
    handleReinforcementPhaseClick(territoryName) {
        const player = this.currentPlayer;
        const territory = this.territories[territoryName];
        
        // Can only place armies on own territories
        if (territory.owner !== player.id) {
            this.updateGameStatus("You can only reinforce your own territories.");
            return;
        }
        
        // Place an army
        territory.armies++;
        player.armies--;
        
        // Update map
        this.map.setTerritoryArmies(territoryName, territory.armies);
        
        // Update UI
        this.updatePlayerArmiesDisplay();
        this.updateGameStatus(`Reinforced ${territoryName}. ${player.armies} armies left to place.`);
        
        // Check if done with reinforcement
        if (player.armies === 0) {
            this.updateGameStatus(`No more armies to place. Click "End Turn" to move to attack phase.`);
        }
    }
    
    // Handle clicks during attack phase
    handleAttackPhaseClick(territoryName) {
        const player = this.currentPlayer;
        const territory = this.territories[territoryName];
        
        // If no territory is selected, select this one (if it's owned by player and has enough armies)
        if (!this.selectedTerritory) {
            if (territory.owner !== player.id) {
                this.updateGameStatus("You can only attack from your own territories.");
                return;
            }
            
            if (territory.armies < 2) {
                this.updateGameStatus("You need at least 2 armies to attack.");
                return;
            }
            
            // Check if the territory has adjacent enemy territories
            const adjacentEnemies = TERRITORIES_DATA[territoryName].adjacent.filter(adj => 
                this.territories[adj].owner !== player.id
            );
            
            if (adjacentEnemies.length === 0) {
                this.updateGameStatus("This territory has no adjacent enemy territories to attack.");
                return;
            }
            
            // Select this territory
            this.selectedTerritory = territoryName;
            this.map.selectTerritory(territoryName);
            
            // Highlight attackable territories
            for (const adjacent of TERRITORIES_DATA[territoryName].adjacent) {
                if (this.territories[adjacent].owner !== player.id) {
                    this.map.highlightTerritory(adjacent, 'attackable');
                }
            }
            
            this.updateGameStatus(`Selected ${territoryName} to attack from. Click an adjacent enemy territory to attack.`);
        }
        // If attacking territory is already selected, check if this is a valid target
        else {
            // Check if clicking the same territory (deselect)
            if (this.selectedTerritory === territoryName) {
                this.selectedTerritory = null;
                this.map.clearSelections();
                this.map.clearHighlights();
                this.updateGameStatus(`Attack canceled. Select a territory to attack from.`);
                return;
            }
            
            // Check if valid attack target
            if (!TERRITORIES_DATA[this.selectedTerritory].adjacent.includes(territoryName)) {
                this.updateGameStatus("You can only attack adjacent territories.");
                return;
            }
            
            if (territory.owner === player.id) {
                this.updateGameStatus("You cannot attack your own territories.");
                return;
            }
            
            // Start the attack
            this.startAttack(this.selectedTerritory, territoryName);
        }
    }
    
    // Start an attack between two territories
    startAttack(attackingTerritoryName, defendingTerritoryName) {
        const attackingTerritory = this.territories[attackingTerritoryName];
        const defendingTerritory = this.territories[defendingTerritoryName];
        const defendingPlayer = this.players.find(p => p.id === defendingTerritory.owner);
        
        // Determine number of dice
        const maxAttackDice = Math.min(3, attackingTerritory.armies - 1);
        const maxDefenseDice = Math.min(2, defendingTerritory.armies);
        
        // Setup dice
        diceRoller.setupDice(maxAttackDice, maxDefenseDice);
        
        // If the defending player is human and present, let them choose dice
        if (defendingPlayer.isHuman) {
            this.updateGameStatus(`${defendingPlayer.name} is defending ${defendingTerritoryName}. Choose how many dice to roll.`);
            
            // Show dice rolling modal for defender
            diceRoller.showRollModal(false, maxDefenseDice, (defenseDiceCount) => {
                // Now that defender has chosen, show dice modal for attacker
                this.updateGameStatus(`${this.currentPlayer.name} is attacking with ${attackingTerritoryName}. Choose how many dice to roll.`);
                
                diceRoller.showRollModal(true, maxAttackDice, (attackDiceCount) => {
                    // Both players have chosen, resolve the battle
                    this.resolveBattle(attackingTerritoryName, defendingTerritoryName, attackDiceCount, defenseDiceCount);
                });
            });
        }
        // If defender is AI, determine dice count and let human attacker choose
        else {
            // AI will use maximum dice
            const defenseDiceCount = maxDefenseDice;
            
            // Show dice rolling modal for attacker
            this.updateGameStatus(`${this.currentPlayer.name} is attacking ${defendingTerritoryName}. Choose how many dice to roll.`);
            
            diceRoller.showRollModal(true, maxAttackDice, (attackDiceCount) => {
                // Resolve the battle
                this.resolveBattle(attackingTerritoryName, defendingTerritoryName, attackDiceCount, defenseDiceCount);
            });
        }
    }
    
    // Resolve battle between territories
    async resolveBattle(attackingTerritoryName, defendingTerritoryName, attackDiceCount, defenseDiceCount) {
        const attackingTerritory = this.territories[attackingTerritoryName];
        const defendingTerritory = this.territories[defendingTerritoryName];
        
        // Roll the dice
        const attackValues = [];
        for (let i = 0; i < attackDiceCount; i++) {
            attackValues.push(Math.floor(Math.random() * 6) + 1);
        }
        
        const defenseValues = [];
        for (let i = 0; i < defenseDiceCount; i++) {
            defenseValues.push(Math.floor(Math.random() * 6) + 1);
        }
        
        // Sort dice in descending order
        attackValues.sort((a, b) => b - a);
        defenseValues.sort((a, b) => b - a);
        
        this.updateGameStatus("Rolling dice...");
        
        // Animate dice roll
        const results = await diceRoller.rollDice(attackValues, defenseValues);
        
        // Determine casualties
        const comparisons = Math.min(attackValues.length, defenseValues.length);
        let attackerLosses = 0;
        let defenderLosses = 0;
        
        for (let i = 0; i < comparisons; i++) {
            if (attackValues[i] > defenseValues[i]) {
                defenderLosses++;
            } else {
                attackerLosses++;
            }
        }
        
        // Update territories
        attackingTerritory.armies -= attackerLosses;
        defendingTerritory.armies -= defenderLosses;
        
        // Update map
        this.map.setTerritoryArmies(attackingTerritoryName, attackingTerritory.armies);
        this.map.setTerritoryArmies(defendingTerritoryName, defendingTerritory.armies);
        
        // Check if territory was conquered
        if (defendingTerritory.armies === 0) {
            // Territory is conquered
            const defendingPlayer = this.players.find(p => p.id === defendingTerritory.owner);
            defendingPlayer.removeTerritory(defendingTerritoryName);
            
            // Transfer ownership
            defendingTerritory.owner = this.currentPlayer.id;
            defendingTerritory.armies = attackDiceCount; // Move attacking dice in
            attackingTerritory.armies -= attackDiceCount;
            
            // Update player's territory list
            this.currentPlayer.addTerritory(defendingTerritoryName);
            
            // Record battle won
            this.currentPlayer.recordBattleWon();
            
            // Update map
            this.map.setTerritoryOwner(defendingTerritoryName, this.currentPlayer.id);
            this.map.setTerritoryArmies(attackingTerritoryName, attackingTerritory.armies);
            this.map.setTerritoryArmies(defendingTerritoryName, defendingTerritory.armies);
            
            this.updateGameStatus(`${this.currentPlayer.name} conquered ${defendingTerritoryName}!`);
            
            // Check if the defending player is eliminated
            if (defendingPlayer.territories.length === 0) {
                defendingPlayer.isEliminated = true;
                this.updateGameStatus(`${defendingPlayer.name} has been eliminated from the game!`);
                
                // Check for game end
                this.checkGameEnd();
            }
        } else {
            // Territory not conquered
            this.updateGameStatus(`Battle results: Attacker lost ${attackerLosses} armies, Defender lost ${defenderLosses} armies.`);
        }
        
        // Clear selections and highlights
        this.selectedTerritory = null;
        this.map.clearSelections();
        this.map.clearHighlights();
    }
    
    // Handle clicks during fortify phase
    handleFortifyPhaseClick(territoryName) {
        const player = this.currentPlayer;
        const territory = this.territories[territoryName];
        
        // Can only fortify own territories
        if (territory.owner !== player.id) {
            this.updateGameStatus("You can only fortify your own territories.");
            return;
        }
        
        // If no territory is selected, select this one as the source
        if (!this.selectedTerritory) {
            // Need at least 2 armies to fortify from
            if (territory.armies < 2) {
                this.updateGameStatus("This territory needs at least 2 armies to fortify from.");
                return;
            }
            
            // Select this territory
            this.selectedTerritory = territoryName;
            this.map.selectTerritory(territoryName);
            
            // Highlight adjacent friendly territories
            for (const adjacent of TERRITORIES_DATA[territoryName].adjacent) {
                if (this.territories[adjacent].owner === player.id) {
                    this.map.highlightTerritory(adjacent, 'fortifiable');
                }
            }
            
            this.updateGameStatus(`Selected ${territoryName} to fortify from. Click an adjacent friendly territory to fortify.`);
        }
        // If source territory is already selected, check if this is a valid target
        else {
            // Check if clicking the same territory (deselect)
            if (this.selectedTerritory === territoryName) {
                this.selectedTerritory = null;
                this.map.clearSelections();
                this.map.clearHighlights();
                this.updateGameStatus(`Fortification canceled. Select a territory to fortify from.`);
                return;
            }
            
            // Check if valid fortification target
            if (!TERRITORIES_DATA[this.selectedTerritory].adjacent.includes(territoryName)) {
                this.updateGameStatus("You can only fortify adjacent territories.");
                return;
            }
            
            if (territory.owner !== player.id) {
                this.updateGameStatus("You can only fortify your own territories.");
                return;
            }
            
            // Ask how many armies to move
            const sourceTerritory = this.territories[this.selectedTerritory];
            const maxArmies = sourceTerritory.armies - 1; // Must leave at least 1 army behind
            
            const armies = prompt(`How many armies to move from ${this.selectedTerritory} to ${territoryName}? (1-${maxArmies})`);
            const armiesToMove = parseInt(armies);
            
            if (isNaN(armiesToMove) || armiesToMove < 1 || armiesToMove > maxArmies) {
                this.updateGameStatus(`Invalid number of armies. Must be between 1 and ${maxArmies}.`);
                return;
            }
            
            // Move armies
            sourceTerritory.armies -= armiesToMove;
            territory.armies += armiesToMove;
            
            // Update map
            this.map.setTerritoryArmies(this.selectedTerritory, sourceTerritory.armies);
            this.map.setTerritoryArmies(territoryName, territory.armies);
            
            this.updateGameStatus(`Moved ${armiesToMove} armies from ${this.selectedTerritory} to ${territoryName}.`);
            
            // End fortification - can only fortify once per turn
            this.selectedTerritory = null;
            this.map.clearSelections();
            this.map.clearHighlights();
            
            // End turn automatically after fortifying
            this.endTurn();
        }
    }
    
    // Handle territory hover
    handleTerritoryHover(territoryName, isHovering) {
        // Additional hover behavior could be added here
    }
    
    // End the current player's turn
    endTurn() {
        const player = this.currentPlayer;
        
        // Check current phase and advance accordingly
        switch (this.currentPhase) {
            case CONFIG.phases.SETUP:
                // If player hasn't placed all armies, force them to
                if (player.armies > 0) {
                    this.updateGameStatus(`You must place all your armies before ending your turn.`);
                    return;
                }
                
                // Check if all players have completed setup
                if (this.players.every(p => p.armies === 0)) {
                    // All players have placed initial armies, move to main game
                    this.currentPhase = CONFIG.phases.REINFORCEMENT;
                    this.turnNumber = 1;
                    this.updateGameStatus(`Setup complete. Starting game. ${player.name}'s turn - Reinforcement phase.`);
                    
                    // Give player reinforcements
                    this.giveReinforcements(player);
                } else {
                    // Move to next player for setup
                    this.moveToNextPlayer();
                    this.updateGameStatus(`${this.currentPlayer.name}'s turn to place armies.`);
                }
                break;
                
            case CONFIG.phases.REINFORCEMENT:
                // If player hasn't placed all reinforcements, force them to
                if (player.armies > 0) {
                    this.updateGameStatus(`You must place all your reinforcements before ending this phase.`);
                    return;
                }
                
                // Move to attack phase
                this.currentPhase = CONFIG.phases.ATTACK;
                this.updateGameStatus(`${player.name}'s turn - Attack phase. Select a territory to attack from, or end turn to skip attacking.`);
                break;
                
            case CONFIG.phases.ATTACK:
                // Move to fortify phase
                this.currentPhase = CONFIG.phases.FORTIFY;
                this.updateGameStatus(`${player.name}'s turn - Fortify phase. Select a territory to fortify from, or end turn to skip fortifying.`);
                break;
                
            case CONFIG.phases.FORTIFY:
                // End this player's turn and move to next player
                player.resetTurnCounters();
                this.moveToNextPlayer();
                
                // Skip eliminated players
                while (this.currentPlayer.isEliminated) {
                    this.moveToNextPlayer();
                }
                
                // Start new player's turn with reinforcement phase
                this.currentPhase = CONFIG.phases.REINFORCEMENT;
                this.updateGameStatus(`${this.currentPlayer.name}'s turn - Reinforcement phase.`);
                
                // Give new player reinforcements
                this.giveReinforcements(this.currentPlayer);
                break;
        }
        
        // Clear selections and highlights
        this.selectedTerritory = null;
        this.map.clearSelections();
        this.map.clearHighlights();
        
        // Update displays
        this.updateCurrentPlayerDisplay();
        this.updatePhaseDisplay();
        
        // Check if it's an AI's turn
        if (!this.currentPlayer.isHuman) {
            // Slight delay before AI starts its turn
            setTimeout(() => this.playAITurn(), 1000);
        }
    }
    
    // Move to the next player
    moveToNextPlayer() {
        const currentIndex = this.players.indexOf(this.currentPlayer);
        const nextIndex = (currentIndex + 1) % this.players.length;
        this.currentPlayer = this.players[nextIndex];
        
        // If we've gone through all players, increment turn number
        if (nextIndex === 0) {
            this.turnNumber++;
        }
        
        // Check for mission completion
        this.checkMissionCompletions();
    }
    
    // Give reinforcements to a player
    giveReinforcements(player) {
        // Calculate reinforcements
        const reinforcements = player.calculateReinforcements(this);
        player.armies += reinforcements;
        
        // Update UI
        this.updatePlayerArmiesDisplay();
        this.updateGameStatus(`${player.name} receives ${reinforcements} reinforcements.`);
    }
    
    // Handle AI player turn
    async playAITurn() {
        const player = this.currentPlayer;
        
        // Make sure it's an AI player
        if (player.isHuman) return;
        
        // Process through all phases
        switch (this.currentPhase) {
            case CONFIG.phases.REINFORCEMENT:
                await this.playAIReinforcement();
                break;
                
            case CONFIG.phases.ATTACK:
                await this.playAIAttack();
                break;
                
            case CONFIG.phases.FORTIFY:
                await this.playAIFortify();
                break;
        }
    }
    
    // AI reinforcement phase
    async playAIReinforcement() {
        const player = this.currentPlayer;
        
        // Get AI reinforcement plan
        const reinforcementPlan = player.decideReinforcements(this);
        
        // Execute reinforcements with animation delay
        for (const reinforcement of reinforcementPlan) {
            const territory = this.territories[reinforcement.territory];
            territory.armies += reinforcement.armies;
            
            // Update map
            this.map.setTerritoryArmies(reinforcement.territory, territory.armies);
            this.map.highlightTerritory(reinforcement.territory, 'reinforceable');
            
            this.updateGameStatus(`${player.name} reinforces ${reinforcement.territory} with ${reinforcement.armies} armies.`);
            
            // Small delay for visual effect
            await this.delay(300);
            this.map.highlightTerritory(reinforcement.territory, null);
        }
        
        // End reinforcement phase
        await this.delay(500);
        this.endTurn();
    }
    
    // AI attack phase
    async playAIAttack() {
        const player = this.currentPlayer;
        
        // Get AI attack plan
        const attackPlan = player.decideAttacks(this);
        
        // Execute attacks
        for (const attack of attackPlan) {
            const attackingTerritory = this.territories[attack.from];
            const defendingTerritory = this.territories[attack.to];
            
            if (attackingTerritory.armies < 2) continue;
            
            // Highlight territories
            this.map.selectTerritory(attack.from);
            this.map.highlightTerritory(attack.to, 'attackable');
            
            this.updateGameStatus(`${player.name} is attacking ${attack.to} from ${attack.from}.`);
            
            // Small delay for visual effect
            await this.delay(500);
            
            // Determine number of dice
            const maxAttackDice = Math.min(3, attackingTerritory.armies - 1);
            const maxDefenseDice = Math.min(2, defendingTerritory.armies);
            
            // AI uses maximum dice available
            const attackDiceCount = maxAttackDice;
            const defenseDiceCount = maxDefenseDice;
            
            // Setup dice
            diceRoller.setupDice(attackDiceCount, defenseDiceCount);
            
            // Roll dice
            const attackValues = [];
            for (let i = 0; i < attackDiceCount; i++) {
                attackValues.push(Math.floor(Math.random() * 6) + 1);
            }
            
            const defenseValues = [];
            for (let i = 0; i < defenseDiceCount; i++) {
                defenseValues.push(Math.floor(Math.random() * 6) + 1);
            }
            
            // Animate dice roll
            const results = await diceRoller.rollDice(attackValues, defenseValues);
            
            // Determine casualties
            const comparisons = Math.min(attackValues.length, defenseValues.length);
            let attackerLosses = 0;
            let defenderLosses = 0;
            
            for (let i = 0; i < comparisons; i++) {
                if (attackValues[i] > defenseValues[i]) {
                    defenderLosses++;
                } else {
                    attackerLosses++;
                }
            }
            
            // Update territories
            attackingTerritory.armies -= attackerLosses;
            defendingTerritory.armies -= defenderLosses;
            
            // Update map
            this.map.setTerritoryArmies(attack.from, attackingTerritory.armies);
            this.map.setTerritoryArmies(attack.to, defendingTerritory.armies);
            
            // Check if territory was conquered
            if (defendingTerritory.armies === 0) {
                // Territory is conquered
                const defendingPlayer = this.players.find(p => p.id === defendingTerritory.owner);
                defendingPlayer.removeTerritory(attack.to);
                
                // Transfer ownership
                defendingTerritory.owner = player.id;
                defendingTerritory.armies = attackDiceCount; // Move attacking dice in
                attackingTerritory.armies -= attackDiceCount;
                
                // Update player's territory list
                player.addTerritory(attack.to);
                
                // Record battle won
                player.recordBattleWon();
                
                // Update map
                this.map.setTerritoryOwner(attack.to, player.id);
                this.map.setTerritoryArmies(attack.from, attackingTerritory.armies);
                this.map.setTerritoryArmies(attack.to, defendingTerritory.armies);
                
                this.updateGameStatus(`${player.name} conquered ${attack.to}!`);
                
                // Check if the defending player is eliminated
                if (defendingPlayer.territories.length === 0) {
                    defendingPlayer.isEliminated = true;
                    this.updateGameStatus(`${defendingPlayer.name} has been eliminated from the game!`);
                    
                    // Check for game end
                    this.checkGameEnd();
                    if (this.currentPhase === CONFIG.phases.GAME_OVER) {
                        return;
                    }
                }
            } else {
                // Territory not conquered
                this.updateGameStatus(`Battle results: Attacker lost ${attackerLosses} armies, Defender lost ${defenderLosses} armies.`);
            }
            
            // Clear selection and highlight for this attack
            this.map.selectTerritory(attack.from, false);
            this.map.highlightTerritory(attack.to, null);
            
            // Small delay between attacks
            await this.delay(500);
            
            // Stop attacking if armies too low
            if (attackingTerritory.armies < 2) break;
        }
        
        // End attack phase
        await this.delay(500);
        this.endTurn();
    }
    
    // AI fortify phase
    async playAIFortify() {
        const player = this.currentPlayer;
        
        // Get AI fortification plan
        const fortification = player.decideFortifications(this);
        
        // Execute fortification if any
        if (fortification) {
            const sourceTerritory = this.territories[fortification.from];
            const targetTerritory = this.territories[fortification.to];
            
            // Highlight territories
            this.map.selectTerritory(fortification.from);
            this.map.highlightTerritory(fortification.to, 'fortifiable');
            
            this.updateGameStatus(`${player.name} is fortifying ${fortification.to} from ${fortification.from}.`);
            
            // Small delay for visual effect
            await this.delay(500);
            
            // Move armies
            sourceTerritory.armies -= fortification.armies;
            targetTerritory.armies += fortification.armies;
            
            // Update map
            this.map.setTerritoryArmies(fortification.from, sourceTerritory.armies);
            this.map.setTerritoryArmies(fortification.to, targetTerritory.armies);
            
            this.updateGameStatus(`${player.name} moved ${fortification.armies} armies from ${fortification.from} to ${fortification.to}.`);
            
            // Clear selection and highlight
            this.map.selectTerritory(fortification.from, false);
            this.map.highlightTerritory(fortification.to, null);
        } else {
            this.updateGameStatus(`${player.name} chooses not to fortify.`);
        }
        
        // End fortify phase
        await this.delay(500);
        this.endTurn();
    }
    
    // Check for mission completions
    checkMissionCompletions() {
        for (const player of this.players) {
            if (player.checkMissionCompletion(this)) {
                this.handleMissionComplete(player);
            }
        }
    }
    
    // Handle a completed mission
    handleMissionComplete(player) {
        // Player has completed their mission
        this.updateGameStatus(`${player.name} has completed their mission: ${player.mission.description}!`);
        
        // Set game over
        this.currentPhase = CONFIG.phases.GAME_OVER;
        this.updatePhaseDisplay();
        
        // Disable end turn button
        this.endTurnBtn.disabled = true;
        
        // Show winning message
        alert(`${player.name} has won the game by completing their mission: ${player.mission.description}`);
    }
    
    // Check if the game has ended
    checkGameEnd() {
        // Check if only one player remains
        const activePlayers = this.players.filter(p => !p.isEliminated);
        
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            this.updateGameStatus(`${winner.name} has conquered the world and won the game!`);
            
            // Set game over
            this.currentPhase = CONFIG.phases.GAME_OVER;
            this.updatePhaseDisplay();
            
            // Disable end turn button
            this.endTurnBtn.disabled = true;
            
            // Show winning message
            alert(`${winner.name} has won the game by conquering the world!`);
            return true;
        }
        
        return false;
    }
    
    // Update the game status display
    updateGameStatus(message) {
        this.gameStatusElement.textContent = message;
    }
    
    // Update the current player display
    updateCurrentPlayerDisplay() {
        if (!this.currentPlayer) return;
        
        this.currentPlayerElement.textContent = this.currentPlayer.name;
        this.currentPlayerElement.style.color = this.currentPlayer.color;
    }
    
    // Update the player armies display
    updatePlayerArmiesDisplay() {
        if (!this.currentPlayer) return;
        
        this.playerArmiesElement.textContent = `Armies: ${this.currentPlayer.armies}`;
    }
    
    // Update the game phase display
    updatePhaseDisplay() {
        let phaseText = '';
        
        switch (this.currentPhase) {
            case CONFIG.phases.SETUP:
                phaseText = 'Setup';
                break;
            case CONFIG.phases.REINFORCEMENT:
                phaseText = 'Reinforcement';
                break;
            case CONFIG.phases.ATTACK:
                phaseText = 'Attack';
                break;
            case CONFIG.phases.FORTIFY:
                phaseText = 'Fortify';
                break;
            case CONFIG.phases.GAME_OVER:
                phaseText = 'Game Over';
                break;
        }
        
        this.phaseDisplayElement.textContent = `${phaseText} (Turn ${this.turnNumber})`;
    }
    
    // Update the mission display
    updateMissionDisplay() {
        const humanPlayer = this.players.find(p => p.isHuman);
        if (humanPlayer && humanPlayer.mission) {
            this.playerMissionElement.textContent = humanPlayer.mission.description;
        } else {
            this.playerMissionElement.textContent = 'No mission assigned yet.';
        }
    }
    
    // Helper function for shuffling arrays
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Helper function for delaying async operations
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Check if the current player is controllable by the local user
    isCurrentPlayerControllable() {
        if (!this.currentPlayer) return false;
        return this.currentPlayer.isHuman && !this.currentPlayer.isRemote;
    }
}
