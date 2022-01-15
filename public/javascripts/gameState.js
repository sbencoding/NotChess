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

    let disableResign = () => {
        const btn = document.querySelector('#resignButton');
        btn.setAttribute('disabled', true);
    };

    let enableResign = () => {
        const btn = document.querySelector('#resignButton');
        btn.removeAttribute('disabled');
    };

    let disableDraw = () => {
        const btn = document.querySelector('#drawButton');
        btn.setAttribute('disabled', true);
    };

    let enableDraw = () => {
        const btn = document.querySelector('#drawButton');
        btn.removeAttribute('disabled');
    };

    disableResign();
    disableDraw();

    let socketSend = (messageObject) => {
        messageObject.player_id = playerID;
        socket.send(JSON.stringify(messageObject));
    };

    let acceptDraw = (showMessage) => {
        disableDraw();
        socketSend({'command': 'accept_draw'});
        clearInterval(timerToken);
        showMessage('gameDraw');
        setTimeout(() => {
            showMessage('gameRematch');
        }, 2000);
    };

    let rejectDraw = (showMessage) => {
        enableDraw();
        socketSend({'command': 'reject_draw'});
        showMessage(`player${playerNumber}`);
    };

    let acceptRematch = (showMessage) => {
        enableDraw();
        socketSend({'command': 'accept_rematch'});
        showMessage('waitingRematch');
    };

    let rejectRematch = () => {
        socketSend({'command': 'reject_rematch'});
        socket.close();
        window.location.pathname = '/';
    };


    let updateMessageArea = (statusCode, parent) => {
        let message = Status[statusCode];
        parent.querySelector("[name=status_message]").textContent = message;
        let buttons = parent.querySelector("[name=message_buttons]");

        if(statusCode === "drawPrompt" || statusCode === "gameRematch" || statusCode === "acceptedRematch") {
            buttons.classList.remove("hidden");
        } else {
            buttons.classList.add("hidden");
        }

        if(statusCode === "drawPrompt") {
            buttons.querySelector("[name=yesButton]").onclick = () => acceptDraw(displayMessage);
            buttons.querySelector("[name=noButton]").onclick = () => rejectDraw(displayMessage);
        } else if (statusCode === "gameRematch") {
            buttons.querySelector("[name=yesButton]").onclick = () => acceptRematch(displayMessage);
            buttons.querySelector("[name=noButton]").onclick = rejectRematch;
        }
    };

    let displayMessage = function (/** @type {string} */ statusCode) {
        const announcementsSide = document.querySelector('#announcements_side');
        const announcementsBottom = document.querySelector('#announcements_bottom');
        updateMessageArea(statusCode, announcementsSide);
        updateMessageArea(statusCode, announcementsBottom);
    };

    displayMessage('waitingPlayer');

    let highlightMoves = function () {
        if(currentPlayer !== playerNumber || pieceSelected === undefined) return;
        board.highlightMoves(pieceSelected);
    };

    let updCaptured = (chessPiece, arr, selector) => {
        arr.push(chessPiece);
        const ui = document.querySelector(selector);
        const img = document.createElement('img');
        img.src = chessPiece.url;
        img.width = 30;
        img.height = 30;
        ui.appendChild(img);
    };
    let updFriendlyPieces = function (chessPiece) {
        updCaptured(chessPiece, capturedFriendlyPieces, '#captured_friendly_pieces');
    };

    let updEnemyPieces = function (chessPiece) {
        updCaptured(chessPiece, capturedEnemyPieces, '#captured_enemy_pieces');
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
        //document.querySelector("#status_message").textContent = "";
        // TODO: handle properly
        displayMessage("");
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
                    if(capturedPiece !== null) updEnemyPieces(capturedPiece);
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

    let updateChatWindow = (chatMessage) => {
        const chatWindow = document.querySelector('#chat_window');
        const container = document.createElement('div');
        const textNode = document.createTextNode(chatMessage.message);
        const messageType = (chatMessage.sender === playerNumber) ? 'my_message' : 'enemy_message';
        container.classList.add(messageType);
        container.appendChild(textNode);
        chatWindow.appendChild(container);
    };

    let chatMessageHandler = (event) => {
        if (event.key === 'Enter') {
            const message = ChatMessage(playerNumber, new Date(), event.target.value);
            chatMessages.push(message);
            updateChatWindow(message);
            socketSend({command: 'send_message', message: message.message});
            event.target.value = '';
        }
    };

    let resetCapturedPieces = () => {
        const friendly = document.querySelector('#captured_friendly_pieces');
        while (friendly.firstElementChild) friendly.removeChild(friendly.firstElementChild);
        const enemy = document.querySelector('#captured_enemy_pieces');
        while (enemy.firstElementChild) enemy.removeChild(enemy.firstElementChild);
    };

    let resetGameState = function () {
        enableResign();
        enableDraw();
        board.initBoard(personalColor, playerMove);
        capturedFriendlyPieces = [];
        capturedEnemyPieces = [];
        resetCapturedPieces();
        pieceSelected = undefined;
        globalTimer = 0;
        personalTimer = 600;
        enemyTimer = 600;
        currentPlayer = 1;
        playerNumber = playerNum;
        timerToken = startTimer();
    };

    socket.onmessage = function (event) {
        console.log(event.data);
        const message = JSON.parse(event.data);
        if (message.command === 'enter_game') {
            enableDraw();
            enableResign();
            console.log('starting game');
            displayMessage(`player${message.player_number}`);
            playerNum = message.player_number;
            personalColor = (message.player_number == 1) ? 'white' : 'black';
            playerID = message.player_id;
            resetGameState();
        } else if (message.command === 'make_move') {
            let piece = {
                piece: board.getPiece(message.origin_row, message.origin_column),
                row: message.origin_row,
                column: message.origin_column
            };
            let friendlyPiece = board.makeMove(piece, message.destination_row, message.destination_column);
            //capturedFriendlyPieces.push(friendlyPiece);
            if (friendlyPiece !== null) updFriendlyPieces(friendlyPiece);
            currentPlayer = playerNumber;
        } else if (message.command === 'game_end') {
            disableDraw();
            disableResign();
            if(message.winner_player === playerNumber) {
                if(message.reason === "pieces") displayMessage('gameWon');
                if(message.reason === "timeout") displayMessage('wonTimeout');
                if(message.reason === "stalemate") displayMessage('wonStalemate');
            }    
            else if (message.winner_player === 0) {
                if(message.reason !== "stalemate") displayMessage('gameDraw');
                else displayMessage('drawStalemate');
            }    
            else {
                if(message.reason === "pieces") displayMessage('gameLost');
                if(message.reason === "timeout") displayMessage('lostTimeout');
                if(message.reason === "stalemate") displayMessage('lostStalemate');
            }    
            playerNumber = 10;
            setTimeout(() => {displayMessage('gameRematch')}, 2000);
            clearInterval(timerToken);
        } else if (message.command === 'offer_draw') {
            disableDraw();
            displayMessage('drawPrompt');
        } else if (message.command === 'accept_draw') {
            disableResign();
            disableDraw();
            displayMessage('gameDraw');
            setTimeout(() => {displayMessage('gameRematch')}, 2000);
            clearInterval(timerToken);
        } else if (message.command === 'reject_draw') {
            displayMessage('drawDenied');
            enableDraw();
            enableResgin();
            setTimeout(() => {displayMessage(`player${playerNumber}`)}, 2000);
        } else if (message.command === 'resign') {
            displayMessage('enemyResigned');
            disableResign();
            disableDraw();
            playerNumber = 10;
            setTimeout(() => {displayMessage('gameRematch')}, 2000);
            clearInterval(timerToken);
        } else if (message.command === 'accept_rematch') {
            displayMessage('acceptedRematch');
        } else if (message.command === 'reject_rematch') {
            displayMessage('rematchDenied');
        } else if (message.command === 'send_message') {
            chatMessages.push(ChatMessage(playerNumber === 1 ? 2 : 1, new Date(), message.message));
            updateChatWindow(chatMessages[chatMessages.length - 1]);
        } else if (message.command === 'opponent_left') {
            disableResign();
            disableDraw();
            displayMessage('opponentLeft');
            playerNumber = 10;
            clearInterval(timerToken);
        }
    };

    socket.onopen = function () {
        //socket.send("Hello from the client!");
    };

    let resign = () => {
        displayMessage('gameResigned');
        disableResign();
        disableDraw();
        socketSend({'command': 'resign'});
        setTimeout(() => {displayMessage('gameRematch')}, 2000);
        clearInterval(timerToken);
    };

    let offerDraw = () => {
        disableDraw();
        socketSend({'command': 'offer_draw'});
    };

    let registerUserEvents = () => {
        const resignButton = document.querySelector('#resignButton');
        resignButton.onclick = resign;
        const drawButton = document.querySelector('#drawButton');
        drawButton.onclick = offerDraw;
        const chatBox = document.querySelector('#chat_box');
        chatBox.addEventListener('keyup', chatMessageHandler);
        const supportButton = document.querySelector('#supportButton');
        supportButton.onclick = () => {
            window.location = "/support";
        };
    };

    return {
        startTimer : function () {
            timerToken = startTimer();
        },
        
        initGame : function () {
            board.initBoard(personalColor, playerMove);
            registerUserEvents();
        }
    };
}
