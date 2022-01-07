const crypto = require('crypto');
const ChessBoard = require('./chessBoardServer');
/**
 * This is the class for the chess match
 */

function Match(socket1, socket2, statistics) {
    let capturedBlackPieces = [];
    let capturedWhitePieces = [];
    let board;
    let currentPlayer;
    let whiteTimer;
    let blackTimer;
    let timerToken;
    let numMatches = 0;
    let matchFinished = false;

    function getRandom() {
        return crypto.randomBytes(60).toString('hex');
    }

    function initClient(socket, playerNumber) {
        socket.gameData = {
            playerNumber,
            playerId: getRandom(),
            wantsRematch: false
        };
        socket.send(JSON.stringify({
            'command': 'enter_game',
            'player_number': playerNumber,
            'player_id': socket.gameData.playerId
        }));
    }

    let startTimer = () => {
        return setInterval(function() {
            if(currentPlayer === 1 && whiteTimer > 0) whiteTimer--;
            else if (currentPlayer !== 1 && blackTimer > 0) blackTimer--;
            if(whiteTimer === 0 || blackTimer === 0) {
                const winner = (blackTimer === 0) ? 1 : 2;
                const winMessage = JSON.stringify({'command': 'game_end', 'winner_player': winner});
                socket1.send(winMessage);
                socket2.send(winMessage);
                clearInterval(timerToken);
            }
        }, 1000);
    };

    function initMatch() {
        statistics.incrementTotalGames();
        numMatches++;
        let player1Color = ((numMatches % 2) === 1) ? 1 : 2;
        let player2Color = (player1Color === 1) ? 2 : 1;  

        capturedBlackPieces = [];
        capturedWhitePieces = [];

        // TODO: increment the number of started matches
        board = ChessBoard();
        currentPlayer = 1;
        board.initBoard();

        // TODO: maybe change player number so that color also changes
        initClient(socket1, player1Color);
        initClient(socket2, player2Color);

        whiteTimer = 600;
        blackTimer = 600;
        timerToken = startTimer();
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
                    if(blackPiece !== null) {
                        capturedBlackPieces.push(blackPiece);
                        statistics.incrementTotalPieces();
                    }    
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
                    if(whitePiece !== null) {
                        capturedWhitePieces.push(whitePiece);
                        statistics.incrementTotalPieces();
                    }    
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
                // TODO: block this command unless the game has ended really
                opponentSocket.send(JSON.stringify({'command': 'accept_rematch'}));
                clientSocket.gameData.wantsRematch = true;
                if (clientSocket.gameData.wantsRematch && opponentSocket.gameData.wantsRematch) {
                    initMatch();
                }
            },
            reject_rematch: () => {
                opponentSocket.send(JSON.stringify({'command': 'reject_rematch'}));
                endGame();
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

    function endGame() {
        if(!matchFinished) {
            statistics.decrementCurrentGames();
            matchFinished = true;
        }    
    }

    function handleSocketClose(exitingSocket, otherSocket) {
        if (!matchFinished) otherSocket.send(JSON.stringify({command: 'opponent_left'}));
        endGame();
    }

    socket1.on("message", function (message) {
        screenMessage(socket1, message);
    });

    socket2.on("message", function(message) {
        screenMessage(socket2, message);
    });

    socket1.on("close", function () {
        handleSocketClose(socket1, socket2);
    });

    socket2.on("close", function () {
        handleSocketClose(socket2, socket1);
    });

    initMatch();
}
module.exports = Match;
