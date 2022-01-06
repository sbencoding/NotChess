const crypto = require('crypto');
const ChessBoard = require('./chessBoardServer');
/**
 * This is the class for the chess match
 */

function Match(socket1, socket2) {
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
                if(!checkMove({piece : board.getPiece(row, column), row, column}, command.destination_row, command.destination_column)) return;
                board.makeMove({piece : board.getPiece(row, column), row, column}, command.destination_row, command.destination_column);
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
        handleClientMessage(socket, opponentsocket, socket.gameData.playerNumber, opponentNumber, message);
    }

    // TODO: increment the number of started matches
    let board = ChessBoard();
    let currentPlayer = 1;
    board.initBoard();

    initClient(socket1, 1);
    initClient(socket2, 2);

    socket1.on("message", function (message) {
        screenMessage(socket1, message);
    });

    socket2.on("message", function(message) {
        screenMessage(socket2, message);
    });

}
