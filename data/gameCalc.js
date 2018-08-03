const gameData = require("./gamedata");
const enemyData = require("./enemydata");

function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createTurns(gameState) {
    let turns = {
        turn1: {
            message: "",
            statusMessage: "",
            flee: false,
            currPlayerStats: gameState.currPlayerStats,
            currEnemyStats: gameState.currEnemyStats
        },
        turn2: {
            message: "",
            statusMessage: "",
            currPlayerStats: gameState.currPlayerStats,
            currEnemyStats: gameState.currEnemyStats
        },
        death: 0,
        levelUp: false,
    }

    if (gameState.messageType === "attack") {
        // Turn 1 (Player acts)
        let miss = calculateMiss(gameState.currPlayerStats.agi, gameState.currEnemyStats.agi);
        if (!miss) {
            let playerDamage = calculateDamage(gameState.currPlayerStats.str, gameState.currEnemyStats.def);
            turns.turn1.currEnemyStats.HP -= playerDamage;
            if (turns.turn1.currEnemyStats.HP <= 0) {
                turns.turn1.currEnemyStats.HP = 0;
                turns.death = 1;
                let expResult = expCalc(turns.turn1.currPlayerStats.exp, turns.turn1.currPlayerStats.level, turns.turn1.currEnemyStats.level);
                turns.turn1.currPlayerStats.exp = expResult.exp;
                turns.levelUp = expResult.levelUp;
                turns.turn2 = null;
                return turns;
            }
        } else {
            turns.turn1.message = gameState.currPlayerStats.name + " missed!";
        }
        // TODO Poison and regen calculation
        /*
        if (gameState.currPlayerStats.status.flux === -1) {
            let poisonDamage = Math.round(gameState.currPlayerStats.MaxHP / 10);
            if (gameState.currPlayerStats.HP - poisonDamage <= 0) {
                poisonDamage = gameState.currPlayerStats.HP - 1;
            }
        }*/

        // Turn 2 (Enemy acts)
        // Add AI later, for now, just attack
        turns.turn2.currPlayerStats = turns.turn1.currPlayerStats;
        turns.turn2.currEnemyStats = turns.turn1.currEnemyStats;
        miss = calculateMiss(turns.turn1.currEnemyStats.agi, turns.turn1.currPlayerStats.agi);
        if (!miss) {
            let enemyDamage = calculateDamage(turns.turn1.currEnemyStats.str, turns.turn1.currPlayerStats.def);
            turns.turn2.currPlayerStats.HP -= enemyDamage;
            if (turns.turn2.currPlayerStats.HP <= 0) {
                turns.turn2.currPlayerStats.HP = 0;
                turns.death = -1;
            }
        } else {
            turns.turn2.message = gameState.currEnemyStats.name + " missed!";
        }
        return turns;
    }
}

function calculateDamage(attackerStat, targetStat) {
    let baseDamage = ((attackerStat * 10) - (targetStat * 5));
    let damage = baseDamage + rand(0, Math.round(baseDamage / 3));
    if (damage <= 0) {
        damage = 1;
    }
    return damage;
}

function calculateMiss(attackerAgi, targetAgi) {
    let missChance = (attackerAgi - targetAgi) + rand(0, Math.round(attackerAgi * 1.5));
    if (missChance >= 0) {
        return false;
    } else {
        return true;
    }
}

function expCalc(currExp, playerLevel, enemyLevel) {
    let exp = 0;
    if (playerLevel === enemyLevel) {
        exp = (50 + rand(-5, 6));
    } else if (playerLevel > enemyLevel) {
        exp = 50 - Math.round((Math.abs(playerLevel - enemyLevel) * 5) * (rand(10, 21) / 10));
        if (exp === 0) {
            exp = 1;
        }
    } else if (playerLevel < enemyLevel) {
        exp = 50 + Math.round((Math.abs(playerLevel - enemyLevel) * 5) * (rand(10, 21) / 10));
        if (exp > 100) {
            exp = 100;
        }
    }
    exp += currExp;
    if (exp > 100) {
        exp = exp - 100;
        return {
            exp: exp,
            levelUp: true
        }
    } else {
        return {
            exp: exp,
            levelUp: false
        }
    }
}

function nextEnemy(messageData, playerData, newEnemy) {
    //let playerData = await gameData.getGameDataById(messageData.playerID);
    //let newEnemy = await enemyData.pickRandomEnemy();
    playerData.enemyID = newEnemy._id;
    playerData.exp = messageData.exp;
    let newPlayerStats = null;
    let newEnemyStats = null;
    if (messageData.playerLevelUp === true) {
        newPlayerStats = applyPlayerLevelUp(playerData);
    }
    if (messageData.enemyLevelUp !== 0) {
        newEnemyStats = applyEnemyLevelChange(playerData, messageData.enemyLevelUp);
    }
    let updatedGame = updatePlayerData(playerData, newPlayerStats, newEnemyStats);
    return updatedGame;
}

