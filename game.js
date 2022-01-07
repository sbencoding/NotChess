const Match = require('./match');
const GameStatistics = require("./gameStatistics");
const playerQueue = [];
let statistics = GameStatistics();

function matchMake() {
    while (playerQueue.length >= 2) {
        const player1 = playerQueue.shift();
        const player2 = playerQueue.shift();
        Match(player1, player2, statistics);
        statistics.incrementCurrentGames();
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
