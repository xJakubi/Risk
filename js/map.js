/**
 * Map module for Risk game
 * Handles the creation and interaction with the game map
 */

class GameMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.territories = {};
        this.zoomLevel = 1;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.viewBox = { x: 0, y: 0, width: 600, height: 400 };
        this.tooltip = null;
        
        // Map interaction callbacks
        this.onTerritoryClick = null;
        this.onTerritoryHover = null;
    }
    
    // Initialize the map
    initialize() {
        // Create SVG element
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
        this.svg.style.backgroundColor = '#b3d9ff'; // Ocean color
        
        // Create groups for different map elements
        this.createGroups();
        
        // Add territories
        this.createTerritories();
        
        // Add continent labels
        this.addContinentLabels();
        
        // Add connections between territories
        this.createConnections();
        
        // Add map controls
        this.addMapControls();
        
        // Create tooltip
        this.createTooltip();
        
        // Add map to container
        this.container.appendChild(this.svg);
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    // Create SVG groups for organizing elements
    createGroups() {
        // Connections group (bottom layer)
        this.connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.connectionsGroup.setAttribute('id', 'connections');
        this.svg.appendChild(this.connectionsGroup);
        
        // Territories group (middle layer)
        this.territoriesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.territoriesGroup.setAttribute('id', 'territories');
        this.svg.appendChild(this.territoriesGroup);
        
        // Labels group (top layer)
        this.labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.labelsGroup.setAttribute('id', 'labels');
        this.svg.appendChild(this.labelsGroup);
        
        // Army counts group
        this.armyCountsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.armyCountsGroup.setAttribute('id', 'army-counts');
        this.svg.appendChild(this.armyCountsGroup);
    }
    
    // Create all territories on the map
    createTerritories() {
        for (const [name, data] of Object.entries(TERRITORIES_DATA)) {
            this.createTerritory(name, data);
        }
    }
    
    // Create a single territory
    createTerritory(name, data) {
        // Create a circle for each territory
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', data.x);
        circle.setAttribute('cy', data.y);
        circle.setAttribute('r', 10);
        circle.setAttribute('id', `territory-${name.replace(/\s+/g, '-').toLowerCase()}`);
        circle.setAttribute('class', 'territory');
        circle.setAttribute('data-name', name);
        circle.setAttribute('data-continent', data.continent);
        
        // Store territory element
        this.territories[name] = {
            element: circle,
            data: data
        };
        
        // Add to territories group
        this.territoriesGroup.appendChild(circle);
        
        // Create army count label
        const armyCount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        armyCount.setAttribute('x', data.x);
        armyCount.setAttribute('y', data.y);
        armyCount.setAttribute('class', 'army-count');
        armyCount.setAttribute('id', `army-count-${name.replace(/\s+/g, '-').toLowerCase()}`);
        armyCount.textContent = '0';
        
        this.armyCountsGroup.appendChild(armyCount);
    }
    
    // Add continent labels to the map
    addContinentLabels() {
        const continentPositions = {
            'North America': { x: 150, y: 100 },
            'South America': { x: 180, y: 270 },
            'Europe': { x: 310, y: 110 },
            'Africa': { x: 320, y: 240 },
            'Asia': { x: 450, y: 140 },
            'Australia': { x: 510, y: 280 },
            'Central America': { x: 140, y: 210 },
            'Middle East': { x: 370, y: 170 },
            'Northern Europe': { x: 330, y: 100 },
            'Southern Europe': { x: 310, y: 160 }
        };
        
        for (const [continent, position] of Object.entries(continentPositions)) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', position.x);
            label.setAttribute('y', position.y);
            label.setAttribute('class', 'continent-label');
            label.textContent = continent;
            
            this.labelsGroup.appendChild(label);
        }
    }
    
    // Create connections between territories
    createConnections() {
        const connectionsMade = new Set();
        
        for (const [territoryName, territoryData] of Object.entries(TERRITORIES_DATA)) {
            const territory = this.territories[territoryName];
            
            for (const adjacentName of territoryData.adjacent) {
                // Create a unique identifier for this connection
                const connectionKey = [territoryName, adjacentName].sort().join('-');
                
                // Skip if connection was already created
                if (connectionsMade.has(connectionKey)) continue;
                
                const adjacentTerritory = this.territories[adjacentName];
                
                if (adjacentTerritory) {
                    // Create a line connecting the territories
                    const connection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    connection.setAttribute('x1', territory.data.x);
                    connection.setAttribute('y1', territory.data.y);
                    connection.setAttribute('x2', adjacentTerritory.data.x);
                    connection.setAttribute('y2', adjacentTerritory.data.y);
                    connection.setAttribute('class', 'connection');
                    
                    this.connectionsGroup.appendChild(connection);
                    
                    // Mark this connection as made
                    connectionsMade.add(connectionKey);
                }
            }
        }
    }
    
    // Add map controls (zoom, etc)
    addMapControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'map-controls';
        
        // Zoom in button
        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'map-control-btn';
        zoomInBtn.innerHTML = '+';
        zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        
        // Zoom out button
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'map-control-btn';
        zoomOutBtn.innerHTML = '-';
        zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        
        // Reset view button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'map-control-btn';
        resetBtn.innerHTML = '⟲';
        resetBtn.addEventListener('click', () => this.resetView());
        
        // Add buttons to container
        controlsContainer.appendChild(zoomInBtn);
        controlsContainer.appendChild(zoomOutBtn);
        controlsContainer.appendChild(resetBtn);
        
        // Add container to map container
        this.container.appendChild(controlsContainer);
    }
    
    // Create tooltip for territory information
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'territory-tooltip';
        this.tooltip.style.display = 'none';
        this.container.appendChild(this.tooltip);
    }
    
    // Set up event listeners for map interaction
    setupEventListeners() {
        // Territory click events
        for (const territory of Object.values(this.territories)) {
            territory.element.addEventListener('click', (e) => {
                const territoryName = e.target.getAttribute('data-name');
                if (this.onTerritoryClick) {
                    this.onTerritoryClick(territoryName);
                }
            });
            
            // Hover events
            territory.element.addEventListener('mouseenter', (e) => {
                const territoryName = e.target.getAttribute('data-name');
                const territoryContinent = e.target.getAttribute('data-continent');
                
                // Show tooltip
                this.tooltip.textContent = `${territoryName} (${territoryContinent})`;
                this.tooltip.style.display = 'block';
                
                // Callback
                if (this.onTerritoryHover) {
                    this.onTerritoryHover(territoryName, true);
                }
            });
            
            territory.element.addEventListener('mouseleave', (e) => {
                const territoryName = e.target.getAttribute('data-name');
                
                // Hide tooltip
                this.tooltip.style.display = 'none';
                
                // Callback
                if (this.onTerritoryHover) {
                    this.onTerritoryHover(territoryName, false);
                }
            });
            
            territory.element.addEventListener('mousemove', (e) => {
                // Position tooltip near cursor
                const rect = this.container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                this.tooltip.style.left = `${x + 10}px`;
                this.tooltip.style.top = `${y + 10}px`;
            });
        }
        
        // Pan events
        this.svg.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                this.isDragging = true;
                this.dragStart = {
                    x: e.clientX,
                    y: e.clientY
                };
                this.svg.style.cursor = 'grabbing';
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = (e.clientX - this.dragStart.x) / this.zoomLevel;
                const dy = (e.clientY - this.dragStart.y) / this.zoomLevel;
                
                this.viewBox.x -= dx;
                this.viewBox.y -= dy;
                
                this.updateViewBox();
                
                this.dragStart = {
                    x: e.clientX,
                    y: e.clientY
                };
            }
        });
        
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.svg.style.cursor = 'grab';
        });
        
        // Zoom with mouse wheel
        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Determine zoom direction
            const direction = e.deltaY < 0 ? 1 : -1;
            const zoomStep = 0.1 * direction;
            
            this.zoom(zoomStep, e);
        });
    }
    
    // Update the SVG viewBox
    updateViewBox() {
        this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
    }
    
    // Zoom the map
    zoom(delta, event) {
        const oldZoom = this.zoomLevel;
        
        // Calculate new zoom level
        this.zoomLevel = Math.max(
            CONFIG.mapZoomMin,
            Math.min(CONFIG.mapZoomMax, this.zoomLevel + delta)
        );
        
        // If zoom level didn't change, return
        if (oldZoom === this.zoomLevel) return;
        
        // Get mouse position for zooming towards cursor
        let mouseX = this.viewBox.width / 2;
        let mouseY = this.viewBox.height / 2;
        
        if (event) {
            const rect = this.svg.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            
            mouseX = this.viewBox.x + this.viewBox.width * x;
            mouseY = this.viewBox.y + this.viewBox.height * y;
        }
        
        // Calculate new viewBox dimensions
        const newWidth = this.viewBox.width * (oldZoom / this.zoomLevel);
        const newHeight = this.viewBox.height * (oldZoom / this.zoomLevel);
        
        // Calculate new viewBox position (centered on mouse)
        const newX = mouseX - (mouseX - this.viewBox.x) * (newWidth / this.viewBox.width);
        const newY = mouseY - (mouseY - this.viewBox.y) * (newHeight / this.viewBox.height);
        
        // Update viewBox
        this.viewBox.x = newX;
        this.viewBox.y = newY;
        this.viewBox.width = newWidth;
        this.viewBox.height = newHeight;
        
        this.updateViewBox();
    }
    
    // Reset map view to default
    resetView() {
        this.zoomLevel = 1;
        this.viewBox = { x: 0, y: 0, width: 600, height: 400 };
        this.updateViewBox();
    }
    
    // Update territory owner
    setTerritoryOwner(territoryName, playerId, color) {
        const territory = this.territories[territoryName];
        if (territory) {
            // Remove any existing player class
            for (let i = 1; i <= CONFIG.maxPlayers; i++) {
                territory.element.classList.remove(`player-${i}`);
            }
            
            // Add new owner class
            if (playerId !== null) {
                territory.element.classList.add(`player-${playerId}`);
            }
        }
    }
    
    // Update territory armies
    setTerritoryArmies(territoryName, armies) {
        const territory = this.territories[territoryName];
        if (territory) {
            const armyCountElement = document.getElementById(`army-count-${territoryName.replace(/\s+/g, '-').toLowerCase()}`);
            if (armyCountElement) {
                armyCountElement.textContent = armies;
            }
        }
    }
    
    // Highlight territories for various game actions
    highlightTerritory(territoryName, type) {
        const territory = this.territories[territoryName];
        if (territory) {
            territory.element.classList.remove('attackable', 'fortifiable', 'reinforceable');
            
            if (type) {
                territory.element.classList.add(type);
            }
        }
    }
    
    // Select/deselect a territory
    selectTerritory(territoryName, selected = true) {
        const territory = this.territories[territoryName];
        if (territory) {
            if (selected) {
                territory.element.classList.add('selected');
            } else {
                territory.element.classList.remove('selected');
            }
        }
    }
    
    // Clear all territory selections
    clearSelections() {
        for (const territory of Object.values(this.territories)) {
            territory.element.classList.remove('selected');
        }
    }
    
    // Clear all territory highlights
    clearHighlights() {
        for (const territory of Object.values(this.territories)) {
            territory.element.classList.remove('attackable', 'fortifiable', 'reinforceable');
        }
    }
}
