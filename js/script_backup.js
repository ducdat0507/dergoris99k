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
        updateVisuals();
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
            updateVisuals();
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
                    piecePositions[0][0]++;
                    piecePositions[1][0]++;
                    piecePositions[2][0]++;
                    piecePositions[3][0]++;
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
            updateVisuals();
            if (checkPieceLanded(piecePositions) && !locking && settings.lockDelay != 0) {
                locking = true;
                currentLockTime = settings.lockDelay;
            }
        }
    }

    //TGM bar flashing (needs to go here because this updates every frame)
    if (settings.visuals == "tgm" && level >= 500) {
        TGMBarState = (TGMBarState+1)%4;
        let leftSide = 160-settings.boardWidth*4;
        ctx.drawImage(images.sideInfo2, 0, (TGMBarState>1 ? 14 : 12), 22, 2, leftSide-32, 192, 22, 2);
    }
    //Main modes time display
    if ((settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle") && settings.timeDisplay) {
        let leftSide = 160-settings.boardWidth*4;
        let timeString = convertToTime(time);
        let timeLength = 8;
        ctx.clearRect(leftSide-74, 82, 64, 9);
        for (let i=0;i<timeLength;i++) {
            if (timeString[i] == ":") {ctx.drawImage(images.digits, 88, 0, 8, 9, leftSide-74+i*8, 82, 8, 9);}
            else {ctx.drawImage(images.digits, parseInt(timeString[i])*8, 0, 8, 9, leftSide-74+i*8, 82, 8, 9);}
        }
        //Current section time
        if (level >= 999) return;
        let currentSection = Math.floor(level/100);
        let currentSectionTime = time - timeAtLastSection;
        ctx.clearRect(61, 117+7*currentSection, 48, 6);

        let levelString = (currentSection*100+100).toString().padStart(2, "0");
        if (levelString == "1000") {levelString = "999";}
        for (let i=0;i<3;i++) ctx.drawImage(images.sideInfo2, levelString[i]*4, 0, 4, 6, 61+4*i, 117+7*currentSection, 4, 6);

        let sectionTimeString = convertToTime(currentSectionTime);
        for (let i=0;i<8;i++) {
            if (sectionTimeString [i] == ":") {ctx.drawImage(images.sideInfo2, 40, 0, 4, 6, 77+4*i, 117+7*currentSection, 4, 6);}
            else {ctx.drawImage(images.sideInfo2, sectionTimeString[i]*4, 0, 4, 6, 77+4*i, 117+7*currentSection, 4, 6);}
        }
    }
    //TGM time display
    else if (settings.visuals == "tgm" && settings.timeDisplay) {
        let leftSide = 160-settings.boardWidth*4;
        let currentBackground = Math.floor(level/100);
        ctx.drawImage(images.background, currentBackground*320+leftSide, 206, 80, 24, leftSide, 206, 80, 24);
        let timeString = convertToTime(time);
        let timeLength = 8;
        for (let i=0;i<timeLength;i++) {
            if (level >= 500) {
                if (timeString[i] == ":") {ctx.drawImage(images.sideInfo3, 100, 13, 10, 13, leftSide+i*10, 210, 10, 13);}
                else {ctx.drawImage(images.sideInfo3, parseInt(timeString[i])*10, 13, 10, 13, leftSide+i*10, 210, 10, 13);}
            }
            else {
                if (timeString[i] == ":") {ctx.drawImage(images.sideInfo3, 100, 0, 10, 13, leftSide+i*10, 210, 10, 13);}
                else {ctx.drawImage(images.sideInfo3, parseInt(timeString[i])*10, 0, 10, 13, leftSide+i*10, 210, 10, 13);}
            }
        }
    }
    timeOfLastUpdate = Date.now();
}

setInterval(updateVariables, 1000/60);



