//User settings
document.getElementById("boardBumpSetting").checked = game.boardBumpVisuals;
document.getElementById("menuBackgroundSetting").checked = game.menuBackgroundEnabled;
document.getElementById("gameBackgroundSetting").checked = game.gameBackgroundEnabled;
document.getElementById("volumeSetting").value = (game.volume*100);
document.getElementById("musicVolumeSetting").value = (game.musicVolume*100);

function setBoardBump() {
    game.boardBumpVisuals = document.getElementById("boardBumpSetting").checked;
    save();
}

function enableDisableMenuBackground() {
    game.menuBackgroundEnabled = document.getElementById("menuBackgroundSetting").checked;
    backgroundCanvas.style.display = game.menuBackgroundEnabled ? "block" : "none";
    save();
}

function enableDisableGameBackground() {
    game.gameBackgroundEnabled = document.getElementById("gameBackgroundSetting").checked;
    save();
}

function setVolume() {
    game.volume = parseFloat(document.getElementById("volumeSetting").value) / 100;
    Howler.volume(game.volume);
    save();
}

function setMusicVolume() {
    game.musicVolume = parseFloat(document.getElementById("musicVolumeSetting").value) / 100;
    setSoundVolume("menuMusic", game.musicVolume);
    save();
}

let gameSettingElements = {}

function updateSettingVisuals() {
    gameSettingElements.startingLevel.value = settings.startingLevel;
    // gameSettingElements.boardWidth.value = settings.boardWidth;
    // gameSettingElements.boardHeight.value = settings.boardHeight;
    gameSettingElements.pieceColouring.value = settings.pieceColouring;
    gameSettingElements.invisible.value = settings.invisible;
    gameSettingElements.softDrop.value = settings.softDrop;
    gameSettingElements.softDropSpeed.value = settings.softDropSpeed;
    gameSettingElements.hardDrop.value = settings.hardDrop;
    gameSettingElements.sonicDrop.value = settings.sonicDrop;
    gameSettingElements.sonicDrop.disabled = !settings.hardDrop;
    gameSettingElements.includePentominoes.value = settings.includePentominoes;
    gameSettingElements.includeDiscordant.value = settings.includeDiscordant;
    gameSettingElements.includeMega.value = settings.includeMega;
    gameSettingElements.rotationSystem.value = settings.rotationSystem;
    gameSettingElements.IRS.value = settings.IRS;
    gameSettingElements.twentyGOverride.value = settings.twentyGOverride;
    gameSettingElements.overrideGameARE.value = !settings.overrideGameARE;
    gameSettingElements.ARE.value = settings.ARE;
    gameSettingElements.ARE.disabled = !settings.overrideGameARE;
    gameSettingElements.ARELineClear.value = settings.ARELineClear;
    gameSettingElements.ARELineClear.disabled = !settings.overrideGameARE;
    gameSettingElements.DASInitial.value = settings.DASInitial;
    gameSettingElements.DAS.value = settings.DAS;
    gameSettingElements.lockDelay.value = settings.lockDelay;
    gameSettingElements.lockReset.value = settings.lockReset;
    gameSettingElements.visuals.value = settings.visuals;
    gameSettingElements.gameMechanics.value = settings.gameMechanics;
    gameSettingElements.DASInitial.disabled = (settings.gameMechanics == "dragonStyle");
    gameSettingElements.DAS.disabled = (settings.gameMechanics == "dragonStyle");
    gameSettingElements.lockDelay.disabled = (settings.gameMechanics == "dragonStyle");
    gameSettingElements.randomizer.value = settings.randomizer;
    gameSettingElements.levelLock.value = settings.levelLock;
}

function clamp(min, val, max) {
    if(val < min) {
        return min;
    }
    if(val > max) {
        return max;
    }
    return val;
}

function setPreset(preset) {
    switch (preset) {
        case "classicStyle":
            settings.boardWidth = 10;
            settings.boardHeight = 20;
            settings.visuals = "classicStyle";
            settings.gameMechanics = "classicStyle";
            settings.includePentominoes = "none";
            settings.includeDiscordant = "none";
            settings.includeMega = "none";
            settings.randomizer = "tgm";
            settings.pieceColouring = "regular";
            settings.softDrop = true;
            settings.softDropSpeed = 2;
            settings.hardDrop = true;
            settings.sonicDrop = false;
            settings.rotationSystem = "nintendo-r";
            settings.IRS = true;
            settings.twentyGOverride = false;
            settings.levelLock = false;
            settings.overrideGameARE = false;
            settings.DASInitial = 16;
            settings.DAS = 6;
            settings.lockDelay = 0;
            break;
        case "masterStyle":
            settings.boardWidth = 10;
            settings.boardHeight = 20;
            settings.visuals = "masterStyle";
            settings.gameMechanics = "masterStyle";
            settings.includePentominoes = "none";
            settings.includeDiscordant = "none";
            settings.includeMega = "none";
            settings.randomizer = "tgm";
            settings.pieceColouring = "regular";
            settings.softDrop = true;
            settings.softDropSpeed = 1;
            settings.hardDrop = false;
            settings.sonicDrop = false;
            settings.rotationSystem = "dergoris";
            settings.IRS = true;
            settings.twentyGOverride = false;
            settings.levelLock = false;
            settings.overrideGameARE = false;
            settings.DASInitial = 16;
            settings.DAS = 1;
            settings.lockDelay = 30;
            break;
        case "dragonStyle":
            settings.boardWidth = 10;
            settings.boardHeight = 20;
            settings.visuals = "dragonStyle";
            settings.gameMechanics = "dragonStyle";
            settings.includePentominoes = "none";
            settings.includeDiscordant = "none";
            settings.includeMega = "none";
            settings.randomizer = "tgm";
            settings.pieceColouring = "regular";
            settings.softDrop = true;
            settings.softDropSpeed = 1;
            settings.hardDrop = true;
            settings.sonicDrop = false;
            settings.rotationSystem = "dergoris";
            settings.IRS = true;
            settings.twentyGOverride = true;
            settings.levelLock = false;
            settings.overrideGameARE = false;
            settings.DASInitial = 16;
            settings.DAS = 1;
            settings.lockDelay = 30;
            break;
        case "onTheBeat":
            settings.boardWidth = 10;
            settings.boardHeight = 20;
            settings.visuals = "onTheBeat";
            settings.gameMechanics = "onTheBeat";
            settings.includePentominoes = "none";
            settings.includeDiscordant = "none";
            settings.includeMega = "none";
            settings.randomizer = "tgm";
            settings.pieceColouring = "regular";
            settings.softDrop = false;
            settings.softDropSpeed = 1;
            settings.hardDrop = false;
            settings.sonicDrop = false;
            settings.rotationSystem = "dergoris";
            settings.IRS = true;
            settings.twentyGOverride = true;
            settings.levelLock = false;
            settings.overrideGameARE = false;
            settings.DASInitial = 8;
            settings.DAS = 1;
            settings.lockDelay = 99999;
            break;
    }
    updateSettingVisuals();
}

