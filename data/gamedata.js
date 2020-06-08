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
        baseHP: (playerData.bonusHP * 10) + 100,
        baseMP: (playerData.bonusMP * 5) + 30,
        baseStr: playerData.bonusStr + 5,
        baseMag: playerData.bonusMag + 5,
        baseDef: playerData.bonusDef + 5,
        baseRes: playerData.bonusRes + 5,
        baseAgi: playerData.bonusAgi + 5,
        baseLuck: playerData.bonusLuck + 5,
        modHP: 1,
        modMP: 1,
        modStr: 1,
        modMag: 1,
        modDef: 1,
        modRes: 1,
        modAgi: 1,
        modLuck: 1,
        fireLvl: 1,
        cureLvl: 1,
        protectLvl: 1,
        deprotectLvl: 1,
        shellLvl: 1,
        deshellLvl: 1,
        braveryLvl: 1,
        debraveLvl: 1,
        faithLvl: 1,
        defaithLvl: 1,
        hasteLvl: 1,
        slowLvl: 1,
        regenLvl: 1,
        poisonLvl: 1,
        fireMP: 5,
        cureMP: 5,
        protectMP: 10,
        deprotectMP: 10,
        shellMP: 10,
        deshellMP: 10,
        braveryMP: 10,
        debraveMP: 10,
        faithMP: 10,
        defaithMP: 10,
        hasteMP: 10,
        slowMP: 10,
        regenMP: 15,
        poisonMP: 15,
        exp: 0,
        skills: [],
        newSkills: [],
        skillPoints: 0,
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