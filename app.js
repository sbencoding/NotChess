// Local imports
const indexRouter = require("./routes/index");
const gameServer = require("./game");
const GameStatistics = require("./gameStatistics");

// Package imports
const express = require("express");
const http = require("http");
const websocket = require("ws");

// Setup statistics tracking
let statistics = GameStatistics();
indexRouter.setStatistics(statistics);
gameServer.setStatistics(statistics);

// Setup express
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.get("/", indexRouter.router);
app.get("/play", indexRouter.router);
app.get("/tutorial", indexRouter.router);

// Setup websocket server
const server = http.createServer(app)
const wss = new websocket.Server({ server });

wss.on('connection', gameServer.addClient);

// Start the server
const port = process.argv[2];
server.listen(port);
