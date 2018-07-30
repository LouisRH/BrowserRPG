const mongoCollections = require("../mongoCollections");
const enemyDataCollection = mongoCollections.enemydata;

function listAllEnemies(){
    return enemyDataCollection().then((enemyData) => {
      return enemyData.find({}).toArray();
    });
}

function getEnemyDataById(id) {
  return enemyDataCollection().then((enemydata) => {
      return enemydata.findOne({ _id: id }).then((enemy) => {
          if (!enemy) return null;
          return enemy;
      });
  });
}

function newEnemy(enemyData){
    return enemyDataCollection().then((enemydata) => {
  
      let newEnemyData = {
          _id: enemyData.id,
          name: enemyData.name,
          HPScale: enemyData.HPScale,
          MPScale: enemyData.MPScale,
          strScale: enemyData.strScale,
          magScale: enemyData.magScale,
          defScale: enemyData.defScale,
          resScale: enemyData.resScale,
          agiScale: enemyData.agiScale,
          luckScale: enemyData.agiScale
      };
  
      return enemydata.insertOne(newEnemyData).then((newInsertInformation) => {
          return newInsertInformation.insertedId;
      }).then((newId) => {
          return getEnemyDataById(newId);
      });
    });
  }

  module.exports = {
    listAllEnemies: listAllEnemies,
    getEnemyDataById: getEnemyDataById,
    newEnemy: newEnemy
  }