const crypto = require('crypto');
const ChessBoard = require('./chessBoardServer');
/**
 * This is the class for the chess match
 */

function Match(socket1, socket2) {
    let capturedBlackPieces = [];
    let capturedWhitePieces = [];


    function getRandom() {
        return crypto.randomBytes(60).toString('hex');
    }

    function initClient(socket, playerNumber) {
        socket.gameData = {
            playerNumber,
            playerId: getRandom()
        }
        socket.send(JSON.stringify({
            'command': 'enter_game',
            'player_number': playerNumber,
            'player_id': socket.gameData.playerId
        }));
    }

    function handleClientMessage(clientSocket, opponentSocket, clientNumber, opponentNumber, command) {
        const messageHandler = {
            make_move: () => {
                if(currentPlayer !== clientNumber) return;
                // TODO: the internal board has one orientation with white on the bottom
                // but the player with black has black on the bottom of the board
                // so when black makes a move we need to mirror it horizontally
                let temp = board.flipPositions(command.origin_row, command.origin_column, command.destination_row, command.destination_column);
                let flippedCommand = {'command': 'make_move', 'player_id': undefined, 'origin_row': temp.origin_row, 
                'origin_column': temp.origin_column, 'destination_row': temp.destination_row, 'destination_column': temp.destination_column};
                if(currentPlayer === 1) {
                    if(!board.checkMove({piece : board.getPiece(command.origin_row, command.origin_column), row: command.origin_row, 
                        column: command.origin_column}, command.destination_row, command.destination_column)) return;
                    let blackPiece = board.makeMove({piece : board.getPiece(command.origin_row, command.origin_column), 
                        row: command.origin_row, column: command.origin_column}, command.destination_row, command.destination_column);
                    if(blackPiece !== null) capturedBlackPieces.push(blackPiece);
                    if(capturedBlackPieces.length === 16) {
                        clientSocket.send(JSON.stringify({'command': 'game_end', 'winner_player': 2}));
                        opponentSocket.send(JSON.stringify({'command': 'game_end', 'winner_player': 2}));
                    }
                    console.log(capturedBlackPieces.length);
                } else {
                    const movingPiece = {piece: board.getPiece(flippedCommand.origin_row, flippedCommand.origin_column), 
                        row: flippedCommand.origin_row, column: flippedCommand.origin_column};
                    if(!board.checkMove(movingPiece, flippedCommand['destination_row'], flippedCommand['destination_column'])) return;
                    let whitePiece = board.makeMove(movingPiece, flippedCommand['destination_row'], flippedCommand['destination_column']);
                    if(whitePiece !== null) capturedWhitePieces.push(whitePiece);
                    if(capturedWhitePieces.length === 16) {
                        clientSocket.send(JSON.stringify({'command': 'game_end', 'winner_player': 1}));
                        opponentSocket.send(JSON.stringify({'command': 'game_end', 'winner_player': 1}));
                    }
                    console.log(capturedWhitePieces.length);
                }
                opponentSocket.send(JSON.stringify(flippedCommand));
                currentPlayer = opponentNumber;  
            },
            offer_draw: () => {
                opponentSocket.send(JSON.stringify({'command': 'offer_draw'}));
            },
            accept_draw: () => {
                opponentSocket.send(JSON.stringify({'command': 'accept_draw'}));
            },
            reject_draw: () => {
                opponentSocket.send(JSON.stringify({'command': 'reject_draw'}));
            },
            resign: () => {
                opponentSocket.send(JSON.stringify({'command': 'resign'}));
            },
            accept_rematch: () => {
                opponentSocket.send(JSON.stringify({'command': 'accept_rematch'}));
            },
            reject_rematch: () => {
                opponentSocket.send(JSON.stringify({'command': 'reject_rematch'}));
            },
            send_message: () => {
                opponentSocket.send(JSON.stringify({'command': 'send_message', 'message': command.message}));
            }
        };
        messageHandler[command.command]();
    }

    function screenMessage(socket, data) {
        const message = JSON.parse(data);
        if (message.player_id === undefined || message.player_id !== socket.gameData.playerId) return;
        const opponentSocket = (socket == socket1) ? socket2 : socket1;
        const opponentNumber = (socket.gameData.playerNumber == 1) ? 2 : 1;
        handleClientMessage(socket, opponentSocket, socket.gameData.playerNumber, opponentNumber, message);
    }

    // TODO: increment the number of started matches
    let board = ChessBoard();
    let currentPlayer = 1;
    board.initBoard();

    initClient(socket1, 1);
    initClient(socket2, 2);

    let whiteTimer = 600;
    let blackTimer = 600;

    let startTimer = () => {
        setInterval(function() {
            if(currentPlayer === 1 && whiteTimer > 0) whiteTimer--;
            else if (currentPlayer !== 1 && blackTimer > 0) blackTimer--;
            if(whiteTimer === 0 || blackTimer === 0) {
                if(blackTimer === 0) {
                    socket1.send(JSON.stringify({'command': 'game_end', 'winner_player': 1}));
                    socket2.send(JSON.stringify({'command': 'game_end', 'winner_player': 1}));
                } else {
                    socket1.send(JSON.stringify({'command': 'game_end', 'winner_player': 2}));
                    socket2.send(JSON.stringify({'command': 'game_end', 'winner_player': 2}));
                }
            }
        }, 1000);
    };
    startTimer();


    socket1.on("message", function (message) {
        screenMessage(socket1, message);
    });

    socket2.on("message", function(message) {
        screenMessage(socket2, message);
    });



}
module.exports = Match;