function updateVisuals() {
    if (!gamePlaying) return;
    if (settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle" || settings.visuals == "onTheBeat") {
        let leftSide = 160-settings.boardWidth*4;
        //Clear the canvas
        //ctx.fillStyle = "black";
        //ctx.fillRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
        ctx.clearRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
        ctx.drawImage(images.sideInfo4, leftSide, 40);
        if (!waitingForNextPiece) {
            //Draw the ghost piece if lower than level 200
            if (level < 200) {
                let tempPiecePositions = [];
                for (let i=0;i<4;i++) tempPiecePositions.push([...piecePositions[i]])
                while (!checkPieceLanded(tempPiecePositions)) {
                    for (let i=0;i<4;i++) tempPiecePositions[i][0]++;
                }
                for (let i=0;i<4;i++) {
                    if (tempPiecePositions[i][0] < 0) continue;
                    if (settings.pieceColouring === "monotoneAll") {ctx.drawImage(images.hardDropTile, 0, 0, 8, 8, tempPiecePositions[i][1]*8+leftSide, tempPiecePositions[i][0]*8+40, 8, 8);}
                    else {ctx.drawImage(images.hardDropTile, 0, currentPiece*8+8, 8, 8, tempPiecePositions[i][1]*8+leftSide, tempPiecePositions[i][0]*8+40, 8, 8);}
                }
            }
            //Regular piece
            for (let i=0;i<piecePositions.length;i++) {
                if (piecePositions[i][0] < 0) continue;
                if (settings.pieceColouring === "monotoneAll") {
                    ctx.drawImage(images.tiles, 0, 0, 8, 8, piecePositions[i][1]*8+leftSide, piecePositions[i][0]*8+40, 8, 8);
                }
                else {
                    ctx.drawImage(images.tiles, 0, currentPiece*8+8, 8, 8, piecePositions[i][1]*8+leftSide, piecePositions[i][0]*8+40, 8, 8);
                }
            }
        }
        //Board pieces
        let currentBeatTime;
        if (gameMusic7) currentBeatTime = gameMusic7.seek() * (155/60);
        if (!settings.invisible && (settings.gameMechanics != "onTheBeat" || (currentBeatTime < 392 && (currentBeatTime < 376 || currentBeatTime >= 377)))) {
            for (let i=0;i<settings.boardHeight;i++) {
                for (let j=0;j<settings.boardWidth;j++) {
                    if (board[i][j] != 0) {
                        if (settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll") {ctx.drawImage(images.tiles, 8, 0, 8, 8, j*8+leftSide, i*8+40, 8, 8);}
                        else {
                            if (settings.pieceColouring != "border") ctx.drawImage(images.tiles, 8, (board[i][j])*8, 8, 8, j*8+leftSide, i*8+40, 8, 8);
                            ctx.fillStyle = "#848484";
                            if (board[i-1] && board[i-1][j] == 0) ctx.fillRect(j*8+leftSide, i*8+40, 8, 1); //Top border
                            if (board[i+1] && board[i+1][j] == 0) ctx.fillRect(j*8+leftSide, i*8+48, 8, 1); //Bottom border
                            if (board[i][j-1] == 0) ctx.fillRect(j*8+leftSide, i*8+40, 1, 8); //Left border
                            if (board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+8, i*8+40, 1, 8); //Right border
                            if (board[i-1] && board[i-1][j] != 0 && board[i-1][j-1] == 0 && board[i][j-1] != 0) ctx.fillRect(j*8+leftSide, i*8+40, 1, 1); //Top corner border 1
                            if (board[i+1] && board[i+1][j] == 0 && board[i+1][j+1] == 0 && board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+8, i*8+48, 1, 1); //Top corner border 2
                        }
                    }
                }
            }
        }

        //Grade
        ctx.clearRect(211, 34, 48, 32);
        ctx.drawImage(images.grades, 0, 32*grade, 48, 32, 211, 34, 48, 32);

        //Text
        let nextGradeString;
        let nextGradeLength;
        if (settings.visuals == "classicStyle") {
            if (grade >= 8) {
                nextGradeString = "??????";
                nextGradeLength = 6;
                ctx.clearRect(leftSide+settings.boardWidth*8+8, 80, 64, 9);
                for (let i=0;i<nextGradeLength;i++) {
                    ctx.drawImage(images.digits, 80, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 80, 8, 9)
                }
            }
            else {
                nextGradeString = classicStyleGradeConditions[grade+1].toString();
                nextGradeLength = nextGradeString.length;
                ctx.clearRect(leftSide+settings.boardWidth*8+8, 80, 64, 9);
                for (let i=0;i<nextGradeLength;i++) {
                    ctx.drawImage(images.digits, parseInt(nextGradeString[i])*8, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 80, 8, 9)
                }
            }
        }
        else if (settings.visuals == "masterStyle") {
            if (grade >= 12) {
                nextGradeString = "??????";
                nextGradeLength = 6;
                ctx.clearRect(leftSide+settings.boardWidth*8+8, 80, 64, 9);
                for (let i=0;i<nextGradeLength;i++) {
                    ctx.drawImage(images.digits, 80, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 80, 8, 9)
                }
            }
            else {
                nextGradeString = masterStyleGradeConditions[grade+1].toString();
                nextGradeLength = nextGradeString.length;
                ctx.clearRect(leftSide+settings.boardWidth*8+8, 80, 64, 9);
                for (let i=0;i<nextGradeLength;i++) {
                    ctx.drawImage(images.digits, parseInt(nextGradeString[i])*8, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 80, 8, 9)
                }
            }
        }
        else if (settings.visuals == "dragonStyle") {
            if (grade >= 20) {
                nextGradeString = "??????";
                nextGradeLength = 6;
                ctx.clearRect(leftSide+settings.boardWidth*8+8, 80, 64, 9);
                for (let i=0;i<nextGradeLength;i++) {
                    ctx.drawImage(images.digits, 80, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 80, 8, 9)
                }
            }
            else {
                nextGradeString = (Math.floor(level/50)*50+50).toString();
                if (nextGradeString == "1000") {nextGradeString = "999";}
                nextGradeLength = nextGradeString.length;
                ctx.clearRect(leftSide+settings.boardWidth*8+8, 80, 64, 9);
                for (let i=0;i<nextGradeLength;i++) {
                    ctx.drawImage(images.digits, parseInt(nextGradeString[i])*8, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 80, 8, 9)
                }
            }
        }

        let scoreString = score.toString();
        let scoreLength = scoreString.length;
        ctx.clearRect(leftSide+settings.boardWidth*8+11, 142, scoreLength*8, 9);
        for (let i=0;i<scoreLength;i++) {
            ctx.drawImage(images.digits, parseInt(scoreString[i])*8, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 142, 8, 9);
        }

        let levelString = level.toString();
        let levelLength = levelString.length;
        ctx.clearRect(leftSide+settings.boardWidth*8+11, 181, levelLength*8, 9);
        for (let i=0;i<levelLength;i++) {
            ctx.drawImage(images.digits, parseInt(levelString[i])*8, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 181, 8, 9);
        }

        if (settings.gameMechanics != "onTheBeat") {
            let levelString2 = (level >= 900 ? "999" : ((Math.floor(level/100)+1)*100).toString());
            let levelLength2 = levelString2.length;
            ctx.clearRect(leftSide+settings.boardWidth*8+11, 197, levelLength2*8, 9);
            for (let i=0;i<levelLength2;i++) {
                ctx.drawImage(images.digits, parseInt(levelString2[i])*8, 0, 8, 9, leftSide+settings.boardWidth*8+11+i*8, 197, 8, 9);
            }
        }
    }
    else if (settings.visuals == "gb" || settings.visuals == "dx") {
        let leftSide = 120-settings.boardWidth*4;
        if (settings.visuals == "dx") {
            if (!gamePlaying) {ctx.fillStyle = "red";}
            else {ctx.fillStyle = dxBackgroundColours[Math.floor(Math.min(level,30)/5)];}
        }
        else {
            ctx.fillStyle = "#c6de86";
        }
        ctx.fillRect(leftSide+16, 0, (8*settings.boardWidth), (8*settings.boardHeight));
        if (!waitingForNextPiece) {
            //Draw the ghost piece if hard drop is enabled
            if (settings.hardDrop) {
                let tempPiecePositions = [];
                for (let i=0;i<4;i++) tempPiecePositions.push([...piecePositions[i]]);
                while (!checkPieceLanded(tempPiecePositions)) {
                    for (let i=0;i<4;i++) tempPiecePositions[i][0]++;
                }
                for (let i=0;i<4;i++) {
                    if (tempPiecePositions[i][0] < 0) continue;
                    ctx.drawImage(images.hardDropTile, tempPiecePositions[i][1]*8+leftSide+16, tempPiecePositions[i][0]*8, 8, 8);
                }
            }
            //Regular piece
            for (let i=0;i<piecePositions.length;i++) {
                if (piecePositions[i][0] < 0) continue
                if (currentPiece == 0) {
                    if (settings.visuals == "dx" && settings.pieceColouring == "monotoneAll") {
                        if (pieceOrientation % 2==0 && i==0) {ctx.drawImage(images.tiles, 8, 48, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==0 && (i==1 || i==2)) {ctx.drawImage(images.tiles, 8, 56, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==0 && i==3) {ctx.drawImage(images.tiles, 8, 64, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==1 && i==0) {ctx.drawImage(images.tiles, 8, 72, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==1 && (i==1 || i==2)) {ctx.drawImage(images.tiles, 8, 80, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==1 && i==3) {ctx.drawImage(images.tiles, 8, 88, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}     
                    }
                    else {
                        if (pieceOrientation % 2==0 && i==0) {ctx.drawImage(images.tiles, 0, 48, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==0 && (i==1 || i==2)) {ctx.drawImage(images.tiles, 0, 56, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==0 && i==3) {ctx.drawImage(images.tiles, 0, 64, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==1 && i==0) {ctx.drawImage(images.tiles, 0, 72, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==1 && (i==1 || i==2)) {ctx.drawImage(images.tiles, 0, 80, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                        else if (pieceOrientation % 2==1 && i==3) {ctx.drawImage(images.tiles, 0, 88, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}     
                    }
                }
                else {
                    if (settings.visuals == "dx" && settings.pieceColouring == "monotoneAll") {ctx.drawImage(images.tiles, 8, currentPiece*8-8, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                    else {ctx.drawImage(images.tiles, 0, currentPiece*8-8, 8, 8, piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);}
                }
                //Add white if the piece is locking
                if (locking && settings.visuals != "dx") {
                    if (settings.visuals == "gb") {ctx.fillStyle = "rgba(198, 222, 140, " + (0.5 - (currentLockTime / settings.lockDelay / 2)) + ")";}
                    else {ctx.fillStyle = "rgba(255, 255, 255, " + (0.5 - (currentLockTime / settings.lockDelay / 2)) + ")";}
                    ctx.fillRect(piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);
                }
                //White flash in DX
                if (settings.visuals != "dx" && waitingForNextPiece) {
                    ctx.fillStyle = "white";
                    ctx.fillRect(piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);
                }
            }
        }
        //Board pieces
        if (!settings.invisible) {
            for (let i=0;i<settings.boardHeight;i++) {
                for (let j=0;j<settings.boardWidth;j++) {
                    if (board[i][j] != 0) {
                        if (settings.visuals == "dx" && (settings.pieceColouring == "monotoneFixed" || settings.pieceColouring == "monotoneAll")) {ctx.drawImage(images.tiles, 8, board[i][j]*8-16, 8, 8, j*8+leftSide+16, i*8, 8, 8);}
                        else if (settings.pieceColouring == "border") {
                            if (settings.visuals == "dx") {ctx.fillStyle = "black";}
                            else {ctx.fillStyle = "#081810";}
                            if (board[i-1] && board[i-1][j] == 0) ctx.fillRect(j*8+leftSide+16, i*8, 8, 1); //Top border
                            if (board[i+1] && board[i+1][j] == 0) ctx.fillRect(j*8+leftSide+16, i*8+8, 8, 1); //Bottom border
                            if (board[i][j-1] == 0) ctx.fillRect(j*8+leftSide+16, i*8, 1, 8); //Left border
                            if (board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+24, i*8, 1, 8); //Right border
                            if (board[i-1] && board[i-1][j] != 0 && board[i-1][j-1] == 0 && board[i][j-1] != 0) ctx.fillRect(j*8+leftSide+16, i*8, 1, 1); //Top corner border 1
                            if (board[i+1] && board[i+1][j] == 0 && board[i+1][j+1] == 0 && board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+24, i*8+8, 1, 1); //Top corner border 2
                        }
                        else {ctx.drawImage(images.tiles, 0, board[i][j]*8-16, 8, 8, j*8+leftSide+16, i*8, 8, 8);}
                    }
                }
            }
        }
        //Text
        if (settings.visuals == "gb") {
            document.getElementsByClassName("GBText")[0].innerText = score.toString();
            document.getElementsByClassName("GBText")[1].innerText = level.toString();
            document.getElementsByClassName("GBText")[2].innerText = lines.toString();
        }
        else {
            document.getElementsByClassName("DXText")[0].innerText = score.toString();
            document.getElementsByClassName("DXText")[1].innerText = level.toString();
            document.getElementsByClassName("DXText")[2].innerText = lines.toString();
        }
    }
    else if (settings.visuals == "nes") {
        //Clear the canvas
        let leftSide = 160-settings.boardWidth*4;
        ctx.fillStyle = "black";
        ctx.fillRect(leftSide+8, 32, settings.boardWidth*8, settings.boardHeight*8);
        //Draw the board
        //ctx.drawImage(images.tiles, 0, 0, 8, 8, pieceTopCorner[1]*8+leftSide+8, pieceTopCorner[0]*8+32, 4, 4);
        let pieceColorSet;
        if (inCampaignMode()) {pieceColorSet = Math.floor(level/100);}
        else {pieceColorSet = level%10;}
        if (!waitingForNextPiece) {
            //Draw the ghost piece if hard drop is enabled
            if (settings.hardDrop) {
                let tempPiecePositions = [];
                for (let i=0;i<4;i++) tempPiecePositions.push([...piecePositions[i]]);
                while (!checkPieceLanded(tempPiecePositions)) {
                    for (let i=0;i<4;i++) tempPiecePositions[i][0]++;
                }
                for (let i=0;i<4;i++) {
                    if (tempPiecePositions[i][0] < 0) continue;
                    ctx.drawImage(images.hardDropTile, tempPiecePositions[i][1]*8+leftSide+8, tempPiecePositions[i][0]*8+32, 8, 8);
                }
            }
            //Regular piece
            for (let i=0;i<piecePositions.length;i++) {
                if (piecePositions[i][0] < 0) continue;
                if (settings.pieceColouring === "monotoneAll") {
                    ctx.drawImage(images.tiles, nesPieceTiles[currentPiece]*8, 80, 8, 8, piecePositions[i][1]*8+leftSide+8, piecePositions[i][0]*8+32, 8, 8);
                }
                else {
                    ctx.drawImage(images.tiles, nesPieceTiles[currentPiece]*8, (pieceColorSet)*8, 8, 8, piecePositions[i][1]*8+leftSide+8, piecePositions[i][0]*8+32, 8, 8);
                }
                //Add white if the piece is locking
                if (locking) {
                    ctx.fillStyle = "rgba(255, 255, 255, " + (0.5 - (currentLockTime / settings.lockDelay / 2)) + ")";
                    ctx.fillRect(piecePositions[i][1]*8+leftSide+8, piecePositions[i][0]*8+32, 8, 8);
                }
            }
        }
        //Board pieces
        for (let i=0;i<settings.boardHeight;i++) {
            for (let j=0;j<settings.boardWidth;j++) {
                if (board[i][j] != 0) {
                    if ((settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll") && !settings.invisible) {ctx.drawImage(images.tiles, nesPieceTiles[board[i][j]-1]*8, 80, 8, 8, j*8+leftSide+8, i*8+32, 8, 8);}
                    else if (settings.pieceColouring === "border" && !settings.invisible) {
                        ctx.fillStyle = "white";
                        if (board[i-1] && board[i-1][j] == 0) ctx.fillRect(j*8+leftSide+8, i*8+32, 8, 1); //Top border
                        if (board[i+1] && board[i+1][j] == 0) ctx.fillRect(j*8+leftSide+8, i*8+40, 8, 1); //Bottom border
                        if (board[i][j-1] == 0) ctx.fillRect(j*8+leftSide+8, i*8+32, 1, 8); //Left border
                        if (board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+16, i*8+32, 1, 8); //Right border
                        if (board[i-1] && board[i-1][j] != 0 && board[i-1][j-1] == 0 && board[i][j-1] != 0) ctx.fillRect(j*8+leftSide+8, i*8+32, 1, 1); //Top corner border 1
                        if (board[i+1] && board[i+1][j] == 0 && board[i+1][j+1] == 0 && board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+16, i*8+40, 1, 1); //Top corner border 2
                    }
                    else if (!settings.invisible) {ctx.drawImage(images.tiles, nesPieceTiles[board[i][j]-1]*8, (pieceColorSet)*8, 8, 8, j*8+leftSide+8, i*8+32, 8, 8);}
                }
            }
        }

        //Text
        document.getElementsByClassName("NESText")[0].innerText = Math.floor(time/60) + ":" + Math.floor(time%60).toString().padStart(2, "0");
        document.getElementsByClassName("NESText")[1].innerText = score.toString().padStart(6, "0");
        document.getElementsByClassName("NESText")[2].innerText = level.toString().padStart(2, "0");
        document.getElementsByClassName("NESText")[3].innerText = "LINES-" + lines.toString().padStart(3, "0");
    }
    else if (settings.visuals == "sega") {
        //Clear the canvas
        let leftSide = 160-settings.boardWidth*4;
        ctx.fillStyle = "black";
        ctx.fillRect(leftSide, 32, settings.boardWidth*8, settings.boardHeight*8);
        //Draw the board
        //ctx.drawImage(images.tiles, 0, 0, 8, 8, pieceTopCorner[1]*8+leftSide+8, pieceTopCorner[0]*8+32, 4, 4);
        if (!waitingForNextPiece) {
            //Draw the ghost piece if hard drop is enabled
            if (settings.hardDrop) {
                let tempPiecePositions = [];
                for (let i=0;i<4;i++) tempPiecePositions.push([...piecePositions[i]])
                while (!checkPieceLanded(tempPiecePositions)) {
                    for (let i=0;i<4;i++) tempPiecePositions[i][0]++;
                }
                for (let i=0;i<4;i++) {
                    if (tempPiecePositions[i][0] < 0) continue;
                    ctx.drawImage(images.hardDropTile, tempPiecePositions[i][1]*8+leftSide, tempPiecePositions[i][0]*8+32, 8, 8);
                }
            }
            //Regular piece
            for (let i=0;i<piecePositions.length;i++) {
                if (piecePositions[i][0] < 0) continue;
                if (settings.pieceColouring === "monotoneAll") {
                    ctx.drawImage(images.tiles, 0, 64, 8, 8, piecePositions[i][1]*8+leftSide, piecePositions[i][0]*8+32, 8, 8);
                }
                else {
                    ctx.drawImage(images.tiles, 0, currentPiece*8, 8, 8, piecePositions[i][1]*8+leftSide, piecePositions[i][0]*8+32, 8, 8);
                }
            }
        }
        //Board pieces
        for (let i=0;i<settings.boardHeight;i++) {
            for (let j=0;j<settings.boardWidth;j++) {
                if (board[i][j] != 0) {
                    if ((settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll") && !settings.invisible) {ctx.drawImage(images.tiles, 0, 64, 8, 8, j*8+leftSide, i*8+32, 8, 8);}
                    else if (settings.pieceColouring === "border" && !settings.invisible) {
                        ctx.fillStyle = "white";
                        if (board[i-1] && board[i-1][j] == 0) ctx.fillRect(j*8+leftSide, i*8+32, 8, 1); //Top border
                        if (board[i+1] && board[i+1][j] == 0) ctx.fillRect(j*8+leftSide, i*8+40, 8, 1); //Bottom border
                        if (board[i][j-1] == 0) ctx.fillRect(j*8+leftSide, i*8+32, 1, 8); //Left border
                        if (board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+8, i*8+32, 1, 8); //Right border
                        if (board[i-1] && board[i-1][j] != 0 && board[i-1][j-1] == 0 && board[i][j-1] != 0) ctx.fillRect(j*8+leftSide, i*8+32, 1, 1); //Top corner border 1
                        if (board[i+1] && board[i+1][j] == 0 && board[i+1][j+1] == 0 && board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+8, i*8+40, 1, 1); //Top corner border 2
                    }
                    else if (!settings.invisible) {ctx.drawImage(images.tiles, 0, (board[i][j]-1)*8, 8, 8, j*8+leftSide, i*8+32, 8, 8);}
                }
            }
        }

        //Text
        let currentBackground = segaBackgroundLevels[Math.min(level, 15)];

        let scoreString = score.toString();
        let scoreLength = scoreString.length;
        ctx.drawImage(images.background, currentBackground*320+leftSide-24-scoreLength*8, 33, scoreLength*8, 8, leftSide-24-scoreLength*8, 33, scoreLength*8, 8);
        for (let i=0;i<scoreLength;i++) {
            ctx.drawImage(images.digits, parseInt(scoreString[i])*8, 0, 8, 8, leftSide-24-scoreLength*8+i*8, 33, 8, 8);
        }

        let linesString = lines.toString();
        let linesLength = linesString.length;
        ctx.drawImage(images.background, currentBackground*320+leftSide-24-linesLength*8, 57, linesLength*8, 8, leftSide-24-linesLength*8, 57, linesLength*8, 8);
        for (let i=0;i<linesLength;i++) {
            ctx.drawImage(images.digits, parseInt(linesString[i])*8, 0, 8, 8, leftSide-24-linesLength*8+i*8, 57, 8, 8);
        }

        let levelString = level.toString();
        let levelLength = levelString.length;
        ctx.drawImage(images.background, currentBackground*320+leftSide-24-levelLength*8, 81, levelLength*8, 8, leftSide-24-levelLength*8, 81, levelLength*8, 8);
        for (let i=0;i<levelLength;i++) {
            ctx.drawImage(images.digits, parseInt(levelString[i])*8, 0, 8, 8, leftSide-24-levelLength*8+i*8, 81, 8, 8);
        }
    }
    else if (settings.visuals == "tgm") {
        let leftSide = 160-settings.boardWidth*4;
        //Clear the canvas
        let currentBackground = Math.floor(level/100);
        ctx.drawImage(images.background2, currentBackground*320+120, 40, 80, 160, 120, 40, 80, 160);
        if (!waitingForNextPiece) {
            //Draw the ghost piece if lower than level 200
            if (level < 200) {
                let tempPiecePositions = [];
                for (let i=0;i<4;i++) tempPiecePositions.push([...piecePositions[i]])
                while (!checkPieceLanded(tempPiecePositions)) {
                    for (let i=0;i<4;i++) tempPiecePositions[i][0]++;
                }
                for (let i=0;i<4;i++) {
                    if (tempPiecePositions[i][0] < 0) continue;
                    if (settings.pieceColouring === "monotoneAll") {ctx.drawImage(images.hardDropTile, 0, 0, 8, 8, tempPiecePositions[i][1]*8+leftSide, tempPiecePositions[i][0]*8+40, 8, 8);}
                    else {ctx.drawImage(images.hardDropTile, 0, currentPiece*8+8, 8, 8, tempPiecePositions[i][1]*8+leftSide, tempPiecePositions[i][0]*8+40, 8, 8);}
                }
            }
            //Regular piece
            for (let i=0;i<piecePositions.length;i++) {
                if (piecePositions[i][0] < 0) continue;
                if (settings.pieceColouring === "monotoneAll") {
                    ctx.drawImage(images.tiles, 0, 0, 8, 8, piecePositions[i][1]*8+leftSide, piecePositions[i][0]*8+40, 8, 8);
                }
                else {
                    ctx.drawImage(images.tiles, 0, currentPiece*8+8, 8, 8, piecePositions[i][1]*8+leftSide, piecePositions[i][0]*8+40, 8, 8);
                }
            }
        }
        //Board pieces
        for (let i=0;i<settings.boardHeight;i++) {
            for (let j=0;j<settings.boardWidth;j++) {
                if (board[i][j] != 0) {
                    if (settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll" && !settings.invisible) {ctx.drawImage(images.tiles, 8, 0, 8, 8, j*8+leftSide, i*8+40, 8, 8);}
                    else if (!settings.invisible) {
                        if (settings.pieceColouring != "border") ctx.drawImage(images.tiles, 8, (board[i][j])*8, 8, 8, j*8+leftSide, i*8+40, 8, 8);
                        ctx.fillStyle = "#848484";
                        if (board[i-1] && board[i-1][j] == 0) ctx.fillRect(j*8+leftSide, i*8+40, 8, 1); //White top border
                        if (board[i+1] && board[i+1][j] == 0) ctx.fillRect(j*8+leftSide, i*8+48, 8, 1); //White bottom border
                        if (board[i][j-1] == 0) ctx.fillRect(j*8+leftSide, i*8+40, 1, 8); //White left border
                        if (board[i][j+1] == 0) ctx.fillRect(j*8+leftSide+8, i*8+40, 1, 8); //White right border
                    }
                }
            }
        }

        //Grade
        ctx.drawImage(images.grades, 27*grade, 0, 27, 26, 84, 34, 27, 26);

        //Text
        let nextGradeString;
        let nextGradeLength;
        if (grade >= 17) {
            nextGradeString = "??????";
            nextGradeLength = 6;
            ctx.drawImage(images.background, currentBackground*320+leftSide-8-nextGradeLength*8, 80, nextGradeLength*8, 9, leftSide-8-nextGradeLength*8, 79, nextGradeLength*8, 9);
            for (let i=0;i<nextGradeLength;i++) {
                if (level >= 500) {ctx.drawImage(images.digits, 80, 9, 8, 9, leftSide-8-nextGradeLength*8+i*8, 80, 8, 9);}
                else {ctx.drawImage(images.digits, 80, 0, 8, 9, leftSide-8-nextGradeLength*8+i*8, 80, 8, 9);}
            }
        }
        else {
            nextGradeString = tgmGradeConditions[grade+1].toString();
            nextGradeLength = nextGradeString.length;
            ctx.drawImage(images.background, currentBackground*320+leftSide-8-nextGradeLength*8, 80, nextGradeLength*8, 9, leftSide-8-nextGradeLength*8, 79, nextGradeLength*8, 9);
            for (let i=0;i<nextGradeLength;i++) {
                if (level >= 500) {ctx.drawImage(images.digits, parseInt(nextGradeString[i])*8, 9, 8, 9, leftSide-8-nextGradeLength*8+i*8, 80, 8, 9);}
                else {ctx.drawImage(images.digits, parseInt(nextGradeString[i])*8, 0, 8, 9, leftSide-8-nextGradeLength*8+i*8, 80, 8, 9);}
            }
        }

        let scoreString = score.toString();
        let scoreLength = scoreString.length;
        ctx.drawImage(images.background, currentBackground*320+leftSide-9-scoreLength*8, 144, scoreLength*8, 9, leftSide-9-scoreLength*8, 144, scoreLength*8, 9);
        for (let i=0;i<scoreLength;i++) {
            if (level >= 500) {ctx.drawImage(images.digits, parseInt(scoreString[i])*8, 9, 8, 9, leftSide-9-scoreLength*8+i*8, 144, 8, 9);}
            else {ctx.drawImage(images.digits, parseInt(scoreString[i])*8, 0, 8, 9, leftSide-9-scoreLength*8+i*8, 144, 8, 9);}
        }

        let levelString = level.toString();
        let levelLength = levelString.length;
        ctx.drawImage(images.background, currentBackground*320+leftSide-9-levelLength*8, 181, levelLength*8, 9, leftSide-9-levelLength*8, 181, levelLength*8, 9);
        for (let i=0;i<levelLength;i++) {
            if (level >= 500) {ctx.drawImage(images.digits, parseInt(levelString[i])*8, 9, 8, 9, leftSide-9-levelLength*8+i*8, 181, 8, 9);}
            else {ctx.drawImage(images.digits, parseInt(levelString[i])*8, 0, 8, 9, leftSide-9-levelLength*8+i*8, 181, 8, 9);}
        }

        let levelString2 = (level >= 900 ? "999" : ((Math.floor(level/100)+1)*100).toString());
        let levelLength2 = levelString2.length;
        ctx.drawImage(images.background, currentBackground*320+leftSide-9-levelLength2*8, 197, levelLength2*8, 9, leftSide-9-levelLength2*8, 197, levelLength2*8, 9);
        for (let i=0;i<levelLength2;i++) {
            if (level >= 500) {ctx.drawImage(images.digits, parseInt(levelString2[i])*8, 9, 8, 9, leftSide-9-levelLength2*8+i*8, 197, 8, 9);}
            else {ctx.drawImage(images.digits, parseInt(levelString2[i])*8, 0, 8, 9, leftSide-9-levelLength2*8+i*8, 197, 8, 9);}
        }

        //Level bar
        if (level >= 500) {ctx.drawImage(images.sideInfo2, 0, 14, 22, 2, leftSide-32, 192, 22, 2);}
        else if (level >= 450) {ctx.drawImage(images.sideInfo2, 0, 6, 22, 2, leftSide-32, 192, 22, 2);}
        else if (level >= 420) {ctx.drawImage(images.sideInfo2, 0, 8, 22, 2, leftSide-32, 192, 22, 2);}
        else if (level >= 400) {ctx.drawImage(images.sideInfo2, 0, 10, 22, 2, leftSide-32, 192, 22, 2);}
        else if (level >= 360) {ctx.drawImage(images.sideInfo2, 0, 8, 22, 2, leftSide-32, 192, 22, 2);}
        else if (level >= 330) {ctx.drawImage(images.sideInfo2, 0, 6, 22, 2, leftSide-32, 192, 22, 2);}
        else if (level >= 300) {ctx.drawImage(images.sideInfo2, 0, 4, 22, 2, leftSide-32, 192, 22, 2);}
        else if (level >= 251) {ctx.drawImage(images.sideInfo2, 0, 2, 22, 2, leftSide-32, 192, 22, 2);}
        else {ctx.drawImage(images.sideInfo2, 0, 0, 22, 2, leftSide-32, 192, 22, 2);}
    }
}

let timeOfLastVisualUpdate = Date.now();
function updateCanvasVisualPosition() {
    if (!gamePlaying || (boardVisualPosition[0] == 0 && boardVisualPosition[1] == 0) || !game.boardBumpVisuals || (settings.visuals != "classicStyle" && settings.visuals != "masterStyle" && settings.visuals != "dragonStyle" && settings.visuals != "onTheBeat")) {
        timeOfLastVisualUpdate = Date.now();
        requestAnimationFrame(updateCanvasVisualPosition);
        return;
    }
    
    let dt = (Date.now() - timeOfLastVisualUpdate) / 1000;

    boardVisualPosition[0] *= 0.04 ** dt;
    if (Math.abs(boardVisualPosition[0]) < 0.01) boardVisualPosition[0] = 0;
    boardVisualPosition[1] *= 0.04 ** dt;
    if (Math.abs(boardVisualPosition[1]) < 0.01) boardVisualPosition[1] = 0;

    document.getElementById("game").style.left = (50 + boardVisualPosition[0]) + "%";
    document.getElementById("game").style.top = (50 + boardVisualPosition[1]) + "%";

    timeOfLastVisualUpdate = Date.now();
    requestAnimationFrame(updateCanvasVisualPosition);
}
requestAnimationFrame(updateCanvasVisualPosition);

//On the Beat Visuals
//WebGL canvas attributes
let beatSunColors = [
    [255, 0, 0],
    [255, 128, 0],
    [255, 255, 0],
    [0, 255, 0],
    [0, 255, 255],
    [0, 0, 255],
    [128, 0, 255],
    [255, 0, 255]
]
let lastBeatSunColors = [0,1];
function updateBeatVisuals() {
    if ((!gamePlaying && introSection != 1 && introSection != 2) || settings.visuals != "onTheBeat") {
        requestAnimationFrame(updateBeatVisuals);
        return;
    }

    let currentBeatTime = gameMusic7.seek() * (155/60); //155 BPM
    if (currentBeatTime > 424) {
        playSound("finish");
        endGame();
    }
    if (currentBeatTime > 3 && introSection == 1) {
        readyGo(2);
        introSection = 2;
    }
    if (currentBeatTime > 6 && introSection == 2) {
        readyGo(3);
        introSection = 0;
    }
    while (currentBeatTime > onTheBeatGradePoints[grade]) {
        grade++;
        ctx.clearRect(211, 34, 48, 32);
        ctx.drawImage(images.grades, 0, 32*grade, 48, 32, 211, 34, 48, 32);
    }
    if (currentBeatTime > onTheBeatBeats[beatsPassed+1]) {
        if (currentBeatTime > 392) {  //Visual section 10
            sunColor = [0,0,0];
        }
        else if (currentBeatTime > 377) {  //Visual section 9
            let chosenColor = Math.floor(Math.random()*beatSunColors.length)
            while (chosenColor == lastBeatSunColors[0] || chosenColor == lastBeatSunColors[1]) {
                chosenColor = Math.floor(Math.random()*beatSunColors.length)
            }
            sunColor = beatSunColors[chosenColor];
            lastBeatSunColors[0] = lastBeatSunColors[1];
            lastBeatSunColors[1] = chosenColor;
        }
        else if (currentBeatTime > 376) {  //Visual section 8
            sunColor = [0,0,0];
        }
        else if (currentBeatTime > 360) {  //Visual section 7
            let chosenColor = Math.floor(Math.random()*beatSunColors.length)
            while (chosenColor == lastBeatSunColors[0] || chosenColor == lastBeatSunColors[1]) {
                chosenColor = Math.floor(Math.random()*beatSunColors.length)
            }
            sunColor = beatSunColors[chosenColor];
            lastBeatSunColors[0] = lastBeatSunColors[1];
            lastBeatSunColors[1] = chosenColor;
        }
        else if (currentBeatTime > 328) {  //Visual section 6
            sunColor = [255,0,0];
        }
        else if (currentBeatTime > 264) {  //Visual section 5
            let chosenColor = Math.floor(Math.random()*beatSunColors.length)
            while (chosenColor == lastBeatSunColors[0] || chosenColor == lastBeatSunColors[1]) {
                chosenColor = Math.floor(Math.random()*beatSunColors.length)
            }
            sunColor = beatSunColors[chosenColor];
            lastBeatSunColors[0] = lastBeatSunColors[1];
            lastBeatSunColors[1] = chosenColor;
        }
        else if (currentBeatTime > 256) {  //Visual section 4
            sunColor = [150, 150, 150];
        }
        else if (currentBeatTime > 232) {  //Visual section 3
            let chosenColor = Math.floor(Math.random()*beatSunColors.length)
            while (chosenColor == lastBeatSunColors[0] || chosenColor == lastBeatSunColors[1]) {
                chosenColor = Math.floor(Math.random()*beatSunColors.length)
            }
            sunColor = beatSunColors[chosenColor];
            lastBeatSunColors[0] = lastBeatSunColors[1];
            lastBeatSunColors[1] = chosenColor;
        }
        else if (currentBeatTime > 216) { //Visual section 2
            sunColor = [150, 150, 150];
        }
        else if (currentBeatTime > 88) { //Visual section 1
            let chosenColor = Math.floor(Math.random()*beatSunColors.length)
            while (chosenColor == lastBeatSunColors[0] || chosenColor == lastBeatSunColors[1]) {
                chosenColor = Math.floor(Math.random()*beatSunColors.length)
            }
            sunColor = beatSunColors[chosenColor];
            lastBeatSunColors[0] = lastBeatSunColors[1];
            lastBeatSunColors[1] = chosenColor;
        }

        //Calculate beat speed
        currentBeatSpeed = 0;
        if (onTheBeatBeats[beatsPassed+2] - onTheBeatBeats[beatsPassed+1] <= 0.5) currentBeatSpeed = 3;
        else if (onTheBeatBeats[beatsPassed+2] - onTheBeatBeats[beatsPassed+1] <= 0.75) currentBeatSpeed = 2;
        else if (onTheBeatBeats[beatsPassed+2] - onTheBeatBeats[beatsPassed+1] <= 1) currentBeatSpeed = 1;

        //Hard drop
        boardVisualPosition[1] = 1.5; //Vertical bump
        maxDrop(); //20G
        landPiece();
    }
    while (currentBeatTime > onTheBeatBeats[beatsPassed+1]) beatsPassed++;
    let timesUntilNextBeats = [];
    let beatsAdded = 0;
    while (onTheBeatBeats[beatsPassed+beatsAdded+1] - currentBeatTime < 4) {
        timesUntilNextBeats[beatsAdded] = onTheBeatBeats[beatsPassed+beatsAdded+1] - currentBeatTime;
        beatsAdded++;
    }
    

    ctx.clearRect(84, 32, 14, 200);
    if (waitingForNextPiece) {ctx.drawImage(images.beatBar, 0, 0, 14, 176, 84, 32, 14, 176);}
    else {ctx.drawImage(images.beatBar, 14, 0, 14, 176, 84, 32, 14, 176);}
    for (let i=0;i<timesUntilNextBeats.length;i++) {
        let beatColor = 0;
        if (onTheBeatBeats[beatsPassed+i+2] - onTheBeatBeats[beatsPassed+i+1] <= 0.5) beatColor = 3;
        else if (onTheBeatBeats[beatsPassed+i+2] - onTheBeatBeats[beatsPassed+i+1] <= 0.75) beatColor = 2;
        else if (onTheBeatBeats[beatsPassed+i+2] - onTheBeatBeats[beatsPassed+i+1] <= 1) beatColor = 1;
        ctx.drawImage(images.beatBar, 28, beatColor*4, 14, 4, 84, 32+Math.floor(timesUntilNextBeats[i]*43), 14, 4);
    }
    requestAnimationFrame(updateBeatVisuals);
}
requestAnimationFrame(updateBeatVisuals);

function getDropInterval() {
    if (settings.twentyGOverride) return 0.05;
    else if (settings.gameMechanics == "classicStyle") return classicStyleDropIntervals[Math.floor(level/100)];
    else if (settings.gameMechanics == "masterStyle") {
        let currentLevelPoint = 0;
        while (masterStyleIntervalLevels[currentLevelPoint+1] <= level) currentLevelPoint++;
        return masterStyleIntervals[currentLevelPoint]
    }
    else if (settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat") return 0.05;
    else if (settings.gameMechanics == "gb") return gameboyDropIntervals[Math.min(level, 20)];
    else if (settings.gameMechanics == "nes") return nesDropIntervals[Math.min(level, 29)];
    else if (settings.gameMechanics == "dx") return dxDropIntervals[Math.min(level, 30)];
    else if (settings.gameMechanics == "sega") {
        if (settings.segaDifficulty == "easy") return segaEasyDropIntervals[Math.min(level, 15)];
        else if (settings.segaDifficulty == "normal") return segaNormalDropIntervals[Math.min(level, 15)];
        else if (settings.segaDifficulty == "hard") return segaHardDropIntervals[Math.min(level, 15)];
        else if (settings.segaDifficulty == "hardest") return segaHardestDropIntervals[Math.min(level, 15)];
    }
    else if (settings.gameMechanics == "tgm") {
        let currentLevelPoint = 0;
        while (tgmIntervalLevels[currentLevelPoint+1] <= level) currentLevelPoint++;
        return tgmIntervals[currentLevelPoint]
    }
}

function getDAS() {
    if (settings.gameMechanics == "classicStyle") {return classicStyleDAS[Math.floor(level/100)];}
    return settings.DAS;
}

function getDASInitial() {
    if (settings.gameMechanics == "classicStyle") {return classicStyleDASInitial[Math.floor(level/100)];}
    else if (settings.gameMechanics == "dragonStyle") {return dragonStyleDASInitial[Math.floor(level/100)];}
    else if (settings.gameMechanics == "onTheBeat") {return beatDASSpeeds[currentBeatSpeed];}
    return settings.DASInitial;
}

function landPiece() {
    if (softDropping) boardVisualPosition[1] = 1.5; //Vertical bump
    locking = false;
    currentLockTime = 0;
    if (settings.visuals == "gb" || settings.visuals == "dx") {
        if (currentPiece == 0 && pieceOrientation % 2 == 0) {
            board[piecePositions[0][0]][piecePositions[0][1]] = 8;
            board[piecePositions[1][0]][piecePositions[1][1]] = 9;
            board[piecePositions[2][0]][piecePositions[2][1]] = 9;
            board[piecePositions[3][0]][piecePositions[3][1]] = 10;
        }
        else if (currentPiece == 0 && pieceOrientation % 2 == 1) {
            board[piecePositions[0][0]][piecePositions[0][1]] = 11;
            board[piecePositions[1][0]][piecePositions[1][1]] = 12;
            board[piecePositions[2][0]][piecePositions[2][1]] = 12;
            board[piecePositions[3][0]][piecePositions[3][1]] = 13;
        }
        else {
        for (let i=0;i<piecePositions.length;i++) board[piecePositions[i][0]][piecePositions[i][1]] = currentPiece+1;
    }
    }
    else {
        for (let i=0;i<piecePositions.length;i++) {
            if (board[piecePositions[i][0]]) board[piecePositions[i][0]][piecePositions[i][1]] = currentPiece+1;
        }
    }
    
    if (settings.overrideGameARE && checkFullLines().length > 0) {currentDropTime = settings.ARELineClear;} //ARE line clear override
    else if (settings.overrideGameARE) {currentDropTime = settings.ARE;} //ARE override
    else if (settings.gameMechanics == "classicStyle" && checkFullLines().length > 0) {currentDropTime = 40;} //Classic style line clear ARE
    else if (settings.gameMechanics == "classicStyle") {currentDropTime = 20;} //Classic style ARE
    else if (settings.gameMechanics == "masterStyle" && checkFullLines().length > 0) {currentDropTime = 40;} //Master style line clear ARE
    else if (settings.gameMechanics == "masterStyle") {currentDropTime = 20;} //Master style ARE
    else if (settings.gameMechanics == "dragonStyle" && checkFullLines().length > 0) {currentDropTime = dragonStyleARELineClear[Math.floor(level/100)]} //Dragon style line clear ARE
    else if (settings.gameMechanics == "dragonStyle") {currentDropTime = dragonStyleARE[Math.floor(level/100)]} //Dragon style ARE
    else if (settings.gameMechanics == "onTheBeat") {currentDropTime = beatARESpeeds[currentBeatSpeed];} //GM on the Beat ARE
    else if (settings.gameMechanics == "gb" && checkFullLines().length > 0) {currentDropTime = 93;} //Game boy line clear ARE
    else if (settings.gameMechanics == "gb") {currentDropTime = 2;} //Game boy ARE
    else if (settings.gameMechanics == "nes" && checkFullLines().length > 0) {currentDropTime = ((settings.boardWidth+1)*2+5);} //NES line clear ARE
    else if (settings.gameMechanics == "nes") {currentDropTime = calculateNESARELevel(Math.max(pieceTopCorner[0], 0));} //NES ARE, 10 frames of ARE if piece lands in bottom row, going up to 18 at top
    else if (settings.gameMechanics == "dx" && checkFullLines().length > 0) {currentDropTime = 50;} //DX line clear ARE
    else if (settings.gameMechanics == "dx") {currentDropTime = 2;} //DX ARE
    else if (settings.gameMechanics == "sega" && checkFullLines().length > 0) {currentDropTime = 72;} //Sega line clear ARE
    else if (settings.gameMechanics == "sega") {currentDropTime = 30;} //Sega ARE
    else if (settings.gameMechanics == "tgm" && checkFullLines().length > 0) {currentDropTime = 71;} //TGM line clear ARE
    else if (settings.gameMechanics == "tgm") {currentDropTime = 30;} //TGM ARE
    else {currentDropTime = 60;} //Backup
    waitingForNextPiece = true;
    if (inCampaignMode() || settings.gameMechanics == "tgm") playSound("lock");
    updateVisuals();
    clearLines();
    //Disable softdrop until key is pressed again
    softDropping = false;
    //Add pushdown points
    if (settings.gameMechanics != "classicStyle" && settings.gameMechanics != "masterStyle" && settings.gameMechanics != "dragonStyle" && settings.gameMechanics != "onTheBeat" && settings.gameMechanics != "dx" && settings.gameMechanics != "tgm") score += maxPushdown;
    maxPushdown = 0;
    currentPushdown = 0;

    //White flash in DX
    if (settings.visuals == "dx" && waitingForNextPiece && checkFullLines().length == 0) {
        let leftSide = 120-settings.boardWidth*4;
        for (let i=0;i<piecePositions.length;i++) {
            ctx.fillStyle = "white";
            ctx.fillRect(piecePositions[i][1]*8+leftSide+16, piecePositions[i][0]*8, 8, 8);
        }
    }
}

function calculateNESARELevel(lvl) {
    let tempX = settings.boardHeight-lvl;
    return Math.min(Math.floor(tempX/4-0.5)*2+10, 18);
}

function placePiece(pieceType) {
    if (((inCampaignMode() && settings.gameMechanics != "onTheBeat") || settings.gameMechanics == "tgm") && level == 999) {
        endGame();
        return;
    }

    waitingForNextPiece = false;
    switch (settings.gameMechanics) {
        case "gb":
            for (let i=0;i<4;i++) {
                piecePositions[i] = [...piecePlacements[pieceType][i]];
                piecePositions[i][0]++;
                if (pieceType==0 || pieceType==1) {piecePositions[i][1] += settings.boardWidth/2-2;}
                else {piecePositions[i][1] += settings.boardWidth/2-3;}
            }
            if (pieceType==0) {pieceTopCorner = [-1,1];}
            else if (pieceType==1) {pieceTopCorner = [1,1];}
            else {pieceTopCorner = [0,1];}
            pieceTopCorner[1] += settings.boardWidth/2-3;
            break;
        case "classicStyle":
            for (let i=0;i<4;i++) {
                piecePositions[i] = [...piecePlacements[pieceType][i]];
                if (pieceType==0 || pieceType==1) {piecePositions[i][1] += settings.boardWidth/2-2;}
                else {piecePositions[i][1] += settings.boardWidth/2-3;}
            }
            if (pieceType==0) {pieceTopCorner = [-2,1];}
            else if (pieceType==1) {pieceTopCorner = [0,1];}
            else {pieceTopCorner = [-1,1];}
            pieceTopCorner[1] += settings.boardWidth/2-3;
            break;
        case "nes":
            for (let i=0;i<4;i++) {
                piecePositions[i] = [...piecePlacements[pieceType][i]];
                piecePositions[i][1] += settings.boardWidth/2-2;
            }
            if (pieceType==0) {pieceTopCorner = [-2,0];}
            else if (pieceType==1) {pieceTopCorner = [0,1];}
            else {pieceTopCorner = [-1,1];}
            pieceTopCorner[1] += settings.boardWidth/2-2;
            break;
        case "dx":
            for (let i=0;i<4;i++) {
                piecePositions[i] = [...piecePlacements[pieceType][i]];
                if (pieceType==0 || pieceType==1) {piecePositions[i][1] += settings.boardWidth/2-2;}
                else {piecePositions[i][1] += settings.boardWidth/2-3;}
            }
            if (pieceType==3 || pieceType == 4) {pieceTopCorner = [1,1];}
            else if (pieceType==0) {pieceTopCorner = [0,0];}
            else if (pieceType==1) {pieceTopCorner = [1,1];}
            else {pieceTopCorner = [0,1];}
            pieceTopCorner[1] += settings.boardWidth/2-3;
            break;
        case "sega":
            for (let i=0;i<4;i++) {
                piecePositions[i] = [...piecePlacements[pieceType][i]];
                if (pieceType==0 || pieceType==1) {piecePositions[i][1] += settings.boardWidth/2-2;}
                else {piecePositions[i][1] += settings.boardWidth/2-3;}
            }
            if (pieceType==0) {pieceTopCorner = [-1,1];}
            else if (pieceType==1) {pieceTopCorner = [0,1];}
            else {pieceTopCorner = [-1,1];}
            pieceTopCorner[1] += settings.boardWidth/2-3;
            break;
        case "masterStyle":
        case "dragonStyle":
        case "onTheBeat":
        case "tgm":
            for (let i=0;i<4;i++) {
                piecePositions[i] = [...piecePlacements[pieceType][i]];
                if (pieceType==0 || pieceType==1) {piecePositions[i][1] += settings.boardWidth/2-2;}
                else {piecePositions[i][1] += settings.boardWidth/2-3;}
            }
            if (pieceType==0) {pieceTopCorner = [-1,1];}
            else if (pieceType==1) {pieceTopCorner = [0,1];}
            else {pieceTopCorner = [-1,1];}
            pieceTopCorner[1] += settings.boardWidth/2-3;
            break;
    }
    currentPiece = pieceType;
    pieceOrientation = 0;
    piecesDropped[pieceType]++;

    //Initial rotation system (IRS)
    if (settings.IRS && (keysHeld[4] || keysHeld[6])) {
        rotatePiece(true, true);
        if (settings.visuals == "tgm") playSound("IRS");
    }
    else if (settings.IRS && (keysHeld[5] || keysHeld[7])) {
        rotatePiece(false, true);
        if (settings.visuals == "tgm") playSound("IRS");
    }

    if (getDropInterval() <= 0.05) maxDrop(); //20G

    //Setting to the initial DAS (For GB and DX) 
    if (settings.gameMechanics == "gb" || settings.gameMechanics == "dx") {currentDASTime = getDASInitial();}

    //Overriding the initial DAS if arrow keys are held (For main modes and TGM, assumed for Sega)
    if ((inCampaignMode() || settings.gameMechanics == "sega" || settings.gameMechanics == "tgm") && keysHeld[0]) {currentDASTime = getDAS();}
    else if ((inCampaignMode() || settings.gameMechanics == "sega" || settings.gameMechanics == "tgm") && keysHeld[1]) {currentDASTime = getDAS();}

    //Cancel the visual line clears if the piece is placed before the animation is finished
    if (visualInterval) {
        if (settings.gameMechanics != "classicStyle" && settings.gameMechanics != "masterStyle" && settings.gameMechanics != "dragonStyle" && settings.gameMechanics != "onTheBeat" && settings.gameMechanics != "tgm") clearInterval(visualInterval);
        //Move all lines above the cleared line down
        let fullLines = checkFullLines();
        for (let i=0;i<fullLines.length;i++) {
            for (let j=0;j<settings.boardWidth;j++) {
                board[fullLines[i]][j] = 0;
            }
            for (let j=fullLines[i];j>0;j--) {
                for (let k=0;k<settings.boardWidth;k++) {
                    board[j][k] = board[j-1][k];
                }
            }
        }
        updateVisuals();
    }

    //Update dropped piece statistics
    if (settings.visuals == "nes") {
        let scoreVisuals = [];
        for (let i=0; i<7; i++) {
            scoreVisuals.push(piecesDropped[i].toString().padStart(3, "0") + "<br><br>");
        }
        document.getElementsByClassName("NESText")[4].innerHTML = scoreVisuals[2] + scoreVisuals[5] + scoreVisuals[4] + scoreVisuals[1] + scoreVisuals[3] + scoreVisuals[6] + scoreVisuals[0];
    }

    //Check for game over
    if (checkPieceOverlap(piecePositions)) {
        endGame();
        return;
    }

    //Update level for TGM-like modes
    if ((inCampaignMode() || settings.gameMechanics == "tgm") && !settings.levelLock && !TGMFirstMove && ((level % 100 != 99 && level != 998) || settings.gameMechanics == "onTheBeat")) {
        level++;
        if (level == 485) fadeOutSound("gameMusic", 2000); //Music fade out
    }
    TGMFirstMove = false;
}

// TODO: create lookup table for the tile positions to condense this
// Alternative: Use equations instead
function setNextPieceVisuals(index, xOffset=0) {
    //Draw the piece in the next box
    if (settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle" || settings.visuals == "onTheBeat") {
        let leftSide = 160-settings.boardWidth*4;
        ctx.clearRect(leftSide+xOffset*36+24, 12, 32, 17);
        ctx.fillStyle = "#080808"
        switch (index) {
            case 0:
                ctx.drawImage(images.tiles, 0, 8, 8, 8, leftSide+xOffset*36+24, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, leftSide+xOffset*36+32, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, leftSide+xOffset*36+40, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, leftSide+xOffset*36+48, 12, 8, 8);
                ctx.fillRect(leftSide+xOffset*36+24, 20, 32, 1);
                break
            case 1:
                ctx.drawImage(images.tiles, 0, 16, 8, 8, leftSide+xOffset*36+32, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, leftSide+xOffset*36+40, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, leftSide+xOffset*36+32, 20, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, leftSide+xOffset*36+40, 20, 8, 8);
                ctx.fillRect(leftSide+xOffset*36+32, 28, 16, 1);
                break
            case 2:
                ctx.drawImage(images.tiles, 0, 24, 8, 8, leftSide+xOffset*36+24, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, leftSide+xOffset*36+32, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, leftSide+xOffset*36+40, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, leftSide+xOffset*36+32, 20, 8, 8);
                ctx.fillRect(leftSide+xOffset*36+24, 20, 8, 1);
                ctx.fillRect(leftSide+xOffset*36+40, 20, 8, 1);
                ctx.fillRect(leftSide+xOffset*36+32, 28, 8, 1);
                break
            case 3:
                ctx.drawImage(images.tiles, 0, 32, 8, 8, leftSide+xOffset*36+32, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, leftSide+xOffset*36+40, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, leftSide+xOffset*36+24, 20, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, leftSide+xOffset*36+32, 20, 8, 8);
                ctx.fillRect(leftSide+xOffset*36+40, 20, 8, 1);
                ctx.fillRect(leftSide+xOffset*36+24, 28, 16, 1);
                break
            case 4:
                ctx.drawImage(images.tiles, 0, 40, 8, 8, leftSide+xOffset*36+24, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, leftSide+xOffset*36+32, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, leftSide+xOffset*36+32, 20, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, leftSide+xOffset*36+40, 20, 8, 8);
                ctx.fillRect(leftSide+xOffset*36+24, 20, 8, 1);
                ctx.fillRect(leftSide+xOffset*36+32, 28, 16, 1);
                break
            case 5:
                ctx.drawImage(images.tiles, 0, 48, 8, 8, leftSide+xOffset*36+24, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, leftSide+xOffset*36+32, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, leftSide+xOffset*36+40, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, leftSide+xOffset*36+40, 20, 8, 8);
                ctx.fillRect(leftSide+xOffset*36+24, 20, 16, 1);
                ctx.fillRect(leftSide+xOffset*36+40, 28, 8, 1);
                break
            case 6:
                ctx.drawImage(images.tiles, 0, 56, 8, 8, leftSide+xOffset*36+24, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, leftSide+xOffset*36+32, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, leftSide+xOffset*36+40, 12, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, leftSide+xOffset*36+24, 20, 8, 8);
                ctx.fillRect(leftSide+xOffset*36+32, 20, 16, 1);
                ctx.fillRect(leftSide+xOffset*36+24, 28, 8, 1);
                break
        }
    }
    else if (settings.visuals == "gb") {
        let leftSide = 120-settings.boardWidth*4;
        ctx.fillStyle = "#c6de86";
        ctx.fillRect(leftSide+(settings.boardWidth*8)+40, 104, 32, 32);
        switch (index) {
            case 0:
                ctx.drawImage(images.tiles, 0, 48, 8, 8, 8*settings.boardWidth+leftSide+40, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, 8*settings.boardWidth+leftSide+48, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, 8*settings.boardWidth+leftSide+56, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 64, 8, 8, 8*settings.boardWidth+leftSide+64, 112, 8, 8);
                break
            case 1:
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+48, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+56, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+48, 120, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+56, 120, 8, 8);
                break
            case 2:
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide+40, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide+48, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide+56, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide+48, 120, 8, 8);
                break
            case 3:
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide+48, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide+56, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide+40, 120, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide+48, 120, 8, 8);
                break
            case 4:
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide+40, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide+48, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide+48, 120, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide+56, 120, 8, 8);
                break
            case 5:
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide+40, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide+48, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide+56, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide+56, 120, 8, 8);
                break
            case 6:
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide+40, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide+48, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide+56, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide+40, 120, 8, 8);
                break
        }
    }
    else if (settings.visuals == "nes") {
        let leftSide = 160-settings.boardWidth*4;
        ctx.fillStyle = "black";
        ctx.fillRect(leftSide+(settings.boardWidth*8)+24, 96, 32, 32);
        let tileTemp;
        if (settings.pieceColouring === "monotoneAll") {tileTemp = 80;}
        else if (inCampaignMode()) {tileTemp = Math.floor(level/100)*8;}
        else {tileTemp = (level%10)*8;}
        switch (index) {
            case 0:
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+24, 108, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+32, 108, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+40, 108, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+48, 108, 8, 8);
                break
            case 1:
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+32, 104, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+40, 104, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+32, 112, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+40, 112, 8, 8);
                break
            case 2:
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+28, 104, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+36, 104, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+44, 104, 8, 8);
                ctx.drawImage(images.tiles, 0, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+36, 112, 8, 8);
                break
            case 3:
                ctx.drawImage(images.tiles, 16, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+36, 104, 8, 8);
                ctx.drawImage(images.tiles, 16, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+44, 104, 8, 8);
                ctx.drawImage(images.tiles, 16, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+28, 112, 8, 8);
                ctx.drawImage(images.tiles, 16, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+36, 112, 8, 8);
                break
            case 4:
                ctx.drawImage(images.tiles, 8, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+28, 104, 8, 8);
                ctx.drawImage(images.tiles, 8, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+36, 104, 8, 8);
                ctx.drawImage(images.tiles, 8, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+36, 112, 8, 8);
                ctx.drawImage(images.tiles, 8, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+44, 112, 8, 8);
                break
            case 5:
                ctx.drawImage(images.tiles, 16, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+28, 104, 8, 8);
                ctx.drawImage(images.tiles, 16, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+36, 104, 8, 8);
                ctx.drawImage(images.tiles, 16, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+44, 104, 8, 8);
                ctx.drawImage(images.tiles, 16, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+44, 112, 8, 8);
                break
            case 6:
                ctx.drawImage(images.tiles, 8, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+28, 104, 8, 8);
                ctx.drawImage(images.tiles, 8, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+36, 104, 8, 8);
                ctx.drawImage(images.tiles, 8, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+44, 104, 8, 8);
                ctx.drawImage(images.tiles, 8, tileTemp, 8, 8, 8*settings.boardWidth+leftSide+28, 112, 8, 8);
                break
        }
    }
    else if (settings.visuals == "dx") {
        let leftSide = 120-settings.boardWidth*4;
        ctx.fillStyle = "white";
        ctx.fillRect(leftSide+(settings.boardWidth*8)+40, 24, 32, 32);
        switch (index) {
            case 0:
                ctx.drawImage(images.tiles, 0, 48, 8, 8, 8*settings.boardWidth+leftSide+40, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, 8*settings.boardWidth+leftSide+48, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, 8*settings.boardWidth+leftSide+56, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 64, 8, 8, 8*settings.boardWidth+leftSide+64, 32, 8, 8);
                break
            case 1:
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+48, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+56, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+48, 40, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+56, 40, 8, 8);
                break
            case 2:
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide+40, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide+48, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide+56, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide+48, 40, 8, 8);
                break
            case 3:
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide+48, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide+56, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide+40, 40, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide+48, 40, 8, 8);
                break
            case 4:
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide+40, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide+48, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide+48, 40, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide+56, 40, 8, 8);
                break
            case 5:
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide+40, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide+48, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide+56, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide+56, 40, 8, 8);
                break
            case 6:
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide+40, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide+48, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide+56, 32, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide+40, 40, 8, 8);
                break
        }
    }
    else if (settings.visuals == "sega") {
        let leftSide = 120-settings.boardWidth*4;
        let currentBackground = segaBackgroundLevels[Math.min(level, 15)];
        ctx.drawImage(images.background, currentBackground*320+leftSide+64, 8, 32, 16, leftSide+64, 8, 32, 16);
        switch (index) {
            case 0:
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide-16, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide-8, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 0, 8, 8, 8*settings.boardWidth+leftSide+8, 16, 8, 8);
                break
            case 1:
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide-8, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide-8, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, 8*settings.boardWidth+leftSide, 16, 8, 8);
                break
            case 2:
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide-16, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide-8, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, 8*settings.boardWidth+leftSide-8, 16, 8, 8);
                break
            case 3:
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide-8, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide-16, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, 8*settings.boardWidth+leftSide-8, 16, 8, 8);
                break
            case 4:
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide-16, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide-8, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide-8, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, 8*settings.boardWidth+leftSide, 16, 8, 8);
                break
            case 5:
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide-16, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide-8, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, 8*settings.boardWidth+leftSide, 16, 8, 8);
                break
            case 6:
                ctx.drawImage(images.tiles, 0, 48, 8, 8, 8*settings.boardWidth+leftSide-16, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, 8*settings.boardWidth+leftSide-8, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, 8*settings.boardWidth+leftSide, 8, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, 8*settings.boardWidth+leftSide-16, 16, 8, 8);
                break
        }
    }
    else if (settings.visuals == "tgm") {
        let leftSide = 160-settings.boardWidth*4;
        let currentBackground = Math.floor(level/100);
        ctx.drawImage(images.background, currentBackground*320+leftSide+24, 17, 32, 17, leftSide+24, 16, 32, 17);
        ctx.fillStyle = "#080808"
        switch (index) {
            case 0:
                ctx.drawImage(images.tiles, 0, 8, 8, 8, leftSide+24, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, leftSide+32, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, leftSide+40, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 8, 8, 8, leftSide+48, 16, 8, 8);
                ctx.fillRect(leftSide+24, 24, 32, 2);
                break
            case 1:
                ctx.drawImage(images.tiles, 0, 16, 8, 8, leftSide+32, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, leftSide+40, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, leftSide+32, 24, 8, 8);
                ctx.drawImage(images.tiles, 0, 16, 8, 8, leftSide+40, 24, 8, 8);
                ctx.fillRect(leftSide+32, 32, 16, 1);
                break
            case 2:
                ctx.drawImage(images.tiles, 0, 24, 8, 8, leftSide+24, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, leftSide+32, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, leftSide+40, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 24, 8, 8, leftSide+32, 24, 8, 8);
                ctx.fillRect(leftSide+24, 24, 8, 2);
                ctx.fillRect(leftSide+40, 24, 8, 2);
                ctx.fillRect(leftSide+32, 32, 8, 1);
                break
            case 3:
                ctx.drawImage(images.tiles, 0, 32, 8, 8, leftSide+32, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, leftSide+40, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, leftSide+24, 24, 8, 8);
                ctx.drawImage(images.tiles, 0, 32, 8, 8, leftSide+32, 24, 8, 8);
                ctx.fillRect(leftSide+40, 24, 8, 2);
                ctx.fillRect(leftSide+24, 32, 16, 1);
                break
            case 4:
                ctx.drawImage(images.tiles, 0, 40, 8, 8, leftSide+24, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, leftSide+32, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, leftSide+32, 24, 8, 8);
                ctx.drawImage(images.tiles, 0, 40, 8, 8, leftSide+40, 24, 8, 8);
                ctx.fillRect(leftSide+24, 24, 8, 2);
                ctx.fillRect(leftSide+32, 32, 16, 1);
                break
            case 5:
                ctx.drawImage(images.tiles, 0, 48, 8, 8, leftSide+24, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, leftSide+32, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, leftSide+40, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 48, 8, 8, leftSide+40, 24, 8, 8);
                ctx.fillRect(leftSide+24, 24, 16, 2);
                ctx.fillRect(leftSide+40, 32, 8, 1);
                break
            case 6:
                ctx.drawImage(images.tiles, 0, 56, 8, 8, leftSide+24, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, leftSide+32, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, leftSide+40, 16, 8, 8);
                ctx.drawImage(images.tiles, 0, 56, 8, 8, leftSide+24, 24, 8, 8);
                ctx.fillRect(leftSide+32, 24, 16, 2);
                ctx.fillRect(leftSide+24, 32, 8, 1);
                break
        }
    }
}

function playNextPieceAudio(index) {
    switch (index) {
        case 0:
            playSound("pieceI");
            break;
        case 1:
            playSound("pieceO");
            break;
        case 2:
            playSound("pieceT");
            break;
        case 3:
            playSound("pieceS");
            break;
        case 4:
            playSound("pieceZ");
            break;
        case 5:
            playSound("pieceJ");
            break;
        case 6:
            playSound("pieceL");
            break;
    }
}

function getRandomPiece() {
    let chosenPiece;
    switch (settings.randomizer) {
        case "random":
            chosenPiece= Math.floor(Math.random()*7);
		break;
        case "gb":
            //Game boy tetris randomizer is slightly weighted away towards certain pieces due to a bug
            chosenPiece = Math.floor(Math.random()*7);
            if (chosenPiece | lastDroppedPieces[0] | lastDroppedPieces[1] == lastDroppedPieces[1]) chosenPiece = Math.floor(Math.random()*7);
            if (chosenPiece | lastDroppedPieces[0] | lastDroppedPieces[1] == lastDroppedPieces[1]) chosenPiece = Math.floor(Math.random()*7);
		break;
        case "nes":
            chosenPiece =  Math.floor(Math.random()*8);
            if (chosenPiece == 7 || chosenPiece == lastDroppedPieces[0]) {chosenPiece= Math.floor(Math.random()*7);}
		break;
        case "dx":
            //Tetris DX randomizer is heavily weighted towards T due to a bug
            chosenPiece =  Math.floor(Math.random()*7); //From 0 to 6. Original game generates 0 to 7, but we are ignoring that.
            if (chosenPiece == lastDroppedPieces[0]) chosenPiece=2; //Makes it a T piece if it's a repeat. Direct repeats are supposed to be rare.
		break;
        case "tgm":
            let startingViablePieces = [0,2,5,6]; //First piece must be I, T, J or L
            if (TGMFirstMove && settings.gameMechanics != "onTheBeat") {chosenPiece=startingViablePieces[Math.floor(Math.random()*4)];}
            else {
                chosenPiece = Math.floor(Math.random()*7);
                for (let i=0; i<3; i++) { //Check 4 times if the piece is in the last 4 pieces
                    if (chosenPiece == lastDroppedPieces[0] || chosenPiece == lastDroppedPieces[1] || chosenPiece == lastDroppedPieces[2] || chosenPiece == lastDroppedPieces[3]) chosenPiece = Math.floor(Math.random()*7);
                }
            }
            break;
        default:
		    chosenPiece= Math.floor(Math.random()*7);
		break;
    }
    //Update last dropped pieces array
    lastDroppedPieces.unshift(chosenPiece);
    if (lastDroppedPieces.length > 7) lastDroppedPieces.pop();
    return chosenPiece;
}


function checkPieceLanded(cells=piecePositions) {
    for (const cell of cells) {
        if (cell[0] >= settings.boardHeight-1) return true;
        if (board[cell[0]+1] && board[cell[0]+1][cell[1]] != 0) return true;
    }
    return false;
}

function checkPieceOverlap(cells=piecePositions) {
    for (const cell of cells) {
        //if (cell[0] < 0 && (settings.gameMechanics == "sega")) return true; //Above top of board (only sega version, intentionally disabled here because it's really annoying)
        if (cell[0] >= settings.boardHeight) return true; //Below bottom of board
        if (cell[1] < 0) return true; //Beyond left side of board
        if (cell[1] >= settings.boardWidth) return true; //Beyond right side of board
        if (board[cell[0]] && board[cell[0]][cell[1]] != 0) return true;
    }
    return false;
}

function checkCanMoveLeft() {
    if (waitingForNextPiece) return false;
    for (let i=0;i<piecePositions.length;i++) {
        if (piecePositions[i][1] == 0) return false;
        if (board[piecePositions[i][0]] && board[piecePositions[i][0]][piecePositions[i][1]-1] != 0) return false;
    }
    return true;
}

function checkCanMoveRight() { 
    if (waitingForNextPiece) return false;
    for (let i=0;i<piecePositions.length;i++) {
        if (piecePositions[i][1] == settings.boardWidth-1) return false;
        if (board[piecePositions[i][0]] && board[piecePositions[i][0]][piecePositions[i][1]+1] != 0) return false;
    }
    return true;
}

function moveLeft() {
    if (checkCanMoveLeft()) {
        for (let i=0;i<piecePositions.length;i++) {
            piecePositions[i][1]--;
        }
        pieceTopCorner[1]--;
        if (locking && settings.lockReset == "move") locking = false;
        if (!checkPieceLanded(piecePositions)) {
            if (settings.lockReset == "step") locking = false;
            if (getDropInterval() <= 0.05) {maxDrop();} //20G
        }
        updateVisuals();
    }
}

function moveRight() {
    if (checkCanMoveRight()) {
        for (let i=0;i<piecePositions.length;i++) {
            piecePositions[i][1]++;
        }
        pieceTopCorner[1]++;
        if (locking && settings.lockReset == "move") locking = false;
        if (!checkPieceLanded(piecePositions)) {
            if (settings.lockReset == "step") locking = false;
            if (getDropInterval() <= 0.05) {maxDrop();} //20G
        }
        updateVisuals();
    }
}

function rotatePiece(clockwise=true, override=false, alt=false) {
    if (clockwise && !alt && keysHeld[4] == 2 && !override) return;
    if (!clockwise && !alt && keysHeld[5] == 2 && !override) return;
    if (clockwise && alt && keysHeld[6] == 2 && !override) return;
    if (!clockwise && alt && keysHeld[7] == 2 && !override) return;
    if (!gamePlaying || waitingForNextPiece) return;
    //This should really be simplified
    let tempPiecePositions = [];
    let canRotate = true;
    let tempY = pieceTopCorner[0];
    let tempX = pieceTopCorner[1];
    let rotatedOrientation;
    if (clockwise) {rotatedOrientation = (pieceOrientation+1)%4;}
    else {rotatedOrientation = (pieceOrientation+3)%4;}
    switch (currentPiece) {
        case 0: //I
            for (let i=0;i<4;i++) tempPiecePositions.push([...piecePositions[i]]);
            //Rotate each tile clockwise around the top corner
            if (settings.rotationSystem == "nintendo-l") {
                if (pieceOrientation == 0 || pieceOrientation == 2) {
                    tempPiecePositions = [[tempY,tempX+1],[tempY+1,tempX+1],[tempY+2,tempX+1],[tempY+3,tempX+1]];
                }
                else {
                    tempPiecePositions = [[tempY+2,tempX],[tempY+2,tempX+1],[tempY+2,tempX+2],[tempY+2,tempX+3]];
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    updateVisuals();
                }
            }
            else if (settings.rotationSystem == "nintendo-r") {
                if (pieceOrientation == 0 || pieceOrientation == 2) {
                    tempPiecePositions = [[tempY,tempX+2],[tempY+1,tempX+2],[tempY+2,tempX+2],[tempY+3,tempX+2]];
                }
                else {
                    tempPiecePositions = [[tempY+2,tempX],[tempY+2,tempX+1],[tempY+2,tempX+2],[tempY+2,tempX+3]];
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    updateVisuals();
                }
            }
            else if (settings.rotationSystem == "dx") {
                if (rotatedOrientation == 1) {
                    tempPiecePositions = [[tempY-1,tempX+2],[tempY,tempX+2],[tempY+1,tempX+2],[tempY+2,tempX+2]];
                }
                else if (rotatedOrientation == 2) {
                    tempPiecePositions = [[tempY+1,tempX],[tempY+1,tempX+1],[tempY+1,tempX+2],[tempY+1,tempX+3]];
                }
                else if (rotatedOrientation == 3) {
                    tempPiecePositions = [[tempY-1,tempX+1],[tempY,tempX+1],[tempY+1,tempX+1],[tempY+2,tempX+1]];
                }
                else {
                    tempPiecePositions = [[tempY,tempX],[tempY,tempX+1],[tempY,tempX+2],[tempY,tempX+3]];
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    updateVisuals();
                }
                //Alternate rotation point
                else {
                    if (rotatedOrientation == 1) {
                        tempX--;
                        tempY--;
                        tempPiecePositions = [[tempY-1,tempX+2],[tempY,tempX+2],[tempY+1,tempX+2],[tempY+2,tempX+2]];
                    }
                    else if (rotatedOrientation == 2) {
                        tempX++;
                        tempY--;
                        tempPiecePositions = [[tempY+1,tempX],[tempY+1,tempX+1],[tempY+1,tempX+2],[tempY+1,tempX+3]];
                    }
                    else if (rotatedOrientation == 3) {
                        tempX++;
                        tempY++;
                        tempPiecePositions = [[tempY-1,tempX+1],[tempY,tempX+1],[tempY+1,tempX+1],[tempY+2,tempX+1]];
                    }
                    else {
                        tempX--;
                        tempY++;
                        tempPiecePositions = [[tempY,tempX],[tempY,tempX+1],[tempY,tempX+2],[tempY,tempX+3]];
                    }
                    canRotate = !checkPieceOverlap(tempPiecePositions);
                    if (canRotate) {
                        for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                        pieceOrientation = rotatedOrientation;
                        //Adjust piece top corner
                        pieceTopCorner[0] = tempY;
                        pieceTopCorner[1] = tempX;
                        updateVisuals();
                    }
                }
            }
            else if (settings.rotationSystem == "sega") {
                if (pieceOrientation == 0 || pieceOrientation == 2) {
                    tempPiecePositions = [[tempY,tempX+2],[tempY+1,tempX+2],[tempY+2,tempX+2],[tempY+3,tempX+2]];
                }
                else {
                    tempPiecePositions = [[tempY+1,tempX],[tempY+1,tempX+1],[tempY+1,tempX+2],[tempY+1,tempX+3]];
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    updateVisuals();
                }
            }
            else if (settings.rotationSystem == "ars") { //Same as sega
                if (pieceOrientation == 0 || pieceOrientation == 2) {
                    tempPiecePositions = [[tempY,tempX+2],[tempY+1,tempX+2],[tempY+2,tempX+2],[tempY+3,tempX+2]];
                }
                else {
                    tempPiecePositions = [[tempY+1,tempX],[tempY+1,tempX+1],[tempY+1,tempX+2],[tempY+1,tempX+3]];
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    if (!checkPieceLanded(piecePositions)) {
                        if (settings.lockReset == "step") locking = false;
                        //if (getDropInterval() <= 0.05) maxDrop(); //20G (no longer needed with rotation changes)
                    }
                    updateVisuals();
                }
            }
            else if (settings.rotationSystem == "dergoris") {
                if (rotatedOrientation == 1) {
                    tempPiecePositions = [[tempY-1,tempX+2],[tempY,tempX+2],[tempY+1,tempX+2],[tempY+2,tempX+2]];
                }
                else if (rotatedOrientation == 2) {
                    tempPiecePositions = [[tempY+1,tempX],[tempY+1,tempX+1],[tempY+1,tempX+2],[tempY+1,tempX+3]];
                }
                else if (rotatedOrientation == 3) {
                    tempPiecePositions = [[tempY-1,tempX+1],[tempY,tempX+1],[tempY+1,tempX+1],[tempY+2,tempX+1]];
                }
                else {
                    tempPiecePositions = [[tempY,tempX],[tempY,tempX+1],[tempY,tempX+2],[tempY,tempX+3]];
                }

                //Kicks
                let rightKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    rightKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    rightKickedPiecePositions[i][1]++;
                }
                let leftKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    leftKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    leftKickedPiecePositions[i][1]--;
                }
                let downKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    downKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    downKickedPiecePositions[i][0]++;
                }
                let downRightKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    downRightKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    downKickedPiecePositions[i][0]++;
                    downRightKickedPiecePositions[i][1]++;
                }
                let downLeftKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    downLeftKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    downKickedPiecePositions[i][0]++;
                    downLeftKickedPiecePositions[i][1]--;
                }

                if (clockwise) {
                    canRotate = !checkPieceOverlap(tempPiecePositions);
                    if (!canRotate && !checkPieceOverlap(rightKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...rightKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(leftKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...leftKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downRightKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downRightKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downLeftKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downLeftKickedPiecePositions[i]];
                    }
                }
                else {
                    canRotate = !checkPieceOverlap(tempPiecePositions);
                    if (!canRotate && !checkPieceOverlap(leftKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...leftKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(rightKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...rightKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downLeftKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downLeftKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downRightKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downRightKickedPiecePositions[i]];
                    }
                }
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    if (!checkPieceLanded(piecePositions)) {
                        if (settings.lockReset == "step") locking = false;
                    }
                    updateVisuals();
                }
            }
            break;
        case 1: //O
            break;
        case 2: //T
        case 3: //S
        case 4: //Z
        case 5: //J
        case 6: //L
            //Create the temporary piece based on nesPieceOrientations
            if (settings.rotationSystem == "nintendo-l") {
                for (let j=0;j<9;j++) {
                    if (gameboyPieceOrientations[currentPiece-2][rotatedOrientation][j] == 1) {
                        tempPiecePositions.push([tempY+Math.floor(j/3),tempX+j%3]);
                    }
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    updateVisuals();
                }
            }
            else if (settings.rotationSystem == "nintendo-r") {
                for (let j=0;j<9;j++) {
                    if (nesPieceOrientations[currentPiece-2][rotatedOrientation][j] == 1) {
                        tempPiecePositions.push([tempY+Math.floor(j/3),tempX+j%3]);
                    }
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    updateVisuals();
                }
            }
            else if (settings.rotationSystem == "dx") { //Fixed DX rotation code by zaphod77
                // place piece in new orinetation
                for (let j=0;j<9;j++) {
                    if (dxPieceOrientations[currentPiece-2][rotatedOrientation][j] == 1) {
                        tempPiecePositions.push([tempY+Math.floor(j/3),tempX+j%3])
                    }
                }
                canRotate = !checkPieceOverlap(tempPiecePositions); // check for overlap.
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]]; // move the blocks
                    pieceOrientation = rotatedOrientation; // update orientation vvaraible
                    updateVisuals(); // update screen
                }
                else { // try alternate position
                    let tempPiecePositions = []; // clear out the temp positions
                    // calculate kick from positions of alternate centers in old and new orientation (First value is Y, second value is X)
                    let pushX = 0-dxAlternateCenters[currentPiece-2][rotatedOrientation][1] + dxAlternateCenters[currentPiece-2][pieceOrientation][1];
                    let pushY = 0-dxAlternateCenters[currentPiece-2][rotatedOrientation][0] + dxAlternateCenters[currentPiece-2][pieceOrientation][0];
                    // copy to adjusted coordinates
                    for (let j=0;j<9;j++) {
                        if (dxPieceOrientations[currentPiece-2][rotatedOrientation][j] == 1) {
                            tempPiecePositions.push([pushY+tempY+Math.floor(j/3),pushX+tempX+j%3]);

                        }
                    }
                    canRotate = !checkPieceOverlap(tempPiecePositions); // check for overlap
                    if (canRotate) {
                        for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]]; // copy in new block locations
                        // need to adjust top corner to account for kick
                        pieceTopCorner[0] = tempY + pushY;
                        pieceTopCorner[1] = tempX + pushX;
                        pieceOrientation = rotatedOrientation; // update orientation
                        updateVisuals(); // and visuals.
                    }
                }
            }
            else if (settings.rotationSystem == "sega") {
                for (let j=0;j<9;j++) {
                    if (segaPieceOrientations[currentPiece-2][rotatedOrientation][j] == 1) {
                        tempPiecePositions.push([tempY+Math.floor(j/3),tempX+j%3]);
                    }
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    updateVisuals();
                }
            }
            else if (settings.rotationSystem == "ars") {
                for (let j=0;j<9;j++) {
                    if (tgmPieceOrientations[currentPiece-2][rotatedOrientation][j] == 1) {
                        tempPiecePositions.push([tempY+Math.floor(j/3),tempX+j%3]);
                    }
                }
                canRotate = !checkPieceOverlap(tempPiecePositions);
                
                let centerColumnOverlap = false;
                if (currentPiece == 2 || currentPiece == 5 || currentPiece == 6) centerColumnOverlap = checkCenterColumnRule(tempPiecePositions, tempY, tempX); //Center column rule

                let rightKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    rightKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    rightKickedPiecePositions[i][1]++;
                }
                let leftKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    leftKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    leftKickedPiecePositions[i][1]--;
                }

                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    if (!checkPieceLanded(piecePositions)) {
                        if (settings.lockReset == "step") locking = false;
                        //if (getDropInterval() <= 0.05) maxDrop(); //20G (no longer needed with rotation changes)
                    }
                    updateVisuals();
                }
                else if (centerColumnOverlap) {return;} //Center column rule
                else if (!checkPieceOverlap(rightKickedPiecePositions)) { //Right kick
                    for (let i=0;i<4;i++) tempPiecePositions[i][1]++;
                    pieceTopCorner[1]++;
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    if (!checkPieceLanded(piecePositions)) {
                        if (settings.lockReset == "step") locking = false;
                        //if (getDropInterval() <= 0.05) maxDrop(); //20G (no longer needed with rotation changes)
                    }
                    updateVisuals();
                }
                else if (!checkPieceOverlap(leftKickedPiecePositions)) { //Left kick
                    for (let i=0;i<4;i++) tempPiecePositions[i][1]--;
                    pieceTopCorner[1]--;
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    if (!checkPieceLanded(piecePositions)) {
                        if (settings.lockReset == "step") locking = false;
                        //if (getDropInterval() <= 0.05) maxDrop(); //20G (no longer needed with rotation changes)
                    }
                    updateVisuals();
                }
            }
            else if (settings.rotationSystem == "dergoris") {
                for (let j=0;j<9;j++) {
                    if (tgmPieceOrientations[currentPiece-2][rotatedOrientation][j] == 1) {
                        tempPiecePositions.push([tempY+Math.floor(j/3),tempX+j%3]);
                    }
                }

                let centerColumnOverlap = false;
                if (currentPiece == 2 || currentPiece == 5 || currentPiece == 6) centerColumnOverlap = checkCenterColumnRule(tempPiecePositions, tempY, tempX); //Center column rule

                //Kicks
                let rightKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    rightKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    rightKickedPiecePositions[i][1]++;
                }
                let leftKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    leftKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    leftKickedPiecePositions[i][1]--;
                }
                let downKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    downKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    downKickedPiecePositions[i][0]++;
                }
                let downRightKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    downRightKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    downKickedPiecePositions[i][0]++;
                    downRightKickedPiecePositions[i][1]++;
                }
                let downLeftKickedPiecePositions = [];
                for (let i=0;i<4;i++) {
                    downLeftKickedPiecePositions[i] = [...tempPiecePositions[i]];
                    downKickedPiecePositions[i][0]++;
                    downLeftKickedPiecePositions[i][1]--;
                }

                if (centerColumnOverlap) {
                    canRotate = !checkPieceOverlap(tempPiecePositions);
                }
                else if (clockwise) {
                    canRotate = !checkPieceOverlap(tempPiecePositions);
                    if (!canRotate && !checkPieceOverlap(rightKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...rightKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(leftKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...leftKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downRightKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downRightKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downLeftKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downLeftKickedPiecePositions[i]];
                    }
                }
                else {
                    canRotate = !checkPieceOverlap(tempPiecePositions);
                    if (!canRotate && !checkPieceOverlap(leftKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...leftKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(rightKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...rightKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downLeftKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downLeftKickedPiecePositions[i]];
                    }
                    if (!canRotate && !checkPieceOverlap(downRightKickedPiecePositions)) {
                        canRotate = true;
                        for (let i=0;i<4;i++) tempPiecePositions[i] = [...downRightKickedPiecePositions[i]];
                    }
                }
                if (canRotate) {
                    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
                    pieceOrientation = rotatedOrientation;
                    if (!checkPieceLanded(piecePositions)) {
                        if (settings.lockReset == "step") locking = false;
                    }
                    updateVisuals();
                }
            }
            break;
        default:
            return false;
    }
}

