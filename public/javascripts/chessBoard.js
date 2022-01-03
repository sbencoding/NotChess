function ChessPiece(col, tp) {
    return {col, tp};
}
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

    const clearUI = () => {
        const rows = document.querySelector('#chess_board table tbody').children;
        for (let i = 0; i < rows.length; ++i) {
            const fields = rows[i].children;
            for (let j = 0; j < fields.length; ++j) {
                if (fields[j].firstElementChild) {
                    fields[j].removeChild(fields[j].firstElementChild);
                }
            }
        }
    };

    return {
        initBoard: (playingColor) => {
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
            clearUI();
        },
        printBoard: () => {
            console.log(cells);
        },
    };
}

const board = ChessBoard();
board.initBoard('white');
