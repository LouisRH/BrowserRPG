const express = require("express");
const path = require("path");
const data = require("../data");
const gameData = data.gamedata;
const enemyData = data.enemydata;
const gameCalc = data.gameCalc;

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
        if (await enemyData.getEnemyDataById(1) === null) {
            let enemySeed = await enemyData.seedEnemies();
        }
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10000);
        res.cookie("GameCookie", newGameData._id, {expires: expiresAt});
        res.status(200).send(newGameData._id);

    } else if (req.body.messageType === "loadPlayer") {
        let gameCookie = req.cookies["GameCookie"];
        if (!gameCookie) {
            res.status(404).send({error: "Cookie not found"});
        }
        let playerData = await gameData.getGameDataById(gameCookie);
        let currEnemyData = await enemyData.pickRandomEnemy();
        let result = {
            playerData: playerData,
            enemyData: currEnemyData
        }
        res.status(200).send(result);

    } else {// make sure to keep this last!!!!!
        let turns = gameCalc.createTurns(req.body);
        res.status(200).send(turns);
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