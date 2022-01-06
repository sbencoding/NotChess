function boundCheck(row, col) {
    return !(row < 0 || row >= 8 || col < 0 || col >= 8);
}

function hasEnemyPiece(grid, row, col, fColor) {
    if (grid[row][col] === null) return false;
    return grid[row][col].color !== fColor;
}

function isEmptyPosition(grid, row, col) {
    return grid[row][col] === null;
}

function getValidMoves(grid, row, col, flipPawn) {
    if (flipPawn == undefined) flipPawn = false;
    const piece = grid[row][col];
    const validators = {
        pawn: () => {
            const positions = [];
            const enemies = [];
            const pawnDirection = flipPawn ? 1 : -1;
            if (boundCheck(row + pawnDirection, col) && isEmptyPosition(grid, row + pawnDirection, col)) positions.push([row + pawnDirection, col]);
            if ((row == 6 && !flipPawn) || (row == 1 && flipPawn)) positions.push([row + 2 * pawnDirection, col]);
            if (boundCheck(row + pawnDirection, col - 1) && hasEnemyPiece(grid, row + pawnDirection, col - 1, piece.color)) enemies.push([row + pawnDirection, col - 1]);
            if (boundCheck(row + pawnDirection, col + 1) && hasEnemyPiece(grid, row + pawnDirection, col + 1, piece.color)) enemies.push([row + pawnDirection, col + 1]);
            return {positions, enemies};
        },
        bishop: () => {
            const positions = [];
            const enemies = [];
            const checkDiagonal = (fromRow, fromCol, deltaR, deltaC) => {
                for (let i = fromRow, j = fromCol; boundCheck(i, j); i += deltaR, j += deltaC) {
                    if (isEmptyPosition(grid, i, j)) {
                        positions.push([i, j]);
                        continue;
                    }
                    if (hasEnemyPiece(grid, i, j, piece.color)) enemies.push([i, j]);
                    break;
                }
            };
            checkDiagonal(row - 1, col - 1, -1, -1); // check up-left
            checkDiagonal(row + 1, col + 1, 1, 1); // check down-right
            checkDiagonal(row + 1, col - 1, 1, -1); // check down-left
            checkDiagonal(row - 1, col + 1, -1, 1); // check up-right
            return {positions, enemies};
        },
        knight: () => {
            const positions = [];
            const enemies = [];
            const deltas = [[-2, -1], [-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2]];
            for (const delta of deltas) {
                const nr = row + delta[0];
                const nc = col + delta[1];
                if (!boundCheck(nr, nc)) continue;
                if (isEmptyPosition(grid, nr, nc)) {
                    positions.push([nr, nc]);
                } else if (hasEnemyPiece(grid, nr, nc, piece.color)) {
                    enemies.push([nr, nc]);
                }
            }
            return {positions, enemies};
        },
        rook: () => {
            const positions = [];
            const enemies = [];
            const checkDiagonal = (fromRow, fromCol, deltaR, deltaC) => {
                for (let i = fromRow, j = fromCol; boundCheck(i, j); i += deltaR, j += deltaC) {
                    if (isEmptyPosition(grid, i, j)) {
                        positions.push([i, j]);
                        continue;
                    }
                    if (hasEnemyPiece(grid, i, j, piece.color)) enemies.push([i, j]);
                    break;
                }
            };
            checkDiagonal(row - 1, col, -1, 0); // check up
            checkDiagonal(row + 1, col, 1, 0); // check down
            checkDiagonal(row, col - 1, 0, -1); // check left
            checkDiagonal(row, col + 1, 0, 1); // check right
            return {positions, enemies};
        },
        queen: () => {
            const bishopResult = validators['bishop']();
            const rookResult = validators['rook']();
            return {
                positions: bishopResult.positions.concat(rookResult.positions),
                enemies: bishopResult.enemies.concat(rookResult.enemies),
            };
        },
        king: () => {
            const positions = [];
            const enemies = [];
            for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
                for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
                    if (deltaRow == 0 && deltaCol == 0) continue;
                    const nr = row + deltaRow;
                    const nc = col + deltaCol;
                    if (!boundCheck(nr, nc)) continue;
                    if (isEmptyPosition(grid, nr, nc)) positions.push([nr, nc]);
                    else if (hasEnemyPiece(grid, nr, nc, piece.color)) enemies.push([nr, nc]);
                }
            }
            return {positions, enemies};
        }
    };

    return validators[piece.type]();
}

if (typeof process === 'object') {
    module.exports = {
        getValidMoves
    };
}
