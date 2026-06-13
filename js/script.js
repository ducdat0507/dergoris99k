//Smaller game canvas sizes
if (window.innerHeight < 750) {
    document.getElementById("game").style.transform = "translate(-50%, -50%) scale(2)";
    document.getElementById("effectOverlay").style.transform = "translate(-50%, -50%) scale(2)";
    document.getElementById("textOverlay").style.transform = "translate(-50%, -50%) scale(2)";
}
else if (window.innerHeight < 950) {
    document.getElementById("game").style.transform = "translate(-50%, -50%) scale(3)";
    document.getElementById("effectOverlay").style.transform = "translate(-50%, -50%) scale(3)";
    document.getElementById("textOverlay").style.transform = "translate(-50%, -50%) scale(3)";
}



// Preload images
const images = {
	tiles: new Image(),
    hardDropTile: new Image(),
    board: new Image(),
    background: new Image(),
    background2: new Image(),
    sideInfo1: new Image(),
    sideInfo2: new Image(),
    sideInfo3: new Image(),
    sideInfo4: new Image(),
    readyGo: new Image(),
    beatBar: new Image(),
    tileVanish: new Image(),
    digits: new Image(),
    grades: new Image(),
};

//Fetch the game canvas element and its 2D drawing context
const canvas = document.getElementById("game");
const ctx = canvas && canvas.getContext("2d");

//Fetch the effect overlay element and its 2D drawing context
const effectOverlayCanvas = document.getElementById("effectOverlay");
const effectCtx = effectOverlayCanvas && effectOverlayCanvas.getContext("2d");


if (ctx) ctx.imageSmoothingEnabled = false; //Disable image smoothing for pixelated look

// This file now contains only the essential initialization code and functions that haven't been moved to modules.
// All major game functions have been moved to:
// - js/ui.js - UI overlay functions
// - js/render.js - Canvas rendering functions  
// - js/piece.js - Piece movement and rotation
// - js/rules.js - Game rules and utilities
// - js/lineclear.js - Line clearing logic

