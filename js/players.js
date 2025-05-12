/**
 * Player management for Risk game
 */

class Player {
    constructor(id, name, color, isHuman = true) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.isHuman = isHuman;
        this.mission = null;
        this.armies = 0;
        this.territories = [];
        this.cards = [];
        this.isEliminated = false;
        
        // Statistics and tracking
        this.battlesWonThisTurn = 0;
        this.territoriesConqueredThisTurn = 0;
        this.territoriesHeldFor3Turns = 0;
        this.turnCounter = 0;
        
        // Track territories held for multiple turns
        this.territoriesHeldHistory = {}; // Maps territory name to number of turns held
    }
    
    // Reset turn-based counters
    resetTurnCounters() {
        this.battlesWonThisTurn = 0;
        this.territoriesConqueredThisTurn = 0;
        this.turnCounter++;
        
        // Update territory history
        for (const territory of this.territories) {
            if (this.territoriesHeldHistory[territory]) {
                this.territoriesHeldHistory[territory]++;
            } else {
                this.territoriesHeldHistory[territory] = 1;
            }
        }
        
        // Calculate territories held for 3+ turns
        this.territoriesHeldFor3Turns = Object.values(this.territoriesHeldHistory)
            .filter(turns => turns >= 3).length;
    }
    
    // Add a territory to the player
    addTerritory(territoryName) {
        if (!this.territories.includes(territoryName)) {
            this.territories.push(territoryName);
            this.territoriesConqueredThisTurn++;
        }
    }
    
    // Remove a territory from the player
    removeTerritory(territoryName) {
        const index = this.territories.indexOf(territoryName);
        if (index !== -1) {
            this.territories.splice(index, 1);
            // Reset the territory history for this territory
            delete this.territoriesHeldHistory[territoryName];
        }
    }
    
    // Calculate reinforcements based on territories and continents
    calculateReinforcements(gameState) {
        // Base reinforcements: max(3, territories / 3)
        let reinforcements = Math.max(3, Math.floor(this.territories.length / 3));
        
        // Add continent bonuses
        for (const [continent, territories] of Object.entries(CONTINENTS)) {
            const ownsAll = territories.every(territory => 
                gameState.territories[territory].owner === this.id
            );
            
            if (ownsAll) {
                reinforcements += CONFIG.continentBonuses[continent] || 0;
            }
        }
        
        // Add card bonuses (to be implemented in the card system)
        
        return reinforcements;
    }
    
    // Assign a mission to the player
    assignMission(mission) {
        this.mission = mission;
    }
    
    // Check if the player has completed their mission
    checkMissionCompletion(gameState) {
        if (!this.mission) return false;
        return this.mission.isCompleted(this, gameState);
    }
    
    // Update player status after winning a battle
    recordBattleWon() {
        this.battlesWonThisTurn++;
    }
}

// AI Player extends basic Player with AI-specific methods
class AIPlayer extends Player {
    constructor(id, name, color) {
        super(id, name, color, false);
        this.difficulty = 'normal'; // 'easy', 'normal', 'hard'
    }
    
