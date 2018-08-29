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
    let defend = false;
    let turn1Message = "";

    if (gameState.messageType === "attack") {
        // Turn 1 (Player acts)
        let miss = calculateMiss(gameState.currPlayerStats.agi, gameState.currEnemyStats.agi);
        turn1Message = gameState.currPlayerStats.name + " --[Attack]-> " + gameState.currEnemyStats.name + ": ";
        if (!miss) {
            let playerDamage = calculateDamage(gameState.currPlayerStats.str, gameState.currEnemyStats.def);
            let crit = calculateCrit(gameState.currPlayerStats.luck, gameState.currEnemyStats.luck);
            if (crit === true) {
                playerDamage = Math.round(playerDamage * 1.5);
            }
            turns.turn1.currEnemyStats.HP -= playerDamage;
            if (crit === true) {
                turn1Message += "*" + playerDamage + "*";
            } else {
                turn1Message += playerDamage;
            }
            turns.turn1.message = turn1Message;
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
            turn1Message += "miss";
            turns.turn1.message = turn1Message;
        }
    } else if (gameState.messageType === "defend") {
        defend = true;
        turn1Message = gameState.currPlayerStats.name + "<-[Defend]->";
        turns.turn1.message = turn1Message;
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
    let turn2Message = gameState.currPlayerStats.name + " <-[Attack]-- " + gameState.currEnemyStats.name + ": "
    if (!miss) {
        let tempDef = turns.turn1.currPlayerStats.def;
        if (defend === true) {
            tempDef *= 2;
        }
        let enemyDamage = calculateDamage(turns.turn1.currEnemyStats.str, tempDef);
        let crit = calculateCrit(gameState.currEnemyStats.luck, gameState.currPlayerStats.luck);
        if (crit === true) {
            enemyDamage = Math.round(enemyDamage * 1.5);
        }
        turns.turn2.currPlayerStats.HP -= enemyDamage;
        if (crit === true) {
            turn2Message += "*" + enemyDamage + "*";
        } else {
            turn2Message += enemyDamage;
        }
        turns.turn2.message = turn2Message;
        if (turns.turn2.currPlayerStats.HP <= 0) {
            turns.turn2.currPlayerStats.HP = 0;
            turns.death = -1;
        }
    } else {
        turn2Message += "miss";
        turns.turn2.message = turn2Message;
    }
    return turns;
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
    if (attackerAgi > targetAgi * 10) {
        return false;
    } else if (attackerAgi * 10 < targetAgi) {
        return true;
    }
    let agiInverse = attackerAgi - targetAgi;
    if (agiInverse < (attackerAgi * -1)) {
        agiInverse = attackerAgi * -1;
    }
    let missChance = agiInverse + rand(0, Math.round(attackerAgi * 1.5));
    if (missChance >= 0) {
        return false;
    } else {
        return true;
    }
}