function updateVariables() {
    if (!gamePlaying) {timeOfLastUpdate = Date.now(); return};
    let timeMultiplier = Math.max(Date.now() - timeOfLastUpdate, 1) / 1000;
    time += timeMultiplier;

    /* Old DAS update (Fixes left+right DAS charge bug, but DAS speed is capped by framerate)
    let resetDAS = false; //Prevents DAS being reset twice when left+right pressed
    let DASChargedThisTick = false; //Prevents DAS being charged twice when left+right pressed
    if (keysHeld[0] && !waitingForNextPiece) {
        if (!checkCanMoveLeft()) {currentDASTime = 0;} //Wall charge
        else {
            currentDASTime -= (timeMultiplier*60);
            DASChargedThisTick = true;
            if (currentDASTime <= 0) {
                moveLeft();
                if (getDropInterval() <= 0.05) maxDrop(); //20G
                resetDAS = true;
            }
        }
    }
    if (keysHeld[1] && !waitingForNextPiece) {
        if (!checkCanMoveRight()) {currentDASTime = 0;} //Wall charge
        else {
            if(!DASChargedThisTick) {
                currentDASTime -= (timeMultiplier*60);
                DASChargedThisTick = true;
            }
            if (currentDASTime <= 0) {
                moveRight();
                if (getDropInterval() <= 0.05) maxDrop(); //20G
                resetDAS = true;
            }
        }
    }
    if(resetDAS) {
        currentDASTime = getDAS();
    }*/

    //Rotation
    if (keysHeld[4] == 1) { //Clockwise
        rotatePiece(true);
        keysHeld[4] = 2;
    }
    if (keysHeld[6] == 1) { //Clockwise alt
        rotatePiece(true, false, true);
        keysHeld[6] = 2;
    }
    if (keysHeld[5] == 1) { //Anticlockwise
        rotatePiece(false);
        keysHeld[5] = 2;
    }
    if (keysHeld[7] == 1) { //Anticlockwise alt
        rotatePiece(false, false, true);
        keysHeld[7] = 2;
    }

    //New DAS
    if (keysHeld[0] && !waitingForNextPiece) {
        if (!checkCanMoveLeft()) {currentDASTime = 0;} //Wall charge
        else {
            currentDASTime -= (timeMultiplier*60);
            while (currentDASTime <= 0) {
                moveLeft();
                currentDASTime += getDAS();
            }
        }
    }
    else if (keysHeld[1] && !waitingForNextPiece) {
        if (!checkCanMoveRight()) {currentDASTime = 0;} //Wall charge
        else {
            currentDASTime -= (timeMultiplier*60);
            while (currentDASTime <= 0) {
                moveRight();
                currentDASTime += getDAS();
            }
        }
    }

    //Update the lock time
    if (checkPieceLanded(piecePositions) && locking) {
        currentLockTime -= (timeMultiplier*60);
        drawGame();
    }
    //Update the drop time
    currentDropTime -= (timeMultiplier*60);
    while (currentDropTime <= 0.01) {
        if (waitingForNextPiece) {
            if (settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat") {
                placePiece(onTheBeatNextPieces[0]);
                onTheBeatNextPieces[0] = onTheBeatNextPieces[1];
                onTheBeatNextPieces[1] = onTheBeatNextPieces[2];
                onTheBeatNextPieces[2] = getRandomPiece();
                setNextPieceVisuals(onTheBeatNextPieces[0],0);
                setNextPieceVisuals(onTheBeatNextPieces[1],1);
                setNextPieceVisuals(onTheBeatNextPieces[2],2);
            }
            else {
                placePiece(nextPiece);
                nextPiece = getRandomPiece();
                if (settings.visuals == "tgm") playNextPieceAudio(nextPiece);
                setNextPieceVisuals(nextPiece);
            }
            drawGame();
            if (((inCampaignMode() && settings.gameMechanics != "onTheBeat") || settings.gameMechanics == "tgm") && keysHeld[3]) { //Starting soft drop if key is held
                currentDropTime = Math.min(getDropInterval(), settings.softDropSpeed);
                softDropping = true;
            }
            else if (settings.gameMechanics == "dx") {currentDropTime = 32;}
            else {currentDropTime = getDropInterval()}
            
        }
        else if (checkPieceLanded(piecePositions) && (locking || settings.lockDelay == 0) && (currentLockTime <= 0.01 || softDropping)) {landPiece();}
        else {
            if (!checkPieceLanded(piecePositions)) {
                if (settings.lockReset == "step") locking = false;
                if (getDropInterval() <= 0.05) maxDrop(); //20G
                else {
                    for (let i=0;i<piecePositions.length;i++) piecePositions[i][0]++;
                    pieceTopCorner[0]++;
                    if (settings.visuals == "tgm" && checkPieceLanded(piecePositions)) playSound("land");
                }
            }
            //Holding the down key for softdrop
            if (settings.softDrop && softDropping) {
                currentDropTime += Math.min(getDropInterval(), settings.softDropSpeed);
                currentPushdown++;
                if (settings.gameMechanics == "dx") score++;
                else if (settings.gameMechanics == "sega") score += segaSoftdropScores[Math.min(level,8)];
                if (currentPushdown > maxPushdown) maxPushdown = currentPushdown;
            }
            else if (locking) {currentDropTime = 1;}
            else {currentDropTime += getDropInterval();}
            drawGame();
            if (checkPieceLanded(piecePositions) && !locking && settings.lockDelay != 0) {
                locking = true;
                currentLockTime = settings.lockDelay;
            }
        }
    }

    timeOfLastUpdate = Date.now();
}

setInterval(updateVariables, 1000/60);

//Unused
function moveBackground() {
    if (!gamePlaying) return;
    document.body.style.backgroundPosition = ((Date.now()/50) % 64)  + "px " + ((Date.now()/50) % 64)   + "px";
    setTimeout(moveBackground, 1000/60);
}

function getSectionTimesLength() {
    let sectionTimesLength = 0;
    for (let i=0;i<sectionTimes.length;i++) {
        if (sectionTimes[i]) sectionTimesLength++;
    }
    return sectionTimesLength;
}

