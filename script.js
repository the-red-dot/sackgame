document.addEventListener('DOMContentLoaded', () => {
    const doors = document.querySelectorAll('.door');
    const statusDiv = document.getElementById('status');
    const logDiv = document.getElementById('log');
    const knownPositionSelect = document.getElementById('knownPositionSelect');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const revealBtn = document.getElementById('revealBtn');

    let gameActive = false;
    let computerPosition = null; // Internal tracking
    let revealTimeout = null;

    // Update Status Display
    function updateStatus() {
        if (!gameActive) {
            statusDiv.textContent = 'בחר התחלה כדי להתחיל את המשחק.';
            return;
        }
        // In known mode, display computer's position
        const isKnownMode = knownPositionSelect.value !== 'unknown';
        if (isKnownMode && computerPosition !== null) {
            const moves = getPossibleMoves(computerPosition);
            const moveText = Array.from(moves).sort((a, b) => a - b).join(' או ');
            statusDiv.textContent = `מיקום השק: דלת ${computerPosition} | השק יכול לנוע לדלת ${moveText}`;
        } else if (computerPosition !== null) {
            // Unknown mode
            statusDiv.textContent = `השק נמצא בדלת כלשהי.`;
        }
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
            if (position < 9 && isOdd(position + 1)) moves.push(position + 1);
        } else {
            // Odd position: move to adjacent even doors
            if (position > 1 && isEven(position - 1)) moves.push(position - 1);
            if (position < 9 && isEven(position + 1)) moves.push(position + 1);
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
            if (doorNumber === computerPosition && knownPositionSelect.value !== 'unknown') {
                door.classList.add('known');
            }
        });
    }

    // Reset Game
    function resetGame() {
        gameActive = false;
        computerPosition = null;
        logDiv.innerHTML = '';
        updateDoors();
        updateStatus();
        knownPositionSelect.value = "";
        resetBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
        revealBtn.style.display = 'none';
        if (revealTimeout) {
            clearTimeout(revealTimeout);
            revealTimeout = null;
        }
    }

    // Event Listener for Reset Button
    resetBtn.addEventListener('click', () => {
        resetGame();
    });

    // Event Listener for Start Button
    startBtn.addEventListener('click', () => {
        const selected = knownPositionSelect.value;
        if (!selected) {
            alert('אנא בחר דלת למיקום ידוע או בחר מיקום לא ידוע.');
            return;
        }

        // Assign computer's position
        if (selected === 'unknown') {
            computerPosition = getRandomDoor();
            addLog('השק התחיל במיקום לא ידוע.');
        } else {
            computerPosition = parseInt(selected);
            addLog(`השק התחיל בדלת ${computerPosition}.`);
        }

        gameActive = true;
        logDiv.innerHTML = '';
        updateDoors();
        updateStatus();
        addLog('המשחק התחיל.');
        if (selected === 'unknown') {
            addLog('השק התחיל במיקום לא ידוע.');
        } else {
            addLog(`השק התחיל בדלת ${computerPosition}.`);
        }
        startBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';
        revealBtn.style.display = 'inline-block';
    });

    // Get a random door number between 1 and 9
    function getRandomDoor() {
        return Math.floor(Math.random() * 9) + 1;
    }

    // Update Positions After Door Click
    function updatePossiblePositionsAfterClick(pressedDoor) {
        if (pressedDoor === computerPosition) {
            // The sack has been caught
            addLog(`לחצת על דלת ${pressedDoor}. השק נפל!`);
            doors.forEach(d => d.classList.add('fallen'));
            gameActive = false;
            updateStatus();
            addLog('המשחק הסתיים.');
            revealBtn.style.display = 'none';
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
            return;
        }

        addLog(`השק יכול לנוע לדלת ${moves.sort((a, b) => a - b).join(' או ')}`);

        // Randomly choose the next position from possible moves
        const randomIndex = Math.floor(Math.random() * moves.length);
        computerPosition = moves[randomIndex];
        addLog(`השק זז לדלת ${computerPosition}.`);
        updateDoors();
        updateStatus();
    }

    // Event Listener for Door Clicks
    doors.forEach(door => {
        door.addEventListener('click', () => {
            if (!gameActive) {
                alert('אנא התחל את המשחק.');
                return;
            }
            const pressedDoor = parseInt(door.getAttribute('data-door'));
            addLog(`נלחץ על דלת ${pressedDoor}`);
            updatePossiblePositionsAfterClick(pressedDoor);
        });
    });

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

            // Remove the highlight after 5 seconds
            revealBtn.disabled = true; // Disable button to prevent multiple clicks
            revealTimeout = setTimeout(() => {
                currentDoor.classList.remove('revealed');
                revealBtn.disabled = false;
            }, 2000);
        }
    });

    // Initialize Game
    resetGame();
});
