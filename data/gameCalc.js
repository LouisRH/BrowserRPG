const gameData = require("./gamedata");
const enemyData = require("./enemydata");

function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createTurns(gameState) {
    // Both the player's turn and the enemy's turn are computed before the data is sent back to the front end.
    let turns = {
        turn1: {
            message: "",
            statusMessage: "",
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
        flee: false
    }
    let defend = false;
    
    // Turn 1 (Player acts)
    turns = calculatePlayerTurn(gameState, turns);
    if (gameState.messageType === "defend") {
        defend = true;
    } else if (turns.death === 1 || turns.flee) {
        return turns;
    }
    
    // Turn 2 (Enemy acts)
    turns = calculateEnemyTurn(gameState, turns, defend);
    return turns;
}

function calculatePlayerTurn(gameState, turns) {
    let turn1Message = "";
    let spellName = "";
    let magicMod = 1;

    if (gameState.messageType === "attack") {
        let miss = calculateMiss(gameState.currPlayerStats.agi, gameState.currEnemyStats.agi);
        turn1Message = gameState.currPlayerStats.name + " --[Attack]-> " + gameState.currEnemyStats.name + ": ";
        if (!miss) {
            let playerDamage = calculateDamage(gameState.currPlayerStats.str, gameState.currEnemyStats.def, 1);
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
        turn1Message = gameState.currPlayerStats.name + " <-[Defend]->";
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "flee") {
        let flee = calculateFlee(turns.turn1.currPlayerStats.agi + turns.turn1.currPlayerStats.luck, turns.turn1.currEnemyStats.agi + turns.turn1.currEnemyStats.luck);
        if (flee === true) {
            turn1Message = "Escaped successfully!";
            turns.turn1.message = turn1Message;
            turns.flee = true;
            turns.turn2 = null;
            return turns;
        } else {
            turn1Message = "Escape failed...";
            turns.turn1.message = turn1Message;
        }
    } else if (gameState.messageType === "fire") {
        if (gameState.baseStats.fireLvl === 1) {
            spellName = " --[Fire 1]-> ";
            magicMod = 1.1;
        } else if (gameState.baseStats.fireLvl === 2) {
            spellName = " --[Fire 2]-> ";
            magicMod = 1.2;
        } else {
            spellName = " --[Fire 3]-> ";
            magicMod = 1.3;
        }
        let playerDamage = calculateDamage(gameState.currPlayerStats.mag, gameState.currEnemyStats.res, magicMod);
        turn1Message = gameState.currPlayerStats.name + spellName + gameState.currEnemyStats.name + ": " + playerDamage;
        turns.turn1.currEnemyStats.HP -= playerDamage;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.fireMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
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
    } else if (gameState.messageType === "cure") {
        if (gameState.baseStats.cureLvl === 1) {
            spellName = " <-[Cure 1]->: ";
            magicMod = 1;
        } else if (gameState.baseStats.cureLvl === 2) {
            spellName = " <-[Cure 2]->: ";
            magicMod = 1.5;
        } else {
            spellName = " <-[Cure 3]->: ";
            magicMod = 2;
        }
        let cureVal = calculateCure(turns.turn1.currPlayerStats.mag * magicMod);
        turns.turn1.currPlayerStats.HP += cureVal;
        if (turns.turn1.currPlayerStats.HP > gameState.currPlayerStats.MaxHP) {
            turns.turn1.currPlayerStats.HP = gameState.currPlayerStats.MaxHP;
        }
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.cureMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName + cureVal;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "protect") {
        if (gameState.baseStats.protectLvl === 1) {
            spellName = " <-[Protect 1]->";
            magicMod = 0.2;
        } else if (gameState.baseStats.protectLvl === 2) {
            spellName = " <-[Protect 2]->";
            magicMod = 0.3;
        } else {
            spellName = " <-[Protect 3]->";
            magicMod = 0.4;
        }
        turns.turn1.currPlayerStats.def = gameState.baseStats.def + Math.round(gameState.baseStats.def * magicMod);
        turns.turn1.currPlayerStats.status.def = 1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.protectMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "deprotect") {
        if (gameState.baseStats.deprotectLvl === 1) {
            spellName = " --[Deprotect 1]-> ";
            magicMod = 0.2;
        } else if (gameState.baseStats.deprotectLvl === 2) {
            spellName = " --[Deprotect 2]-> ";
            magicMod = 0.3;
        } else {
            spellName = " --[Deprotect 3]-> ";
            magicMod = 0.4;
        }
        turns.turn1.currEnemyStats.def = Math.round(gameState.baseStats.enemyDef * (gameState.enemyScale.defScale / 100)) - Math.round(Math.round(gameState.baseStats.enemyDef * (gameState.enemyScale.defScale / 100)) * magicMod);
        turns.turn1.currEnemyStats.status.def = -1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.deprotectMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName + gameState.currEnemyStats.name;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "shell") {
        if (gameState.baseStats.shellLvl === 1) {
            spellName = " <-[Shell 1]->";
            magicMod = 0.2;
        } else if (gameState.baseStats.shellLvl === 2) {
            spellName = " <-[Shell 2]->";
            magicMod = 0.3;
        } else {
            spellName = " <-[Shell 3]->";
            magicMod = 0.4;
        }
        turns.turn1.currPlayerStats.res = gameState.baseStats.res + Math.round(gameState.baseStats.res * magicMod);
        turns.turn1.currPlayerStats.status.res = 1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.shellMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "deshell") {
        if (gameState.baseStats.deshellLvl === 1) {
            spellName = " --[Deshell 1]-> ";
            magicMod = 0.2;
        } else if (gameState.baseStats.deshellLvl === 2) {
            spellName = " --[Deshell 2]-> ";
            magicMod = 0.3;
        } else {
            spellName = " --[Deshell 3]-> ";
            magicMod = 0.4;
        }
        turns.turn1.currEnemyStats.res = Math.round(gameState.baseStats.enemyRes * (gameState.enemyScale.resScale / 100)) - Math.round(Math.round(gameState.baseStats.enemyRes * (gameState.enemyScale.resScale / 100)) * magicMod);
        turns.turn1.currEnemyStats.status.res = -1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.deshellMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName + gameState.currEnemyStats.name;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "bravery") {
        if (gameState.baseStats.braveryLvl === 1) {
            spellName = " <-[Bravery 1]->";
            magicMod = 0.2;
        } else if (gameState.baseStats.braveryLvl === 2) {
            spellName = " <-[Bravery 2]->";
            magicMod = 0.3;
        } else {
            spellName = " <-[Bravery 3]->";
            magicMod = 0.4;
        }
        turns.turn1.currPlayerStats.str = gameState.baseStats.str + Math.round(gameState.baseStats.str * magicMod);
        turns.turn1.currPlayerStats.status.str = 1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.braveryMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "debrave") {
        if (gameState.baseStats.debraveLvl === 1) {
            spellName = " --[Debrave 1]-> ";
            magicMod = 0.2;
        } else if (gameState.baseStats.debraveLvl === 2) {
            spellName = " --[Debrave 2]-> ";
            magicMod = 0.3;
        } else {
            spellName = " --[Debrave 3]-> ";
            magicMod = 0.4;
        }
        turns.turn1.currEnemyStats.str = Math.round(gameState.baseStats.enemyStr * (gameState.enemyScale.strScale / 100)) - Math.round(Math.round(gameState.baseStats.enemyStr * (gameState.enemyScale.strScale / 100)) * magicMod);
        turns.turn1.currEnemyStats.status.str = -1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.debraveMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName + gameState.currEnemyStats.name;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "faith") {
        if (gameState.baseStats.faithLvl === 1) {
            spellName = " <-[Faith 1]->";
            magicMod = 0.2;
        } else if (gameState.baseStats.faithLvl === 2) {
            spellName = " <-[Faith 2]->";
            magicMod = 0.3;
        } else {
            spellName = " <-[Faith 3]->";
            magicMod = 0.4;
        }
        turns.turn1.currPlayerStats.mag = gameState.baseStats.mag + Math.round(gameState.baseStats.mag * magicMod);
        turns.turn1.currPlayerStats.status.mag = 1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.faithMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "defaith") {
        if (gameState.baseStats.defaithLvl === 1) {
            spellName = " --[Defaith 1]-> ";
            magicMod = 0.2;
        } else if (gameState.baseStats.defaithLvl === 2) {
            spellName = " --[Defaith 2]-> ";
            magicMod = 0.3;
        } else {
            spellName = " --[Defaith 3]-> ";
            magicMod = 0.4;
        }
        turns.turn1.currEnemyStats.mag = Math.round(gameState.baseStats.enemyMag * (gameState.enemyScale.magScale / 100)) - Math.round(Math.round(gameState.baseStats.enemyMag * (gameState.enemyScale.magScale / 100)) * magicMod);
        turns.turn1.currEnemyStats.status.mag = -1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.defaithMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName + gameState.currEnemyStats.name;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "haste") {
        if (gameState.baseStats.hasteLvl === 1) {
            spellName = " <-[Haste 1]->";
            magicMod = 0.2;
        } else if (gameState.baseStats.hasteLvl === 2) {
            spellName = " <-[Haste 2]->";
            magicMod = 0.3;
        } else {
            spellName = " <-[Haste 3]->";
            magicMod = 0.4;
        }
        turns.turn1.currPlayerStats.agi = gameState.baseStats.agi + Math.round(gameState.baseStats.agi * magicMod);
        turns.turn1.currPlayerStats.status.agi = 1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.hasteMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "slow") {
        if (gameState.baseStats.slowLvl === 1) {
            spellName = " --[Slow 1]-> ";
            magicMod = 0.2;
        } else if (gameState.baseStats.slowLvl === 2) {
            spellName = " --[Slow 2]-> ";
            magicMod = 0.3;
        } else {
            spellName = " --[Slow 3]-> ";
            magicMod = 0.4;
        }
        turns.turn1.currEnemyStats.agi = Math.round(gameState.baseStats.enemyAgi * (gameState.enemyScale.agiScale / 100)) - Math.round(Math.round(gameState.baseStats.enemyAgi * (gameState.enemyScale.agiScale / 100)) * magicMod);
        turns.turn1.currEnemyStats.status.agi = -1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.slowMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName + gameState.currEnemyStats.name;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "regen") {
        if (gameState.baseStats.regenLvl === 1) {
            spellName = " <-[Regen 1]->";
        } else if (gameState.baseStats.regenLvl === 2) {
            spellName = " <-[Regen 2]->";
        } else {
            spellName = " <-[Regen 3]->";
        }
        turns.turn1.currPlayerStats.status.flux = 1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.regenMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName;
        turns.turn1.message = turn1Message;
    } else if (gameState.messageType === "poison") {
        if (gameState.baseStats.poisonLvl === 1) {
            spellName = " --[Poison 1]-> ";
        } else if (gameState.baseStats.poisonLvl === 2) {
            spellName = " --[Poison 2]-> ";
        } else {
            spellName = " --[Poison 3]-> ";
        }
        turns.turn1.currEnemyStats.status.flux = -1;
        turns.turn1.currPlayerStats.MP -= gameState.baseStats.poisonMP;
        if (turns.turn1.currPlayerStats.MP < 0) {
            turns.turn1.currPlayerStats.MP = 0
        }
        turn1Message = gameState.currPlayerStats.name + spellName + gameState.currEnemyStats.name;
        turns.turn1.message = turn1Message;
    }
    
    // After the player has taken action, they may recover health from regen, or take damage from poison.
    if (gameState.currPlayerStats.status.flux === 1) {
        if (gameState.baseStats.regenLvl === 1) {
            spellName = " <-[Regen 1]->: ";
            magicMod = 10;
        } else if (gameState.baseStats.regenLvl === 2) {
            spellName = " <-[Regen 2]->: ";
            magicMod = 5
        } else {
            spellName = " <-[Regen 3]->: ";
            magicMod = 3.3333;
        }
        let regenVal = Math.round(gameState.currPlayerStats.MaxHP / magicMod);
        turns.turn1.currPlayerStats.HP += regenVal;
        if (turns.turn1.currPlayerStats.HP > gameState.currPlayerStats.MaxHP) {
            turns.turn1.currPlayerStats.HP = gameState.currPlayerStats.MaxHP;
        }
        turns.turn1.statusMessage = gameState.currPlayerStats.name + spellName + regenVal;
    } else if (gameState.currPlayerStats.status.flux === -1) {
        if (turns.turn1.currEnemyStats.level < 10) {
            spellLvl = 1;
            magicMod = 10;
        } else if (turns.turn1.currEnemyStats.level >= 10 && turns.turn1.currEnemyStats.level < 25) {
            spellLvl = 2;
            magicMod = 5;
        } else {
            spellLvl = 3;
            magicMod = 3.3333;
        }

        let poisonDamage = Math.round(gameState.currPlayerStats.MaxHP / magicMod);
        turns.turn1.currPlayerStats.HP -= poisonDamage;
        if (turns.turn1.currPlayerStats.HP <= 0) {
            turns.turn1.currPlayerStats.HP = 1;
        }
        turns.turn1.statusMessage = gameState.currPlayerStats.name + " <-[Poison " + spellLvl + "]->: " + poisonDamage;
    }

    return turns;
}

function calculateEnemyTurn(gameState, turns, defend) {
    turns.turn2.currPlayerStats = turns.turn1.currPlayerStats;
    turns.turn2.currEnemyStats = turns.turn1.currEnemyStats;

    let action = calculateAI(turns);
    let turn2Message = "";
    let spellName = "";
    let magicMod = 1;
    let spellLvl = 1;
    let smallMP = 0;
    let mediumMP = 0;
    let largeMP = 0;
    
    if (turns.turn2.currEnemyStats.level < 10) {
        spellLvl = 1;
        smallMP = 5;
        mediumMP = 10;
        largeMP = 15;
    } else if (turns.turn2.currEnemyStats.level >= 10 && turns.turn2.currEnemyStats.level < 25) {
        spellLvl = 2;
        smallMP = 25;
        mediumMP = 50;
        largeMP = 75;
    } else {
        spellLvl = 3;
        smallMP = 125;
        mediumMP = 250;
        largeMP = 375;
    }

    if (action === "attack") {
        miss = calculateMiss(turns.turn2.currEnemyStats.agi, turns.turn2.currPlayerStats.agi);
        turn2Message = gameState.currPlayerStats.name + " <-[Attack]-- " + gameState.currEnemyStats.name + ": "
        if (!miss) {
            let tempDef = turns.turn2.currPlayerStats.def;
            if (defend === true) {
                tempDef *= 2;
            }
            let enemyDamage = calculateDamage(turns.turn2.currEnemyStats.str, tempDef, 1);
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
    } else if (action === "fire") {
        if (spellLvl === 1) {
            magicMod = 1.1;
        } else if (spellLvl === 2) {
            magicMod = 1.2;
        } else {
            magicMod = 1.3;
        }

        let tempRes = turns.turn2.currPlayerStats.res;
        if (defend === true) {
            tempRes *= 2;
        }
        let enemyDamage = calculateDamage(turns.turn2.currEnemyStats.mag, tempRes, magicMod);
        turn2Message = gameState.currPlayerStats.name + " <-[Fire " + spellLvl + "]-- " + gameState.currEnemyStats.name + ": " + enemyDamage;
        turns.turn2.currPlayerStats.HP -= enemyDamage;
        turns.turn2.currEnemyStats.MP -= smallMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0;
        }
        turns.turn2.message = turn2Message;
        if (turns.turn2.currPlayerStats.HP <= 0) {
            turns.turn2.currPlayerStats.HP = 0;
            turns.death = -1;
        }
    } else if (action === "cure") {
        if (spellLvl === 1) {
            magicMod = 1;
        } else if (spellLvl === 2) {
            magicMod = 1.5;
        } else {
            magicMod = 2;
        }

        let cureVal = calculateCure(turns.turn2.currEnemyStats.mag * magicMod);
        turns.turn2.currEnemyStats.HP += cureVal;
        if (turns.turn2.currEnemyStats.HP > gameState.currEnemyStats.MaxHP) {
            turns.turn2.currEnemyStats.HP = gameState.currEnemyStats.MaxHP;
        }
        turns.turn2.currEnemyStats.MP -= smallMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currEnemyStats.name + " <-[Cure " + spellLvl + "]->: " + cureVal;
        turns.turn2.message = turn2Message;
    } else if (action === "protect") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        let scaledDef = Math.round(gameState.baseStats.enemyDef * (gameState.enemyScale.defScale / 100));
        turns.turn2.currEnemyStats.def = scaledDef + Math.round(scaledDef * magicMod);
        turns.turn2.currEnemyStats.status.def = 1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currEnemyStats.name + " <-[Protect " + spellLvl + "]->";
        turns.turn2.message = turn2Message;
    } else if (action === "deprotect") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        turns.turn2.currPlayerStats.def = gameState.baseStats.def - Math.round(gameState.baseStats.def * magicMod);
        turns.turn2.currPlayerStats.status.def = -1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currPlayerStats.name + " <-[Deprotect " + spellLvl + "]-- " + gameState.currEnemyStats.name;
        turns.turn2.message = turn2Message;
    } else if (action === "shell") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        let scaledRes = Math.round(gameState.baseStats.enemyRes * (gameState.enemyScale.resScale / 100));
        turns.turn2.currEnemyStats.res = scaledRes + Math.round(scaledRes * magicMod);
        turns.turn2.currEnemyStats.status.res = 1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currEnemyStats.name + " <-[Shell " + spellLvl + "]->";
        turns.turn2.message = turn2Message;
    } else if (action === "deshell") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        turns.turn2.currPlayerStats.res = gameState.baseStats.res - Math.round(gameState.baseStats.res * magicMod);
        turns.turn2.currPlayerStats.status.res = -1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currPlayerStats.name + " <-[Deshell " + spellLvl + "]-- " + gameState.currEnemyStats.name;
        turns.turn2.message = turn2Message;
    } else if (action === "bravery") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        let scaledStr = Math.round(gameState.baseStats.enemyStr * (gameState.enemyScale.strScale / 100));
        turns.turn2.currEnemyStats.str = scaledStr + Math.round(scaledStr * magicMod);
        turns.turn2.currEnemyStats.status.str = 1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currEnemyStats.name + " <-[Bravery " + spellLvl + "]->";
        turns.turn2.message = turn2Message;
    } else if (action === "debrave") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        turns.turn2.currPlayerStats.str = gameState.baseStats.str - Math.round(gameState.baseStats.str * magicMod);
        turns.turn2.currPlayerStats.status.str = -1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currPlayerStats.name + " <-[Debrave " + spellLvl + "]-- " + gameState.currEnemyStats.name;
        turns.turn2.message = turn2Message;
    } else if (action === "faith") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        let scaledMag = Math.round(gameState.baseStats.enemyMag * (gameState.enemyScale.magScale / 100));
        turns.turn2.currEnemyStats.mag = scaledMag + Math.round(scaledMag * magicMod);
        turns.turn2.currEnemyStats.status.mag = 1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currEnemyStats.name + " <-[Faith " + spellLvl + "]->";
        turns.turn2.message = turn2Message;
    } else if (action === "defaith") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        turns.turn2.currPlayerStats.mag = gameState.baseStats.mag - Math.round(gameState.baseStats.mag * magicMod);
        turns.turn2.currPlayerStats.status.mag = -1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currPlayerStats.name + " <-[Defaith " + spellLvl + "]-- " + gameState.currEnemyStats.name;
        turns.turn2.message = turn2Message;
    } else if (action === "haste") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        let scaledAgi = Math.round(gameState.baseStats.enemyAgi * (gameState.enemyScale.agiScale / 100));
        turns.turn2.currEnemyStats.agi = scaledAgi + Math.round(scaledAgi * magicMod);
        turns.turn2.currEnemyStats.status.agi = 1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currEnemyStats.name + " <-[Haste " + spellLvl + "]->";
        turns.turn2.message = turn2Message;
    } else if (action === "slow") {
        if (spellLvl === 1) {
            magicMod = 0.2;
        } else if (spellLvl === 2) {
            magicMod = 0.3;
        } else {
            magicMod = 0.4;
        }

        turns.turn2.currPlayerStats.agi = gameState.baseStats.agi - Math.round(gameState.baseStats.agi * magicMod);
        turns.turn2.currPlayerStats.status.agi = -1;
        turns.turn2.currEnemyStats.MP -= mediumMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currPlayerStats.name + " <-[Slow " + spellLvl + "]-- " + gameState.currEnemyStats.name;
        turns.turn2.message = turn2Message;
    } else if (action === "regen") {
        turns.turn2.currEnemyStats.status.flux = 1;
        turns.turn2.currEnemyStats.MP -= largeMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currEnemyStats.name + " <-[Regen " + spellLvl + "]->";
        turns.turn2.message = turn2Message;
    } else if (action === "poison") {
        turns.turn2.currPlayerStats.status.flux = -1;
        turns.turn2.currEnemyStats.MP -= largeMP;
        if (turns.turn2.currEnemyStats.MP < 0) {
            turns.turn2.currEnemyStats.MP = 0
        }
        turn2Message = gameState.currPlayerStats.name + " <-[Poison " + spellLvl + "]-- " + gameState.currEnemyStats.name;
        turns.turn2.message = turn2Message;
    }

    if (turns.turn2.currEnemyStats.status.flux === 1) {
        if (spellLvl === 1) {
            magicMod = 10;
        } else if (spellLvl === 2) {
            magicMod = 5;
        } else {
            magicMod = 3.3333;
        }

        let regenVal = Math.round(gameState.currEnemyStats.MaxHP / magicMod);
        turns.turn2.currEnemyStats.HP += regenVal;
        if (turns.turn2.currEnemyStats.HP > gameState.currEnemyStats.MaxHP) {
            turns.turn2.currEnemyStats.HP = gameState.currEnemyStats.MaxHP;
        }
        turns.turn2.statusMessage = gameState.currEnemyStats.name + " <-[Regen " + spellLvl + "]->: " + regenVal;
    } else if (turns.turn2.currEnemyStats.status.flux === -1) {
        if (gameState.baseStats.poisonLvl === 1) {
            magicMod = 10;
        } else if (gameState.baseStats.poisonLvl === 2) {
            magicMod = 5
        } else {
            magicMod = 3.3333;
        }
        let poisonDamage = Math.round(gameState.currEnemyStats.MaxHP / magicMod);
        turns.turn2.currEnemyStats.HP -= poisonDamage;
        if (turns.turn2.currEnemyStats.HP <= 0) {
            turns.turn2.currEnemyStats.HP = 1;
        }
        turns.turn2.statusMessage = gameState.currEnemyStats.name + " <-[Poison " + gameState.baseStats.poisonLvl + "]->: " + poisonDamage;
    }
    return turns;
}

