const indexRouter = require("./routes/index");
const gameServer = require("./game");

const express = require("express");
const http = require("http");
const websocket = require("ws");
const GameStatistics = require("./gameStatistics");

let statistics = GameStatistics();

indexRouter.setStatistics(statistics);
gameServer.setStatistics(statistics);
const port = process.argv[2];
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.get("/", indexRouter.router);
app.get("/play", indexRouter.router);

const server = http.createServer(app)
const wss = new websocket.Server({ server });

wss.on('connection', gameServer.addClient);

server.listen(port);