function rotatePieceAroundPoint(piecePos,x,y,clockwise=true) {
    //Shift the piece positions to be around 0,0
    let tempPiecePositions = [];
    for (let i=0;i<piecePos.length;i++) {
        tempPiecePositions.push([piecePos[i][0]-y,piecePos[i][1]-x]);
    }
    //Rotate each tile around 0,0
    for (let i=0;i<tempPiecePositions.length;i++) {
        if (clockwise) {
            let temp = tempPiecePositions[i][0];
            tempPiecePositions[i][0] = tempPiecePositions[i][1];
            tempPiecePositions[i][1] = -temp;
            
        }
        else {
            let temp = tempPiecePositions[i][0];
            tempPiecePositions[i][0] = -tempPiecePositions[i][1];
            tempPiecePositions[i][1] = temp;
        }
    }
    //Shift the piece positions back to the original position
    for (let i=0;i<tempPiecePositions.length;i++) {
        tempPiecePositions[i][0] += y;
        tempPiecePositions[i][1] += x;
    }
    return tempPiecePositions;
}

function checkCenterColumnRule(piecePositions, y, x) {
    for (let i=y;i<y+3;i++) {
        for (let j=x;j<x+3;j++) {
            if (board[i] && board[i][j] != 0 && piecePositions.some(cell => cell[0] == i && cell[1] == j)) {
                if (j == x+1) return true;
                return false;
            }
        }
    }
    return false;
}

