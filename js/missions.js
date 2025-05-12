/**
 * Missions for Risk game
 * Includes a pool of 50 different missions
 */

class Mission {
    constructor(id, description, checkFn, points = 0) {
        this.id = id;
        this.description = description;
        this.checkFn = checkFn; // Function to check if mission is completed
        this.points = points; // Additional points for mission completion
    }
    
    // Check if mission is completed by a player
    isCompleted(player, gameState) {
        return this.checkFn(player, gameState);
    }
}

// Generate 50 unique missions for players to choose from
const MISSIONS = [
    // Continent control missions
    new Mission(
        'conquer_north_america',
        'Conquer all of North America',
        (player, gameState) => {
            return CONTINENTS['North America'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    new Mission(
        'conquer_south_america',
        'Conquer all of South America',
        (player, gameState) => {
            return CONTINENTS['South America'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        3
    ),
    new Mission(
        'conquer_europe',
        'Conquer all of Europe',
        (player, gameState) => {
            return CONTINENTS['Europe'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    new Mission(
        'conquer_africa',
        'Conquer all of Africa',
        (player, gameState) => {
            return CONTINENTS['Africa'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        3
    ),
    new Mission(
        'conquer_asia',
        'Conquer all of Asia',
        (player, gameState) => {
            return CONTINENTS['Asia'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        7
    ),
    new Mission(
        'conquer_australia',
        'Conquer all of Australia',
        (player, gameState) => {
            return CONTINENTS['Australia'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        2
    ),
    new Mission(
        'conquer_central_america',
        'Conquer all of Central America',
        (player, gameState) => {
            return CONTINENTS['Central America'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        3
    ),
    new Mission(
        'conquer_middle_east',
        'Conquer all of the Middle East',
        (player, gameState) => {
            return CONTINENTS['Middle East'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        4
    ),
    new Mission(
        'conquer_northern_europe',
        'Conquer all of Northern Europe',
        (player, gameState) => {
            return CONTINENTS['Northern Europe'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        3
    ),
    new Mission(
        'conquer_southern_europe',
        'Conquer all of Southern Europe',
        (player, gameState) => {
            return CONTINENTS['Southern Europe'].every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        2
    ),
    
    // Multiple continent control missions
    new Mission(
        'conquer_north_south_america',
        'Conquer all of North and South America',
        (player, gameState) => {
            return CONTINENTS['North America'].concat(CONTINENTS['South America']).every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        8
    ),
    new Mission(
        'conquer_europe_africa',
        'Conquer all of Europe and Africa',
        (player, gameState) => {
            return CONTINENTS['Europe'].concat(CONTINENTS['Africa']).every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        8
    ),
    new Mission(
        'conquer_asia_australia',
        'Conquer all of Asia and Australia',
        (player, gameState) => {
            return CONTINENTS['Asia'].concat(CONTINENTS['Australia']).every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        9
    ),
    new Mission(
        'conquer_north_america_africa',
        'Conquer all of North America and Africa',
        (player, gameState) => {
            return CONTINENTS['North America'].concat(CONTINENTS['Africa']).every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        8
    ),
    new Mission(
        'conquer_europe_australia',
        'Conquer all of Europe and Australia',
        (player, gameState) => {
            return CONTINENTS['Europe'].concat(CONTINENTS['Australia']).every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        7
    ),
    
    // Territory control missions
    new Mission(
        'control_24_territories',
        'Control 24 territories',
        (player, gameState) => {
            return Object.values(gameState.territories).filter(t => t.owner === player.id).length >= 24;
        },
        8
    ),
    new Mission(
        'control_18_territories_2_armies',
        'Control 18 territories with at least 2 armies on each',
        (player, gameState) => {
            return Object.values(gameState.territories).filter(t => 
                t.owner === player.id && t.armies >= 2
            ).length >= 18;
        },
        6
    ),
    new Mission(
        'control_12_territories_3_armies',
        'Control 12 territories with at least 3 armies on each',
        (player, gameState) => {
            return Object.values(gameState.territories).filter(t => 
                t.owner === player.id && t.armies >= 3
            ).length >= 12;
        },
        5
    ),
    new Mission(
        'control_30_territories',
        'Control 30 territories',
        (player, gameState) => {
            return Object.values(gameState.territories).filter(t => t.owner === player.id).length >= 30;
        },
        9
    ),
    new Mission(
        'control_9_territories_5_armies',
        'Control 9 territories with at least 5 armies on each',
        (player, gameState) => {
            return Object.values(gameState.territories).filter(t => 
                t.owner === player.id && t.armies >= 5
            ).length >= 9;
        },
        4
    ),
    
    // Strategic territory control
    new Mission(
        'control_key_territories',
        'Control Alaska, Ukraine, Middle East, Brazil, and Western Australia',
        (player, gameState) => {
            const keyTerritories = ['Alaska', 'Ukraine', 'Middle East', 'Brazil', 'Western Australia'];
            return keyTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        6
    ),
    new Mission(
        'control_coastal_strongholds',
        'Control Great Britain, Japan, Eastern Australia, Brazil, and Western Europe',
        (player, gameState) => {
            const coastalTerritories = ['Great Britain', 'Japan', 'Eastern Australia', 'Brazil', 'Western Europe'];
            return coastalTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    new Mission(
        'control_asian_capitals',
        'Control China, India, Russia, Japan and Middle East',
        (player, gameState) => {
            const asianCapitals = ['China', 'India', 'Russia', 'Japan', 'Middle East'];
            return asianCapitals.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    new Mission(
        'control_american_capitals',
        'Control Eastern United States, Western United States, Mexico, Brazil, and Argentina',
        (player, gameState) => {
            const americanCapitals = ['Eastern United States', 'Western United States', 'Mexico', 'Brazil', 'Argentina'];
            return americanCapitals.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    new Mission(
        'control_european_capitals',
        'Control Great Britain, Western Europe, Southern Europe, Northern Europe, and Scandinavia',
        (player, gameState) => {
            const europeanCapitals = ['Great Britain', 'Western Europe', 'Southern Europe', 'Northern Europe', 'Scandinavia'];
            return europeanCapitals.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    
    // Player elimination missions
    new Mission(
        'eliminate_red_player',
        'Completely eliminate the Red player (if you are the Red player, control 24 territories)',
        (player, gameState) => {
            if (player.color === CONFIG.playerColors[0]) {
                return Object.values(gameState.territories).filter(t => t.owner === player.id).length >= 24;
            }
            return gameState.players.find(p => p.color === CONFIG.playerColors[0])?.isEliminated || false;
        },
        7
    ),
    new Mission(
        'eliminate_blue_player',
        'Completely eliminate the Blue player (if you are the Blue player, control 24 territories)',
        (player, gameState) => {
            if (player.color === CONFIG.playerColors[1]) {
                return Object.values(gameState.territories).filter(t => t.owner === player.id).length >= 24;
            }
            return gameState.players.find(p => p.color === CONFIG.playerColors[1])?.isEliminated || false;
        },
        7
    ),
    new Mission(
        'eliminate_green_player',
        'Completely eliminate the Green player (if you are the Green player, control 24 territories)',
        (player, gameState) => {
            if (player.color === CONFIG.playerColors[2]) {
                return Object.values(gameState.territories).filter(t => t.owner === player.id).length >= 24;
            }
            return gameState.players.find(p => p.color === CONFIG.playerColors[2])?.isEliminated || false;
        },
        7
    ),
    new Mission(
        'eliminate_orange_player',
        'Completely eliminate the Orange player (if you are the Orange player, control 24 territories)',
        (player, gameState) => {
            if (player.color === CONFIG.playerColors[3]) {
                return Object.values(gameState.territories).filter(t => t.owner === player.id).length >= 24;
            }
            return gameState.players.find(p => p.color === CONFIG.playerColors[3])?.isEliminated || false;
        },
        7
    ),
    new Mission(
        'eliminate_purple_player',
        'Completely eliminate the Purple player (if you are the Purple player, control 24 territories)',
        (player, gameState) => {
            if (player.color === CONFIG.playerColors[4]) {
                return Object.values(gameState.territories).filter(t => t.owner === player.id).length >= 24;
            }
            return gameState.players.find(p => p.color === CONFIG.playerColors[4])?.isEliminated || false;
        },
        7
    ),
    
    // Battle-focused missions
    new Mission(
        'win_10_battles',
        'Win 10 battles in a single turn',
        (player, gameState) => {
            return player.battlesWonThisTurn >= 10;
        },
        5
    ),
    new Mission(
        'conquer_5_territories_turn',
        'Conquer 5 territories in one turn',
        (player, gameState) => {
            return player.territoriesConqueredThisTurn >= 5;
        },
        5
    ),
    new Mission(
        'control_40_armies',
        'Control a total of 40 armies across all territories',
        (player, gameState) => {
            return Object.values(gameState.territories)
                .filter(t => t.owner === player.id)
                .reduce((sum, t) => sum + t.armies, 0) >= 40;
        },
        4
    ),
    new Mission(
        'have_army_each_territory',
        'Have at least one army in each continent',
        (player, gameState) => {
            return Object.keys(CONTINENTS).every(continent => {
                return CONTINENTS[continent].some(territory => 
                    gameState.territories[territory].owner === player.id
                );
            });
        },
        5
    ),
    new Mission(
        'hold_territory_for_3_turns',
        'Hold 15 territories for 3 complete turns',
        (player, gameState) => {
            return player.territoriesHeldFor3Turns >= 15;
        },
        6
    ),
    
    // Border control missions
    new Mission(
        'control_all_border_territories',
        'Control all territories that border the ocean',
        (player, gameState) => {
            const coastalTerritories = [
                'Alaska', 'Western United States', 'Eastern United States', 'Mexico', 
                'Caribbean', 'Venezuela', 'Brazil', 'Argentina', 'Chile', 
                'Morocco', 'West Africa', 'South Africa', 'Madagascar',
                'Great Britain', 'Western Europe', 'Southern Europe', 'Scandinavia', 'Iceland',
                'Middle East', 'India', 'Southeast Asia', 'Japan', 'Kamchatka',
                'Indonesia', 'New Guinea', 'Western Australia', 'Eastern Australia', 'New Zealand'
            ];
            return coastalTerritories.every(territory => 
                gameState.territories[territory]?.owner === player.id
            );
        },
        9
    ),
    new Mission(
        'control_all_center_territories',
        'Control all territories that do not border the ocean',
        (player, gameState) => {
            const allTerritories = Object.keys(TERRITORIES_DATA);
            const coastalTerritories = [
                'Alaska', 'Western United States', 'Eastern United States', 'Mexico', 
                'Caribbean', 'Venezuela', 'Brazil', 'Argentina', 'Chile', 
                'Morocco', 'West Africa', 'South Africa', 'Madagascar',
                'Great Britain', 'Western Europe', 'Southern Europe', 'Scandinavia', 'Iceland',
                'Middle East', 'India', 'Southeast Asia', 'Japan', 'Kamchatka',
                'Indonesia', 'New Guinea', 'Western Australia', 'Eastern Australia', 'New Zealand'
            ];
            const centerTerritories = allTerritories.filter(t => !coastalTerritories.includes(t));
            return centerTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        8
    ),
    
    // Special connection missions
    new Mission(
        'control_path_north_to_south',
        'Control a continuous path of territories from Alaska to Argentina',
        (player, gameState) => {
            // This would require a graph traversal algorithm
            // Simplified version: check if player controls key territories along the path
            const pathTerritories = [
                'Alaska', 'Western United States', 'Mexico', 
                'Central America', 'Colombia', 'Peru', 'Argentina'
            ];
            return pathTerritories.every(territory => 
                gameState.territories[territory]?.owner === player.id
            );
        },
        7
    ),
    new Mission(
        'control_path_east_to_west',
        'Control a continuous path of territories from Western Europe to Japan',
        (player, gameState) => {
            // Simplified version
            const pathTerritories = [
                'Western Europe', 'Southern Europe', 'Ukraine',
                'Afghanistan', 'China', 'Japan'
            ];
            return pathTerritories.every(territory => 
                gameState.territories[territory]?.owner === player.id
            );
        },
        7
    ),
    
    // Resource control missions (thematic)
    new Mission(
        'control_oil_regions',
        'Control the oil-rich regions (Russia, Middle East, Venezuela, Alaska)',
        (player, gameState) => {
            const oilRegions = ['Russia', 'Middle East', 'Venezuela', 'Alaska'];
            return oilRegions.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    new Mission(
        'control_gold_regions',
        'Control the gold-rich regions (South Africa, Brazil, Western United States, Ural)',
        (player, gameState) => {
            const goldRegions = ['South Africa', 'Brazil', 'Western United States', 'Ural'];
            return goldRegions.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    
    // Population control missions (thematic)
    new Mission(
        'control_populous_regions',
        'Control the most populous regions (China, India, Eastern United States, Western Europe, Brazil)',
        (player, gameState) => {
            const populousRegions = ['China', 'India', 'Eastern United States', 'Western Europe', 'Brazil'];
            return populousRegions.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        6
    ),
    
    // Defensive missions
    new Mission(
        'fortify_key_points',
        'Have at least 5 armies on each of 7 different territories',
        (player, gameState) => {
            return Object.values(gameState.territories).filter(t => 
                t.owner === player.id && t.armies >= 5
            ).length >= 7;
        },
        5
    ),
    new Mission(
        'island_control',
        'Control all island territories (Great Britain, Iceland, Japan, Madagascar, New Zealand, Indonesia)',
        (player, gameState) => {
            const islandTerritories = ['Great Britain', 'Iceland', 'Japan', 'Madagascar', 'New Zealand', 'Indonesia'];
            return islandTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        5
    ),
    
    // Nuclear control mission (thematic)
    new Mission(
        'nuclear_control',
        'Control all nuclear power territories (Russia, Eastern United States, China, Great Britain, India)',
        (player, gameState) => {
            const nuclearTerritories = ['Russia', 'Eastern United States', 'China', 'Great Britain', 'India'];
            return nuclearTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        6
    ),
    
    // Space race mission (thematic)
    new Mission(
        'space_race',
        'Control all space program territories (Russia, Eastern United States, China, Western Europe)',
        (player, gameState) => {
            const spaceTerritories = ['Russia', 'Eastern United States', 'China', 'Western Europe'];
            return spaceTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        4
    ),
    
    // Desert control mission (thematic)
    new Mission(
        'desert_control',
        'Control all desert territories (North Africa, Middle East, Central Asia, Western Australia)',
        (player, gameState) => {
            const desertTerritories = ['North Africa', 'Middle East', 'Afghanistan', 'Western Australia'];
            return desertTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        4
    ),
    
    // Jungle control mission (thematic)
    new Mission(
        'jungle_control',
        'Control all jungle territories (Central Africa, Brazil, Southeast Asia, Indonesia)',
        (player, gameState) => {
            const jungleTerritories = ['Central Africa', 'Brazil', 'Southeast Asia', 'Indonesia'];
            return jungleTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        4
    ),
    
    // Mountain control mission (thematic)
    new Mission(
        'mountain_control',
        'Control all mountain territories (Ural, Afghanistan, Peru, Tibet)',
        (player, gameState) => {
            const mountainTerritories = ['Ural', 'Afghanistan', 'Peru', 'Tibet'];
            return mountainTerritories.every(territory => 
                gameState.territories[territory].owner === player.id
            );
        },
        4
    )
];

// Function to get random missions for a player to choose from
function getRandomMissions(count) {
    const shuffled = [...MISSIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
