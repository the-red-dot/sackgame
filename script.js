document.addEventListener('DOMContentLoaded', () => {
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

    let gameActive = false;
    let computerPosition = null; // Internal tracking
    let revealTimeout = null;
    let isGridView = true; // Tracks the current view state
    let attemptsCount = 0; // Initialize attempt counter
    let numberOfDoors = 3; // Default number of doors

    // Variables to store last game settings
    let lastNumberOfDoors = 3;
    let lastKnownPosition = 'unknown';

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
            const moveText = Array.from(moves).sort((a, b) => a - b).join(' או ');
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

    // Get Possible Moves based on Even/Odd Rules
    function getPossibleMoves(position) {
        const moves = [];
        const isEvenPos = position % 2 === 0;
        if (isEvenPos) {
            // Even position: move to adjacent odd doors
            if (position > 1 && isOdd(position - 1)) moves.push(position - 1);
            if (position < numberOfDoors && isOdd(position + 1)) moves.push(position + 1);
        } else {
            // Odd position: move to adjacent even doors
            if (position > 1 && isEven(position - 1)) moves.push(position - 1);
            if (position < numberOfDoors && isEven(position + 1)) moves.push(position + 1);
        }
        return moves;
    }

    // Check if a number is even
    function isEven(number) {
        return number % 2 === 0;
    }

    // Check if a number is odd
    function isOdd(number) {
        return number % 2 !== 0;
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
        // Update numberOfDoors to reflect the current game settings
        numberOfDoors = count;

        // Generate doors and populate known position select
        generateDoors(count);
        populateKnownPositionSelect(count);

        // Assign computer's position
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
        doorCountSelect.disabled = true; // Prevent changing door count during active game
        knownPositionSelect.disabled = true; // Prevent changing known position during active game
        updateArrows();
    }

    // Reset Game Function
    function resetGame() {
        gameActive = false;
        computerPosition = null;
        logDiv.innerHTML = '';
        updateDoors();
        updateStatus();
        attemptsCount = 0; // Reset attempts counter
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

        // Automatically start a new game with last settings
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

        // Update last settings
        lastNumberOfDoors = parseInt(selectedDoorCount);
        lastKnownPosition = selectedKnownPosition;

        // Start the game with selected settings
        startGame(lastNumberOfDoors, lastKnownPosition);
    });

    // Event Listener for Door Count Selector to update Known Position Selector dynamically
    doorCountSelect.addEventListener('change', () => {
        const newCount = parseInt(doorCountSelect.value);
        populateKnownPositionSelect(newCount);

        // If the current known position is greater than the new count, reset it
        if (lastKnownPosition !== 'unknown' && lastKnownPosition > newCount) {
            knownPositionSelect.value = '';
            lastKnownPosition = 'unknown';
        }
    });

    // Get a random door number between 1 and numberOfDoors
    function getRandomDoor() {
        return Math.floor(Math.random() * numberOfDoors) + 1;
    }

    // Update Positions After Door Click
    function updatePossiblePositionsAfterClick(pressedDoor) {
        // **Moved attemptsCount++ here to include successes**
        attemptsCount++;
        updateAttempts();

        if (pressedDoor === computerPosition) {
            // The sack has been caught
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
            knownPositionSelect.disabled = false; // Allow changing known position after game ends
            doorCountSelect.disabled = false; // Allow changing door count after game ends
            return;
        }

        // The sack moves based on rules
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
            leftArrowBtn.classList.remove('enabled');
            rightArrowBtn.classList.remove('enabled');
            knownPositionSelect.disabled = false; // Allow changing known position after game ends
            doorCountSelect.disabled = false; // Allow changing door count after game ends
            return;
        }

        addLog(`השק יכול לנוע לדלת ${moves.sort((a, b) => a - b).join(' או ')}`);

        // Randomly choose the next position from possible moves
        const randomIndex = Math.floor(Math.random() * moves.length);
        computerPosition = moves[randomIndex];
        addLog(`השק זז לדלת ${computerPosition}.`);
        updateDoors();
        updateStatus();
        updateArrows();
    }

    // Event Listener for Reveal Button
    revealBtn.addEventListener('click', () => {
        if (!gameActive || computerPosition === null) {
            alert('אין מידע לחשוף. אנא התחל את המשחק.');
            return;
        }

        // Highlight the computer's current door
        const currentDoor = document.querySelector(`.door[data-door="${computerPosition}"]`);
        if (currentDoor) {
            currentDoor.classList.add('revealed');

            // Remove the highlight after 2 seconds
            revealBtn.disabled = true; // Disable button to prevent multiple clicks
            revealTimeout = setTimeout(() => {
                currentDoor.classList.remove('revealed');
                revealBtn.disabled = false;
            }, 2000); // 2 seconds as per latest requirement
        }
    });

    // Event Listener for Change View Button
    changeViewBtn.addEventListener('click', () => {
        if (isGridView) {
            // Switch to single-line view
            gridSection.classList.add('single-line');
            changeViewBtn.textContent = 'שנה לתצוגת רשת';
            isGridView = false;
        } else {
            // Switch back to grid view
            gridSection.classList.remove('single-line');
            changeViewBtn.textContent = 'שנה תצוגה';
            isGridView = true;
        }
    });

    // Function to Update Arrow Buttons Based on Current Position
    function updateArrows() {
        if (!gameActive || computerPosition === null) {
            // Disable all arrows
            leftArrowBtn.disabled = true;
            rightArrowBtn.disabled = true;
            leftArrowBtn.classList.remove('enabled');
            rightArrowBtn.classList.remove('enabled');
            leftArrowBtn.dataset.target = '';
            rightArrowBtn.dataset.target = '';
            return;
        }

        const possibleMoves = getPossibleMoves(computerPosition);
        if (possibleMoves.length === 0) {
            // No moves available
            leftArrowBtn.disabled = true;
            rightArrowBtn.disabled = true;
            leftArrowBtn.classList.remove('enabled');
            rightArrowBtn.classList.remove('enabled');
            leftArrowBtn.dataset.target = '';
            rightArrowBtn.dataset.target = '';
            return;
        }

        if (possibleMoves.length === 1) {
            // Only one possible move, assign to left arrow
            leftArrowBtn.disabled = false;
            leftArrowBtn.classList.add('enabled');
            leftArrowBtn.dataset.target = possibleMoves[0];
            rightArrowBtn.disabled = true;
            rightArrowBtn.classList.remove('enabled');
            rightArrowBtn.dataset.target = '';
        } else if (possibleMoves.length === 2) {
            // Two possible moves, assign left and right arrows
            leftArrowBtn.disabled = false;
            leftArrowBtn.classList.add('enabled');
            leftArrowBtn.dataset.target = possibleMoves[0];
            rightArrowBtn.disabled = false;
            rightArrowBtn.classList.add('enabled');
            rightArrowBtn.dataset.target = possibleMoves[1];
        }
    }

    // Event Listeners for Arrow Buttons
    leftArrowBtn.addEventListener('click', () => {
        if (leftArrowBtn.disabled) return;
        const targetDoor = parseInt(leftArrowBtn.dataset.target);
        moveSack(targetDoor, 'left');
    });

    rightArrowBtn.addEventListener('click', () => {
        if (rightArrowBtn.disabled) return;
        const targetDoor = parseInt(rightArrowBtn.dataset.target);
        moveSack(targetDoor, 'right');
    });

    // Function to Move the Sack Manually
    function moveSack(targetDoor, direction) {
        if (!gameActive || computerPosition === null) return;

        const possibleMoves = getPossibleMoves(computerPosition);
        if (!possibleMoves.includes(targetDoor)) {
            alert('תנועה לא חוקית.');
            return;
        }

        // **Removed Attempts Increment Here**
        // Since arrows should not count as attempts

        // Move the sack
        computerPosition = targetDoor;
        addLog(`השק זז ידנית לדלת ${computerPosition} (${direction}-arrow).`);
        updateDoors();
        updateStatus();
        updateArrows();
    }

    // Initialize Door Count Selector and Generate Initial Doors
    function initializeGame() {
        // Set default selection if not already set
        if (!doorCountSelect.value) {
            doorCountSelect.value = '3'; // Default to 3 doors
        }

        numberOfDoors = parseInt(doorCountSelect.value);
        lastNumberOfDoors = numberOfDoors;

        generateDoors(numberOfDoors);
        populateKnownPositionSelect(numberOfDoors);
    }

    // Initialize the game on page load
    initializeGame();
});
