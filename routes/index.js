const express = require("express");
const path = require("path");
const data = require("../data");
const gameData = data.gamedata;
const enemyData = data.enemydata;

const index = (req, res) => {
    res.sendFile(path.join(__dirname, "..\\public\\html", "index.html"));
    return;
}

const gameGet = (req, res) => {
    res.sendFile(path.join(__dirname, "..\\public\\html", "game.html"));
    return;
}

const gamePost = async (req, res) => {
    if (req.body.messageType === "newGame") {
        let newGameData = await gameData.newGame(req.body);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        res.cookie("GameCookie", newGameData._id, {expires: expiresAt});
        res.status(200).send(newGameData._id);
    } else if (req.body.messageType === "loadPlayer") {
        let gameCookie = req.cookies["GameCookie"];
        if (!gameCookie) {
            alert("Error: Could not find cookie");
        }
        let playerData = await gameData.getGameDataById(gameCookie);
        res.status(200).send(playerData);
    }
    return;
}

const constructorMethod = app => {
    app.get("/", index);
    app.get("/game", gameGet);
    app.post("/game", gamePost);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
  };
  
  module.exports = constructorMethod;