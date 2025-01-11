document.addEventListener('DOMContentLoaded', () => {
    // ===============================
    // Existing elements
    // ===============================
    const doorsGrid = document.getElementById('doorsGrid');
    const doorCountSelect = document.getElementById('doorCountSelect');
    const doors = []; // To store door elements
    const statusMessage = document.getElementById('statusMessage');
    const attemptsDiv = document.getElementById('attempts');
    const logDiv = document.getElementById('log');
    const knownPositionSelect = document.getElementById('knownPositionSelect');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const revealBtn = document.getElementById('revealBtn');
    const changeViewBtn = document.getElementById('changeViewBtn');
    const gridSection = document.querySelector('.grid');

    // Arrow Buttons
    const leftArrowBtn = document.getElementById('leftArrowBtn');
    const rightArrowBtn = document.getElementById('rightArrowBtn');

    // ===============================
    // New elements for simulation
    // ===============================
    const simulationPatternTextarea = document.getElementById('simulationPattern');
    const runSimulationBtn = document.getElementById('runSimulationBtn');
    const simulationStatusP = document.getElementById('simulationStatus');
    const simulationCounterP = document.getElementById('simulationCounter');

    // ===============================
    // Existing game state variables
    // ===============================
    let gameActive = false;
    let computerPosition = null; // Internal tracking
    let revealTimeout = null;
    let isGridView = true; // Tracks the current view state
    let attemptsCount = 0; // Initialize attempt counter
    let numberOfDoors = 3; // Default number of doors

    // Variables to store last game settings
    let lastNumberOfDoors = 3;
    let lastKnownPosition = 'unknown';

    // ===============================
    // New simulation variables
    // ===============================
    let simulationActive = false;
    let simulationPattern = [];
    let simulationIndex = 0; // which door in the pattern we're on

    // Track how many attempts we used in the simulation:
    let simulationAttemptsCount = 0; 
    // We'll see if the sack is caught or survives.

    // ===============================
    // Functions
    // ===============================

    // Populate Known Position Select based on number of doors
    function populateKnownPositionSelect(count) {
        knownPositionSelect.innerHTML = '<option value="" disabled selected>בחר דלת</option>';
        for (let i = 1; i <= count; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `דלת ${i}`;
            knownPositionSelect.appendChild(option);
        }
        // Add 'unknown' option
        const unknownOption = document.createElement('option');
        unknownOption.value = 'unknown';
        unknownOption.textContent = 'מיקום לא ידוע';
        knownPositionSelect.appendChild(unknownOption);
    }

    // Generate Doors Dynamically
    function generateDoors(count) {
        doorsGrid.innerHTML = ''; // Clear existing doors
        doors.length = 0; // Reset doors array

        for (let i = 1; i <= count; i++) {
            const door = document.createElement('div');
            door.classList.add('door');
            door.setAttribute('data-door', i);
            door.textContent = i;
            doorsGrid.appendChild(door);
            doors.push(door);

            // Add event listener to each door
            door.addEventListener('click', () => {
                if (!gameActive) {
                    alert('אנא התחל את המשחק.');
                    return;
                }
                const pressedDoor = parseInt(door.getAttribute('data-door'));
                addLog(`נלחץ על דלת ${pressedDoor}`);
                updatePossiblePositionsAfterClick(pressedDoor);
            });
        }
    }

    // Update Status Display
    function updateStatus() {
        if (!gameActive) {
            statusMessage.textContent = 'בחר התחלה כדי להתחיל את המשחק.';
            return;
        }
        const isKnownMode = lastKnownPosition !== 'unknown';
        if (isKnownMode && computerPosition !== null) {
            const moves = getPossibleMoves(computerPosition);
            const moveText = moves.sort((a, b) => a - b).join(' או ');
            statusMessage.textContent = `מיקום השק: דלת ${computerPosition} | השק יכול לנוע לדלת ${moveText}`;
        } else if (computerPosition !== null) {
            // Unknown mode
            statusMessage.textContent = `השק נמצא בדלת כלשהי.`;
        }
    }

    // Update Attempts Display
    function updateAttempts() {
        attemptsDiv.textContent = `ניסיונות: ${attemptsCount}`;
    }

    // Add Message to Log
    function addLog(message) {
        const p = document.createElement('p');
        p.textContent = message;
        logDiv.prepend(p);
    }

    /**
     * The sack can only move exactly 1 door left or right (if possible).
     */
    function getPossibleMoves(position) {
        const moves = [];
        if (position === 1) {
            if (numberOfDoors > 1) moves.push(2);
            return moves;
        }
        if (position === numberOfDoors) {
            if (numberOfDoors > 1) moves.push(numberOfDoors - 1);
            return moves;
        }
        moves.push(position - 1);
        moves.push(position + 1);
        return moves;
    }

    // Update Doors Display
    function updateDoors() {
        doors.forEach(door => {
            const doorNumber = parseInt(door.getAttribute('data-door'));
            door.classList.remove('fallen', 'known', 'revealed');
            if (doorNumber === computerPosition && lastKnownPosition !== 'unknown') {
                door.classList.add('known');
            }
        });
    }

    // Start Game Function
    function startGame(count, knownPos) {
        numberOfDoors = count;
        generateDoors(count);
        populateKnownPositionSelect(count);

        if (knownPos === 'unknown') {
            computerPosition = getRandomDoor();
            addLog('השק התחיל במיקום לא ידוע.');
        } else {
            computerPosition = parseInt(knownPos);
            addLog(`השק התחיל בדלת ${computerPosition}.`);
        }

        gameActive = true;
        logDiv.innerHTML = '';
        updateDoors();
        updateStatus();
        addLog('המשחק התחיל.');

        if (knownPos === 'unknown') {
            addLog('השק התחיל במיקום לא ידוע.');
        } else {
            addLog(`השק התחיל בדלת ${computerPosition}.`);
        }

        startBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';
        revealBtn.style.display = 'inline-block';
        attemptsCount = 0; // Reset attempts counter
        updateAttempts();
        doorCountSelect.disabled = true;
        knownPositionSelect.disabled = true;
        updateArrows();
    }

    // Reset Game Function
    function resetGame() {
        gameActive = false;
        computerPosition = null;
        logDiv.innerHTML = '';
        updateDoors();
        updateStatus();
        attemptsCount = 0;
        updateAttempts();
        resetBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
        revealBtn.style.display = 'none';
        leftArrowBtn.disabled = true;
        rightArrowBtn.disabled = true;
        leftArrowBtn.classList.remove('enabled');
        rightArrowBtn.classList.remove('enabled');
        leftArrowBtn.dataset.target = '';
        rightArrowBtn.dataset.target = '';
        if (revealTimeout) {
            clearTimeout(revealTimeout);
            revealTimeout = null;
        }

        // automatically restore last settings
        startGame(lastNumberOfDoors, lastKnownPosition);
    }

    // Event Listener for Reset Button
    resetBtn.addEventListener('click', () => {
        resetGame();
    });

    // Event Listener for Start Button
    startBtn.addEventListener('click', () => {
        const selectedDoorCount = doorCountSelect.value;
        const selectedKnownPosition = knownPositionSelect.value;

        if (!selectedDoorCount) {
            alert('אנא בחר מספר דלתות.');
            return;
        }

        if (!selectedKnownPosition) {
            alert('אנא בחר דלת למיקום ידוע או בחר מיקום לא ידוע.');
            return;
        }

        lastNumberOfDoors = parseInt(selectedDoorCount);
        lastKnownPosition = selectedKnownPosition;
        startGame(lastNumberOfDoors, lastKnownPosition);
    });

    // Door Count change => re-populate knownPositionSelect
    doorCountSelect.addEventListener('change', () => {
        const newCount = parseInt(doorCountSelect.value);
        populateKnownPositionSelect(newCount);
        if (lastKnownPosition !== 'unknown' && lastKnownPosition > newCount) {
            knownPositionSelect.value = '';
            lastKnownPosition = 'unknown';
        }
    });

    // Random door
    function getRandomDoor() {
        return Math.floor(Math.random() * numberOfDoors) + 1;
    }

    // Update Positions After Door Click (Manual)
    function updatePossiblePositionsAfterClick(pressedDoor) {
        attemptsCount++;
        updateAttempts();

        if (pressedDoor === computerPosition) {
            addLog(`לחצת על דלת ${pressedDoor}. השק נפל!`);
            doors.forEach(d => d.classList.add('fallen'));
            gameActive = false;
            updateStatus();
            addLog('המשחק הסתיים.');
            revealBtn.style.display = 'none';
            leftArrowBtn.disabled = true;
            rightArrowBtn.disabled = true;
            leftArrowBtn.classList.remove('enabled');
            rightArrowBtn.classList.remove('enabled');
            knownPositionSelect.disabled = false;
            doorCountSelect.disabled = false;
            return;
        }

        addLog(`לחצת על דלת ${pressedDoor}. השק לא נפל.`);

        const moves = getPossibleMoves(computerPosition);
        if (moves.length === 0) {
            addLog('אין אפשרויות תנועה נוספות. המשחק מסתיים.');
            gameActive = false;
            updateStatus();
            addLog('המשחק הסתיים.');
            revealBtn.style.display = 'none';
            leftArrowBtn.disabled = true;
            rightArrowBtn.disabled = true;
            knownPositionSelect.disabled = false;
            doorCountSelect.disabled = false;
            return;
        }

        addLog(`השק יכול לנוע לדלת ${moves.sort((a, b) => a - b).join(' או ')}`);
        // random move
        const randIdx = Math.floor(Math.random() * moves.length);
        computerPosition = moves[randIdx];
        addLog(`השק זז לדלת ${computerPosition}.`);
        updateDoors();
        updateStatus();
        updateArrows();
    }

    // Reveal Button
    revealBtn.addEventListener('click', () => {
        if (!gameActive || computerPosition === null) {
            alert('אין מידע לחשוף. אנא התחל את המשחק.');
            return;
        }
        const currentDoor = document.querySelector(`.door[data-door="${computerPosition}"]`);
        if (currentDoor) {
            currentDoor.classList.add('revealed');
            revealBtn.disabled = true;
            revealTimeout = setTimeout(() => {
                currentDoor.classList.remove('revealed');
                revealBtn.disabled = false;
            }, 2000);
        }
    });

    // Change View
    changeViewBtn.addEventListener('click', () => {
        if (isGridView) {
            gridSection.classList.add('single-line');
            changeViewBtn.textContent = 'שנה לתצוגת רשת';
            isGridView = false;
        } else {
            gridSection.classList.remove('single-line');
            changeViewBtn.textContent = 'שנה תצוגה';
            isGridView = true;
        }
    });

    // Update Arrows
    function updateArrows() {
        if (!gameActive || computerPosition === null) {
            leftArrowBtn.disabled = true;
            rightArrowBtn.disabled = true;
            leftArrowBtn.classList.remove('enabled');
            rightArrowBtn.classList.remove('enabled');
            leftArrowBtn.dataset.target = '';
            rightArrowBtn.dataset.target = '';
            return;
        }

        const possibleMoves = getPossibleMoves(computerPosition);
        if (!possibleMoves.length) {
            leftArrowBtn.disabled = true;
            rightArrowBtn.disabled = true;
            leftArrowBtn.classList.remove('enabled');
            rightArrowBtn.classList.remove('enabled');
            leftArrowBtn.dataset.target = '';
            rightArrowBtn.dataset.target = '';
            return;
        }

        if (possibleMoves.length === 1) {
            leftArrowBtn.disabled = false;
            leftArrowBtn.classList.add('enabled');
            leftArrowBtn.dataset.target = possibleMoves[0];
            rightArrowBtn.disabled = true;
            rightArrowBtn.classList.remove('enabled');
            rightArrowBtn.dataset.target = '';
        } else {
            leftArrowBtn.disabled = false;
            leftArrowBtn.classList.add('enabled');
            leftArrowBtn.dataset.target = possibleMoves[0];
            rightArrowBtn.disabled = false;
            rightArrowBtn.classList.add('enabled');
            rightArrowBtn.dataset.target = possibleMoves[1];
        }
    }

    // Move Sack Manually with Arrows
    leftArrowBtn.addEventListener('click', () => {
        if (leftArrowBtn.disabled) return;
        const targetDoor = parseInt(leftArrowBtn.dataset.target);
        moveSack(targetDoor, 'left', false);
    });

    rightArrowBtn.addEventListener('click', () => {
        if (rightArrowBtn.disabled) return;
        const targetDoor = parseInt(rightArrowBtn.dataset.target);
        moveSack(targetDoor, 'right', false);
    });

    function moveSack(targetDoor, direction, shouldLog = true) {
        if (!gameActive || computerPosition === null) return;
        const possibleMoves = getPossibleMoves(computerPosition);
        if (!possibleMoves.includes(targetDoor)) {
            alert('תנועה לא חוקית.');
            return;
        }
        computerPosition = targetDoor;
        if (shouldLog) {
            addLog(`השק זז לדלת ${computerPosition} (${direction}-arrow).`);
        }
        updateDoors();
        updateStatus();
        updateArrows();
    }

    // Initialize on page load
    function initializeGame() {
        if (!doorCountSelect.value) {
            doorCountSelect.value = '3';
        }
        numberOfDoors = parseInt(doorCountSelect.value);
        lastNumberOfDoors = numberOfDoors;
        generateDoors(numberOfDoors);
        populateKnownPositionSelect(numberOfDoors);
    }
    initializeGame();

    // ========================================
    // NEW: SMART SIMULATION
    // ========================================
    runSimulationBtn.addEventListener('click', () => {
        if (simulationActive) {
            alert('סימולציה כבר פעילה.');
            return;
        }

        const patternText = simulationPatternTextarea.value.trim();
        if (!patternText) {
            alert('אנא הזן תבנית סימולציה.');
            return;
        }

        // Parse the pattern
        const lines = patternText.split(/\r?\n/);
        let pattern = [];
        lines.forEach(line => {
            const parts = line.split(',');
            parts.forEach(p => {
                const doorNum = parseInt(p.trim());
                if (!isNaN(doorNum)) {
                    pattern.push(doorNum);
                }
            });
        });

        if (!pattern.length) {
            alert('לא נמצאו מספרי דלת תקינים בתבנית.');
            return;
        }

        // Initialize simulation
        simulationActive = true;
        simulationPattern = pattern;
        simulationIndex = 0;
        simulationAttemptsCount = 0;
        simulationStatusP.textContent = 'מצב סימולציה: פעיל';
        simulationCounterP.textContent = 'ניסיונות בסימולציה: 0';

        startSmartSimulation();
    });

    // Start a new simulation run
    function startSmartSimulation() {
        resetGameForSimulation();
        // Launch the pattern from index 0
        playSmartPattern(0);
    }

    // Clear / reset before sim
    function resetGameForSimulation() {
        gameActive = false;
        computerPosition = null;
        logDiv.innerHTML = '';
        updateDoors();
        updateStatus();
        attemptsCount = 0;
        updateAttempts();
        revealBtn.style.display = 'none';
        leftArrowBtn.disabled = true;
        rightArrowBtn.disabled = true;
        leftArrowBtn.classList.remove('enabled');
        rightArrowBtn.classList.remove('enabled');
        leftArrowBtn.dataset.target = '';
        rightArrowBtn.dataset.target = '';
        if (revealTimeout) {
            clearTimeout(revealTimeout);
            revealTimeout = null;
        }
        // Start the game with last settings, but we'll override the "movement" logic
        startGame(lastNumberOfDoors, lastKnownPosition);
    }

    // Recursively play the pattern of door openings
    function playSmartPattern(idx) {
        if (!simulationActive) return;
        if (!gameActive) {
            // Sack was caught
            finishSimulation(false);
            return;
        }
        if (idx >= simulationPattern.length) {
            // Survived all
            finishSimulation(true);
            return;
        }

        const doorToOpen = simulationPattern[idx];
        addLog(`(סימולציה) פותחים את דלת ${doorToOpen}`);
        updatePossiblePositionsAfterSmartClick(doorToOpen, idx);
        // Move to next
        setTimeout(() => {
            playSmartPattern(idx + 1);
        }, 150);
    }

    // "Smart" move logic
    function updatePossiblePositionsAfterSmartClick(pressedDoor, idxInPattern) {
        simulationAttemptsCount++; 
        // We won't reuse attemptsCount for the simulation logic,
        // because the main game has it as well. We'll keep a separate counter here.
        simulationCounterP.textContent = `ניסיונות בסימולציה: ${simulationAttemptsCount}`;

        // Check if the sack is caught
        if (pressedDoor === computerPosition) {
            addLog(`נלחץ על דלת ${pressedDoor}. השק נפל!`);
            doors.forEach(d => d.classList.add('fallen'));
            gameActive = false;
            addLog('המשחק הסתיים (סימולציה).');
            return;
        }
        addLog(`נלחץ על דלת ${pressedDoor}. השק לא נפל.`);

        // Sack moves SMART:
        const moves = getPossibleMoves(computerPosition);
        if (!moves.length) {
            addLog('אין אפשרויות תנועה נוספות. המשחק מסתיים.');
            gameActive = false;
            return;
        }
        addLog(`השק יכול לנוע לדלת ${moves.sort((a, b) => a - b).join(' או ')}`);

        // See what the NEXT door is
        let nextDoor = null;
        if (idxInPattern + 1 < simulationPattern.length) {
            nextDoor = simulationPattern[idxInPattern + 1];
        }
        const chosenDoor = chooseSmartMove(computerPosition, moves, nextDoor);
        computerPosition = chosenDoor;
        addLog(`השק זז לדלת ${computerPosition} (חכם).`);
        updateDoors();
    }

    // The "smart" move tries to avoid the next door if possible
    function chooseSmartMove(currentPos, possibleMoves, nextDoor) {
        if (!nextDoor) {
            // no next door => just pick randomly
            return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
        // filter out the nextDoor if possible
        const safeMoves = possibleMoves.filter(m => m !== nextDoor);
        if (safeMoves.length > 0) {
            return safeMoves[Math.floor(Math.random() * safeMoves.length)];
        }
        // if forced, we must move to nextDoor
        return nextDoor;
    }

    function finishSimulation(survived) {
        simulationActive = false;
        if (survived) {
            addLog('הסימולציה הסתיימה: השק שרד את כל הלחיצות!');
            simulationStatusP.textContent = 'מצב סימולציה: הסתיימה - לא נתפס';
        } else {
            addLog(`הסימולציה הסתיימה: השק נתפס לאחר ${simulationAttemptsCount} נסיונות.`);
            simulationStatusP.textContent = `מצב סימולציה: הסתיימה - נתפס בנסיון ${simulationAttemptsCount}`;
        }
    }

});