function setStartingLevel(value) {
    const capTable = {
        classicStyle: 998,
        masterStyle: 998,
        dragonStyle: 998,
        onTheBeat: 998
    };
    const max = capTable[settings.gameMechanics] || 998;
    startingLevel = clamp(0, value, max);
    settings.startingLevel = startingLevel;
}

function setBoardWidth(value) {
    let boardWidth = parseInt(value ?? gameSettingElements.boardWidth.value);
    boardWidth = clamp(4, boardWidth, 20);
    const input = gameSettingElements.boardWidth.element.querySelector('input');
    if (input) input.value = boardWidth;
    settings.boardWidth = boardWidth;
}

function setBoardHeight(value) {
    let boardHeight = parseInt(value ?? gameSettingElements.boardHeight.value);
    boardHeight = clamp(4, boardHeight, 25);
    const input = gameSettingElements.boardHeight.element.querySelector('input');
    if (input) input.value = boardHeight;
    settings.boardHeight = boardHeight;
}
function setPieceColouring(value) {
    settings.pieceColouring = value ?? gameSettingElements.pieceColouring.value;
}

function setInvisible(value) {
    settings.invisible = value ?? gameSettingElements.invisible.value;
}

function setSoftDrop(value) {
    settings.softDrop = value ?? gameSettingElements.softDrop.value;
}

function setSoftDropSpeed(value) {
    let softDropSpeed = parseInt(value ?? gameSettingElements.softDropSpeed.value);
    softDropSpeed = clamp(1, softDropSpeed, 20);
    gameSettingElements.softDropSpeed.value = softDropSpeed;
    settings.softDropSpeed = softDropSpeed;

}

function setHardDrop(value) {
    settings.hardDrop = value ?? gameSettingElements.hardDrop.value;
    if (gameSettingElements.sonicDrop) gameSettingElements.sonicDrop.disabled = !settings.hardDrop;
}

function setSonicDrop(value) {
    settings.sonicDrop = value ?? gameSettingElements.sonicDrop.value;
}

function setRotationSystem(value) {
    settings.rotationSystem = value ?? gameSettingElements.rotationSystem.value;
}

function setIRS(value) {
    settings.IRS = value ?? gameSettingElements.IRS.value;
}

function setTwentyGOverride(value) {
    settings.twentyGOverride = value ?? gameSettingElements.twentyGOverride.value;
}

function setLevelLock(value) {
    settings.levelLock = value ?? gameSettingElements.levelLock.value;
}

function setOverrideGameARE(value) {
    settings.overrideGameARE = value ?? gameSettingElements.overrideGameARE.value;
    gameSettingElements.ARE.disabled = !settings.overrideGameARE;
    ameSettingElements.ARELineClear.disabled = !settings.overrideGameARE;
}

function setARE(value) {
    let ARE = parseInt(value ?? gameSettingElements.ARE.value);
    ARE = clamp(0, ARE, 200);
    gameSettingElements.ARE.value = ARE;
    settings.ARE = ARE;
}

function setARELineClear(value) {
    let ARELineClear = parseInt(value ?? gameSettingElements.ARELineClear.value);
    ARELineClear = clamp(0, ARELineClear, 200);
    gameSettingElements.ARELineClear.value = ARELineClear;
    settings.ARELineClear = ARELineClear;
}

function setDASInitial(value) {
    let DASInitial = parseInt(value ?? gameSettingElements.DASInitial.value);
    DASInitial = clamp(1, DASInitial, 60);
    gameSettingElements.DASInitial.value = DASInitial;
    settings.DASInitial = DASInitial;
}

function setDAS(value) {
    let DAS = parseInt(value ?? gameSettingElements.DAS.value);
    DAS = clamp(1, DAS, 60);
    gameSettingElements.DAS.value = DAS;
    settings.DAS = DAS;
}

function setLockDelay(value) {
    let lockDelay = parseInt(value ?? gameSettingElements.lockDelay.value);
    lockDelay = clamp(0, lockDelay, 9999);
    gameSettingElements.lockDelay.value = lockDelay;
    settings.lockDelay = lockDelay;
}

function setLockReset(value) {
    settings.lockReset = value ?? gameSettingElements.lockReset.value;
}