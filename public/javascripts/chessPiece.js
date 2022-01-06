// @ts-check

/**
 * The constructor for the chess Piece object
 * @param color of the chess piece
 * @param type of the chess piece (eg. horse, rook, etc)
 * @returns an object containing the relative url of this chess piece's icon (png file), the color and the type of the piece
 */
function ChessPiece(color, type) {
    return {
        url : `images/chess_pieces/${color}_${type}.png`,
        color, 
        type
    } 
}        

if (typeof process === 'object') {
    module.exports = ChessPiece;
}
