const movingSound = new Audio("audio/chess_piece_sound.wav");

/**
 * This is the chessBoard class, for the object chessBoard used in gameState.
 * @returns void
 */

function ChessBoard() {
    let cells = [];
    const initCells = () => {
        cells = [];
        for (let i = 0; i < 8; ++i) {
            let row = [];
            for (let j = 0; j < 8; ++j) {
                row.push(null)
            }
            cells.push(row);
        }
    };

    initCells();

    const addPiece = (row, col, piece) => {
        cells[row][col] = piece;
    };

    /**
     * This functions resets the board, removing all the pieces that might exist.
     * @clickHandler ???
     */

    const resetUI = (clickHandler) => {
        const rows = document.querySelector('#chess_board table tbody').children;
        for (let i = 0; i < rows.length; ++i) {
            const fields = rows[i].children;
            for (let j = 0; j < fields.length; ++j) {
                fields[j].onclick = () => {
                    clickHandler(i, j);
                };
                if (fields[j].firstElementChild) {
                    fields[j].removeChild(fields[j].firstElementChild);
                }
            }
        }
    };

    /**
     * This functions renderes all cells that have a piece with their respective icons
     */

    const renderBoard = () => {
        const rows = document.querySelector('#chess_board table tbody').children;
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 8; ++j) {
                if (cells[i][j] !== null) {
                    const img = document.createElement('img');
                    img.src = cells[i][j].url;
                    rows[i].children[j].appendChild(img);
                }
            }
        }
    };

    /**
     * This function removes the dimness of a single square
     * @param {*} row the row of the square to remove the dimness from
     * @param {*} col the column of the square to remove the dimness from
     * @returns void
     */

    const highlightSquare = (row, col) => {
        const rows = document.querySelector('#chess_board table tbody').children;
        if (!boundCheck(row, col)) return;
        rows[row].children[col].classList.remove('dimmed');
    };

    /**
     * This function fills a single square with red, indicating that it is an enemy square 
     * @param {*} row the row of the square to fill with red
     * @param {*} col the column of the square to fill with red
     * @returns void
     */

    const markEnemySquare = (row, col) => {
        const rows = document.querySelector('#chess_board table tbody').children;
        if (!boundCheck(row, col)) return;
        rows[row].children[col].classList.add('tag_enemy');
    };

    /**
     * This function dims all of the board
     */

    const dimBoard = function () {
        const cells = document.querySelectorAll("td");
        for (var j = 0; j < cells.length; j++) {
            cells[j].classList.add("dimmed");
            cells[j].classList.remove("tag_enemy");
        }
    };

    /**
     * This function removes the dimness of all the board
     */

    const lightenBoard = function () {
        const cells = document.querySelectorAll("td");
        for (var j = 0; j < cells.length; j++) {
            cells[j].classList.remove("dimmed");
            cells[j].classList.remove("tag_enemy");
        }
    };

    /**
     * This function verifies if it's possible for the player to eat an enemy piece
     * @param {*} playingColor to color of the pieces of the player 
     * @returns a boolean indicating if the player can take an enemy piece
     */

    const canHitEnemy = (playingColor) => {
        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 8; ++j) {
                if (cells[i][j] == null || cells[i][j].color !== playingColor) continue;
                const moves = getValidMoves(cells, i, j);
                if (moves.enemies.length > 0) return true;
            }
        }
        return false;
    };

    return {

        /**
         * The same function as above but as a public function of board
         * @param {*} playingColor the color of the pieces of the player
         * @returns a boolean indicating if the player can take an enemy piece
         */
        canHitEnemy: (playingColor) => {
            return(canHitEnemy(playingColor));
        },

        /**
         * This function initializes the board with all the pieces with the correct colors
         * @param {*} playingColor the color of the player
         * @param {*} eventHandler the function that makes the player moves, considering chess contingencies
         */
        initBoard: (playingColor, eventHandler) => {
            initCells();
            const oppositeColor = (playingColor == 'white') ? 'black' : 'white';
            addPiece(0, 0, ChessPiece(oppositeColor, 'rook'));
            addPiece(7, 0, ChessPiece(playingColor, 'rook'));
            addPiece(0, 1, ChessPiece(oppositeColor, 'knight'));
            addPiece(7, 1, ChessPiece(playingColor, 'knight'));
            addPiece(0, 2, ChessPiece(oppositeColor, 'bishop'));
            addPiece(7, 2, ChessPiece(playingColor, 'bishop'));
            if (playingColor == 'white') {
                addPiece(0, 4, ChessPiece(oppositeColor, 'king'));
                addPiece(7, 4, ChessPiece(playingColor, 'king'));
                addPiece(0, 3, ChessPiece(oppositeColor, 'queen'));
                addPiece(7, 3, ChessPiece(playingColor, 'queen'));
            } else {
                addPiece(0, 3, ChessPiece(oppositeColor, 'king'));
                addPiece(7, 3, ChessPiece(playingColor, 'king'));
                addPiece(0, 4, ChessPiece(oppositeColor, 'queen'));
                addPiece(7, 4, ChessPiece(playingColor, 'queen'));
            }
            addPiece(0, 5, ChessPiece(oppositeColor, 'bishop'));
            addPiece(7, 5, ChessPiece(playingColor, 'bishop'));
            addPiece(0, 6, ChessPiece(oppositeColor, 'knight'));
            addPiece(7, 6, ChessPiece(playingColor, 'knight'));
            addPiece(0, 7, ChessPiece(oppositeColor, 'rook'));
            addPiece(7, 7, ChessPiece(playingColor, 'rook'));

            for (let i = 0; i < 8; ++i) {
                addPiece(1, i, ChessPiece(oppositeColor, 'pawn'));
                addPiece(6, i, ChessPiece(playingColor, 'pawn'));
            }
            resetUI(eventHandler);
            renderBoard();
        },

        printBoard: () => {
            console.log(cells);
        },
        hasPiece: (row, col) => {
            return cells[row][col] !== null;
        },
        getPiece: (row, col) => {
            return cells[row][col];
        },

        getCells: () => {
            return cells;
        },

        /**
         * This function makes the literal move of the piece within the chess board
         * @param {*} piece to be moved
         * @param {*} row the row to be moved to
         * @param {*} col the column to be moved to
         * @returns the enemy piece that might have been replaced by the moved piece
         */

        makeMove: (piece, row, col) => {
            const target = cells[row][col];
            const current = cells[piece.row][piece.column];
            cells[row][col] = current;
            cells[piece.row][piece.column] = null;
            const rows = document.querySelector('#chess_board table tbody').children;
            const targetField = rows[row].children[col];
            const sourceField = rows[piece.row].children[piece.column];
            if (target !== null) {
                targetField.removeChild(targetField.firstElementChild);
            }
            const element = sourceField.firstElementChild;
            sourceField.removeChild(element);
            targetField.appendChild(element);
            movingSound.play();
            return target;
        },

        /**
         * This function returns a boolean representing the possibility of a certain move, taking into consideration
         *  AntiChess contingencies
         * @param {*} piece the piece (object) to check the moves for
         * @param {*} row the row of the intended square after the move
         * @param {*} col the column of the intended square after the move
         * @returns a boolean representing the possibility of this move.
         */
        checkMove: (piece, row, col) => {
            const possibleMoves = getValidMoves(cells, piece.row, piece.column);
            const possibleEnemyHit = canHitEnemy(piece.piece.color);
            if (possibleEnemyHit) {
                return possibleMoves.enemies.find((arr) => arr[0] == row && arr[1] == col) !== undefined;
            }
            return possibleMoves.positions.find((arr) => arr[0] == row && arr[1] == col) !== undefined;
        },

        /**
         * This function takes care of all the logic related with highlighting the possible moves of the selected
         * piece, taking into consideration AntiChess contingencies
         * @param {*} piece the piece that is selected
         */

        highlightMoves: (piece) => {
            const row = piece.row;
            const col = piece.column;
            const type = piece.piece.type;
            dimBoard();
            // Always highlight the piece itself for visibility
            highlightSquare(row, col);
            const result = getValidMoves(cells, row, col);
            result.enemies.forEach(pos => {
                highlightSquare(pos[0], pos[1]);
                markEnemySquare(pos[0], pos[1]);
            });
            if (result.enemies.length == 0) {
                result.positions.forEach(pos => {
                    highlightSquare(pos[0], pos[1]);
                });
            }
        },

        /**
         * This function takes all the dimness of the board
         */
        deselectBoard: () => {
            lightenBoard();
        }
    };
}