function applyPlayerLevelUp(playerData) {
    // Stats increase by a random percentage. The range can be boosted with bonus stats.
    let newStats = {
        level: playerData.level + 1,
        HP: playerData.HP + Math.round(playerData.HP * (rand(25 + playerData.bonusHP, 31 + playerData.bonusHP) / 100)),
        MP: playerData.MP + Math.round(playerData.MP * (rand(10 + playerData.bonusMP, 16 + playerData.bonusMP) / 100)),
        str: playerData.str + Math.round(playerData.str * (rand(15 + playerData.bonusStr, 21 + playerData.bonusStr) / 100)),
        mag: playerData.mag + Math.round(playerData.mag * (rand(15 + playerData.bonusMag, 21 + playerData.bonusMag) / 100)),
        def: playerData.def + Math.round(playerData.def * (rand(15 + playerData.bonusDef, 21 + playerData.bonusDef) / 100)),
        res: playerData.res + Math.round(playerData.res * (rand(15 + playerData.bonusRes, 21 + playerData.bonusRes) / 100)),
        agi: playerData.agi + Math.round(playerData.agi * (rand(15 + playerData.bonusAgi, 21 + playerData.bonusAgi) / 100)),
        luck: playerData.luck + Math.round(playerData.luck * (rand(15 + playerData.bonusLuck, 21 + playerData.bonusLuck) / 100))
    }
    return newStats;
}

function applyEnemyLevelChange(playerData, change) {
    let newStats = {
        level: playerData.enemyLevel,
        HP: playerData.enemyHP,
        MP: playerData.enemyMP,
        str: playerData.enemyStr,
        mag: playerData.enemyMag,
        def: playerData.enemyDef,
        res: playerData.enemyRes,
        agi: playerData.enemyAgi,
        luck: playerData.enemyLuck
    };
    if (change === 1) {
        newStats.level = playerData.enemyLevel + 1;
        newStats.HP = playerData.enemyHP + Math.round(playerData.enemyHP * (rand(30, 36) / 100));
        newStats.MP = playerData.enemyMP + Math.round(playerData.enemyMP * (rand(15, 21) / 100));
        newStats.str = playerData.enemyStr + Math.round(playerData.enemyStr * (rand(20, 26) / 100));
        newStats.mag = playerData.enemyMag + Math.round(playerData.enemyMag * (rand(20, 26) / 100));
        newStats.def = playerData.enemyDef + Math.round(playerData.enemyDef * (rand(20, 26) / 100));
        newStats.res = playerData.enemyRes + Math.round(playerData.enemyRes * (rand(20, 26) / 100));
        newStats.agi = playerData.enemyAgi + Math.round(playerData.enemyAgi * (rand(20, 26) / 100));
        newStats.luck = playerData.enemyLuck + Math.round(playerData.enemyLuck * (rand(20, 26) / 100));
    } else if (change === -1 && playerData.enemyLevel > 1) {
        newStats.level = playerData.enemyLevel - 1;
        newStats.HP = playerData.enemyHP - Math.round(playerData.enemyHP * (rand(25, 31) / 100));
        newStats.MP = playerData.enemyMP - Math.round(playerData.enemyMP * (rand(10, 16) / 100));
        newStats.str = playerData.enemyStr - Math.round(playerData.enemyStr * (rand(15, 21) / 100));
        newStats.mag = playerData.enemyMag - Math.round(playerData.enemyMag * (rand(15, 21) / 100));
        newStats.def = playerData.enemyDef - Math.round(playerData.enemyDef * (rand(15, 21) / 100));
        newStats.res = playerData.enemyRes - Math.round(playerData.enemyRes * (rand(15, 21) / 100));
        newStats.agi = playerData.enemyAgi - Math.round(playerData.enemyAgi * (rand(15, 21) / 100));
        newStats.luck = playerData.enemyLuck - Math.round(playerData.enemyLuck * (rand(15, 21) / 100));
    }
    return newStats;
}

async function updatePlayerData(playerData, newPlayerStats, newEnemyStats) {
    if (newPlayerStats !== null) {
        playerData.level = newPlayerStats.level;
        playerData.HP = newPlayerStats.HP;
        playerData.MP = newPlayerStats.MP;
        playerData.str = newPlayerStats.str;
        playerData.mag = newPlayerStats.mag;
        playerData.def = newPlayerStats.def;
        playerData.res = newPlayerStats.res;
        playerData.agi = newPlayerStats.agi;
        playerData.luck = newPlayerStats.luck;
    }
    if (newEnemyStats !== null) {
        playerData.enemyLevel = newEnemyStats.level;
        playerData.enemyHP = newEnemyStats.HP;
        playerData.enemyMP = newEnemyStats.MP;
        playerData.enemyStr = newEnemyStats.str;
        playerData.enemyMag = newEnemyStats.mag;
        playerData.enemyDef = newEnemyStats.def;
        playerData.enemyRes = newEnemyStats.res;
        playerData.enemyAgi = newEnemyStats.agi;
        playerData.enemyLuck = newEnemyStats.luck;
    }
    return playerData;
}

module.exports = {
    rand: rand,
    createTurns: createTurns,
    calculateDamage: calculateDamage,
    expCalc: expCalc,
    nextEnemy: nextEnemy,
    applyPlayerLevelUp: applyPlayerLevelUp,
    applyEnemyLevelChange: applyEnemyLevelChange,
    updatePlayerData: updatePlayerData
}