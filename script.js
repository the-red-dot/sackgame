document.addEventListener('DOMContentLoaded', () => {
    const doors = document.querySelectorAll('.door');
    const statusDiv = document.getElementById('status');
    const logDiv = document.getElementById('log');
    const knownPositionSelect = document.getElementById('knownPositionSelect');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');

    let gameActive = false;
    let knownPosition = null;

    // Update Status Display
    function updateStatus() {
        if (!gameActive) {
            statusDiv.textContent = 'בחר התחלה כדי להתחיל את המשחק.';
            return;
        }
        if (knownPosition !== null) {
            const moves = getPossibleMoves(knownPosition);
            const moveText = Array.from(moves).sort((a, b) => a - b).join(' או ');
            statusDiv.textContent = `מיקום השק: דלת ${knownPosition} | השק יכול לנוע לדלת ${moveText}`;
        }
    }

    // Add Message to Log
    function addLog(message) {
        const p = document.createElement('p');
        p.textContent = message;
        logDiv.prepend(p);
    }

    // Get Possible Moves
    function getPossibleMoves(position) {
        const moves = [];
        if (position > 1) moves.push(position - 1);
        if (position < 9) moves.push(position + 1);
        return moves;
    }

    // Update Doors Display
    function updateDoors() {
        doors.forEach(door => {
            const doorNumber = parseInt(door.getAttribute('data-door'));
            door.classList.remove('fallen', 'known');
            if (doorNumber === knownPosition) {
                door.classList.add('known');
            }
        });
    }

    // Reset Game
    function resetGame() {
        gameActive = false;
        knownPosition = null;
        logDiv.innerHTML = '';
        updateDoors();
        updateStatus();
        knownPositionSelect.value = "";
        resetBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
    }

    // Event Listener for Reset Button
    resetBtn.addEventListener('click', () => {
        resetGame();
    });

    // Event Listener for Start Button
    startBtn.addEventListener('click', () => {
        const selected = parseInt(knownPositionSelect.value);
        if (isNaN(selected)) {
            alert('אנא בחר דלת למיקום ידוע.');
            return;
        }
        knownPosition = selected;
        gameActive = true;
        logDiv.innerHTML = '';
        updateDoors();
        updateStatus();
        addLog('המשחק התחיל.');
        addLog(`השק התחיל בדלת ${knownPosition}.`);
        startBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';
    });

    // Update Positions After Door Click
    function updatePossiblePositionsAfterClick(pressedDoor) {
        if (pressedDoor === knownPosition) {
            // The sack has fallen
            addLog(`לחצת על דלת ${pressedDoor}. השק נפל!`);
            doors.forEach(d => d.classList.add('fallen'));
            gameActive = false;
            updateStatus();
            addLog('המשחק הסתיים.');
        } else {
            // The sack moves
            addLog(`לחצת על דלת ${pressedDoor}. השק לא נפל.`);
            const moves = getPossibleMoves(knownPosition);
            addLog(`השק יכול לנוע לדלת ${moves.sort((a, b) => a - b).join(' או ')}`);

            // Randomly choose the next position
            if (moves.length > 0) {
                const randomIndex = Math.floor(Math.random() * moves.length);
                knownPosition = moves[randomIndex];
                addLog(`השק זז לדלת ${knownPosition}.`);
                updateDoors();
                updateStatus();
            } else {
                addLog('אין אפשרויות תנועה נוספות. המשחק מסתיים.');
                gameActive = false;
                updateStatus();
                addLog('המשחק הסתיים.');
            }
        }
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

    // Initialize Game
    resetGame();
});
