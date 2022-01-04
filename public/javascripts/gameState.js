//@ts-check

const movingSound = new Audio("...");

function GameState(board, socket, startingPlayer, personalColor) {
    let personalTimer = 600;
    let enemyTimer = 600;
    let globalTimer = 0;
    let capturedFriendlyPieces = [];
    let capturedEnemyPieces = [];
    let chatMessages = [];
    let currentPlayer = startingPlayer;
    let pieceSelected;

    let displayMessage = function (statusCode) {
        let message = Status[statusCode];
        document.querySelector("").textContent = message;
        if(statusCode === "drawPrompt" || statusCode === "gameRematch") {
            let buttons = document.querySelector("");
            buttons.classList.remove("hidden");
        }
        if(statusCode === "drawPrompt") {
            let buttons = document.querySelector("");
            buttons.querySelector("yesChild").onclick = acceptDraw;
            buttons.querySelector("noChild").onclick = rejectDraw;
        }
        else if (statusCode === "gameRematch") {
            let buttons = document.querySelector("");
            buttons.querySelector("yesChild").onclick = acceptRematch;
            buttons.querySelector("noChild").onclick = rejectRematch;
        }
    };

    let highlightMoves = function () {
        if(currentPlayer !== 1 || pieceSelected === undefined) return;
        board.highlightMoves(pieceSelected);
    };

    let updFriendlyPieces = function (chessPiece) {
        capturedFriendlyPieces.push(chessPiece);
    };

    let playerMove = function (row, column) {
        if(currentPlayer !== 1) return;
        if(pieceSelected === undefined) {
            if (!board.hasPiece(row, column)) return;
            pieceSelected = {piece : board.getPiece(row, column), row, column};
        } else {
            if(!board.hasPiece(row, column) || board.getPiece(row, column).color !== personalColor) {
                if(!board.checkMove(pieceSelected, row, column)) return;
                else {
                   let capturedPiece = board.makeMove(pieceSelected, row, column); 
                   if(capturedPiece !== null) capturedEnemyPieces.push(capturedPiece);
                   pieceSelected = undefined;
                }
            } else {
                if(row === pieceSelected.row && column === pieceSelected.column) pieceSelected = undefined;
                else pieceSelected = {piece : board.getPiece(row, column), row, column};
            }
        }
        highlightMoves();
    };
    
    let resetGameState = function () {
        board.initBoard(personalColor, playerMove);
        capturedFriendlyPieces = [];
        capturedEnemyPieces = [];
        pieceSelected = undefined;
        globalTimer = 0;
        personalTimer = 600;
        enemyTimer = 600;
        currentPlayer = startingPlayer;
    };

    return {
        startTimer : function () {
            setInterval(function() {
                if(currentPlayer === 1 && personalTimer > 0) personalTimer--;
                else if (currentPlayer === 2 && enemyTimer > 0) enemyTimer--;
                if(personalTimer > 0 && enemyTimer > 0) globalTimer++;
            }, 1000);
        },
        
        initGame : function () {
            board.initBoard(personalColor, playerMove);
        }
    };
}