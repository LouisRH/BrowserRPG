const mongoCollections = require("../mongoCollections");
const uuid = require("uuid");
const gameDataCollection = mongoCollections.gamedata;
const enemyData = require("./enemydata");

function listAllGames(){
    return gameDataCollection().then((gameData) => {
      return gameData.find({}).toArray();
    });
}

function getGameDataById(id) {
  return gameDataCollection().then((gamedata) => {
      return gamedata.findOne({ _id: id }).then((game) => {
          if (!game) return null;
          return game;
      });
  });
}

async function newGame(playerData){
  let enemy = await enemyData.pickRandomEnemy();
  return gameDataCollection().then((gamedata) => {
    enemyID = enemy._id;

    let newGameData = {
        name: playerData.name,
        level: 1,
        HP: (playerData.bonusHP * 10) + 100,
        MP: (playerData.bonusMP * 5) + 30,
        str: playerData.bonusStr + 5,
        mag: playerData.bonusMag + 5,
        def: playerData.bonusDef + 5,
        res: playerData.bonusRes + 5,
        agi: playerData.bonusAgi + 5,
        luck: playerData.bonusLuck + 5,
        bonusHP: playerData.bonusHP,
        bonusMP: playerData.bonusMP,
        bonusStr: playerData.bonusStr,
        bonusMag: playerData.bonusMag,
        bonusDef: playerData.bonusDef,
        bonusRes: playerData.bonusRes,
        bonusAgi: playerData.bonusAgi,
        bonusLuck: playerData.bonusLuck,
        exp: 0,
        enemyID: enemyID,
        enemyLevel: 1,
        enemyHP: 100,
        enemyMP: 50,
        enemyStr: 5,
        enemyMag: 5,
        enemyDef: 5,
        enemyRes: 5,
        enemyAgi: 5,
        enemyLuck: 5,
        _id: uuid.v4()
    };

    return gamedata.insertOne(newGameData).then((newInsertInformation) => {
        return newInsertInformation.insertedId;
    }).then((newId) => {
        return getGameDataById(newId);
    });
  });
}

function updateGame(playerData){
  return gameDataCollection().then((gamedata) => {
    let id = playerData._id;
    return gamedata.updateOne({_id:id},{$set: playerData}).then((result) => {
      if(result.matchedCount !== 1)
        throw "Game data not found " + id;
      return getGameDataById(id);
    });
  });
}

function deleteGame(id){
  return gameDataCollection().then((gamedata) => {
    return gamedata.deleteOne({_id:id}).then((result)=>{
        if(result.deletedCount < 1)
          throw "Game data not found "+id;
        return;
    });
  });

}

module.exports = {
  listAllGames: listAllGames,
  getGameDataById: getGameDataById,
  newGame: newGame,
  updateGame: updateGame,
  deleteGame: deleteGame
}