# BrowserRPG
A simple turn-based browser game created using Javascript, HTML, CSS, AngularJS, and MongoDB.

Node, npm, and MongoDB are required to run this application.

Before running the application, run the `mongod` command in a command line (assuming MongoDB is included in your PATH environment variable).

To start, run the following commands:

`npm install`

`npm start`

Navigate to `http://localhost:3000` to begin the game.

# Character Creation and Stats
Upon lanching the game, you will be greeted with a character creation screen. Here you can give your character a name, as well as add bonus points to each of your stats. Here is a breakdown of what each stat does:

**HP**: Your health. When you receive damage, this number will decrease. If your HP reaches 0, you are defeated. Similarly, if the enemy's HP reaches 0, they are defeated and you advance to the next enemy.

**MP**: Your Magic Points. These points are consumed when you cast spells, and can only be restored by winning, losing, or fleeing the current battle.

**Str**: Your physical strength. This value affects how much damage you deal with the 'Attack' command.

**Mag**: Your magical strength. This value affects how much damage you deal with the 'Fire' command.

**Def**: Your physical resistance. This value affects how much damage you take from physical attacks.

**Res**: Your magical resistance. This value affects how much damage you take from magical attacks.

**Agi**: Your agility. This value affects your likelihood of hitting the enemy with physical attacks, as well as dodging enemy physical attacks. It also partially affects your ability to flee from enemies.

**Luck**: This stat determines the likelihood of landing a critical hit* on an enemy with a physical attack. It also partially affects your ability to flee from enemies.

\*Note: A critical hit is an unusually strong attack that deals 1.5 times the damage of a standard attack.

You have the option of adding up to 10 bonus points to your stats. Adding bonus points to a stat will slightly improve its growth as you level up, as well as give you some extra stat points at the start of the game.

When you have finished customizing your character, click the 'Start' button.

# Battle

After creating your character, you will be met with the battle screen. In the center of the screen are two panels displaying your stats and the current enemy's stats. Below is a set of general commands:

**Attack**: A physical attack.

**Defend**: Reduce the damage taken from incoming attacks for 1 turn.

**Flee**: Run from the current enemy and generate a new one. This command can fail if your Agi and Luck are too low relative to the enemy's stats.

**Next**: A command used to proceed to the next battle. You will be prompted to use this command whenever it is available.

To the left is a larger panel with a list of spells, along with their MP costs:

**Fire**: A magical attack.

**Cure**: Restores some HP based on your Mag stat.

**Protect**: Increases your Def stat.

**Deprotect**: Lowers the enemy's Def stat.

**Shell**: Increases your Res stat.

**Deshell**: Lowers the enemy's Res stat.

**Bravery**: Increases your Str stat.

**Debrave**: Lowers the enemy's Str stat.

**Faith**: Increases your Mag stat.

**Defaith**: Lowers the enemy's Mag stat.

**Haste**: Increases your Agi stat.

**Slow**: Lowers the enemy's Agi stat.

**Regen**: Restores a percentage of your HP each turn.

**Poison**: Damages an enemy for a percentage of their HP each turn.

Status spells (such as Protect and Deprotect) will persist until the battle ends or until they are removed by the enemy. 

Each pair of status spells will overwrite each other if applied to the same character. For example, if you cast Slow on the enemy, and they then cast Haste on themselves, Haste will overwrite Slow and their Agi will be increased by the end of their turn. 

Stat increases are represented by a yellow number, and stat decreases are represented by a red number.

On the right side of the screen is a log that presents information about what is happening in battle. For example, if you cast Fire on the enemy, the message displayed will look similar to this:

`Player --[Fire]-> Enemy: 352`

The number shown after the colon is the amount of damage the attack dealt to the enemy. If the number has stars on either side (Ex: \*352\*), this means that the attack was a critical hit. If the enemy then decided to cast Cure on itself to recover from the attack, it would look similar to this:

`Enemy <-[Cure]->: 286`

In this case, the number is the amount of HP healed.

# Leveling Up

When you defeat an enemy, you gain experience points (which are not visible). After gaining enough points, you will level up, and your stats will increase by a slightly random percentage. This percentage is influenced in part by the bonus stats you chose when creating your character. 

Defeating an enemy will also cause the next enemy to be 1 level stronger than the previous one. Conversely, if you are defeated by an enemy, the next enemy you face will be one level lower. You also gain more experience from defeating enemies that are a higher level than you, and vice versa.

# Enemies

There are many different enemies you can face, each one chosen at random. Different types of enemies will have variations in their stats, as well as the actions they perform. For example, an Orc will have high Str and HP, but low Agi. It will also be biased towards using the Attack and Bravery commands, rather than Fire or Deshell.

There are 5 normal enemies you can encounter, as well as an extremely rare, yet powerful secret enemy. You have been warned.

Have fun!