function displaySectionTime(index) {
    if (!sectionTimes[index]) return;
    let sectionTime;
    if (index == 0 || !sectionTimes[index-1]) {sectionTime = sectionTimes[index];}
    else {sectionTime = sectionTimes[index] - sectionTimes[index-1];}

    ctx.clearRect(61, 117+7*index, 48, 6);

    let levelString = (index*100+100).toString().padStart(2, "0");
    if (levelString == "1000") {levelString = "999";}
    for (let i=0;i<3;i++) ctx.drawImage(images.sideInfo2, levelString[i]*4, 0, 4, 6, 61+4*i, 117+7*index, 4, 6);

    let timeString = formatTime(sectionTime);
    let sectionTimeColor = getTimeColor(sectionTime);
    for (let i=0;i<8;i++) {
        if (timeString[i] == ":") {ctx.drawImage(images.sideInfo2, 40, sectionTimeColor*6, 4, 6, 77+4*i, 117+7*index, 4, 6);}
        else {ctx.drawImage(images.sideInfo2, timeString[i]*4, sectionTimeColor*6, 4, 6, 77+4*i, 117+7*index, 4, 6);}
    }
}

function displayEndingLine(x) {
    if (document.getElementById("game").style.display == "none") return;
    if (settings.visuals == "gb" || settings.visuals == "dx") {
        let leftSide = 120-settings.boardWidth*4;
        for (let i=0;i<settings.boardWidth;i++) {
            ctx.drawImage(images.tiles, 0, 96, 8, 8, i*8+leftSide+16, (settings.boardHeight-x)*8, 8, 8);
        }
        if (x<settings.boardHeight) {
            setTimeout(function() {displayEndingLine(x+1)}, 1000/60);
        }
        else {
            setTimeout(returnToMenu, 1000);
        }
    }
    else if (settings.visuals == "nes") {
        let leftSide = 160-settings.boardWidth*4;
        if (inCampaignMode()) {pieceColorSet = Math.floor(level/100);}
        else {pieceColorSet = level%10;}
        for (let i=0;i<settings.boardWidth;i++) {
            ctx.drawImage(images.tiles, 24, pieceColorSet*8, 8, 8, i*8+leftSide+8, x*8+32, 8, 8);
        }
        if (x<settings.boardHeight-1) {
            setTimeout(function() {displayEndingLine(x+1)}, 1000/16);
        }
        else {
            setTimeout(returnToMenu, 1000);
        }
    }
    else if (settings.visuals == "tgm") {
        let leftSide = 160-settings.boardWidth*4;
        for (let j=0;j<settings.boardWidth;j++) {
            if (board[settings.boardHeight-x-1][j] != 0) {
                ctx.drawImage(images.tiles, 8, 0, 8, 8, j*8+leftSide, (settings.boardHeight-x-1)*8+40, 8, 8);
            }
        }
        if (x<settings.boardHeight-1) {
            setTimeout(function() {displayEndingLine(x+1)}, 1000/12);
        }
        else {
            setTimeout(returnToMenu, 1000);
        }
    }
}

function returnToMenu() {
    hideBlackCover();
    stopSound("gameMusic");
    setSoundVolume('menuMusic', game.musicVolume);
    playSound('menuMusic');
    board = [];
    waitingForNextPiece = false;
    piecesDropped = [0,0,0,0,0,0,0];
    lastDroppedPieces = [];
    score = 0;
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
    TGMFirstMove = true;
    combo = 1;
    grade = 0;
    GMQualifying = true;
    TGMBarState = 0;
    beatsPassed = 0;
    currentBeatSpeed = 0;
    introSection = 0;
    document.getElementById("game").style.display = "none";
    document.getElementById("effectOverlay").style.display = "none";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("backgroundCanvas").style.display = game.menuBackgroundEnabled ? "block" : "none";
    document.getElementById("textOverlay").style.display = "none";
    document.getElementById("textOverlay").innerHTML = "";
    document.getElementsByClassName("container")[1].style.display = "block"; //Campaign screen
    document.getElementsByClassName("container")[2].style.display = "block"; //Custom game screen
    if (inCampaign) selectMenuMode(currentMenuMode);
    document.body.style.backgroundColor = "#333";
    document.body.style.backgroundImage = "none";
    save();
}
// - js/main.js - Main game flow
// - js/state.js - Save/load functions
// - js/input.js - Input handling

// Functions remaining in this file are those that haven't been modularized yet.
