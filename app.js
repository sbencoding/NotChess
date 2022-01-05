const indexRouter = require("./routes/index");
const gameServer = require("./game");

const express = require("express");
const http = require("http");
const websocket = require("ws");

const port = process.argv[2];
const app = express();

app.use(express.static(__dirname + "/public"));
app.get("/", indexRouter);
app.get("/play", indexRouter);

const server = http.createServer(app)
const wss = new websocket.Server({ server });

wss.on('connection', gameServer.addClient);

server.listen(port);