function softDrop() {
    if (gamePlaying && settings.softDrop && !keysHeld[3] && !softDropping && !waitingForNextPiece) {
        currentDropTime = 0;
        currentPushdown = 1;
        if (settings.gameMechanics == "dx") score++;
        softDropping = true;
        if (currentPushdown > maxPushdown) maxPushdown = currentPushdown;
    }
}

function hardDrop() {
    if (gamePlaying && (settings.hardDrop) && !waitingForNextPiece) {
        let tempPiecePositions = [];
        for (let i=0;i<4;i++) tempPiecePositions.push([...piecePositions[i]]);
        while (!checkPieceLanded(tempPiecePositions)) {
            for (let i=0;i<4;i++) tempPiecePositions[i][0]++;
            if (inCampaignMode() || settings.gameMechanics == "tgm") maxPushdown++;
        }
        for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
        if (!settings.sonicDrop) {
            boardVisualPosition[1] = 1.5; //Vertical bump
            landPiece();
        }
        else {updateVisuals();}
    }
}

function maxDrop() {
    let tempPiecePositions = [];
    let tempPieceTopCorner = [];
    for (let i=0;i<4;i++) tempPiecePositions.push([...piecePositions[i]]);
    for (let i=0;i<2;i++) tempPieceTopCorner.push(pieceTopCorner[i]);
    while (!checkPieceLanded(tempPiecePositions)) {
        for (let i=0;i<4;i++) tempPiecePositions[i][0]++;
        tempPieceTopCorner[0]++;
    }
    for (let i=0;i<4;i++) piecePositions[i] = [...tempPiecePositions[i]];
    for (let i=0;i<2;i++) pieceTopCorner[i] = tempPieceTopCorner[i];
    if (settings.visuals == "tgm") playSound("land");
}

