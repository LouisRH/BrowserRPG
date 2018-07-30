const express = require("express");
const router = express.Router();
const data = require("../data");
const gameData = data.gamedata;
const enemyData = data.enemydata; // Figure out when these are used

router.get('/game', (req,res) => {
    // Eventually load game data
    res.render("layouts/game");
})

module.exports = router;