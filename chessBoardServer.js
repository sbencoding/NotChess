const validator = require('./public/javascripts/chessValidation.js');
const ChessPiece = require('./public/javascripts/chessPiece.js');
/**
 * This is the chessBoard class, for the object chessBoard used in a match object.
 * @returns void
 */
function ChessBoard() {
    let cells = [];
    for (let i = 0; i < 8; ++i) {
        let row = [];
        for (let j = 0; j < 8; ++j) {
            row.push(null)
        }
        cells.push(row);
    }

    const addPiece = (row, col, piece) => {
        cells[row][col] = piece;
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
                const moves = validator.getValidMoves(cells, i, j);
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
        initBoard: () => {
            playingColor = 'white'
            const oppositeColor = (playingColor == 'white') ? 'black' : 'white';
            addPiece(0, 0, ChessPiece(oppositeColor, 'rook'));
            addPiece(7, 0, ChessPiece(playingColor, 'rook'));
            addPiece(0, 1, ChessPiece(oppositeColor, 'knight'));
            addPiece(7, 1, ChessPiece(playingColor, 'knight'));
            addPiece(0, 2, ChessPiece(oppositeColor, 'bishop'));
            addPiece(7, 2, ChessPiece(playingColor, 'bishop'));
            addPiece(0, 3, ChessPiece(oppositeColor, 'king'));
            addPiece(7, 3, ChessPiece(playingColor, 'king'));
            addPiece(0, 4, ChessPiece(oppositeColor, 'queen'));
            addPiece(7, 4, ChessPiece(playingColor, 'queen'));
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
            const possibleMoves = validator.getValidMoves(cells, piece.row, piece.column);
            const possibleEnemyHit = canHitEnemy(piece.piece.color);
            if (possibleEnemyHit) {
                return possibleMoves.enemies.find((arr) => arr[0] == row && arr[1] == col) !== undefined;
            }
            return possibleMoves.positions.find((arr) => arr[0] == row && arr[1] == col) !== undefined;
        },

        flipPositions: (originalRow, originalColumn, destinationRow, destinationColumn) => {
            return {
                'original_row': 7 - originalRow,
                'original_column': 7 - originalColumn,
                'destination_row': 7 - destinationRow,
                'destination_column': 7 - destinationColumn,
            };
        },
    };
}

module.exports = ChessBoard;