    // AI decision making for reinforcement phase
    decideReinforcements(gameState) {
        const reinforcementPlan = [];
        
        // Logic based on difficulty
        if (this.difficulty === 'easy') {
            // Random reinforcement distribution
            const availableTerritories = this.territories.slice();
            while (this.armies > 0 && availableTerritories.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableTerritories.length);
                const territory = availableTerritories[randomIndex];
                
                const armiesToAdd = Math.min(this.armies, Math.floor(Math.random() * 3) + 1);
                reinforcementPlan.push({
                    territory: territory,
                    armies: armiesToAdd
                });
                
                this.armies -= armiesToAdd;
                
                // Remove territory to avoid multiple reinforcements on the same territory for easy AI
                availableTerritories.splice(randomIndex, 1);
            }
        } else {
            // More strategic reinforcement for normal/hard AI
            // Calculate border territories (that are adjacent to enemy territories)
            const borderTerritories = this.territories.filter(territoryName => {
                const territory = TERRITORIES_DATA[territoryName];
                return territory.adjacent.some(adjTerritory => 
                    gameState.territories[adjTerritory].owner !== this.id
                );
            });
            
            // Prioritize border territories
            const priorityTerritories = [...borderTerritories];
            
            // Add territories that would complete a continent
            for (const [continent, territories] of Object.entries(CONTINENTS)) {
                const ownedInContinent = territories.filter(t => 
                    gameState.territories[t].owner === this.id
                );
                
                // If we own most of the continent but not all
                if (ownedInContinent.length > territories.length * 0.7 && 
                    ownedInContinent.length < territories.length) {
                    // Add the territories we own in this continent to priority list
                    priorityTerritories.push(...ownedInContinent);
                }
            }
            
            // Distribute reinforcements to priority territories
            while (this.armies > 0 && priorityTerritories.length > 0) {
                // In hard mode, concentrate forces more
                const armiesToAdd = this.difficulty === 'hard' 
                    ? Math.min(this.armies, Math.floor(this.armies * 0.7))
                    : Math.min(this.armies, Math.floor(Math.random() * 5) + 2);
                
                const randomIndex = Math.floor(Math.random() * priorityTerritories.length);
                const territory = priorityTerritories[randomIndex];
                
                reinforcementPlan.push({
                    territory: territory,
                    armies: armiesToAdd
                });
                
                this.armies -= armiesToAdd;
                
                // In normal/hard mode, we might reinforce the same territory multiple times
                if (Math.random() < 0.3) {
                    priorityTerritories.splice(randomIndex, 1);
                }
            }
            
            // If we still have armies, distribute to other territories
            if (this.armies > 0) {
                const remainingTerritories = this.territories.filter(t => 
                    !reinforcementPlan.some(plan => plan.territory === t)
                );
                
                while (this.armies > 0 && remainingTerritories.length > 0) {
                    const randomIndex = Math.floor(Math.random() * remainingTerritories.length);
                    const territory = remainingTerritories[randomIndex];
                    
                    const armiesToAdd = Math.min(this.armies, Math.floor(Math.random() * 2) + 1);
                    reinforcementPlan.push({
                        territory: territory,
                        armies: armiesToAdd
                    });
                    
                    this.armies -= armiesToAdd;
                    remainingTerritories.splice(randomIndex, 1);
                }
            }
        }
        