function calculateAI(turns) {
    let currAiVals = turns.turn2.currEnemyStats.aiVals;
    // Check enemy level --> create 3 variables for different spell costs --> replace hardcoded mp vals with vars
    // Level 1-9: rank 1, level 10-24: rank 2, level 25+: rank 3
    let smallMP = 0;
    let mediumMP = 0;
    let largeMP = 0;

    if (turns.turn2.currEnemyStats.level < 10) {
        smallMP = 5;
        mediumMP = 10;
        largeMP = 15;
    } else if (turns.turn2.currEnemyStats.level >= 10 && turns.turn2.currEnemyStats.level < 25) {
        smallMP = 25;
        mediumMP = 50;
        largeMP = 75;
    } else {
        smallMP = 125;
        mediumMP = 250;
        largeMP = 375;
    }

    if (turns.turn2.currEnemyStats.MP >= smallMP) {
        if (turns.turn2.currEnemyStats.HP < (turns.turn2.currEnemyStats.MaxHP * 0.3)) {
            currAiVals.cure = 7;
        } else if (turns.turn2.currEnemyStats.HP < (turns.turn2.currEnemyStats.MaxHP * 0.5)) {
            currAiVals.cure = 5;
        } else if (turns.turn2.currEnemyStats.HP < (turns.turn2.currEnemyStats.MaxHP * 0.7)) {
            currAiVals.cure = 3;
        }
    } else {
        currAiVals.cure = 0;
        currAiVals.fire = 0;
    }

    if (turns.turn2.currEnemyStats.status.def === 1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.protect = 0;
    }

    if (turns.turn2.currPlayerStats.status.def === -1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.deprotect = 0;
    }

    if (turns.turn2.currEnemyStats.status.res === 1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.shell = 0;
    }

    if (turns.turn2.currPlayerStats.status.res === -1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.deshell = 0;
    }

    if (turns.turn2.currEnemyStats.status.str === 1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.bravery = 0;
    }

    if (turns.turn2.currPlayerStats.status.str === -1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.debrave = 0;
    }

    if (turns.turn2.currEnemyStats.status.mag === 1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.faith = 0;
    }

    if (turns.turn2.currPlayerStats.status.mag === -1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.defaith = 0;
    }

    if (turns.turn2.currEnemyStats.status.agi === 1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.haste = 0;
    }

    if (turns.turn2.currPlayerStats.status.agi === -1 || turns.turn2.currEnemyStats.MP < mediumMP) {
        currAiVals.slow = 0;
    }

    if (turns.turn2.currEnemyStats.status.flux === 1 || turns.turn2.currEnemyStats.MP < largeMP) {
        currAiVals.regen = 0;
    }

    if (turns.turn2.currPlayerStats.status.flux === -1 || turns.turn2.currEnemyStats.MP < largeMP) {
        currAiVals.poison = 0;
    }

    for (let i in currAiVals) {
        if (currAiVals[i] !== 0) {
            currAiVals[i] = rand(currAiVals[i], 11);
        }
    }

    let action = "";
    let maxVal = 0;

    for (let i in currAiVals) {
        if (currAiVals[i] > maxVal) {
            maxVal = currAiVals[i];
            action = i;
        }
    }

    return action;
}