/** @param {0 | 1} direction - 0 for left, 1 for right */
function setInitialDAS(direction) {
    if(!gamePlaying || waitingForNextPiece) return;
    if (direction==0 && !keysHeld[0]) {
        currentDASTime = getDASInitial();
        moveLeft();
    }
    else if (direction==1 && !keysHeld[1]) {
        currentDASTime = getDASInitial();
        moveRight();
    }
}

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

    let timeString = convertToTime(sectionTime);
    let sectionTimeColor = getTimeColor(sectionTime);
    for (let i=0;i<8;i++) {
        if (timeString[i] == ":") {ctx.drawImage(images.sideInfo2, 40, sectionTimeColor*6, 4, 6, 77+4*i, 117+7*index, 4, 6);}
        else {ctx.drawImage(images.sideInfo2, timeString[i]*4, sectionTimeColor*6, 4, 6, 77+4*i, 117+7*index, 4, 6);}
    }
}

//Event listeners


function checkFullLines() { //Return an array of the full lines
    let fullLines = [];
    for (let i=0;i<settings.boardHeight;i++) {
        let lineFull = true;
        for (let j=0;j<settings.boardWidth;j++) {
            if (board[i][j] == 0) {lineFull = false; break;}
        }
        if (lineFull) fullLines.push(i);
    }
    return fullLines;
}

