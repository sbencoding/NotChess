const fs = require("fs");
const statisticsFile = require("./statistics.json");

function GameStatistics() {
    let games_playing = 0;

    return {
        incrementTotalGames : function() {
            statisticsFile.statistics['games_played']++;
            fs.writeFile("./statistics.json", JSON.stringify(statisticsFile), (err) => {
                if(err) throw err;
            });
        },
        incrementTotalPieces : function() {
            statisticsFile.statistics["pieces_taken"]++;
            fs.writeFile("./statistics.json", JSON.stringify(statisticsFile), (err) => {
                if(err) throw err;
            });
        },
        incrementCurrentGames : function() {
            games_playing++;
        },
        decrementCurrentGames : function() {
            games_playing--;
        },
        getStatistics : function() {
            return {
                "games_played" : statisticsFile.statistics['games_played'],
                "pieces_taken" : statisticsFile.statistics['pieces_taken'],
                "games_playing" : games_playing
            }
        }
    }
}

module.exports = GameStatistics;
