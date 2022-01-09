// Local imports
const statisticsFile = require("./statistics.json");

// Node imports
const fs = require("fs");

/**
 * Create new statistics tracker instance
 * @returns {GameStatistics} a new tracker instance
 */
function GameStatistics() {
    // Amount of matches currently in progress
    let games_playing = 0;

    return {
        /**
         * Increment the total number of games played
         */
        incrementTotalGames : function() {
            statisticsFile.statistics['games_played']++;
            fs.writeFile("./statistics.json", JSON.stringify(statisticsFile), (err) => {
                if(err) throw err;
            });
        },
        /**
         * Increment the total number of pieces captured by all players
         */
        incrementTotalPieces : function() {
            statisticsFile.statistics["pieces_taken"]++;
            fs.writeFile("./statistics.json", JSON.stringify(statisticsFile), (err) => {
                if(err) throw err;
            });
        },
        /**
         * Increment the number of games currently in progress
         */
        incrementCurrentGames : function() {
            games_playing++;
        },
        /**
         * Decrement the number of games currently in progress
         */
        decrementCurrentGames : function() {
            games_playing--;
        },
        
        /**
         * Return an object containing all statistics tracked
         */
        getStatistics : function() {
            return {
                "games_played" : statisticsFile.statistics['games_played'],
                "pieces_taken" : statisticsFile.statistics['pieces_taken'],
                "games_playing" : games_playing
            };
        }
    }
}

// Exports
module.exports = GameStatistics;
