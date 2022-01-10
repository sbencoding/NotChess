// Local imports
const Match = require('./match');

const playerQueue = [];
let statistics;

/**
 * Set the server-wide statistics tracker instance
 * @param {GameStatistics} value The instance of the statistics tracker
 */
function setStatistics(value) {
    statistics = value;
}

/**
 * Pair the players currently waiting in the queue (if possible)
 */
function matchMake() {
    // TODO: remove players exiting from the queue
    while (playerQueue.length >= 2) {
        // Remove and get the first two players in the queue
        const player1 = playerQueue.shift();
        const player2 = playerQueue.shift();

        // Add the players to a new match
        Match(player1, player2, statistics);

        // Update current game stat
        statistics.incrementCurrentGames();
    }
}

/**
 * Add a new socket to the game server
 * @param {WebSocket} socket The socket the server accepted the connection from
 */
function addClient(socket) {
    console.log('new client');
    // Add the new player to the queue
    playerQueue.push(socket);

    // Create matches if possible
    matchMake();
}

// Exports
module.exports = {
    addClient,
    setStatistics
};
