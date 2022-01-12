var express = require('express');
var router = express.Router();
let statistics;

function setStatistics(value) {
  statistics = value;
}

router.get("/play", function(req, res) {
  res.sendFile("game.html", { root: "./public" });
});

router.get("/", function(req, res) {
  res.render("splash.ejs",
    statistics.getStatistics()
  );
});

/* GET home page. */
router.get('/tutorial', function(req, res, next) {
  res.sendFile('tutorial.html', {root: './public'});
});

module.exports = {router, setStatistics};
