const dbConnection = require("../mongoConnection");
const data = require("../data");
const enemyData = data.enemydata;

async function seed(){

    let dbConn = await dbConnection();
    await dbConn.dropDatabase();
    let bandit = await enemyData.newEnemy({
        _id: 1,
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

    let orc = await enemyData.newEnemy({
        _id: 2,
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

    let witch = await enemyData.newEnemy({
        _id: 3,
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

    let darkElf = await enemyData.newEnemy({
        _id: 4,
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

    let slime = await enemyData.newEnemy({
        _id: 5,
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

    let reaper = await enemyData.newEnemy({
        _id: 6,
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
    
    dbConn.close();
    
    
}

seed().then(()=>{
    console.log("Done seeding database");
}).catch((error) => {
    console.error(error);
});