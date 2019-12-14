const express = require("express");
const router = require("express").Router();
const path = require("path");
const data = require("../data");
const gameData = data.gamedata;
const enemyData = data.enemydata;
const gameCalc = data.gameCalc;

router.get("/", function(req, res) {
    //res.setHeader("Content-Security-Policy", "default-src 'self' https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js 'unsafe-inline'");
    res.sendFile(path.join(appRoot, "\\public\\html", "index.html"));
    return;
})

router.get("/game", function(req, res) {
    res.sendFile(path.join(appRoot, "\\public\\html", "game.html"));
    return;
})

router.post("/game", async function(req, res) {
    if (req.body.messageType === "newGame") {
        if (await enemyData.getEnemyDataById(1) === null) {
            let enemySeed = await enemyData.seedEnemies();
        }
        let newGameData = await gameData.newGame(req.body);
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
        let currEnemyData = await enemyData.getEnemyDataById(playerData.enemyID);
        let result = {
            playerData: playerData,
            enemyData: currEnemyData
        }
        res.status(200).send(result);

    } else if (req.body.messageType === "next") {
        let currGameData = await gameData.getGameDataById(req.body.playerID);
        let newEnemy = await enemyData.pickRandomEnemy();
        let playerData = await gameCalc.nextEnemy(req.body, currGameData, newEnemy);
        let currPlayerData = await gameData.updateGame(playerData);
        let currEnemyData = await enemyData.getEnemyDataById(currPlayerData.enemyID);
        let result = {
            playerData: currPlayerData,
            enemyData: currEnemyData
        }
        res.status(200).send(result);
    } else {// make sure to keep this last!!!!!
        let turns = await gameCalc.createTurns(req.body);
        res.status(200).send(turns);
    }
    return;
})

router.get("*",function(req, res) {
    res.status(404).json({ error: "Not found" });
});

/*
const constructorMethod = app => {
    app.get("/", index);
    app.get("/game", gameGet);
    app.post("/game", gamePost);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
  };
  */
module.exports = router;