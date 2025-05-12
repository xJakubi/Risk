/**
 * Game configuration
 */
const CONFIG = {
    // Game settings
    maxPlayers: 6,
    minPlayers: 2,
    defaultPlayers: 4,
    
    // Game phases
    phases: {
        SETUP: 'setup',
        REINFORCEMENT: 'reinforcement',
        ATTACK: 'attack',
        FORTIFY: 'fortify',
        GAME_OVER: 'gameOver'
    },
    
    // Dice settings
    maxAttackDice: 3,
    maxDefenseDice: 2,
    
    // Initial armies by player count
    initialArmies: {
        2: 40,
        3: 35,
        4: 30,
        5: 25,
        6: 20
    },
    
    // Continent bonus armies
    continentBonuses: {
        'North America': 5,
        'South America': 2,
        'Europe': 5,
        'Africa': 3,
        'Asia': 7,
        'Australia': 2,
        'Central America': 3,
        'Middle East': 4,
        'Northern Europe': 3,
        'Southern Europe': 2
    },
    
    // Colors for players
    playerColors: [
        "#e74c3c", // Red
        "#3498db", // Blue
        "#2ecc71", // Green
        "#f39c12", // Orange
        "#9b59b6", // Purple
        "#1abc9c"  // Teal
    ],
    
    // Animation settings
    diceRollDuration: 1000, // In milliseconds
    
    // Map settings
    mapZoomMin: 0.5,
    mapZoomMax: 2.0,
    mapZoomStep: 0.1,
    
    // Mission settings
    missionsPerPlayer: 2, // Number of mission options each player gets to choose from
};
