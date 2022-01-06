const playerQueue = [];

function matchMake() {
    while (playerQueue.length >= 2) {
        const player1 = playerQueue.shift();
        const player2 = playerQueue.shift();
        player1.send(JSON.stringify({'command': 'enter_game', 'player_number': 1, 'player_id': ''}));
        player2.send(JSON.stringify({'command': 'enter_game', 'player_number': 2, 'player_id': ''}));
    }
}


function addClient(socket) {
    console.log('new client');
    playerQueue.push(socket);
    socket.on('message', incomingMessage)
    matchMake();
}

function incomingMessage(data) {
    console.log('new message: ' + data);
}

module.exports = {
    addClient,
    incomingMessage
};