function checkPerfectClear() { //Check for perfect clear by checking if all lines besides the full lines are empty
    let fullLines = checkFullLines();
    for (let i=0;i<settings.boardHeight;i++) {
        if (fullLines.includes(i)) continue;
        for (let j=0;j<settings.boardWidth;j++) {
            if (board[i][j] != 0) return false;
        }
    }
    return true;
}

let visualInterval;
function clearLines() {
    //Check for full lines
    let linesCleared = checkFullLines().length;
    lines += linesCleared;
    if ((inCampaignMode()) && (level < 485 && level + linesCleared >= 485)) { //Music fade out
        fadeOutSound("gameMusic", 2000);
    }
    else if ((inCampaignMode()) && (level < 500 && level + linesCleared >= 500)) { //New music
        stopSound("gameMusic");
        playSound("gameMusic", true); //Must be forced otherwise song won't play since the level is still < 500
        setSoundVolume("gameMusic", game.musicVolume);
    }
    if ((inCampaignMode() && settings.gameMechanics != "onTheBeat") && (Math.floor(level/100) < Math.floor((level+linesCleared)/100) || level+linesCleared >= 999)) { //main styles level up
        playSound("levelUp");
        timeAtLastSection = time;
        sectionTimes[Math.floor(level/100)] = time;
        if (settings.gameMechanics != "onTheBeat") displaySectionTime(Math.floor(level/100));
        if (settings.visuals == "dragonStyle" && Math.floor(level/100) == 4) { //Switch to grey background and board
            seaColor = [30, 30, 30];
            waveColor = [70, 70, 70];
            images.board.src = "img/main/board3.png";
            ctx.drawImage(images.board, 112, 32);
        }
        if (settings.gameMechanics == "dragonStyle") { //Update DAS and lock delay
            settings.lockDelay = dragonStyleLockDelay[Math.floor(level/100)];
        }
    }
    else if (settings.visuals == "tgm" && Math.floor(level/100) < Math.floor((level+linesCleared)/100)) { //TGM level up
        let currentBackground = Math.floor((level+linesCleared)/100);
        ctx.drawImage(images.background, currentBackground*320, 0, 320, 240, 0, 0, 320, 240);
        //Draw the board (to be improved)
        ctx.drawImage(images.board, 114, 34);
        ctx.drawImage(images.background2, currentBackground*320+120, 40, 80, 160, 120, 40, 80, 160);
        //Draw the side info
        if ((level+linesCleared) >= 500) {ctx.drawImage(images.sideInfo1, 64, 0, 64, 150, 70, 26, 64, 150);}
        else {ctx.drawImage(images.sideInfo1, 0, 0, 64, 150, 70, 26, 64, 150);}
        setNextPieceVisuals(nextPiece);
        updateVisuals();
        //Update GM qualifier
        if ((level+linesCleared) >= 300 && (score < 12000 || time > 255)) {GMQualifying = false;}
        if ((level+linesCleared) >= 500 && (score < 40000 || time > 450)) {GMQualifying = false;}
    }
    else if (settings.gameMechanics != "classicStyle" && settings.gameMechanics != "masterStyle" && settings.gameMechanics != "dragonStyle" && settings.gameMechanics != "onTheBeat" && settings.gameMechanics != "tgm") {linesUntilNextLevel -= linesCleared;}
    if (linesUntilNextLevel <= 0) {
        level++;
        //Sega level 99 cap
        if (settings.gameMechanics == "sega" && level == 99) {linesUntilNextLevel = Infinity;}
        //Game boy level 20 cap
        if (settings.gameMechanics == "gb" && level == 20) {linesUntilNextLevel = Infinity;}
        //DX level 30 cap
        else if (settings.gameMechanics == "dx" && level == 30) {linesUntilNextLevel = Infinity;}
        else if (settings.gameMechanics == "sega") {linesUntilNextLevel = 4;}
        else {linesUntilNextLevel += 10;}
        if (settings.visuals == "dx") { //Tetris DX background color change
            ctx.fillStyle = Math.floor(Math.min(level,30)/5);
            document.body.style.backgroundColor = dxBackgroundColours[backgroundColor];
        }
        else if (settings.visuals == "sega") { //Sega tetris background change
            let leftSide = 152-settings.boardWidth*4;
            let boardBottom = 8*settings.boardHeight+48;
            let currentBackground = segaBackgroundLevels[Math.min(level, 15)];
            ctx.drawImage(images.background, currentBackground*320, 0, leftSide, 225, 0, 0, leftSide, 225);
            ctx.drawImage(images.background, currentBackground*320+320-leftSide, 0, 320, 225, 320-leftSide, 0, 320, 225);
            ctx.drawImage(images.background, currentBackground*320+leftSide, 0, 320-leftSide, 24, leftSide, 0, 320-leftSide, 24);
            ctx.drawImage(images.background, currentBackground*320+leftSide, boardBottom, 320-leftSide, 320, leftSide, boardBottom, 320-leftSide, 320);
            //Draw the side info
            images.sideInfo1.src = "img/sega/sideInfo.png";
            ctx.drawImage(images.sideInfo1, leftSide-56, 16);
            setNextPieceVisuals(nextPiece);
            updateVisuals();
        }
    }

    //Update score
    let scoreToGain = 0;
    if (!linesCleared && (inCampaignMode() || settings.gameMechanics == "tgm")) {combo = 1;}
    else if (linesCleared && (settings.gameMechanics == "masterStyle" || settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat" || settings.gameMechanics == "tgm")) { ///TGM style
        combo += (linesCleared*2) - 2;
        let finalScore = (Math.ceil((level+linesCleared)/4) + maxPushdown)*combo*linesCleared;
        if (checkPerfectClear()) finalScore *= 4;
        if (settings.gameMechanics == "onTheBeat") finalScore *= 10;
        scoreToGain = finalScore;
        if (!settings.levelLock && settings.gameMechanics != "onTheBeat") level += linesCleared;
        if (level > 999 && settings.gameMechanics != "onTheBeat") level = 999;
        if (settings.visuals != "tgm") playSound("lineClear");
        updateVisuals();
    }
    else if (linesCleared && settings.gameMechanics == "classicStyle") { //Similar to NES/GB/DX
        switch (linesCleared) {
            case 1:
                scoreToGain = 40*Math.ceil(level/50);
                break;
            case 2:
                scoreToGain = 100*Math.ceil(level/50);
                break;
            case 3:
                scoreToGain = 300*Math.ceil(level/50);
                break;
            case 4:
                scoreToGain = 1200*Math.ceil(level/50);
                break;
        }
        if (!settings.levelLock) level += linesCleared;
        if (level > 999) level = 999;
        playSound("lineClear");
        updateVisuals();
    }
    else if (linesCleared && settings.gameMechanics == "sega") {
        let finalScore = segaLineScores[linesCleared-1][Math.min(level,8)];
        if (checkPerfectClear()) finalScore *= 10;
        scoreToGain = finalScore;
    }
    else if (linesCleared) {
        switch (linesCleared) {
            case 1:
                scoreToGain = 40*(level+1);
                break;
            case 2:
                scoreToGain = 100*(level+1);
                break;
            case 3:
                scoreToGain = 300*(level+1);
                break;
            case 4:
                scoreToGain = 1200*(level+1);
                break;
        }
    }
    score += scoreToGain;

    //Update classic style grade
    if (settings.gameMechanics == "classicStyle" && score > classicStyleGradeConditions[grade+1]) {
        while (score > classicStyleGradeConditions[grade+1]) grade++;
        updateVisuals();
    }
    //Update master style grade
    else if (settings.gameMechanics == "masterStyle" && score > masterStyleGradeConditions[grade+1]) {
        while (score > masterStyleGradeConditions[grade+1]) grade++;
        updateVisuals();
    }
    //Update dragon style grade
    else if (settings.gameMechanics == "dragonStyle" && Math.floor(level/50) > grade && grade < 19) {
        grade = Math.floor(level/50);
        updateVisuals();
    }
    else if (settings.gameMechanics == "dragonStyle" && level >= 999 && grade == 19) {
        grade = 20;
        updateVisuals();
    }

    //Update TGM grade
    if (settings.gameMechanics == "tgm" && score > tgmGradeConditions[grade+1]) {
        while (score > tgmGradeConditions[grade+1]) grade++;
        updateVisuals();
    }
    if (level == 999 && GMQualifying && score >= 126000 && time < 810) {grade = 18; updateVisuals();} //GM grade

    //Line clear visuals
    if (settings.ARELineClear == 0 && linesCleared > 0) { //No ARE
        let fullLines = checkFullLines();
        for (const line of fullLines) {
            //Move all lines above the cleared line down
            for (let j = 0; j < settings.boardWidth; j++) {
                board[line][j] = 0;
            }
            for (let j = line; j > 0; j--) {
                for (let k = 0; k < settings.boardWidth; k++) {
                    board[j][k] = board[j - 1][k];
                }
            }
        }
        updateVisuals();
    }

    else if ((inCampaignMode()) && linesCleared > 0) { //Main line clear visuals
        let fullLines = checkFullLines();
        let piecesInFullLines = [];
        for (let i = 0; i < fullLines.length; i++) { //Copy the pieces in the full lines
            piecesInFullLines.push([]);
            for (let j=0;j<settings.boardWidth;j++) {
                piecesInFullLines[i].push(board[fullLines[i]][j]);
            }
        }
        //Empty full lines
        for (const line of fullLines) {
            for (let j = 0; j < settings.boardWidth; j++) {
                board[line][j] = 0;
            }
        }
        updateVisuals();
        let startTime = Date.now()
        visualInterval = mainVisualClearLines(startTime, [...fullLines], piecesInFullLines);
        let lineClearLength = Math.max(Math.min(12, currentDropTime-2),0);
        if (settings.visuals == "dragonStyle") {
            lineClearLength = dragonStyleLineClear[Math.floor(level/100)];
        }
        setTimeout(function() {mainClearLines([...fullLines])}, 1000 / 60 * lineClearLength);
    }
    
    else if (settings.visuals == "gb" && linesCleared > 0) {visualInterval = GBVisualClearLines(1);}
    else if (settings.visuals == "nes" && linesCleared > 0) {visualInterval = setTimeout(NESVisualClearLines, 1000/12, 1);}
    else if (settings.visuals == "dx" && linesCleared > 0) {visualInterval = DXVisualClearLines(1);}
    else if (settings.visuals == "sega" && linesCleared > 0) {visualInterval = segaVisualClearLines(1, scoreToGain)}
    else if (settings.visuals == "tgm" && linesCleared > 0) {visualInterval = TGMVisualClearLines(1, checkFullLines())}
}

function mainVisualClearLines(startTime, fullLinesTemp, piecesInFullLines) {
    let leftSide = 160 - settings.boardWidth * 4;
    let dt = Date.now() - startTime;
    let stage = Math.floor(dt / 16.667 + 0.05);

    effectCtx.clearRect(0, 0, 320, 240);
    if (stage < 11) {
        for (let i = 0; i < fullLinesTemp.length; i++) {
            let line = fullLinesTemp[i];
            for (let j = 0; j < settings.boardWidth; j++) { //Display the pieces in the line on the effectOverlay canvas
                if ((i+j)%2 == 0) continue; //Skip every other tile
                effectCtx.drawImage(images.tileVanish, stage*64, (piecesInFullLines[i][j])*64-64, 64, 64, j*8 + leftSide - 28, line*8+12, 64, 64);
                //ctx.drawImage(images.tiles, 8, (board[i][j])*8, 8, 8, j*8+leftSide, i*8+40, 8, 8
            }
        }
        visualInterval = setTimeout(function() {mainVisualClearLines(startTime, fullLinesTemp, piecesInFullLines)}, 1000 / 60);
    }
}

function mainClearLines(fullLinesTemp) {
    for (const line of fullLinesTemp) {
        //Move all lines above the cleared line down
        for (let j = 0; j < settings.boardWidth; j++) {
            board[line][j] = 0;
        }
        for (let j = line; j > 0; j--) {
            for (let k = 0; k < settings.boardWidth; k++) {
                board[j][k] = board[j - 1][k];
            }
        }
        for (let j = 0; j < settings.boardWidth; j++) { //Top row
            board[0][j] = 0;
        }
    }
    updateVisuals();
}

function GBVisualClearLines(stage) {
    let fullLines = checkFullLines();
    let leftSide = 120 - settings.boardWidth * 4;
    if (stage == 1 || stage == 3 || stage == 5) {
        ctx.fillStyle = "#84a563";
        for (let i = 0; i < fullLines.length; i++) {
            ctx.fillRect(leftSide + 16, fullLines[i] * 8, settings.boardWidth * 8, 8);
        }
        visualInterval = setTimeout(function() {GBVisualClearLines(stage + 1)}, 1000 / 6);
    }
    else if (stage == 2 || stage == 4 || stage == 6) {
        for (const line of fullLines) {
            ctx.fillStyle = "#c6de86";
            for (let j = 0; j < settings.boardWidth; j++) {
                if (settings.pieceColouring == "border") {ctx.fillRect(leftSide + 16, line * 8, settings.boardWidth * 8, 8);}
                else {ctx.drawImage(images.tiles, 0, board[line][j] * 8 - 16, 8, 8, j * 8 + leftSide + 16, line * 8, 8, 8);}
            }
        }
        visualInterval = setTimeout(function() {GBVisualClearLines(stage + 1)}, 1000 / 6);
    }
    else {
        ctx.fillStyle = "#c6de86";
        for (const line of fullLines) {
            ctx.fillRect(leftSide + 16, line * 8, settings.boardWidth * 8, 8);
            moveLineDown(line);
            setTimeout(updateVisuals, 1000/3);
        }
    }
}

function NESVisualClearLines(width) {
    let fullLines = checkFullLines();
    let leftSide = 160-settings.boardWidth*4;
    let roundedWidth = settings.boardWidth;
    if (roundedWidth%2 == 1) roundedWidth--;
    ctx.fillStyle = "black";
    if (width < roundedWidth/2) {
        let pieceColorSet;
        if (inCampaignMode()) {pieceColorSet = Math.floor(level/100);}
        else {pieceColorSet = level%10;}
        for (let i=0;i<fullLines.length;i++) {
            let line = fullLines[i];
            //Redraw all the tiles in the line (makes them visible if invisible board is enabled)
            for (let j=0;j<settings.boardWidth;j++) {
                if (settings.pieceColouring == "monotoneFixed" || settings.pieceColouring == "monotoneAll") {
                    ctx.drawImage(images.tiles, nesPieceTiles[board[line][j]-1]*8, 80, 8, 8, j*8+leftSide+8, line*8+32, 8, 8);
                } else if (settings.pieceColouring != "border") {
                    ctx.drawImage(images.tiles, nesPieceTiles[board[line][j]-1]*8, pieceColorSet*8, 8, 8, j*8+leftSide+8, line*8+32, 8, 8);
                }
            }
            //Draw the blacked out section
            if (settings.pieceColouring != "border") ctx.fillRect(leftSide+(roundedWidth*4)-(width*8)+8, line*8+32, width*16, 8);
        }
        visualInterval = setTimeout(function() {NESVisualClearLines(width+1)}, 1000/15);
    }
    else {
        for (const line of fullLines) {
            ctx.fillRect(leftSide+(roundedWidth*4)-(width*8)+8, line*8+32, width*16, 8);
            moveLineDown(line);
            setTimeout(updateVisuals, 1000/15);
        }
    }
}

function DXVisualClearLines(stage) {
    let fullLines = checkFullLines();
    let leftSide = 120 - settings.boardWidth * 4;
    if (stage == 1 || stage == 3) {
        ctx.fillStyle = "white";
        for (const line of fullLines) {
            ctx.fillRect(leftSide + 16, line * 8, settings.boardWidth * 8, 8);
        }
        visualInterval = setTimeout(function() {DXVisualClearLines(stage + 1)}, 1000 / 4);
    }
    else if (stage == 2) {
        let backgroundColor = Math.floor(Math.min(level,30)/5);
        ctx.fillStyle = dxBackgroundColours[backgroundColor];
        for (const line of fullLines) {
            for (let j = 0; j < settings.boardWidth; j++) {
                if (settings.pieceColouring == "monotoneFixed" || settings.pieceColouring == "monotoneAll") {ctx.drawImage(images.tiles, 8, board[line][j] * 8 - 16, 8, 8, j * 8 + leftSide + 16, line * 8, 8, 8);}
                else if (settings.pieceColouring == "border") {ctx.fillRect(leftSide + 16, line * 8, settings.boardWidth * 8, 8);}
                else {ctx.drawImage(images.tiles, 0, board[line][j] * 8 - 16, 8, 8, j * 8 + leftSide + 16, line * 8, 8, 8);}
            }
        }
        visualInterval = setTimeout(function() {DXVisualClearLines(stage + 1)}, 1000 / 4);
    }
    else {
        fullLines.forEach(moveLineDown);
        updateVisuals();
    }
}

function segaVisualClearLines(stage, scoreGained) {
    let fullLines = checkFullLines();
    let leftSide = 120 - settings.boardWidth * 4;
    if (stage < 14) {
        if (stage < 8) {
            for (let i = 0; i < fullLines.length; i++) {
                for (let j = 0; j < settings.boardWidth ; j++) {
                    ctx.drawImage(images.tileVanish, 0, Math.min(stage-1,6)*8, 8, 8, j*8+leftSide+40, fullLines[i]*8+32, 8, 8);
                }
            }
        }
        //Draw score text in line
        else if (stage == 8) {
            let scoreString = scoreGained.toString();
            let bottomFullLineRow = fullLines[fullLines.length-1];
            switch (scoreString.length) {
                case 2:
                    ctx.drawImage(images.digits, parseInt(scoreString[0])*8, 0, 8, 8, leftSide+72, bottomFullLineRow*8+24, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[1])*8, 0, 8, 8, leftSide+80, bottomFullLineRow*8+24, 8, 8);
                    break;
                case 3:
                    ctx.drawImage(images.digits, parseInt(scoreString[0])*8, 0, 8, 8, leftSide+72, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[1])*8, 0, 8, 8, leftSide+80, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[2])*8, 0, 8, 8, leftSide+88, bottomFullLineRow*8+32, 8, 8);
                    break;
                case 4:
                    ctx.drawImage(images.digits, parseInt(scoreString[0])*8, 0, 8, 8, leftSide+64, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[1])*8, 0, 8, 8, leftSide+72, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[2])*8, 0, 8, 8, leftSide+80, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[3])*8, 0, 8, 8, leftSide+88, bottomFullLineRow*8+32, 8, 8);
                    break;
                case 5:
                    ctx.drawImage(images.digits, parseInt(scoreString[0])*8, 0, 8, 8, leftSide+56, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[1])*8, 0, 8, 8, leftSide+64, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[2])*8, 0, 8, 8, leftSide+72, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[3])*8, 0, 8, 8, leftSide+80, bottomFullLineRow*8+32, 8, 8);
                    ctx.drawImage(images.digits, parseInt(scoreString[4])*8, 0, 8, 8, leftSide+88, bottomFullLineRow*8+32, 8, 8);
                    break;
                default:
                    break;
            }
        }
        visualInterval = setTimeout(function() {segaVisualClearLines(stage + 1, scoreGained)}, 1000 / 20);
    }
    else {
        fullLines.forEach(moveLineDown);
        updateVisuals();
    }
}

