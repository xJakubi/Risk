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
        // Load the SVG map file
        this.loadMapSVG();
    }
    
    // Load the SVG map file
    loadMapSVG() {
        fetch('assets/images/risk-map.svg')
            .then(response => response.text())
            .then(svgData => {
                // Insert the SVG into the container
                this.container.innerHTML = svgData;
                
                // Get the SVG element
                this.svg = this.container.querySelector('svg');
                this.svg.setAttribute('width', '100%');
                this.svg.setAttribute('height', '100%');
                
                // Set the initial viewBox
                this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
                
                // Get references to groups
                this.connectionsGroup = this.svg.querySelector('#connections');
                this.territoriesGroup = this.svg.querySelector('#territories');
                this.armyCountsGroup = this.svg.querySelector('#army-counts');
                this.labelsGroup = this.svg.querySelector('#labels');
                
                // Create territories
                this.createTerritories();
                
                // Create connections between territories
                this.createConnections();
                
                // Set up map controls
                this.setupMapControls();
                
                // Create tooltip
                this.createTooltip();
                
                // Set up drag and zoom
                this.setupDragAndZoom();
            })
            .catch(error => {
                console.error('Error loading the map SVG:', error);
                // Fallback to the old map creation if SVG fails to load
                this.createFallbackMap();
            });
        
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
        // Create a territory group
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', `territory-group-${name.replace(/\s+/g, '-').toLowerCase()}`);
        group.setAttribute('data-name', name);
        group.setAttribute('data-continent', data.continent);
        
        // Create a more detailed territory shape
        // We'll generate a polygon based on the territory position
        const territory = this.createTerritoryShape(name, data);
        territory.setAttribute('id', `territory-${name.replace(/\s+/g, '-').toLowerCase()}`);
        territory.setAttribute('class', 'territory');
        territory.setAttribute('data-name', name);
        territory.setAttribute('data-continent', data.continent);
        
        // Add a highlight/glow effect for the territory
        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        highlight.setAttribute('cx', data.x);
        highlight.setAttribute('cy', data.y);
        highlight.setAttribute('r', 6);
        highlight.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
        highlight.setAttribute('class', 'territory-highlight');
          // Add event listeners
        territory.addEventListener('click', () => {
            if (this.onTerritoryClick) {
                this.onTerritoryClick(name);
            }
        });
        
        territory.addEventListener('mouseenter', () => {
            // Show tooltip
            this.showTooltip(name, data, { x: data.x, y: data.y });
            
            if (this.onTerritoryHover) {
                this.onTerritoryHover(name, true);
            }
        });
        
        territory.addEventListener('mouseleave', () => {
            // Hide tooltip
            this.hideTooltip();
            
            if (this.onTerritoryHover) {
                this.onTerritoryHover(name, false);
            }
        });
        
        // Add shapes to the group
        group.appendChild(territory);
        group.appendChild(highlight);
        
        // Store territory elements
        this.territories[name] = {
            element: territory,
            group: group,
            highlight: highlight,
            data: data
        };
        
        // Add to territories group
        this.territoriesGroup.appendChild(group);
        
        // Create army count label
        const armyCount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        armyCount.setAttribute('x', data.x);
        armyCount.setAttribute('y', data.y + 1); // Slight offset for better centering
        armyCount.setAttribute('class', 'army-count');
        armyCount.setAttribute('id', `army-count-${name.replace(/\s+/g, '-').toLowerCase()}`);
        armyCount.textContent = '0';
        
        this.armyCountsGroup.appendChild(armyCount);
    }
    
    // Create a polygon shape for a territory
    createTerritoryShape(name, data) {
        // Generate a polygon shape around the territory center point
        // This creates an irregular polygon to make maps more interesting
        const points = this.generateTerritoryPoints(data.x, data.y, data.continent);
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', points);
        
        // Add the continent class to style based on continent
        path.classList.add(`continent-${data.continent.toLowerCase().replace(/\s+/g, '-')}`);
        
        return path;
    }
    
    // Generate points for a territory polygon
    generateTerritoryPoints(x, y, continent) {
        // Size of territory based on continent (some continents have more dense territories)
        const baseSizeMap = {
            'North America': 15,
            'South America': 18,
            'Europe': 12,
            'Africa': 16,
            'Asia': 14,
            'Australia': 20,
            'Central America': 10,
            'Middle East': 14,
            'Northern Europe': 10,
            'Southern Europe': 10
        };
        
        const baseSize = baseSizeMap[continent] || 15;
        
        // Create an irregular polygon with 6-8 points
        const points = [];
        const numPoints = 6 + Math.floor(Math.random() * 3); // 6-8 points
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * 2 * Math.PI;
            // Vary the radius to create irregular shapes
            const radius = baseSize * (0.8 + Math.random() * 0.4);
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            points.push(`${i === 0 ? 'M' : 'L'}${px},${py}`);
        }
        
        // Close the path
        points.push('Z');
        
        return points.join(' ');
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
    
    // Show tooltip for a territory
    showTooltip(name, data, position) {
        if (!this.tooltip) return;
        
        // Update tooltip content with territory info
        this.tooltip.innerHTML = `
            <strong>${name}</strong>
            <div>Continent: ${data.continent}</div>
        `;
        
        // Calculate position (above the territory)
        const svgRect = this.svg.getBoundingClientRect();
        const scale = svgRect.width / this.viewBox.width;
        
        // Convert SVG coordinates to screen coordinates
        const screenX = (position.x - this.viewBox.x) * scale;
        const screenY = (position.y - this.viewBox.y) * scale;
        
        // Position tooltip
        this.tooltip.style.left = `${screenX}px`;
        this.tooltip.style.top = `${screenY - 40}px`; // Position above territory
        this.tooltip.style.display = 'block';
    }
    
    // Hide tooltip
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }
      // Set up event listeners for map interaction
    setupEventListeners() {
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
