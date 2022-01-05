//@ts-check



function GameState(board, socket, playerNumber, personalColor) {
    let personalTimer = 600;
    let enemyTimer = 600;
    let globalTimer = 0;
    let capturedFriendlyPieces = [];
    let capturedEnemyPieces = [];
    let chatMessages = [];
    let currentPlayer = 1;
    let pieceSelected;

    let displayMessage = function (/** @type {string} */ statusCode) {
        let message = Status[statusCode];
        document.querySelector("#status_message").textContent = message;
        if(statusCode === "drawPrompt" || statusCode === "gameRematch") {
            let buttons = document.querySelector("#message_buttons");
            buttons.classList.remove("hidden");
        }
        if(statusCode === "drawPrompt") {
            let buttons = document.querySelector("#message_buttons");
            buttons.querySelector("#yesButton").onclick = acceptDraw;
            buttons.querySelector("#noButton").onclick = rejectDraw;
        }
        else if (statusCode === "gameRematch") {
            let buttons = document.querySelector("#message_buttons");
            buttons.querySelector("#yesButton").onclick = acceptRematch;
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
                    if(capturedPiece !== null) capturedEnemyPieces.push(capturedPiece);
                    pieceSelected = undefined;
                    board.deselectBoard();
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

    socket.onmessage = function (event) {
        console.log(event.data);
        const message = JSON.parse(event.data);
        if (message.command === 'enter_game') {
            console.log('starting game');
            displayMessage(`player${message.player_number}`);
            playerNumber = message.player_number;
            personalColor = (message.player_number == 1) ? 'white' : 'black';
            board.initBoard(personalColor, playerMove);
        }
    };

    socket.onopen = function () {
        socket.send("Hello from the client!");
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
    };

    return {
        startTimer : function () {
            setInterval(function() {
                if(currentPlayer === playerNumber && personalTimer > 0) personalTimer--;
                else if (currentPlayer !== playerNumber && enemyTimer > 0) enemyTimer--;
                if(personalTimer > 0 && enemyTimer > 0) globalTimer++;
            }, 1000);
        },
        
        initGame : function () {
            board.initBoard(personalColor, playerMove);
        }
    };
}
