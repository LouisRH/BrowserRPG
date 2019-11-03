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
          luckScale: enemyData.luckScale,
          aiVals: {
              attack: enemyData.aiVals.attack,
              fire: enemyData.aiVals.fire,
              cure: enemyData.aiVals.cure,
              protect: enemyData.aiVals.protect,
              deprotect: enemyData.aiVals.deprotect,
              shell: enemyData.aiVals.shell,
              deshell: enemyData.aiVals.deshell,
              bravery: enemyData.aiVals.bravery,
              debrave: enemyData.aiVals.debrave,
              faith: enemyData.aiVals.faith,
              defaith: enemyData.aiVals.defaith,
              haste: enemyData.aiVals.haste,
              slow: enemyData.aiVals.slow,
              regen: enemyData.aiVals.regen,
              poison: enemyData.aiVals.poison
          }
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
            luckScale: 100,
            aiVals: {
                attack: 5,
                fire: 5,
                cure: 0,
                protect: 5,
                deprotect: 5,
                shell: 5,
                deshell: 5,
                bravery: 5,
                debrave: 5,
                faith: 5,
                defaith: 5,
                haste: 5,
                slow: 5,
                regen: 5,
                poison: 5
            }
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
            luckScale: 90,
            aiVals: {
                attack: 7,
                fire: 3,
                cure: 0,
                protect: 7,
                deprotect: 7,
                shell: 4,
                deshell: 2,
                bravery: 7,
                debrave: 6,
                faith: 2,
                defaith: 4,
                haste: 4,
                slow: 4,
                regen: 6,
                poison: 5
            }
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
            luckScale: 50,
            aiVals: {
                attack: 3,
                fire: 7,
                cure: 0,
                protect: 6,
                deprotect: 2,
                shell: 6,
                deshell: 7,
                bravery: 2,
                debrave: 5,
                faith: 7,
                defaith: 5,
                haste: 6,
                slow: 6,
                regen: 4,
                poison: 4
            }
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
            luckScale: 130,
            aiVals: {
                attack: 6,
                fire: 5,
                cure: 0,
                protect: 6,
                deprotect: 6,
                shell: 5,
                deshell: 3,
                bravery: 6,
                debrave: 5,
                faith: 4,
                defaith: 4,
                haste: 6,
                slow: 4,
                regen: 3,
                poison: 4
            }
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
            luckScale: 70,
            aiVals: {
                attack: 4,
                fire: 6,
                cure: 0,
                protect: 6,
                deprotect: 3,
                shell: 6,
                deshell: 7,
                bravery: 4,
                debrave: 5,
                faith: 6,
                defaith: 4,
                haste: 6,
                slow: 4,
                regen: 3,
                poison: 6
            }
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
            luckScale: 200,
            aiVals: {
                attack: 5,
                fire: 5,
                cure: 0,
                protect: 7,
                deprotect: 7,
                shell: 7,
                deshell: 7,
                bravery: 7,
                debrave: 7,
                faith: 7,
                defaith: 7,
                haste: 7,
                slow: 7,
                regen: 6,
                poison: 6
            }
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