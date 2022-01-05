const indexRouter = require("./routes/index");
const require

const express = require("express");
const http = require("http");

const port = process.argv[2];
const app = express();

app.use(express.static(__dirname + "/public"));
app.get("/", indexRouter);
app.get("/play", indexRouter);

http.createServer(app).listen(port);