function TGMVisualClearLines(stage, fullLinesTemp) {
    if (stage == 1) {
        //Empty full lines
        for (const line of fullLinesTemp) {
            for (let j = 0; j < settings.boardWidth; j++) {
                board[line][j] = 0;
            }
        }
        updateVisuals();
        visualInterval = setTimeout(function() {TGMVisualClearLines(2, fullLinesTemp)}, (1000 / 60) * 41);
    }
    else {
        for (const line of fullLinesTemp) {
            //Move all lines above the cleared line down
            for (let j = 0; j < settings.boardWidth; j++) {
                board[line][j] = 0;
            }
            for (let j = line; j > 0; j--) {
                for (let k = 0; k < settings.boardWidth; k++) {
                    board[j][k] = board[j - 1][k];
                }
            }
            for (let j = 0; j < settings.boardWidth; j++) { //Top row
                board[0][j] = 0;
            }
        }
        updateVisuals();
    }w
    
}

function moveLineDown(line) {
    //Move all lines above the cleared line down
    for (let j = 0; j < settings.boardWidth; j++) {
        board[line][j] = 0;
    }
    for (let j = line; j > 0; j--) {
        for (let k = 0; k < settings.boardWidth; k++) {
            board[j][k] = board[j - 1][k];
        }
    }
    for (let j = 0; j < settings.boardWidth; j++) { //Top row
        board[0][j] = 0;
    }
}

