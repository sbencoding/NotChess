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

    const highlightSquare = (row, col) => {
        const rows = document.querySelector('#chess_board table tbody').children;
        if (!boundCheck(row, col)) return;
        rows[row].children[col].classList.remove('dimmed');
    };

    const markEnemySquare = (row, col) => {
        const rows = document.querySelector('#chess_board table tbody').children;
        if (!boundCheck(row, col)) return;
        rows[row].children[col].classList.add('tag_enemy');
    };

    const dimBoard = function () {
        const cells = document.querySelectorAll("td");
        for (var j = 0; j < cells.length; j++) {
            cells[j].classList.add("dimmed");
            cells[j].classList.remove("tag_enemy");
        }
    };

    const lightenBoard = function () {
        const cells = document.querySelectorAll("td");
        for (var j = 0; j < cells.length; j++) {
            cells[j].classList.remove("dimmed");
            cells[j].classList.remove("tag_enemy");
        }
    };

    return {
        initBoard: (playingColor, eventHandler) => {
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
            return target;
        },
        checkMove: (piece, row, col) => {
            return true;
        },
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
        deselectBoard: () => {
            lightenBoard();
        }
    };
}
