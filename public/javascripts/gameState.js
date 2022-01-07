//@ts-check

function GameState(board, socket, playerNum, personalColor) {
    let personalTimer = 600;
    let enemyTimer = 600;
    let globalTimer = 0;
    let capturedFriendlyPieces = [];
    let capturedEnemyPieces = [];
    let chatMessages = [];
    let currentPlayer = 1;
    let pieceSelected;
    let playerID;
    let playerNumber = playerNum;
    let rematchAccepted = false;
    let timerToken;

    let socketSend = (messageObject) => {
        messageObject.player_id = playerID;
        socket.send(JSON.stringify(messageObject));
    };

    let acceptDraw = (showMessage) => {
        socketSend({'command': 'accept_draw'});
        clearInterval(timerToken);
        showMessage('gameDraw');
        setTimeout(() => {
            showMessage('gameRematch');
        }, 2000);
    };

    let rejectDraw = (showMessage) => {
        socketSend({'command': 'reject_draw'});
        showMessage(`player${playerNumber}`);
    };

    let acceptRematch = (showMessage) => {
        socketSend({'command': 'accept_rematch'});
        showMessage('waitingRematch');
    };

    let rejectRematch = () => {
        socketSend({'command': 'reject_rematch'});
        socket.close();
        window.location.pathname = '/';
    };

    let displayMessage = function (/** @type {string} */ statusCode) {
        let message = Status[statusCode];
        document.querySelector("#status_message").textContent = message;
        let buttons = document.querySelector("#message_buttons");

        if(statusCode === "drawPrompt" || statusCode === "gameRematch" || statusCode === "acceptedRematch") {
            buttons.classList.remove("hidden");
        } else {
            buttons.classList.add("hidden");
        }

        if(statusCode === "drawPrompt") {
            let buttons = document.querySelector("#message_buttons");
            buttons.querySelector("#yesButton").onclick = () => acceptDraw(displayMessage);
            buttons.querySelector("#noButton").onclick = () => rejectDraw(displayMessage);
        }
        else if (statusCode === "gameRematch") {
            let buttons = document.querySelector("#message_buttons");
            buttons.querySelector("#yesButton").onclick = () => acceptRematch(displayMessage);
            buttons.querySelector("#noButton").onclick = rejectRematch;
        }
    };

    displayMessage('waitingPlayer');

    let highlightMoves = function () {
        if(currentPlayer !== playerNumber || pieceSelected === undefined) return;
        board.highlightMoves(pieceSelected);
    };

    let updFriendlyPieces = function (chessPiece) {
        capturedFriendlyPieces.push(chessPiece);
    };

    let updateTimer = () => {
        const prefix = (input) => {
            const val = input.toString();
            if (val.length == 1) return '0' + val;
            return val;
        };
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds - minutes * 60;
            return `${prefix(minutes)}:${prefix(remainingSeconds)}`;
        };
        const myTime = document.querySelector('#my_timer');
        const enemyTime = document.querySelector('#enemy_timer');
        const globalTime = document.querySelector('#timer');
        myTime.textContent = formatTime(personalTimer);
        enemyTime.textContent = formatTime(enemyTimer);
        globalTime.textContent = formatTime(globalTimer);
    };

    let playerMove = function (row, column) {
        document.querySelector("#status_message").textContent = "";
        if(currentPlayer !== playerNumber) return;
        if(pieceSelected === undefined) {
            if (!board.hasPiece(row, column)) return;
            const piece = board.getPiece(row, column);
            if (piece.color !== personalColor) return;
            if(board.canHitEnemy(personalColor)) {
                if(getValidMoves(board.getCells(), row, column).enemies.length === 0) {
                    displayMessage("pieceDenied");
                    return;
                }
            }
            pieceSelected = {piece, row, column};
        } else {
            if(!board.hasPiece(row, column) || board.getPiece(row, column).color !== personalColor) {
                if(!board.checkMove(pieceSelected, row, column)) return;
                else {
                    let capturedPiece = board.makeMove(pieceSelected, row, column);
                    socketSend({'command': 'make_move', 'player_id': playerID, 'origin_row': pieceSelected.row, 
                    'origin_column': pieceSelected.column, 'destination_row': row, 'destination_column': column}); 
                    if(capturedPiece !== null) capturedEnemyPieces.push(capturedPiece);
                    pieceSelected = undefined;
                    board.deselectBoard();
                    currentPlayer = (playerNumber == 1) ? 2 : 1;
                }
            } else {
                if(row === pieceSelected.row && column === pieceSelected.column) {
                    pieceSelected = undefined;
                    board.deselectBoard();
                }
                else {
                    if(board.canHitEnemy(personalColor)) {
                        if(getValidMoves(board.getCells(), row, column).enemies.length === 0) {
                            displayMessage("pieceDenied");
                            return;
                        }
                    }
                    pieceSelected = {piece : board.getPiece(row, column), row, column};
                }    
            }
        }
        highlightMoves();
    };
    
    let startTimer = () => {
        return setInterval(function() {
            if(currentPlayer === playerNumber && personalTimer > 0) personalTimer--;
            else if (currentPlayer !== playerNumber && enemyTimer > 0) enemyTimer--;
            if(personalTimer > 0 && enemyTimer > 0) globalTimer++;
            updateTimer();
        }, 1000);
    };

    socket.onmessage = function (event) {
        console.log(event.data);
        const message = JSON.parse(event.data);
        if (message.command === 'enter_game') {
            console.log('starting game');
            displayMessage(`player${message.player_number}`);
            playerNumber = message.player_number;
            personalColor = (message.player_number == 1) ? 'white' : 'black';
            board.initBoard(personalColor, playerMove);
            timerToken = startTimer();
            playerID = message.player_id;
            currentPlayer = 1;
            personalTimer = 600;
            enemyTimer = 600;
            globalTimer = 0;
        } else if (message.command === 'make_move') {
            let piece = {
                piece: board.getPiece(message.origin_row, message.origin_column),
                row: message.origin_row,
                column: message.origin_column
            };
            let friendlyPiece = board.makeMove(piece, message.destination_row, message.destination_column);
            capturedFriendlyPieces.push(friendlyPiece);
            currentPlayer = playerNumber;
        } else if (message.command === 'game_end') {
            if(message.winner_player === playerNumber) displayMessage('gameWon');
            else displayMessage('gameLost');
            playerNumber = 10;
            setTimeout(() => {displayMessage('gameRematch')}, 2000);
            clearInterval(timerToken);
        } else if (message.command === 'offer_draw') {
            displayMessage('drawPrompt');
        } else if (message.command === 'accept_draw') {
            displayMessage('gameDraw');d
            setTimeout(() => {displayMessage('gameRematch')}, 2000);
            clearInterval(timerToken);
        } else if (message.command === 'reject_draw') {
            displayMessage('drawDenied');
            setTimeout(() => {displayMessage(`player${playerNumber}`)}, 2000);
        } else if (message.command === 'resign') {
            displayMessage('enemyResigned');
            playerNumber = 10;
            setTimeout(() => {displayMessage('gameRematch')}, 2000);
            clearInterval(timerToken);
        } else if (message.command === 'accept_rematch') {
            displayMessage('acceptedRematch');
        } else if (message.command === 'reject_rematch') {
            displayMessage('rematchDenied');
        } else if (message.command === 'send_message') {
            chatMessages.push(ChatMessage(playerNumber, new Date(), message.message));
        }
    };

    socket.onopen = function () {
        //socket.send("Hello from the client!");
    };
    
    let resetGameState = function () {
        board.initBoard(personalColor, playerMove);
        capturedFriendlyPieces = [];
        capturedEnemyPieces = [];
        pieceSelected = undefined;
        globalTimer = 0;
        personalTimer = 600;
        enemyTimer = 600;
        currentPlayer = 1;
        playerNumber = playerNum;
    };

    let resign = () => {
        displayMessage('gameResigned');
        socketSend({'command': 'resign'});
        setTimeout(() => {displayMessage('gameRematch')}, 2000);
        clearInterval(timerToken);
    };

    let offerDraw = () => {
        socketSend({'command': 'offer_draw'});
    };

    let registerActionButtons = () => {
        const resignButton = document.querySelector('#resignButton');
        resignButton.onclick = resign;
        const drawButton = document.querySelector('#drawButton');
        drawButton.onclick = offerDraw;
    };

    return {
        startTimer : function () {
            timerToken = startTimer();
        },
        
        initGame : function () {
            board.initBoard(personalColor, playerMove);
            registerActionButtons();
        }
    };
}
