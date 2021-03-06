// Local imports
const ChessBoard = require('./chessBoardServer');

// Node imports
const crypto = require('crypto');

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
    let roundFinished = false;

    /**
     * Get a 60-byte random value
     */
    function getRandom() {
        return crypto.randomBytes(60).toString('hex');
    }

    /**
     * Initialize the socket connected with a player
     * @param {WebSocket} socket The socket of the player
     * @param {number} playerNumber The number the player gets determining the playing color
     */
    function initClient(socket, playerNumber) {
        // Store player information on the socket object
        socket.gameData = {
            playerNumber,
            playerId: getRandom(),
            wantsRematch: false
        };

        // Send the game setup command to the client
        socket.send(JSON.stringify({
            'command': 'enter_game',
            'player_number': playerNumber,
            'player_id': socket.gameData.playerId
        }));
    }

    /**
     * Start countdown for the players
     */
    let startTimer = () => {
        return setInterval(function() {
            // Decrement remaining time for the player whose turn it is
            if(currentPlayer === 1 && whiteTimer > 0) whiteTimer--;
            else if (currentPlayer !== 1 && blackTimer > 0) blackTimer--;

            // In case of a player running out of time
            if(whiteTimer === 0 || blackTimer === 0) {
                roundFinished = true;
                // Determine the winner (player with time left) and notify the players of the match end
                const winner = (blackTimer === 0) ? 1 : 2;
                const winMessage = JSON.stringify({'command': 'game_end', 'winner_player': winner, 'reason': 'timeout'});
                socket1.send(winMessage);
                socket2.send(winMessage);
                clearInterval(timerToken);
            }
        }, 1000);
    };

    /**
     * Initialize a new game
     */
    function initMatch() {
        roundFinished = false;

        statistics.incrementTotalGames();
        numMatches++;
        let player1Color = ((numMatches % 2) === 1) ? 1 : 2;
        let player2Color = (player1Color === 1) ? 2 : 1;  

        capturedBlackPieces = [];
        capturedWhitePieces = [];

        board = ChessBoard();
        currentPlayer = 1;
        board.initBoard();

        initClient(socket1, player1Color);
        initClient(socket2, player2Color);

        whiteTimer = 600;
        blackTimer = 600;
        timerToken = startTimer();
    }

    /**
     * Handle an incoming message from a client socket
     * @param {WebSocket} clientSocket The socket of the player who sent the message
     * @param {WebSocket} opponentSocket The socket of the player's opponent
     * @param {number} clientNumber The playerNumber of the sender
     * @param {number} opponentNumber The playerNumber of the sender's opponent
     * @param {Object} command The message send by the client socket
     */
    function handleClientMessage(clientSocket, opponentSocket, clientNumber, opponentNumber, command) {
        // Object containing a handler function for each command
        const messageHandler = {
            make_move: () => {
                // If it's not the player's turn ignore the message OR the round is finished (not the whole match, they can still rematch)
                if(currentPlayer !== clientNumber || roundFinished) return;

                // Get command with the positions of the move in the perspective of the opponent
                let flippedCommand = board.flipPositions(command.origin_row, command.origin_column, command.destination_row, command.destination_column);
                flippedCommand.command = 'make_move';

                // Determine moving piece, source position and destination position
                let movingPiece;
                let destRow;
                let destCol;
                let capturedArray;

                if (currentPlayer == 1) {
                    // Player is white use the sent position
                    movingPiece = {
                        piece : board.getPiece(command.origin_row, command.origin_column),
                        row: command.origin_row, 
                        column: command.origin_column
                    };
                    destRow = command.destination_row;
                    destCol = command.destination_column;
                    capturedArray = capturedBlackPieces;
                } else {
                    // Player is black use the flipped position, since the server's internal board has white at the bottom
                    movingPiece = {
                        piece: board.getPiece(flippedCommand.origin_row, flippedCommand.origin_column), 
                        row: flippedCommand.origin_row,
                        column: flippedCommand.origin_column
                    };
                    destRow = flippedCommand.destination_row;
                    destCol = flippedCommand.destination_column;
                    capturedArray = capturedWhitePieces;
                }

                // If client submitted invalid move, ignore the command
                if (!board.checkMove(movingPiece, destRow, destCol)) return;

                // Make the move
                const capturedPiece = board.makeMove(movingPiece, destRow, destCol);

                // Send the move to the opponent
                opponentSocket.send(JSON.stringify(flippedCommand));

                // Switch whose turn it is
                currentPlayer = opponentNumber;  

                // Handle if a piece was captured as the result of the move
                if (capturedPiece !== null) {
                    capturedArray.push(capturedPiece);
                    statistics.incrementTotalPieces();

                    // If all 16 pieces are captured by a player, the other player wins
                    if (capturedArray.length === 16) {
                        roundFinished = true;
                        const gameEndMessage = JSON.stringify({
                            'command': 'game_end',
                            'winner_player': opponentNumber,
                            'reason': 'pieces'
                        });
                        clientSocket.send(gameEndMessage);
                        opponentSocket.send(gameEndMessage);
                        return;
                    }
                }

                //If opponent is stalemated, send the gameEndMessage
                let isClientStalemate = board.isStalemate(clientNumber);
                let isOpponentStalemate = board.isStalemate(opponentNumber);
                if (isClientStalemate || isOpponentStalemate) {
                    let winner;
                    if(isClientStalemate && !isOpponentStalemate) {
                        winner = clientNumber;
                    } else if (isOpponentStalemate && !isClientStalemate) winner = opponentNumber;
                    else winner = 0;
                    const gameEndMessage = JSON.stringify({
                        'command': 'game_end',
                        'winner_player': winner,
                        'reason': 'stalemate'
                    });
                    clientSocket.send(gameEndMessage);
                    opponentSocket.send(gameEndMessage);
                    return;
                } 
            },
            offer_draw: () => {
                opponentSocket.send(JSON.stringify({'command': 'offer_draw'}));
            },
            accept_draw: () => {
                opponentSocket.send(JSON.stringify({'command': 'accept_draw'}));
                roundFinished = true;
            },
            reject_draw: () => {
                opponentSocket.send(JSON.stringify({'command': 'reject_draw'}));
            },
            resign: () => {
                opponentSocket.send(JSON.stringify({'command': 'resign'}));
                roundFinished = true;
            },
            accept_rematch: () => {
                // If the round is still on going, then don't accept this command
                if (!roundFinished) return;
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

        // Execute the corresponding command handler
        messageHandler[command.command]();
    }

    /**
     * Check if the message is valid and if it is forward it to the proper handler
     * @param {WebSocket} socket The socket of the player who sent the message
     * @param {String} data The message send by the socket 
     */
    function screenMessage(socket, data) {
        // Conver the message to an object
        const message = JSON.parse(data);

        // If the secret player_id is missing, or invalid ignore the message
        if (message.player_id === undefined || message.player_id !== socket.gameData.playerId) return;

        // Determine opponent socket and playerNumber
        const opponentSocket = (socket == socket1) ? socket2 : socket1;
        const opponentNumber = (socket.gameData.playerNumber == 1) ? 2 : 1;

        // Pass the message to the handler
        handleClientMessage(socket, opponentSocket, socket.gameData.playerNumber, opponentNumber, message);
    }

    /**
     * Set the current match's state as ended, update current game stat
     */
    function endGame() {
        // Prevents ending the game more than once
        if(!matchFinished) {
            statistics.decrementCurrentGames();
            matchFinished = true;
        }    
    }

    /**
     * Handle a socket close
     */
    function handleSocketClose(exitingSocket, otherSocket) {
        // Notify opponent if socket is connected
        if (!matchFinished) otherSocket.send(JSON.stringify({command: 'opponent_left'}));

        // Set game state to end
        endGame();
    }

    // Register socket event for messaging and close
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

    // Initialize the first match of the lobby
    initMatch();
}

// Exports
module.exports = Match;
