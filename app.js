const express = require("express");
var cookieParser = require("cookie-parser");
const router = require("./router");

// Le righe del blocco successivo servono ad avere il refresh del browser automatico
// bisogna aver caricato gli npm package livereload e connect-livereload
// vanno tolte prima di andare in produzione
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const liveReloadServer = livereload.createServer();

const app = express();

// La riga successiva serve ad avere il refresh del browser automatico
// va tolta prima di andare in produzione
app.use(connectLivereload());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.set("views", "views");
app.set("view engine", "ejs");

liveReloadServer.watch("views", { recursive: true });
liveReloadServer.watch("public", { recursive: true });

app.use("/", router);

module.exports = app;
