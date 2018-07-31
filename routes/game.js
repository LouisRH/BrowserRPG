const express = require("express");
const router = express.Router();
const data = require("../data");
const gameData = data.gamedata;
const enemyData = data.enemydata; // Figure out when these are used

router.post('/game', (req,res) => {
    
    res.sendFile("game.html", {root: "public/html/"});
})

module.exports = router;