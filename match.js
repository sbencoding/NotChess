/**
 * This is the class for the chess match
 */

function match (socket1, socket2) {
    //increment the number of started matches
    let board = new ChessBoard();
    let currentPlayer = 1;
    board.init();
    socket1.send(JSON.stringify({'command': 'enter_game', 'player_number': 1, 'player_id': ''}));
    socket2.send(JSON.stringify({'command': 'enter_game', 'player_number': 2, 'player_id': ''}));
    socket1.on("message", function (message) {
        let command = JSON.stringify(message);
        const messageHandler = {
            make_move: () => {
                if(currentPlayer !== 1) return;
                if(!checkMove({piece : board.getPiece(row, column), row, column}, command.destination_row, command.destination_column)) return;
                board.makeMove({piece : board.getPiece(row, column), row, column}, command.destination_row, command.destination_column);
                currentPlayer = 2;
            },
            offer_draw: () => {
                socket2.send(JSON.stringify({'command': 'offer_draw'}));
            },
            accept_draw: () => {
                socket2.send(JSON.stringify({'command': 'accept_draw'}));
            },
            reject_draw: () => {
                socket2.send(JSON.stringify({'command': 'reject_draw'}));
            },
            resign: () => {
                socket2.send(JSON.stringify({'command': 'resign'}));
            },
            accept_rematch: () => {
                socket2.send(JSON.stringify({'command': 'accept_rematch'}));
            },
            reject_rematch: () => {
                socket2.send(JSON.stringify({'command': 'reject_rematch'}));
            },
            send_message: () => {
                socket2.send(JSON.stringify({'command': 'send_message', 'message': command.message}));
            }
        };
        messageHandler[command.command]();
    });

    socket2.on("message", function(message) {
        let command = JSON.stringify(message);
        const messageHandler = {
            make_move: () => {
                if(currentPlayer !== 2) return;
                if(!checkMove({piece : board.getPiece(row, column), row, column}, command.destination_row, command.destination_column)) return;
                board.makeMove({piece : board.getPiece(row, column), row, column}, command.destination_row, command.destination_column);
                currentPlayer = 1;
            },
            offer_draw: () => {
                socket1.send(JSON.stringify({'command': 'offer_draw'}));
            },
            accept_draw: () => {
                socket1.send(JSON.stringify({'command': 'accept_draw'}));
            },
            reject_draw: () => {
                socket1.send(JSON.stringify({'command': 'reject_draw'}));
            },
            resign: () => {
                socket1.send(JSON.stringify({'command': 'resign'}));
            },
            accept_rematch: () => {
                socket1.send(JSON.stringify({'command': 'accept_rematch'}));
            },
            reject_rematch: () => {
                socket1.send(JSON.stringify({'command': 'reject_rematch'}));
            },
            send_message: () => {
                socket1.send(JSON.stringify({'command': 'send_message', 'message': command.message}));
            }
        };
        messageHandler[command.command]();
    });

}