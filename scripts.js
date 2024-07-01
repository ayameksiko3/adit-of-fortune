// Variables
let gameOver = false;
let currentRow = 5; // Indeks baris saat ini dimulai dari bawah
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const grid = document.getElementById('grid');
const winPopup = document.getElementById('win-popup');
const closePopup = document.getElementById('close-popup');
const playAgainButton = document.getElementById('play-again');
const claimPrizeButton = document.getElementById('claim-prize'); // Memastikan tombol ada di HTML
claimPrizeButton.style.display = 'none'; // Awalnya disembunyikan

// Variables for betting
let saldoAmount = localStorage.getItem('saldoAmount') ? parseInt(localStorage.getItem('saldoAmount'), 10) : 100000; // Ambil dari localStorage atau default 100000
let betPlaced = false; // Track if a bet has been placed
let currentBetAmount = 0; // Store the current bet amount
let lastBetAmount = 0; // Store the last bet amount for percentage calculation

// Function to initialize or reset the game
function initGame() {
    gameOver = false;
    betPlaced = false; // Reset bet status
    currentBetAmount = 0; // Reset current bet amount
    lastBetAmount = 0; // Reset last bet amount
    message.textContent = 'Place a bet to start!';
    restartButton.style.display = 'none';
    grid.innerHTML = ''; // Clear grid
    currentRow = 5; // Reset currentRow to the last row
    winPopup.style.display = 'none';
    claimPrizeButton.style.display = 'none'; // Sembunyikan tombol Ambil Kemenangan

    // Create new 6x5 grid
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.dataset.row = 5 - i; // Store row index in reverse order
        grid.appendChild(row);

        // Create boxes for each row
        for (let j = 0; j < 5; j++) {
            const newBox = document.createElement('div');
            newBox.className = 'box';
            newBox.dataset.row = 5 - i; // Store row index in reverse order
            newBox.dataset.column = j; // Store column index
            newBox.dataset.hasSkull = 'false'; // Initialize with no skull
            row.appendChild(newBox);
        }

        // Randomly select one box to be a skull in each row
        const skullIndex = Math.floor(Math.random() * 5);
        row.children[skullIndex].dataset.hasSkull = 'true';
    }

    addBoxListeners();
}

// Function to add event listeners to boxes
function addBoxListeners() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.addEventListener('click', boxClickHandler);
    });
}

// Event listener handler for box clicks
function boxClickHandler() {
    if (gameOver || this.textContent || !betPlaced) return;

    const row = parseInt(this.dataset.row);
    if (row !== currentRow) return; // Only allow clicks on the current row

    const boxesInRow = this.parentElement.querySelectorAll('.box');

    if (this.dataset.hasSkull === 'true') {
        this.textContent = '💀';
        this.classList.add('skull');
        message.textContent = 'You lost!';
        gameOver = true;
        restartButton.style.display = 'block';
        setTimeout(initGame, 2000); // Restart game after 2 seconds
    } else {
        this.textContent = '🍏';
        this.classList.add('won');

        // Disable clicking for the rest of the boxes in the current row
        boxesInRow.forEach(box => box.removeEventListener('click', boxClickHandler));

        // Move to the next row
        if (currentRow > 0) {
            currentRow--;
            message.textContent = `You won row ${6 - currentRow}! Choose a box in the next row.`;

            // Set last bet amount for percentage calculation
            lastBetAmount = currentBetAmount;
        } else {
            // Won all rows
            message.textContent = 'You won all rows!';
        }

        // Show claim prize button
        claimPrizeButton.style.display = 'block';
        claimPrizeButton.dataset.level = 6 - currentRow; // Set the level on the button
    }
}

// Event listener for claim prize button
claimPrizeButton.addEventListener('click', function() {
    // Hitung saldo berdasarkan level yang berhasil diselesaikan
    const level = parseInt(claimPrizeButton.dataset.level);

    // Hitung faktor pengali berdasarkan level
    let multiplier;
    switch (level) {
        case 1:
            multiplier = 2;
            break;
        case 2:
            multiplier = 4;
            break;
        case 3:
            multiplier = 6;
            break;
        case 4:
            multiplier = 8;
            break;
        case 5:
            multiplier = 10;
            break;
        case 6:
            multiplier = 12;
            break;
        default:
            multiplier = 1; // Default multiplier jika level tidak valid
    }

    // Hitung jumlah uang yang akan ditambahkan berdasarkan persentase dari taruhan sebelumnya
    const additionalAmount = lastBetAmount * multiplier; // Based on last bet amount
    saldoAmount += additionalAmount;

    // Simpan saldo ke localStorage
    localStorage.setItem('saldoAmount', saldoAmount);

    // Update saldo di tampilan
    document.getElementById('saldo-amount').textContent = `Rp ${saldoAmount.toLocaleString()}`;

    // Sembunyikan tombol Ambil Kemenangan
    claimPrizeButton.style.display = 'none';

    // Reset permainan
    initGame();
});

// Initialize the game
initGame();

// Restart button functionality
restartButton.addEventListener('click', function() {
    initGame();
});

// Taruhan Logic
document.addEventListener('DOMContentLoaded', function() {
    const placeBetButton = document.getElementById('place-bet');
    const saldoAmountElem = document.getElementById('saldo-amount');

    placeBetButton.addEventListener('click', function() {
        const betAmount = parseInt(document.getElementById('bet-amount').value);

        if (!isNaN(betAmount) && betAmount > 0) {
            if (saldoAmount >= betAmount) {
                saldoAmount -= betAmount;
                saldoAmountElem.textContent = `Rp ${saldoAmount.toLocaleString()}`;
                currentBetAmount = betAmount; // Store the current bet amount
                betPlaced = true; // Mark that a bet has been placed
                message.textContent = 'Pilih kotak untuk mencari apel!';
            } else {
                alert('Saldo tidak cukup untuk taruhan ini.');
            }
        } else {
            alert('Masukkan jumlah taruhan yang valid.');
        }
    });
});