function calculateDamage(attackerStat, targetStat, modifier) {
    attackerStat = Math.round(attackerStat * modifier);
    let baseDamage = ((attackerStat * 10) - (targetStat * 5));
    let damage = baseDamage + rand(0, Math.round(baseDamage / 3));
    if (damage <= 0) {
        damage = 1;
    }
    return damage;
}

function calculateCure(mag) {
    return (mag * 10) + rand(1, mag);
}

function calculateMiss(attackerAgi, targetAgi) {
    if (attackerAgi > targetAgi * 10) {
        return false;
    } else if (attackerAgi * 15 < targetAgi) {
        return true;
    }
    let agiInverse = attackerAgi - targetAgi;
    if (agiInverse < (attackerAgi * -1)) {
        agiInverse = attackerAgi * -1;
    }
    let missChance = agiInverse + rand(0, Math.round(attackerAgi * 2));
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

function calculateFlee(playerFlee, enemyFlee) {
    if (playerFlee > enemyFlee) {
        return true;
    } else {
        let fleeChance = Math.round((playerFlee / enemyFlee) * 100);
        if (fleeChance < 1) {
            fleeChance = 1;
        }
        if (rand(fleeChance, 101) >= 80) {
            return true;
        } else {
            return false;
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
    let baseHP = playerData.baseHP + Math.round(playerData.baseHP * (rand(24 + playerData.bonusHP, 26 + playerData.bonusHP) / 100));
    let baseMP = playerData.baseMP + Math.round(playerData.baseMP * (rand(14 + playerData.bonusMP, 16 + playerData.bonusMP) / 100));
    let baseStr = playerData.baseStr + Math.round(playerData.baseStr * (rand(19 + playerData.bonusStr, 21 + playerData.bonusStr) / 100));
    let baseMag = playerData.baseMag + Math.round(playerData.baseMag * (rand(19 + playerData.bonusMag, 21 + playerData.bonusMag) / 100));
    let baseDef = playerData.baseDef + Math.round(playerData.baseDef * (rand(19 + playerData.bonusDef, 21 + playerData.bonusDef) / 100));
    let baseRes = playerData.baseRes + Math.round(playerData.baseRes * (rand(19 + playerData.bonusRes, 21 + playerData.bonusRes) / 100));
    let baseAgi = playerData.baseAgi + Math.round(playerData.baseAgi * (rand(19 + playerData.bonusAgi, 21 + playerData.bonusAgi) / 100));
    let baseLuck = playerData.baseLuck + Math.round(playerData.baseLuck * (rand(19 + playerData.bonusLuck, 21 + playerData.bonusLuck) / 100));

    let newStats = {
        level: playerData.level + 1,
        HP: Math.round(baseHP * playerData.modHP),
        MP: Math.round(baseMP * playerData.modMP),
        str: Math.round(baseStr * playerData.modStr),
        mag: Math.round(baseMag * playerData.modMag),
        def: Math.round(baseDef * playerData.modDef),
        res: Math.round(baseRes * playerData.modRes),
        agi: Math.round(baseAgi * playerData.modAgi),
        luck: Math.round(baseLuck * playerData.modLuck),
        baseHP: baseHP,
        baseMP: baseMP,
        baseStr: baseStr,
        baseMag: baseMag,
        baseDef: baseDef,
        baseRes: baseRes,
        baseAgi: baseAgi,
        baseLuck: baseLuck,
        skillPoints: playerData.skillPoints + 1
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
        newStats.HP = playerData.enemyHP + Math.round(playerData.enemyHP * (rand(29, 31) / 100));
        newStats.MP = playerData.enemyMP + Math.round(playerData.enemyMP * (rand(19, 21) / 100));
        newStats.str = playerData.enemyStr + Math.round(playerData.enemyStr * (rand(24, 26) / 100));
        newStats.mag = playerData.enemyMag + Math.round(playerData.enemyMag * (rand(24, 26) / 100));
        newStats.def = playerData.enemyDef + Math.round(playerData.enemyDef * (rand(24, 26) / 100));
        newStats.res = playerData.enemyRes + Math.round(playerData.enemyRes * (rand(24, 26) / 100));
        newStats.agi = playerData.enemyAgi + Math.round(playerData.enemyAgi * (rand(24, 26) / 100));
        newStats.luck = playerData.enemyLuck + Math.round(playerData.enemyLuck * (rand(24, 26) / 100));
    } else if (change === -1 && playerData.enemyLevel > 1) {
        // Enemy level down
        newStats.level = playerData.enemyLevel - 1;
        newStats.HP = playerData.enemyHP - Math.round(playerData.enemyHP * (rand(27, 29) / 100));
        newStats.MP = playerData.enemyMP - Math.round(playerData.enemyMP * (rand(17, 19) / 100));
        newStats.str = playerData.enemyStr - Math.round(playerData.enemyStr * (rand(22, 24) / 100));
        newStats.mag = playerData.enemyMag - Math.round(playerData.enemyMag * (rand(22, 24) / 100));
        newStats.def = playerData.enemyDef - Math.round(playerData.enemyDef * (rand(22, 24) / 100));
        newStats.res = playerData.enemyRes - Math.round(playerData.enemyRes * (rand(22, 24) / 100));
        newStats.agi = playerData.enemyAgi - Math.round(playerData.enemyAgi * (rand(22, 24) / 100));
        newStats.luck = playerData.enemyLuck - Math.round(playerData.enemyLuck * (rand(22, 24) / 100));
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
        playerData.baseHP = newPlayerStats.baseHP;
        playerData.baseMP = newPlayerStats.baseMP;
        playerData.baseStr = newPlayerStats.baseStr;
        playerData.baseMag = newPlayerStats.baseMag;
        playerData.baseDef = newPlayerStats.baseDef;
        playerData.baseRes = newPlayerStats.baseRes;
        playerData.baseAgi = newPlayerStats.baseAgi;
        playerData.baseLuck = newPlayerStats.baseLuck;
        playerData.skillPoints = newPlayerStats.skillPoints;
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

async function updateSkillData(playerData, skillData) {
    if (skillData.newSkills.length > 0) {
        playerData.skills = skillData.skills;
        playerData = applySkills(playerData, skillData);
        playerData.newSkills = [];
    }

    playerData.skillPoints = skillData.skillPoints;
    return playerData;
}

function applySkills(playerData, skillData) {
    for (i = 0; i < skillData.newSkills.length; i++) {
        switch(skillData.newSkills[i]) {
            case 1:
                playerData.modHP += 0.03;
                break;
            case 2:
                playerData.modMP += 0.03;
                break;
            case 3:
                playerData.modDef += 0.02;
                break;
            case 4:
                playerData.modRes += 0.02;
                break;
            case 5:
                playerData.modStr += 0.02;
                break;
            case 6:
                playerData.modMag += 0.02;
                break;
            case 7:
                playerData.modAgi += 0.02;
                break;
            case 8:
                playerData.modLuck += 0.02;
                break;
            case 9:
                playerData.fireLvl = 2;
                playerData.fireMP = 25;
                break;
            case 10:
                playerData.cureLvl = 2;
                playerData.cureMP = 25;
                break;
            case 11:
                playerData.protectLvl = 2;
                playerData.protectMP = 50;
                break;
            case 12:
                playerData.deprotectLvl = 2;
                playerData.deprotectMP = 50;
                break;
            case 13:
                playerData.shellLvl = 2;
                playerData.shellMP = 50;
                break;
            case 14:
                playerData.deshellLvl = 2;
                playerData.deshellMP = 50;
                break;
            case 15:
                playerData.braveryLvl = 2;
                playerData.braveryMP = 50;
                break;
            case 16:
                playerData.debraveLvl = 2;
                playerData.debraveMP = 50;
                break;
            case 17:
                playerData.faithLvl = 2;
                playerData.faithMP = 50;
                break;
            case 18:
                playerData.defaithLvl = 2;
                playerData.defaithMP = 50;
                break;
            case 19:
                playerData.hasteLvl = 2;
                playerData.hasteMP = 50;
                break;
            case 20:
                playerData.slowLvl = 2;
                playerData.slowMP = 50;
                break;
            case 21:
                playerData.regenLvl = 2;
                playerData.regenMP = 75;
                break;
            case 22:
                playerData.poisonLvl = 2;
                playerData.poisonMP = 75;
                break;
            case 23:
                playerData.modHP += 0.07;
                break;
            case 24:
                playerData.modMP += 0.07;
                break;
            case 25:
                playerData.modStr += 0.04;
                break;
            case 26:
                playerData.modDef += 0.04;
                break;
            case 27:
                playerData.modMag += 0.04;
                break;
            case 28:
                playerData.modRes += 0.04;
                break;
            case 29:
                playerData.modStr += 0.04;
                break;
            case 30:
                playerData.modDef += 0.04;
                break;
            case 31:
                playerData.modMag += 0.04;
                break;
            case 32:
                playerData.modRes += 0.04;
                break;
            case 33:
                playerData.modAgi += 0.04;
                break;
            case 34:
                playerData.modAgi += 0.04;
                break;
            case 35:
                playerData.modLuck += 0.04;
                break;
            case 36:
                playerData.modLuck += 0.04;
                break;
            case 37:
                playerData.fireLvl = 3;
                playerData.fireMP = 125;
                break;
            case 38:
                playerData.cureLvl = 3;
                playerData.cureMP = 125;
                break;
            case 39:
                playerData.protectLvl = 3;
                playerData.protectMP = 250;
                break;
            case 40:
                playerData.deprotectLvl = 3;
                playerData.deprotectMP = 250;
                break;
            case 41:
                playerData.shellLvl = 3;
                playerData.shellMP = 250;
                break;
            case 42:
                playerData.deshellLvl = 3;
                playerData.deshellMP = 250;
                break;
            case 43:
                playerData.braveryLvl = 3;
                playerData.braveryMP = 250;
                break;
            case 44:
                playerData.debraveLvl = 3;
                playerData.debraveMP = 250;
                break;
            case 45:
                playerData.faithLvl = 3;
                playerData.faithMP = 250;
                break;
            case 46:
                playerData.defaithLvl = 3;
                playerData.defaithMP = 250;
                break;
            case 47:
                playerData.hasteLvl = 3;
                playerData.hasteMP = 250;
                break;
            case 48:
                playerData.slowLvl = 3;
                playerData.slowMP = 250;
                break;
            case 49:
                playerData.regenLvl = 3;
                playerData.regenMP = 375;
                break;
            case 50:
                playerData.poisonLvl = 3;
                playerData.poisonMP = 375;
                break;
            default:
                console.log("Something went wrong");
        }
    }

    playerData.HP = Math.round(playerData.baseHP * playerData.modHP)
    playerData.MP = Math.round(playerData.baseMP * playerData.modMP)
    playerData.str = Math.round(playerData.baseStr * playerData.modStr)
    playerData.mag = Math.round(playerData.baseMag * playerData.modMag)
    playerData.def = Math.round(playerData.baseDef * playerData.modDef)
    playerData.res = Math.round(playerData.baseRes * playerData.modRes)
    playerData.agi = Math.round(playerData.baseAgi * playerData.modAgi)
    playerData.luck = Math.round(playerData.baseLuck * playerData.modLuck)

    return playerData;
}

module.exports = {
    rand: rand,
    createTurns: createTurns,
    calculatePlayerTurn: calculatePlayerTurn,
    calculateEnemyTurn: calculateEnemyTurn,
    calculateAI: calculateAI,
    calculateDamage: calculateDamage,
    calculateCure: calculateCure,
    calculateMiss: calculateMiss,
    calculateCrit: calculateCrit,
    calculateFlee: calculateFlee,
    expCalc: expCalc,
    nextEnemy: nextEnemy,
    statRegulator: statRegulator,
    applyPlayerLevelUp: applyPlayerLevelUp,
    applyEnemyLevelChange: applyEnemyLevelChange,
    updatePlayerData: updatePlayerData,
    updateSkillData: updateSkillData,
    applySkills: applySkills
}