        return reinforcementPlan;
    }
    
    // AI decision making for attack phase
    decideAttacks(gameState) {
        const attackPlan = [];
        
        // Different strategies based on difficulty
        if (this.difficulty === 'easy') {
            // Easy AI makes at most 2 random attacks
            const maxAttacks = Math.min(2, Math.floor(Math.random() * 3));
            
            for (let i = 0; i < maxAttacks; i++) {
                // Find territories that can attack
                const attackableTerritoryPairs = [];
                
                for (const territory of this.territories) {
                    const territoryData = TERRITORIES_DATA[territory];
                    const territoryState = gameState.territories[territory];
                    
                    // Need at least 2 armies to attack
                    if (territoryState.armies < 2) continue;
                    
                    // Check adjacent enemy territories
                    for (const adjacent of territoryData.adjacent) {
                        const adjacentState = gameState.territories[adjacent];
                        if (adjacentState.owner !== this.id) {
                            attackableTerritoryPairs.push({
                                from: territory,
                                to: adjacent
                            });
                        }
                    }
                }
                
                if (attackableTerritoryPairs.length === 0) break;
                
                // Choose a random attack
                const randomAttack = attackableTerritoryPairs[
                    Math.floor(Math.random() * attackableTerritoryPairs.length)
                ];
                
                attackPlan.push(randomAttack);
            }
        } else {
            // Normal/Hard AI is more strategic
            // Continue attacking until no good attacks are left or a maximum is reached
            const maxAttacks = this.difficulty === 'hard' ? 10 : 5;
            
            for (let i = 0; i < maxAttacks; i++) {
                // Find territories that can attack with good odds
                const strategicAttacks = [];
                
                for (const territory of this.territories) {
                    const territoryData = TERRITORIES_DATA[territory];
                    const territoryState = gameState.territories[territory];
                    
                    // Need more armies for a good attack
                    const minAttackArmies = this.difficulty === 'hard' ? 4 : 3;
                    if (territoryState.armies < minAttackArmies) continue;
                    
                    // Check adjacent enemy territories
                    for (const adjacent of territoryData.adjacent) {
                        const adjacentState = gameState.territories[adjacent];
                        if (adjacentState.owner !== this.id) {
                            // Calculate attack advantage - more armies is better
                            const advantage = territoryState.armies / (adjacentState.armies + 1);
                            
                            // Only attack if we have an advantage (or a smaller one for hard AI)
                            const minAdvantage = this.difficulty === 'hard' ? 1.2 : 1.5;
                            if (advantage >= minAdvantage) {
                                strategicAttacks.push({
                                    from: territory,
                                    to: adjacent,
                                    advantage: advantage
                                });
                            }
                        }
                    }
                }
                
                if (strategicAttacks.length === 0) break;
                
                // Sort by advantage and choose the best attack
                strategicAttacks.sort((a, b) => b.advantage - a.advantage);
                
                // Add a bit of randomness - hard AI is more deterministic
                const topAttacks = this.difficulty === 'hard' 
                    ? strategicAttacks.slice(0, 1)  // Hard takes the best
                    : strategicAttacks.slice(0, 3); // Normal selects from top 3
                
                const selectedAttack = topAttacks[
                    Math.floor(Math.random() * topAttacks.length)
                ];
                
                attackPlan.push({
                    from: selectedAttack.from,
                    to: selectedAttack.to
                });
            }
        }
        
        return attackPlan;
    }
    
    // AI decision making for fortification phase
    decideFortifications(gameState) {
        // Skip fortification sometimes in easy mode
        if (this.difficulty === 'easy' && Math.random() < 0.3) {
            return null;
        }
        
        // Find border territories (adjacent to enemies)
        const borderTerritories = this.territories.filter(territoryName => {
            const territory = TERRITORIES_DATA[territoryName];
            return territory.adjacent.some(adjTerritory => 
                gameState.territories[adjTerritory].owner !== this.id
            );
        });
        
        // Find interior territories (not adjacent to enemies)
        const interiorTerritories = this.territories.filter(territoryName => 
            !borderTerritories.includes(territoryName) && 
            gameState.territories[territoryName].armies > 1
        );
        
        // If no interior territories with extra armies, no fortification
        if (interiorTerritories.length === 0) return null;
        
        // Find the interior territory with the most armies
        const fromTerritory = interiorTerritories.reduce((max, territory) => {
            return gameState.territories[territory].armies > gameState.territories[max].armies 
                ? territory : max;
        }, interiorTerritories[0]);
        
        // No fortification if the territory doesn't have enough armies
        if (gameState.territories[fromTerritory].armies < 2) return null;
        
        // Normal/Hard AI: Find border territory that needs reinforcements most
        let toTerritory;
        
        if (this.difficulty !== 'easy' && borderTerritories.length > 0) {
            // Find border territories adjacent to the from territory
            const reachableBorders = borderTerritories.filter(border => {
                // Check if there's a path from fromTerritory to border through friendly territories
                // This is simplified - in a real game, you'd need a proper pathfinding algorithm
                return TERRITORIES_DATA[fromTerritory].adjacent.includes(border) || 
                       TERRITORIES_DATA[fromTerritory].adjacent.some(adj => 
                           gameState.territories[adj].owner === this.id && 
                           TERRITORIES_DATA[adj].adjacent.includes(border)
                       );
            });
            
            if (reachableBorders.length > 0) {
                // For hard AI, prioritize territories that could complete a continent
                if (this.difficulty === 'hard') {
                    for (const [continent, territories] of Object.entries(CONTINENTS)) {
                        const ownedInContinent = territories.filter(t => 
                            gameState.territories[t].owner === this.id
                        );
                        
                        // If we own most of the continent but not all
                        if (ownedInContinent.length > territories.length * 0.7 && 
                            ownedInContinent.length < territories.length) {
                            
                            // Check if any reachable border is in this continent
                            const continentBorders = reachableBorders.filter(b => 
                                territories.includes(b)
                            );
                            
                            if (continentBorders.length > 0) {
                                toTerritory = continentBorders[0];
                                break;
                            }
                        }
                    }
                }
                
                // If no continent priority, choose the border with least armies
                if (!toTerritory) {
                    toTerritory = reachableBorders.reduce((min, territory) => {
                        return gameState.territories[territory].armies < gameState.territories[min].armies 
                            ? territory : min;
                    }, reachableBorders[0]);
                }
            }
        }
        
        // Easy AI or if no reachable borders, just pick a random adjacent friendly territory
        if (!toTerritory) {
            const adjacentFriendly = TERRITORIES_DATA[fromTerritory].adjacent.filter(adj => 
                gameState.territories[adj].owner === this.id
            );
            
            if (adjacentFriendly.length === 0) return null;
            
            toTerritory = adjacentFriendly[
                Math.floor(Math.random() * adjacentFriendly.length)
            ];
        }
        
        // Calculate armies to move
        let armiesToMove;
        
        if (this.difficulty === 'easy') {
            // Easy AI moves fewer armies
            armiesToMove = Math.min(
                Math.floor(Math.random() * 3) + 1, 
                gameState.territories[fromTerritory].armies - 1
            );
        } else if (this.difficulty === 'normal') {
            // Normal AI moves about half
            armiesToMove = Math.min(
                Math.floor(gameState.territories[fromTerritory].armies / 2), 
                gameState.territories[fromTerritory].armies - 1
            );
        } else {
            // Hard AI moves most armies, leaving just 1
            armiesToMove = gameState.territories[fromTerritory].armies - 1;
        }
        
        return {
            from: fromTerritory,
            to: toTerritory,
            armies: armiesToMove
        };
    }
}
