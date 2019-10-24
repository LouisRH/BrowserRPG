const data = require("../data");
const gameData = data.gamedata;
const enemyData = data.enemydata;

async function dumpDb(){
    console.log("Printing all saved games");
    let savedGames = await gameData.listAllGames();
    console.log(savedGames);
    console.log("Printing all enemies");
    let enemies = await enemyData.listAllEnemies();
    console.log(enemies);
}

dumpDb().then(()=>{
    console.log("Done with database dump");
}).catch((error) => {
    console.error(error);
});
