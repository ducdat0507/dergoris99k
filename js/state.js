let keyConfig = {
    a: "left",
    d: "right",
    w: "hardDrop",
    s: "softDrop",
    j: "rotClockwise",
    n: "rotClockwiseAlt",
    k: "rotAnticlockwise",
    l: "rotAnticlockwiseAlt",
    Escape: "exit",
};
const keybindNames = [
    "left",
    "right",
    "hardDrop",
    "softDrop",
    "rotClockwise",
    "rotClockwiseAlt",
    "rotAnticlockwise",
    "rotAnticlockwiseAlt"
];

let game = {};
let settings = {};
let board = [];
let waitingForNextPiece = false;
let currentPiece = 0; //I, O, T, S, Z, J, L
let nextPiece = 0;
let pieceOrientation = 0;
let pieceTopCorner = [0,0]; //Y,X
let piecePositions = [];
let level = 0;
let piecesDropped = [0,0,0,0,0,0,0];
let lastDroppedPieces = [];
let score = 0;
let grade = 0;
let lines = 0;
let linesUntilNextLevel = 0;
let time = 0;
let timeAtLastSection = 0;
let sectionTimes = [];
let softDropping = false;
let currentPushdown = 0;
let maxPushdown = 0;
let currentDropTime = 0;
let currentDASTime = 0;
let currentLockTime = 0;
let locking = false;

//TGM-specific variables
let TGMFirstMove = true;
let combo = 1;
let GMQualifying = true;
let TGMBarState = 0;

//GM on the beat variables
let beatsPassed = 0;
let currentBeatSpeed = 0;
let introSection = 0;
let onTheBeatNextPieces = [0,1,2];

let boardVisualPosition = [0,0];
let soundEnabled = true;
let gamePlaying = false;
let inCampaign = false;
let keysHeld = [false, false, false, false, 0, 0, 0, 0]; //Left, Right, Up, Down, CW, CCW, CW alt, CCW alt, rotations have 3 states
let keybindToReplace = "";
let timeOfLastUpdate = Date.now();

function reset() {
    //Save game variables
    game = {
        //Campaign progress
        playerInitials: "Dergoris",
        bestPowers: [0, 0, 0],
        bestScores: [0, 0, 0],
        bestLevels: [0, 0, 0],
        onTheBeatBests: [0, 0],
        bestHighestSectionTimes: [5940, 5940, 5940],
        bestAverageSectionTimes: [5940, 5940, 5940],
        classicStyleBestSectionTimes: [],
        masterStyleBestSectionTimes: [],
        dragonStyleBestSectionTimes: [],
        medals: [0, 0, 0],
        decorPoints: 0,
        //User settings
        volume: 0.5,
        musicVolume: 1,
        boardBumpVisuals: true,
        menuBackgroundEnabled: true,
        gameBackgroundEnabled: true,
    };
    //Game settings
    settings = {
        startingLevel: 0,
        boardWidth: 10,
        boardHeight: 20,
        visuals: "classicStyle",
        gameMechanics: "classicStyle",
        segaDifficulty: "normal",
        randomizer: "tgm",
        pieceColouring: "regular",
        invisible: false,
        softDrop: true,
        hardDrop: true,
        sonicDrop: false,
        rotationSystem: "nintendo-r",
        IRS: true,
        twentyGOverride: false,
        levelLock: false,
        ARE: 10,
        ARELineClear: 30,
        overrideGameARE: false,
        softDropSpeed: 2,
        DASInitial: 16,
        DAS: 6,
        lockDelay: 0,
        lockReset: "step",
        timeDisplay: true,
        includePentominoes: "none",
        includeDiscordant: "none",
        includeMega: "none",
    };
    //Game-specific variables
    board = [];
    waitingForNextPiece = false;
    currentPiece = 0; //I, O, T, S, Z, J, L
    nextPiece = 0;
    pieceOrientation = 0;
    pieceTopCorner = [0,0]; //Y,X
    piecePositions = [];
    level = settings.startingLevel;
    // Initialize to definition count for campaign modes if available
    // Initialize piece drop counters
    piecesDropped = new Array(window.pieceDefs.length).fill(0);
    lastDroppedPieces = [];
    score = 0;
    grade = 0;
    lines = 0;
    linesUntilNextLevel = 0;
    time = 0;
    timeAtLastSection = 0;
    sectionTimes = [];
    softDropping = false;
    currentPushdown = 0;
    maxPushdown = 0;
    currentDropTime = 0;
    currentDASTime = 0;
    currentLockTime = 0;
    locking = false;

    //TGM-specific variables
    TGMFirstMove = true;
    combo = 1;
    GMQualifying = true;
    TGMBarState = 0;

    //GM on the beat variables
    beatsPassed = 0;
    currentBeatSpeed = 0;
    introSection = 0;
    onTheBeatNextPieces = [0,1,2];

    boardVisualPosition = [0,0];
    soundEnabled = true;
    gamePlaying = false;
    inCampaign = false;
    keysHeld = [false, false, false, false, 0, 0, 0, 0]; //Left, Right, Up, Down, CW, CCW, CW alt, CCW alt, rotations have 3 states
    keybindToReplace = "";
    timeOfLastUpdate = Date.now();
}
reset();

//If the user confirms the hard reset, resets all variables, saves and refreshes the page
function hardReset() {
    if (confirm("Are you sure you want to reset? You will lose everything!")) {
        reset();
        save();
        location.reload();
    }
}
  
function save() {
    game.lastSave = Date.now();
    localStorage.setItem("dergorisSave", JSON.stringify(game));
}
  
function setAutoSave() {
    setInterval(save, 5000);
    autosaveStarted = true;
}
//setInterval(save, 5000);
  
function load() {
    reset()
    let loadgame = JSON.parse(localStorage.getItem("dergorisSave"));
    if (loadgame != null) {loadGame(loadgame);}
    
    const keybinds = localStorage.getItem("dergorisKeybinds");
    if (keybinds != null) {
        keyConfig = JSON.parse(keybinds);
    }
    
    updateKeybindList();
}
load()
  
function exportGame() {
    save()
    navigator.clipboard.writeText(btoa(JSON.stringify(game))).then(function() {
        alert("Copied to clipboard!");
    }, function() {
        alert("Error copying to clipboard... Here's the save string: " + btoa(JSON.stringify(game)));
    });
}
  
function importGame() {
    loadgame = JSON.parse(atob(prompt("Input your save here:")));
    if (loadgame && loadgame != null && loadgame != "") {
        reset();
        loadGame(loadgame);
        save();
        location.reload();
    }
    else {
        alert("Invalid input.");
    }
}
  
function loadGame(loadgame) {
    //Sets each variable in 'game' to the equivalent variable in 'loadgame' (the saved file)
    let loadKeys = Object.keys(loadgame);
    for (i=0; i<loadKeys.length; i++) {
        if (loadgame[loadKeys[i]] != "undefined") {
            let thisKey = loadKeys[i];
            if (Array.isArray(loadgame[thisKey])) {
                game[loadKeys[i]] = loadgame[thisKey].map((x) => {return x});
            }
            //else {game[Object.keys(game)[i]] = loadgame[loadKeys[i]]}
            else {game[loadKeys[i]] = loadgame[loadKeys[i]];}
        }
    }

    document.getElementById("backgroundCanvas").style.display = game.menuBackgroundEnabled ? "block" : "none";
}
