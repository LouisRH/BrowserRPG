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
        miss = calculateMiss(turns.turn1.currEnemyStats.agi, turns.turn1.currPlayerStats.agi);
        if (!miss) {
            let enemyDamage = calculateDamage(turns.turn1.currEnemyStats.str, turns.turn1.currPlayerStats.def);
            turns.turn2.curPlayerStats.HP -= enemyDamage;
            if (turns.turn2.currPlayerStats.HP <= 0) {
                turns.turn2.currPlayerStats.HP = 0;
                turns.death = -1;
                return turns;
            }
        } else {
            turns.turn2.message = gameState.currEnemyStats.name + " missed!";
            return turns;
        }
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
    let missChance = (attackerAgi - targetAgi) + rand(0, Math.round(attackerAgi / 5));
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

module.exports = {
    rand: rand,
    createTurns: createTurns,
    calculateDamage: calculateDamage,
    expCalc: expCalc
}