function calculateCrit(attackerLuck, targetLuck) {
    let luckDiff = attackerLuck - targetLuck;
    let luckRoll;
    if (luckDiff >= 0) {
        luckRoll = rand(luckDiff, attackerLuck + 1);
        if (luckRoll >= (Math.round((attackerLuck - luckDiff) / 1.5) + luckDiff)) {
            return true;
        } else {
            return false;
        }
    } else {
        if (luckDiff <= -5) {
            return false;
        } else {
            luckRoll = rand((5 - (luckDiff * -1)), 21);
            if (luckRoll >= 17) {
                return true;
            } else {
                return false;
            }
        }
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

function statRegulator(stat) {
    // Enforces stat cap of 10 trillion - 1
    if (stat > 9999999999999) {
        return 9999999999999;
    } else {
        return stat;
    }
}

function applyPlayerLevelUp(playerData) {
    // Stats increase by a random percentage. The range can be boosted with bonus stats.
    let newStats = {
        level: playerData.level + 1,
        HP: playerData.HP + Math.round(playerData.HP * (rand(20 + playerData.bonusHP, 26 + playerData.bonusHP) / 100)),
        MP: playerData.MP + Math.round(playerData.MP * (rand(10 + playerData.bonusMP, 16 + playerData.bonusMP) / 100)),
        str: playerData.str + Math.round(playerData.str * (rand(15 + playerData.bonusStr, 21 + playerData.bonusStr) / 100)),
        mag: playerData.mag + Math.round(playerData.mag * (rand(15 + playerData.bonusMag, 21 + playerData.bonusMag) / 100)),
        def: playerData.def + Math.round(playerData.def * (rand(15 + playerData.bonusDef, 21 + playerData.bonusDef) / 100)),
        res: playerData.res + Math.round(playerData.res * (rand(15 + playerData.bonusRes, 21 + playerData.bonusRes) / 100)),
        agi: playerData.agi + Math.round(playerData.agi * (rand(15 + playerData.bonusAgi, 21 + playerData.bonusAgi) / 100)),
        luck: playerData.luck + Math.round(playerData.luck * (rand(15 + playerData.bonusLuck, 21 + playerData.bonusLuck) / 100))
    }
    newStats.HP = statRegulator(newStats.HP);
    newStats.MP = statRegulator(newStats.MP);
    newStats.str = statRegulator(newStats.str);
    newStats.mag = statRegulator(newStats.mag);
    newStats.def = statRegulator(newStats.def);
    newStats.res = statRegulator(newStats.res);
    newStats.agi = statRegulator(newStats.agi);
    newStats.luck = statRegulator(newStats.luck);
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
        // Enemy level up
        newStats.level = playerData.enemyLevel + 1;
        newStats.HP = playerData.enemyHP + Math.round(playerData.enemyHP * (rand(25, 31) / 100));
        newStats.MP = playerData.enemyMP + Math.round(playerData.enemyMP * (rand(10, 16) / 100));
        newStats.str = playerData.enemyStr + Math.round(playerData.enemyStr * (rand(15, 21) / 100));
        newStats.mag = playerData.enemyMag + Math.round(playerData.enemyMag * (rand(15, 21) / 100));
        newStats.def = playerData.enemyDef + Math.round(playerData.enemyDef * (rand(10, 16) / 100));
        newStats.res = playerData.enemyRes + Math.round(playerData.enemyRes * (rand(10, 16) / 100));
        newStats.agi = playerData.enemyAgi + Math.round(playerData.enemyAgi * (rand(10, 16) / 100));
        newStats.luck = playerData.enemyLuck + Math.round(playerData.enemyLuck * (rand(15, 21) / 100));
    } else if (change === -1 && playerData.enemyLevel > 1) {
        // Enemy level down
        newStats.level = playerData.enemyLevel - 1;
        newStats.HP = playerData.enemyHP - Math.round(playerData.enemyHP * (rand(20, 26) / 100));
        newStats.MP = playerData.enemyMP - Math.round(playerData.enemyMP * (rand(10, 16) / 100));
        newStats.str = playerData.enemyStr - Math.round(playerData.enemyStr * (rand(10, 16) / 100));
        newStats.mag = playerData.enemyMag - Math.round(playerData.enemyMag * (rand(10, 16) / 100));
        newStats.def = playerData.enemyDef - Math.round(playerData.enemyDef * (rand(10, 16) / 100));
        newStats.res = playerData.enemyRes - Math.round(playerData.enemyRes * (rand(10, 16) / 100));
        newStats.agi = playerData.enemyAgi - Math.round(playerData.enemyAgi * (rand(10, 16) / 100));
        newStats.luck = playerData.enemyLuck - Math.round(playerData.enemyLuck * (rand(10, 16) / 100));
    }
    newStats.HP = statRegulator(newStats.HP);
    newStats.MP = statRegulator(newStats.MP);
    newStats.str = statRegulator(newStats.str);
    newStats.mag = statRegulator(newStats.mag);
    newStats.def = statRegulator(newStats.def);
    newStats.res = statRegulator(newStats.res);
    newStats.agi = statRegulator(newStats.agi);
    newStats.luck = statRegulator(newStats.luck);
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
    calculateMiss: calculateMiss,
    calculateCrit: calculateCrit,
    expCalc: expCalc,
    nextEnemy: nextEnemy,
    statRegulator: statRegulator,
    applyPlayerLevelUp: applyPlayerLevelUp,
    applyEnemyLevelChange: applyEnemyLevelChange,
    updatePlayerData: updatePlayerData
}