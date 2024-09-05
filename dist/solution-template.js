/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
 */
let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let gameLost = false;


/*
*
* the probability of a bomb in each square
*
 */
let bombProbability = 3;
let maxProbability = 15;

const difficulties = {
    easy: { rowCount: 7, colCount: 7},
    medium: { rowCount: 12, colCount: 12},
    hard: { rowCount: 18, colCount: 18}
};


function minesweeperGameBootstrapper(rowCount, colCount) {
    if (!rowCount  || !colCount ) {
        // TODO have a default difficulty
        generateBoard({'rowcount': difficulties.easy.rowCount, 'colCount': difficulties.easy.colCount});
    } else {
        generateBoard({'rowCount': rowCount, 'colCount': colCount});
    }
    renderBoard();
}

function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;
    bombCount = 0;
    
    /*
    *
    * "generate" an empty matrix
    *
     */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
    }

    /*
    *
    * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
    *
    */

    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }


    /*
    *
    * "place" bombs according to the probabilities declared at the top of the file
    * those could be read from a config file or env variable, but for the
    * simplicity of the solution, I will not do that
    *
    */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            // TODO place the bomb, you can use the following formula: Math.random() * maxProbability < bombProbability
            if (Math.random() * maxProbability < bombProbability) {//////////
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }

    /*
    *
    * TODO set the state of the board, with all the squares closed
    * and no flagged squares
    *
     */
    openedSquares = [];
    flaggedSquares = [];


    //BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS

    /*
    *
    * TODO count the bombs around each square
    *
    */

    countAdjacentBombs(boardMetadata.rowCount, boardMetadata.colCount);
    
    // Set the number of squares that need to be opened to win
    squaresLeft -= bombCount;

    /*
    *
    * print the board to the console to see the result
    *
    */
    updateBombsLeft();
    console.log(board);
}

/*
*
* simple object to keep the data for each square
* of the board
*
*/
class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


/*
* call the function that "handles the game"
* called at the end of the file, because if called at the start,
* all the global variables will appear as undefined / out of scope
*
 */
minesweeperGameBootstrapper(7,7);

// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)

function countAdjacentBombs(rowCount, colCount) {
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (!board[i][j].hasBomb) {
                board[i][j].bombsAround = countBombsInVicinity(i, j, rowCount, colCount);
            }
        }
    }
}

function countBombsInVicinity(row, col, rowCount, colCount) {
    let bombCount = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            const newRow = row + x;
            const newCol = col + y;
            if (isValidSquare(newRow, newCol, rowCount, colCount) && board[newRow][newCol].hasBomb) {
                bombCount++;
            }
        }
    }
    return bombCount;
}

function isValidSquare(row, col, rowCount, colCount) {
    return row >= 0 && row < rowCount && col >= 0 && col < colCount;
}

function openSquare(row, col) {
    if (gameLost || board[row][col].isOpened || board[row][col].isFlagged) {
        return;
    }

    const square = board[row][col];
    square.isOpened = true;
    openedSquares.push(new Pair(row, col));

    if (square.hasBomb) {                                                     
        gameLost = true;
        revealBombs();
        alert('Game Over! You hit a bomb.');
    } else {
        squaresLeft--;
        if (squaresLeft === 0) {
            alert('Congratulations! You won the game.');
        }
        if (square.bombsAround === 0) {
            openAdjacentSquares(row, col);
        }
    }

    console.log(board);
}

function openAdjacentSquares(row, col) {
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            const newRow = row + x;
            const newCol = col + y;
            if (isValidSquare(newRow, newCol, board.length, board[0].length) && !board[newRow][newCol].isOpened && !board[newRow][newCol].hasBomb) {
                openSquare(newRow, newCol);
            }
        }
    }
}

function flagSquare(row, col) {
    if (gameLost || board[row][col].isOpened) {
        return;
    }

    const square = board[row][col];
    square.isFlagged = !square.isFlagged;

    if (square.isFlagged) {
        flaggedSquares.push(new Pair(row, col));
    } else {
        flaggedSquares = flaggedSquares.filter(pair => pair.x !== row || pair.y !== col);
    }

    console.log(board);
}

function revealBombs() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].hasBomb) {
                board[i][j].isOpened = true;
            }
        }
    }
}

function updateBombProbability() {
    bombProbability = parseInt(document.getElementById('bombProbability').value);
    resetGame();
}

function updateMaxProbability() {
    maxProbability = parseInt(document.getElementById('maxProbability').value);
    resetGame();
}

function updateBombsLeft() {
    const bombsLeftElement = document.getElementById('bombs-left');
    bombsLeftElement.textContent = `Bombs Left: ${bombCount - flaggedSquares.length}`;
}

function changeDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    const { rowCount, colCount} = difficulties[difficulty];
    gameLost = false;
    minesweeperGameBootstrapper(rowCount, colCount);
}

function resetGame() {
    const difficulty = document.getElementById('difficulty').value;
    const { rowCount, colCount } = difficulties[difficulty];
    gameLost = false;
    minesweeperGameBootstrapper(rowCount, colCount);
    updateBombsLeft();
}


function renderBoard() {
    const boardElement = document.getElementById('minesweeper-board');
    boardElement.innerHTML = ''; // Clear the board

    board.forEach((row, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');

        row.forEach((square, colIndex) => {
            const squareElement = document.createElement('div');
            squareElement.classList.add('square');
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = colIndex;

            // Add click event for opening a square
            squareElement.addEventListener('click', () => openSquare(rowIndex, colIndex));

            // Add right-click event for flagging a square
            squareElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagSquare(rowIndex, colIndex);
            });

            rowElement.appendChild(squareElement);
        });

        boardElement.appendChild(rowElement);
    });
}

function openSquare(row, col) {
    if (gameLost || board[row][col].isOpened || board[row][col].isFlagged) return;

    const square = board[row][col];
    square.isOpened = true;
    openedSquares.push(new Pair(row, col));

    const squareElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    squareElement.classList.add('opened');
    squareElement.innerHTML = square.hasBomb ? '💣' : (square.bombsAround > 0 ? square.bombsAround : '');

    if (square.hasBomb) {
        gameLost = true;
        revealBombs();
        alert('Game Over! You hit a bomb.');
    } else {
        squaresLeft--;
        if (squaresLeft === 0) {
            alert('Congratulations! You won the game.');
        }
        if (square.bombsAround === 0) {
            openAdjacentSquares(row, col);
        }
    }
    updateBombsLeft();
}

function flagSquare(row, col) {
    if (gameLost || board[row][col].isOpened) return;

    const square = board[row][col];
    square.isFlagged = !square.isFlagged;

    const squareElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    squareElement.innerHTML = square.isFlagged ? '🚩' : '';

    if (square.isFlagged) {
        flaggedSquares.push(new Pair(row, col));
    } else {
        flaggedSquares = flaggedSquares.filter(pair => pair.x !== row || pair.y !== col);
    }
}

function revealBombs() {
    board.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
            if (square.hasBomb) {
                const squareElement = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);
                squareElement.classList.add('bomb');
                squareElement.innerHTML = '💣';
            }
        });
    });
}