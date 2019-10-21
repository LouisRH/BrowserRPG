const mongoCollections = require("../mongoCollections");
const enemyDataCollection = mongoCollections.enemydata;
const gameCalc = require("./gameCalc");

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

  function seedEnemies(){
    return enemyDataCollection().then(async (enemydata) => {
        console.log("Seeding Enemy Database");
  
        let bandit = await newEnemy({
            id: 1,
            name: "Bandit",
            HPScale: 100,
            MPScale: 100,
            strScale: 100,
            magScale: 100,
            defScale: 100,
            resScale: 100,
            agiScale: 100,
            luckScale: 100
        });
    
        let orc = await newEnemy({
            id: 2,
            name: "Orc",
            HPScale: 150,
            MPScale: 60,
            strScale: 120,
            magScale: 70,
            defScale: 120,
            resScale: 80,
            agiScale: 50,
            luckScale: 90
        });
    
        let witch = await newEnemy({
            id: 3,
            name: "Witch",
            HPScale: 70,
            MPScale: 130,
            strScale: 60,
            magScale: 140,
            defScale: 70,
            resScale: 120,
            agiScale: 110,
            luckScale: 50
        });
    
        let darkElf = await newEnemy({
            id: 4,
            name: "Dark Elf",
            HPScale: 75,
            MPScale: 100,
            strScale: 90,
            magScale: 80,
            defScale: 65,
            resScale: 100,
            agiScale: 135,
            luckScale: 130
        });
    
        let slime = await newEnemy({
            id: 5,
            name: "Slime",
            HPScale: 65,
            MPScale: 140,
            strScale: 80,
            magScale: 125,
            defScale: 160,
            resScale: 40,
            agiScale: 90,
            luckScale: 70
        });
    
        let reaper = await newEnemy({
            id: 6,
            name: "Reaper",
            HPScale: 200,
            MPScale: 200,
            strScale: 200,
            magScale: 200,
            defScale: 200,
            resScale: 200,
            agiScale: 200,
            luckScale: 200
        });
      });
  }

  async function pickRandomEnemy() {
      let reaperCount = 0;
      let selected = false;
      let selectedId;
      while (!selected) {
          let randNum = gameCalc.rand(1, 7);
          if (randNum === 6) {
              if (reaperCount === 3) {
                  selectedId = 6;
                  selected = true;
              } else {
                  reaperCount++;
              }
          } else {
              selectedId = randNum;
              selected = true;
          }
      }

      let enemy = await getEnemyDataById(selectedId);
      return enemy;
  }

  module.exports = {
    listAllEnemies: listAllEnemies,
    getEnemyDataById: getEnemyDataById,
    newEnemy: newEnemy,
    seedEnemies: seedEnemies,
    pickRandomEnemy: pickRandomEnemy
  }