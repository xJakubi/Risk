/**
 * Dice module for Risk game
 * Handles dice rolling with animations
 */

class DiceRoller {
    constructor() {
        this.attackDice = [];
        this.defenseDice = [];
        this.attackContainer = document.getElementById('attack-dice');
        this.defenseContainer = document.getElementById('defense-dice');
        this.rollInProgress = false;
        
        // For dice rolling modal
        this.rollModal = document.getElementById('dice-roll-modal');
        this.rollInstructions = document.getElementById('roll-instructions');
        this.rollDiceDisplay = document.getElementById('roll-dice-display');
        this.rollDiceBtn = document.getElementById('roll-dice-btn');
        
        // Bind event handlers
        this.rollDiceBtn.addEventListener('click', this.handlePlayerRoll.bind(this));
        
        // Callback for when dice roll is complete
        this.onRollComplete = null;
    }
    
    // Create a single die element
    createDie(isAttack) {
        const die = document.createElement('div');
        die.className = `dice ${isAttack ? 'attack-die' : 'defense-die'}`;
        
        const cube = document.createElement('div');
        cube.className = 'dice-cube';
        
        // Create all 6 faces
        for (let i = 1; i <= 6; i++) {
            const face = document.createElement('div');
            face.className = `dice-face face-${i}`;
            
            const pips = document.createElement('div');
            pips.className = `dice-pips pips-${i}`;
            
            // Add the appropriate number of pips
            for (let j = 0; j < i; j++) {
                const pip = document.createElement('div');
                pip.className = 'pip';
                pips.appendChild(pip);
            }
            
            face.appendChild(pips);
            cube.appendChild(face);
        }
        
        die.appendChild(cube);
        return die;
    }
    
    // Clear existing dice
    clearDice() {
        this.attackContainer.innerHTML = '';
        this.defenseContainer.innerHTML = '';
        this.attackDice = [];
        this.defenseDice = [];
    }
    
    // Set up dice for a battle
    setupDice(attackCount, defenseCount) {
        this.clearDice();
        
        // Create attack dice
        for (let i = 0; i < attackCount; i++) {
            const die = this.createDie(true);
            this.attackContainer.appendChild(die);
            this.attackDice.push(die);
        }
        
        // Create defense dice
        for (let i = 0; i < defenseCount; i++) {
            const die = this.createDie(false);
            this.defenseContainer.appendChild(die);
            this.defenseDice.push(die);
        }
    }
    
    // Roll specific dice with animation
    rollDie(die, value) {
        return new Promise(resolve => {
            const cube = die.querySelector('.dice-cube');
            
            // Apply rolling animation
            cube.classList.add('rolling');
            
            // Apply bouncing animation to the die
            die.classList.add('rolling-bounce');
            
            // Remove animations and set final value
            setTimeout(() => {
                cube.classList.remove('rolling');
                die.classList.remove('rolling-bounce');
                
                // Set the proper rotation for the final value
                switch(value) {
                    case 1:
                        cube.style.transform = 'rotateX(0deg) rotateY(0deg)';
                        break;
                    case 2:
                        cube.style.transform = 'rotateY(90deg)';
                        break;
                    case 3:
                        cube.style.transform = 'rotateY(180deg)';
                        break;
                    case 4:
                        cube.style.transform = 'rotateY(-90deg)';
                        break;
                    case 5:
                        cube.style.transform = 'rotateX(90deg)';
                        break;
                    case 6:
                        cube.style.transform = 'rotateX(-90deg)';
                        break;
                }
                
                resolve(value);
            }, CONFIG.diceRollDuration);
        });
    }
    