function endGame() {
    gamePlaying = false;
    if (inCampaignMode()) {
        fadeOutSound('gameMusic', 1000);
        let currentBeatTime;
        if (gameMusic7) currentBeatTime = gameMusic7.seek() * (155/60);
        if ((level < 999 && settings.gameMechanics != "onTheBeat") || (settings.gameMechanics == "onTheBeat" && currentBeatTime < 424)) {
            playSound("end");
            landPiece();
        }
        else {playSound("finish");}
        let leftSide = 160-settings.boardWidth*4;
        //Clear the canvas
        //ctx.fillStyle = "black";
        //ctx.fillRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
        ctx.clearRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
        ctx.drawImage(images.sideInfo4, leftSide, 40);
        //Board pieces
        for (let i=0;i<settings.boardHeight;i++) {
            for (let j=0;j<settings.boardWidth;j++) {
                if (board[i][j] != 0) {
                    if (settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll") {ctx.drawImage(images.tiles, 8, 0, 8, 8, j*8+leftSide, i*8+40, 8, 8);}
                    else {ctx.drawImage(images.tiles, 8, (board[i][j])*8, 8, 8, j*8+leftSide, i*8+40, 8, 8);}
                }
            }
        }
        //Finish text
        if ((level >= 999 && settings.gameMechanics != "onTheBeat") || (settings.gameMechanics == "onTheBeat" && currentBeatTime >= 424)) ctx.drawImage(images.sideInfo3, 0, 0, 79, 7, 121, 105, 79, 7);
        ctx.drawImage(images.sideInfo3, 0, 8, 79, 7, 121, 113, 79, 7);
        //Average section time
        let averageSectionTime;
        if (sectionTimes.length > 0) { 
            ctx.drawImage(images.sideInfo3, 0, 16, 79, 7, 121, 169, 79, 7);
            averageSectionTime = sectionTimes[0] ? sectionTimes[0] : 0;
            for (let i=1;i<sectionTimes.length;i++) {
                if (sectionTimes[i] && sectionTimes[i-1]) {averageSectionTime += (sectionTimes[i] - sectionTimes[i-1]);}
                else if (sectionTimes[i]) {averageSectionTime += (sectionTimes[i]);}
            }
            averageSectionTime /= getSectionTimesLength();

            let timeString = convertToTime(averageSectionTime);
            let sectionTimeColor = getTimeColor(averageSectionTime);

            for (let i=0;i<timeString.length;i++) {
                if (timeString[i] == ":") {ctx.drawImage(images.sideInfo2, 40, sectionTimeColor*6, 4, 6, 145+i*4, 177, 4, 6);}
                else {ctx.drawImage(images.sideInfo2, parseInt(timeString[i])*4, sectionTimeColor*6, 4, 6, 145+i*4, 177, 4, 6);}
            }

            if (level >= 999 && inCampaign && settings.gameMechanics != "onTheBeat") {
                //Best average section time
                if (settings.gameMechanics == "classicStyle" && averageSectionTime < game.bestAverageSectionTimes[0]) game.bestAverageSectionTimes[0] = averageSectionTime;
                else if (settings.gameMechanics == "masterStyle" && averageSectionTime < game.bestAverageSectionTimes[1]) game.bestAverageSectionTimes[1] = averageSectionTime;
                else if (settings.gameMechanics == "dragonStyle" && averageSectionTime < game.bestAverageSectionTimes[2]) game.bestAverageSectionTimes[2] = averageSectionTime;
                //Best highest section time
                let highestSectionTime = sectionTimes[0];
                for (let i=1;i<sectionTimes.length;i++) {
                    if (sectionTimes[i] && sectionTimes[i] - sectionTimes[i-1] > highestSectionTime) highestSectionTime = (sectionTimes[i] - sectionTimes[i-1]);
                }
                if (settings.gameMechanics == "classicStyle" && highestSectionTime < game.bestHighestSectionTimes[0]) game.bestHighestSectionTimes[0] = highestSectionTime;
                else if (settings.gameMechanics == "masterStyle" && highestSectionTime < game.bestHighestSectionTimes[1]) game.bestHighestSectionTimes[1] = highestSectionTime;
                else if (settings.gameMechanics == "dragonStyle" && highestSectionTime < game.bestHighestSectionTimes[2]) game.bestHighestSectionTimes[2] = highestSectionTime;
            }
            
            if (inCampaign) {
                //Individual best section times
                if (settings.gameMechanics == "classicStyle" && (sectionTimes[0] < game.classicStyleBestSectionTimes[0] || !game.classicStyleBestSectionTimes[0])) game.classicStyleBestSectionTimes[0] = sectionTimes[0];
                else if (settings.gameMechanics == "masterStyle" && (sectionTimes[0] < game.masterStyleBestSectionTimes[0] || !game.masterStyleBestSectionTimes[0])) game.masterStyleBestSectionTimes[0] = sectionTimes[0];
                else if (settings.gameMechanics == "dragonStyle" && (sectionTimes[0] < game.dragonStyleBestSectionTimes[0] || !game.dragonStyleBestSectionTimes[0])) game.dragonStyleBestSectionTimes[0] = sectionTimes[0];
                for (let i=1;i<sectionTimes.length;i++) {
                    if (settings.gameMechanics == "classicStyle" && (sectionTimes[i] - sectionTimes[i-1] < game.classicStyleBestSectionTimes[i] || !game.classicStyleBestSectionTimes[i])) game.classicStyleBestSectionTimes[i] = (sectionTimes[i] - sectionTimes[i-1]);
                    else if (settings.gameMechanics == "masterStyle" && (sectionTimes[i] - sectionTimes[i-1] < game.masterStyleBestSectionTimes[i] || !game.masterStyleBestSectionTimes[i])) game.masterStyleBestSectionTimes[i] = (sectionTimes[i] - sectionTimes[i-1]);
                    else if (settings.gameMechanics == "dragonStyle" && (sectionTimes[i] - sectionTimes[i-1] < game.dragonStyleBestSectionTimes[i] || !game.dragonStyleBestSectionTimes[i])) game.dragonStyleBestSectionTimes[i] = (sectionTimes[i] - sectionTimes[i-1]);
                }
            }
        }
        //Power
        ctx.drawImage(images.sideInfo3, 0, 24, 79, 7, 121, 185, 79, 7);
        let power = 0;
        if (settings.gameMechanics == "classicStyle") {
            power = (level+1)*15; //Level component
            if (sectionTimes.length > 0) power += Math.max((1875000 / averageSectionTime - 20000), 0); //Section time component
            power += score ** 0.5 * 8; //Score component
            if (inCampaign && power > game.bestPowers[0]) game.bestPowers[0] = power;
            if (inCampaign && score > game.bestScores[0]) game.bestScores[0] = score;
            if (inCampaign && level > game.bestLevels[0]) game.bestLevels[0] = level;
        }
        else if (settings.gameMechanics == "masterStyle") {
            power = (level+1)*15; //Level component
            if (sectionTimes.length > 0) power += Math.max((2800000 / averageSectionTime - 30000), 0); //Section time component
            if (inCampaign && power > game.bestPowers[1]) game.bestPowers[1] = power;
            if (inCampaign && score > game.bestScores[1]) game.bestScores[1] = score;
            if (inCampaign && level > game.bestLevels[1]) game.bestLevels[1] = level;
        }
        else if (settings.gameMechanics == "dragonStyle") {
            power = (level+1)*20; //Level component
            if (sectionTimes.length > 0) power += Math.max((1200000 / averageSectionTime - 20000), 0); //Section time component
            if (inCampaign && power > game.bestPowers[2]) game.bestPowers[2] = power;
            if (inCampaign && score > game.bestScores[2]) game.bestScores[2] = score;
            if (inCampaign && level > game.bestLevels[2]) game.bestLevels[2] = level;
        }
        else if (settings.gameMechanics == "onTheBeat") {
            if (inCampaign && score > game.onTheBeatBests[0]) game.onTheBeatBests[0] = score;
            if (inCampaign && level > game.onTheBeatBests[1]) game.onTheBeatBests[1] = level;
        }
        
        let powerString = Math.floor(power).toString();
        if (powerString == "0") powerString = "";
        for (let i=0;i<(5-powerString.length);i++) {ctx.drawImage(images.sideInfo2, 0, 24, 4, 6, 150+i*4, 193, 4, 6);} //Greyed out zeroes
        let powerColor;
        if (settings.gameMechanics == "classicStyle" && power >= 30000) {powerColor = 3;}
        else if (settings.gameMechanics == "masterStyle" && power >= 39000) {powerColor = 3;}
        else if (settings.gameMechanics == "dragonStyle" && power >= 30000) {powerColor = 3;}
        else {powerColor = 0;}
        for (let i=0;i<powerString.length;i++) {ctx.drawImage(images.sideInfo2, parseInt(powerString[i])*4, powerColor*6, 4, 6, 170 - (4*powerString.length) + i*4, 193, 4, 6);}
    }
    else if (settings.visuals == "gb") {displayEndingLine(0);}
    else if (settings.visuals == "nes") {setTimeout(function() {displayEndingLine(0)}, 1200);}
    else if (settings.visuals == "dx") {setTimeout(function() {displayEndingLine(0)}, 1000);}
    else if (settings.visuals == "sega") {return;} //to do
    else if (settings.visuals == "tgm") {
        if (level < 999) landPiece();
        let leftSide = 160-settings.boardWidth*4;
        //Clear the canvas
        let currentBackground = Math.floor(level/100);
        ctx.drawImage(images.background2, currentBackground*320+120, 40, 80, 160, 120, 40, 80, 160);
        //Board pieces
        for (let i=0;i<settings.boardHeight;i++) {
            for (let j=0;j<settings.boardWidth;j++) {
                if (board[i][j] != 0) {
                    if (settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll") {ctx.drawImage(images.tiles, 8, 0, 8, 8, j*8+leftSide, i*8+40, 8, 8);}
                    else {ctx.drawImage(images.tiles, 8, (board[i][j])*8, 8, 8, j*8+leftSide, i*8+40, 8, 8);}
                }
            }
        }
        if (settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll") {setTimeout(returnToMenu, 1500);}
        else {setTimeout(function() {displayEndingLine(0)}, 1000/12);}
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