    // Roll all dice and return results
    async rollDice(attackValues, defenseValues) {
        this.rollInProgress = true;
        
        // Make sure values are provided, or generate random ones
        attackValues = attackValues || this.attackDice.map(() => this.getRandomDieValue());
        defenseValues = defenseValues || this.defenseDice.map(() => this.getRandomDieValue());
        
        // Roll attack dice
        const attackRolls = [];
        for (let i = 0; i < this.attackDice.length; i++) {
            if (i < attackValues.length) {
                attackRolls.push(this.rollDie(this.attackDice[i], attackValues[i]));
            }
        }
        
        // Roll defense dice
        const defenseRolls = [];
        for (let i = 0; i < this.defenseDice.length; i++) {
            if (i < defenseValues.length) {
                defenseRolls.push(this.rollDie(this.defenseDice[i], defenseValues[i]));
            }
        }
        
        // Wait for all dice to finish rolling
        const attackResults = await Promise.all(attackRolls);
        const defenseResults = await Promise.all(defenseRolls);
        
        // Sort results in descending order (Risk rules)
        attackResults.sort((a, b) => b - a);
        defenseResults.sort((a, b) => b - a);
        
        // Highlight winners and losers
        this.highlightWinners(attackResults, defenseResults);
        
        this.rollInProgress = false;
        
        // If there's a callback, invoke it with the results
        if (this.onRollComplete) {
            setTimeout(() => {
                this.onRollComplete(attackResults, defenseResults);
            }, 1000); // Give time to see the results
        }
        
        return {
            attack: attackResults,
            defense: defenseResults
        };
    }
    
    // Highlight winner dice
    highlightWinners(attackValues, defenseValues) {
        // Compare each pair (up to the number of defense dice)
        const comparisons = Math.min(attackValues.length, defenseValues.length);
        
        for (let i = 0; i < comparisons; i++) {
            if (attackValues[i] > defenseValues[i]) {
                // Attacker wins
                this.attackDice[i].classList.add('winner');
                this.defenseDice[i].classList.add('loser');
            } else {
                // Defender wins
                this.attackDice[i].classList.add('loser');
                this.defenseDice[i].classList.add('winner');
            }
        }
    }
    
    // Generate a random die value (1-6)
    getRandomDieValue() {
        return Math.floor(Math.random() * 6) + 1;
    }
    
    // Show the dice rolling modal for player interaction
    showRollModal(isAttacker, maxDice, onRollComplete) {
        this.rollInProgress = true;
        this.onRollComplete = onRollComplete;
        
        // Clear previous state
        this.rollDiceDisplay.innerHTML = '';
        
        // Set instructions
        this.rollInstructions.textContent = isAttacker ? 
            `You are attacking. Choose up to ${maxDice} dice to roll.` :
            `You are defending. Choose up to ${maxDice} dice to roll.`;
        
        // Create dice selection
        for (let i = 1; i <= maxDice; i++) {
            const diceOption = document.createElement('div');
            diceOption.className = 'dice-option';
            diceOption.innerHTML = `
                <input type="radio" name="dice-count" id="dice-${i}" value="${i}" ${i === maxDice ? 'checked' : ''}>
                <label for="dice-${i}">${i} ${i === 1 ? 'Die' : 'Dice'}</label>
            `;
            this.rollDiceDisplay.appendChild(diceOption);
        }
        
        // Store state for the roll handler
        this.currentRollState = {
            isAttacker,
            maxDice
        };
        
        // Show the modal
        this.rollModal.style.display = 'flex';
    }
    
    // Hide the dice rolling modal
    hideRollModal() {
        this.rollModal.style.display = 'none';
        this.rollInProgress = false;
    }
    
    // Handle when player clicks the roll button
    handlePlayerRoll() {
        // Get the number of dice selected
        const diceCountInputs = document.getElementsByName('dice-count');
        let selectedCount = this.currentRollState.maxDice; // Default to max
        
        for (const input of diceCountInputs) {
            if (input.checked) {
                selectedCount = parseInt(input.value);
                break;
            }
        }
        
        // Generate random values for the dice
        const values = [];
        for (let i = 0; i < selectedCount; i++) {
            values.push(this.getRandomDieValue());
        }
        
        // Hide the modal
        this.hideRollModal();
        
        // Return the result to the callback
        if (this.onRollComplete) {
            this.onRollComplete(values);
        }
    }
    
    // Check if a roll is in progress
    isRolling() {
        return this.rollInProgress;
    }
}

// Create a global instance
const diceRoller = new DiceRoller();
