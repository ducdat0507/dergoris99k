// Main game flow and loop moved from script.js

function startGameFromUI() {
    if (blackCoverShown) return;
    showBlackCover();
    playSound('buttonClick'); 
    fadeOutSound('menuMusic', 500); 
    setTimeout(startGame, 1000)
}

function startGame() {
    hideBlackCover();
    stopSound("menuMusic");

    level = settings.startingLevel;
    document.getElementsByClassName("container")[1].style.display = "none"; //Campaign screen
    document.getElementsByClassName("container")[2].style.display = "none"; //Custom game screen
    document.getElementById("overallGradeCanvas").style.display = "none";
    document.getElementById("backgroundCanvas").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("effectOverlay").style.display = "block";
    document.getElementById("textOverlay").style.display = "block";
    setActiveForm(null);
    drawInputPrompts([])
    setMouseNavs([])

    backgroundZOffset = backgroundZOffsetSpeed = backgroundZOffsetTargetSpeed = 0;

    //Setting webGL canvas attributes
    if (settings.visuals == "classicStyle") {
        document.getElementById("gameCanvas").style.display = game.gameBackgroundEnabled ? "block" : "none";
        seaColor = [11, 72, 142];
        waveColor = [15, 120, 152];
        sunColor = [225, 230, 200];
    }
    else if (settings.visuals == "masterStyle") {
        document.getElementById("gameCanvas").style.display = game.gameBackgroundEnabled ? "block" : "none";
        seaColor = [11, 122, 142];
        waveColor = [15, 120, 152];
        sunColor = [225, 230, 200];
    }
    else if (settings.visuals == "dragonStyle") {
        grade = Math.floor(level / 50);
        document.getElementById("gameCanvas").style.display = game.gameBackgroundEnabled ? "block" : "none";
        if (level >= 500) {
            seaColor = [30, 30, 30];
            waveColor = [70, 70, 70];
            sunColor = [225, 230, 200];
        }
        else {
            seaColor = [22, 22, 142];
            waveColor = [15, 30, 152];
            sunColor = [225, 230, 200];
        }
    }
    else if (settings.visuals == "onTheBeat") {
        document.getElementById("gameCanvas").style.display = game.gameBackgroundEnabled ? "block" : "none";
        seaColor = [0, 0, 0];
        waveColor = [40, 40, 40];
        sunColor = [150, 150, 150];
    }

    if (inCampaignMode()) {
        linesUntilNextLevel = 100;
        lastDroppedPieces = [3, 4, 4, 3];
    }
    initialiseCanvasBoard();
    for (let i = 0; i < settings.boardHeight; i++) board.push(Array(settings.boardWidth).fill(0));
    if (settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle" || settings.visuals == "onTheBeat") { readyGo(1); } else {
        gamePlaying = true;
        placePiece(getRandomPiece());
        nextPiece = getRandomPiece();
        setNextPieceVisuals(nextPiece);
        drawGame();
    }
}

function updateVariables() {

    // Handle "On the Beat" mode intro section timing (must run even when gamePlaying is false)
    if (settings.gameMechanics == "onTheBeat" && gameMusic7) {

        let currentBeatTime = gameMusic7.seek() * (155 / 60); //155 BPM
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

        // Handle beat-based piece landing and progression (only during gameplay)
        if (gamePlaying) {
            // Grade progression based on beat time
            while (currentBeatTime > onTheBeatGradePoints[grade]) {
                grade++;
                // Update grade visuals if needed
            }

            // Beat-based piece landing - pieces automatically land on beats
            if (currentBeatTime > onTheBeatBeats[beatsPassed + 1]) {
                // Calculate beat speed for next beat
                currentBeatSpeed = 0;
                if (onTheBeatBeats[beatsPassed + 2] - onTheBeatBeats[beatsPassed + 1] <= 0.5) currentBeatSpeed = 3;
                else if (onTheBeatBeats[beatsPassed + 2] - onTheBeatBeats[beatsPassed + 1] <= 0.75) currentBeatSpeed = 2;
                else if (onTheBeatBeats[beatsPassed + 2] - onTheBeatBeats[beatsPassed + 1] <= 1) currentBeatSpeed = 1;

                // Auto hard drop and land the piece on the beat
                if (!waitingForNextPiece) {
                    maxDrop(); // Hard drop (20G)
                    landPiece(); // Land the piece
                }
            }

            // Update beats passed counter
            while (currentBeatTime > onTheBeatBeats[beatsPassed + 1]) beatsPassed++;
        }
    }

    // Return early if not playing
    if (!gamePlaying) {
        timeOfLastUpdate = Date.now();
        return;
    }

    let zSpeed = 0;
    switch (settings.gameMechanics) 
    {
        case "classicStyle":
            zSpeed = 15 / Math.max(getDropInterval(), 0.05);
            break;
        case "masterStyle":
            zSpeed = 3 / Math.max(Math.sqrt(getDropInterval()), 0.05);
            break;
        case "dragonStyle":
            zSpeed = 50 / dragonStyleLockDelay[Math.floor(level/100)];
            break;
        default:
            zSpeed = 0;
            break;
    }
    backgroundZOffsetTargetSpeed = zSpeed;

    let timeMultiplier = Math.max(Date.now() - timeOfLastUpdate, 1) / 1000;
    time += timeMultiplier;

    // Rotation edge-triggered updates
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

    if (keysHeld[8] == 1) { // Restart
        restartTimer += timeMultiplier;
        restartTimerUI = Math.min(restartTimerUI + timeMultiplier * 2, 1);
        exitTimerUI = Math.max(exitTimerUI - timeMultiplier * 3, 0);
    } else {
        restartTimer = Math.max(restartTimer - timeMultiplier * 3, 0);
        restartTimerUI = Math.max(restartTimerUI - timeMultiplier, 0);
    }
    if (restartTimer > 1) {
        gamePlaying = false;
        restartGame();
    }

    if (keysHeld[9] == 1) { // Exit
        exitTimer += timeMultiplier;
        exitTimerUI = Math.min(exitTimerUI + timeMultiplier * 2, 1);
        restartTimerUI = Math.max(restartTimerUI - timeMultiplier * 3, 0);
    } else {
        exitTimer = Math.max(exitTimer - timeMultiplier * 3, 0);
        exitTimerUI = Math.max(exitTimerUI - timeMultiplier, 0);
    }
    if (exitTimer > 1) {
        gamePlaying = false;
        showBlackCover();
        setTimeout(returnToMenu, 1000);
    }

    // Horizontal DAS
    if (keysHeld[0] && !waitingForNextPiece) {
        if (!checkCanMoveLeft()) { currentDASTime = 0; } //Wall charge
        else {
            currentDASTime -= (timeMultiplier * 60);
            while (currentDASTime <= 0) {
                moveLeft();
                currentDASTime += getDAS();
            }
        }
    }
    else if (keysHeld[1] && !waitingForNextPiece) {
        if (!checkCanMoveRight()) { currentDASTime = 0; } //Wall charge
        else {
            currentDASTime -= (timeMultiplier * 60);
            while (currentDASTime <= 0) {
                moveRight();
                currentDASTime += getDAS();
            }
        }
    }

    // Lock time update when landed
    if (checkPieceLanded(piecePositions) && locking) {
        currentLockTime -= (timeMultiplier * 60);
        drawGame();
    }

    // Gravity
    currentDropTime -= (timeMultiplier * 60);
    while (currentDropTime <= 0.01) {
        if (waitingForNextPiece) {
            if (settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat") {
                placePiece(onTheBeatNextPieces[0]);
                onTheBeatNextPieces[0] = onTheBeatNextPieces[1];
                onTheBeatNextPieces[1] = onTheBeatNextPieces[2];
                onTheBeatNextPieces[2] = getRandomPiece();
                setNextPieceVisuals(onTheBeatNextPieces[0], 0);
                setNextPieceVisuals(onTheBeatNextPieces[1], 1);
                setNextPieceVisuals(onTheBeatNextPieces[2], 2);
            } else {
                placePiece(nextPiece);
                nextPiece = getRandomPiece();
                // Next piece sound removed for classic modes
                setNextPieceVisuals(nextPiece);
            }
            drawGame();
            if (inCampaignMode() && settings.gameMechanics != "onTheBeat" && keysHeld[3]) { //Starting soft drop if key is held
                currentDropTime = Math.min(getDropInterval(), settings.softDropSpeed);
                softDropping = true;
            }
            else if (settings.gameMechanics == "dx") { currentDropTime = 32; }
            else { currentDropTime = getDropInterval() }
        }
        else if (checkPieceLanded(piecePositions) && (locking || settings.lockDelay == 0) && (currentLockTime <= 0.01 || softDropping)) { landPiece(); }
        else {
            if (!checkPieceLanded(piecePositions)) {
                if (settings.lockReset == "step") locking = false;
                if (getDropInterval() <= 0.05) maxDrop(); //20G
                else {
                    // Move all blocks in the active piece down by 1 row
                    for (let i = 0; i < piecePositions.length; i++) {
                        piecePositions[i][0]++;
                    }
                    pieceTopCorner[0]++;
                    // Land sound removed for classic modes
                }
            }
            // Soft drop handling
            if (settings.softDrop && softDropping) {
                currentDropTime += Math.min(getDropInterval(), settings.softDropSpeed);
                currentPushdown++;
                if (settings.gameMechanics == "dx") score++;
                else if (settings.gameMechanics == "sega") score += segaSoftdropScores[Math.min(level, 8)];
                if (currentPushdown > maxPushdown) maxPushdown = currentPushdown;
            }
            else if (locking) { currentDropTime = 1; }
            else { currentDropTime += getDropInterval(); }
            drawGame();
            if (checkPieceLanded(piecePositions) && !locking && settings.lockDelay != 0) {
                locking = true;
                currentLockTime = settings.lockDelay;
            }
        }
    }

    drawGame();
    timeOfLastUpdate = Date.now();
}

setInterval(updateVariables, 1000 / 60);

function readyGo(stage) {
    if (stage == 1) {
        gameReadying = true;

        let leftSide = 160 - settings.boardWidth * 4;
        //Get the current piece to display as the next piece
        if (settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat") {
            onTheBeatNextPieces[0] = getRandomPiece();
            TGMFirstMove = false;
            onTheBeatNextPieces[1] = getRandomPiece();
            onTheBeatNextPieces[2] = getRandomPiece();
        }
        else { nextPiece = getRandomPiece(); }
        waitingForNextPiece = true;
        stopSound("gameMusic");
        if (settings.visuals == "onTheBeat") {
            introSection = 1;
            playSound("gameMusic");
            setSoundVolume("gameMusic", game.musicVolume);
        }
        else {
            playSound("ready");
        }


        if (settings.visuals == "tgm") {
            //Clear the canvas
            let currentBackground = Math.floor(level / 100);
            ctx.drawImage(images.background2, currentBackground * 320 + 120, 40, 80, 160, 120, 40, 80, 160);
            //Display "Ready"
            ctx.drawImage(images.readyGo, 0, 0, 76, 19, 122, 110, 76, 19);
            setTimeout(readyGo, 1000, 2);

            //Grade
            ctx.drawImage(images.grades, 27 * grade, 0, 27, 26, 84, 34, 27, 26);

            //Next piece
            setNextPieceVisuals(nextPiece);

            //Text (Copied from drawGame, any change there should also happen here)
            //This is a lot of code duplication! Find a way to reduce this ASAP
            let nextGradeString;
            let nextGradeLength;
            if (grade >= 17) {
                nextGradeString = "??????";
                nextGradeLength = 6;
                ctx.drawImage(images.background, currentBackground * 320 + leftSide - 8 - nextGradeLength * 8, 80, nextGradeLength * 8, 9, leftSide - 8 - nextGradeLength * 8, 79, nextGradeLength * 8, 9);
                for (let i = 0; i < nextGradeLength; i++) {
                    if (level >= 500) { ctx.drawImage(images.digits, 80, 9, 8, 9, leftSide - 8 - nextGradeLength * 8 + i * 8, 80, 8, 9); }
                    else { ctx.drawImage(images.digits, 80, 0, 8, 9, leftSide - 8 - nextGradeLength * 8 + i * 8, 80, 8, 9); }
                }
            }
            else {
                nextGradeString = tgmGradeConditions[grade + 1].toString();
                nextGradeLength = nextGradeString.length;
                ctx.drawImage(images.background, currentBackground * 320 + leftSide - 8 - nextGradeLength * 8, 80, nextGradeLength * 8, 9, leftSide - 8 - nextGradeLength * 8, 79, nextGradeLength * 8, 9);
                for (let i = 0; i < nextGradeLength; i++) {
                    if (level >= 500) { ctx.drawImage(images.digits, parseInt(nextGradeString[i]) * 8, 9, 8, 9, leftSide - 8 - nextGradeLength * 8 + i * 8, 80, 8, 9); }
                    else { ctx.drawImage(images.digits, parseInt(nextGradeString[i]) * 8, 0, 8, 9, leftSide - 8 - nextGradeLength * 8 + i * 8, 80, 8, 9); }
                }
            }

            let scoreString = score.toString();
            let scoreLength = scoreString.length;
            ctx.drawImage(images.background, currentBackground * 320 + leftSide - 9 - scoreLength * 8, 144, scoreLength * 8, 9, leftSide - 9 - scoreLength * 8, 144, scoreLength * 8, 9);
            for (let i = 0; i < scoreLength; i++) {
                if (level >= 500) { ctx.drawImage(images.digits, parseInt(scoreString[i]) * 8, 9, 8, 9, leftSide - 9 - scoreLength * 8 + i * 8, 144, 8, 9); }
                else { ctx.drawImage(images.digits, parseInt(scoreString[i]) * 8, 0, 8, 9, leftSide - 9 - scoreLength * 8 + i * 8, 144, 8, 9); }
            }

            let levelString = level.toString();
            let levelLength = levelString.length;
            ctx.drawImage(images.background, currentBackground * 320 + leftSide - 9 - levelLength * 8, 181, levelLength * 8, 9, leftSide - 9 - levelLength * 8, 181, levelLength * 8, 9);
            for (let i = 0; i < levelLength; i++) {
                if (level >= 500) { ctx.drawImage(images.digits, parseInt(levelString[i]) * 8, 9, 8, 9, leftSide - 9 - levelLength * 8 + i * 8, 181, 8, 9); }
                else { ctx.drawImage(images.digits, parseInt(levelString[i]) * 8, 0, 8, 9, leftSide - 9 - levelLength * 8 + i * 8, 181, 8, 9); }
            }

            let levelString2 = (level >= 900 ? "999" : ((Math.floor(level / 100) + 1) * 100).toString());
            let levelLength2 = levelString2.length;
            ctx.drawImage(images.background, currentBackground * 320 + leftSide - 9 - levelLength2 * 8, 197, levelLength2 * 8, 9, leftSide - 9 - levelLength2 * 8, 197, levelLength2 * 8, 9);
            for (let i = 0; i < levelLength2; i++) {
                if (level >= 500) { ctx.drawImage(images.digits, parseInt(levelString2[i]) * 8, 9, 8, 9, leftSide - 9 - levelLength2 * 8 + i * 8, 197, 8, 9); }
                else { ctx.drawImage(images.digits, parseInt(levelString2[i]) * 8, 0, 8, 9, leftSide - 9 - levelLength2 * 8 + i * 8, 197, 8, 9); }
            }

            //Level bar
            if (level >= 500) { ctx.drawImage(images.sideInfo2, 0, 14, 22, 2, leftSide - 32, 192, 22, 2); }
            else if (level >= 450) { ctx.drawImage(images.sideInfo2, 0, 6, 22, 2, leftSide - 32, 192, 22, 2); }
            else if (level >= 420) { ctx.drawImage(images.sideInfo2, 0, 8, 22, 2, leftSide - 32, 192, 22, 2); }
            else if (level >= 400) { ctx.drawImage(images.sideInfo2, 0, 10, 22, 2, leftSide - 32, 192, 22, 2); }
            else if (level >= 360) { ctx.drawImage(images.sideInfo2, 0, 8, 22, 2, leftSide - 32, 192, 22, 2); }
            else if (level >= 330) { ctx.drawImage(images.sideInfo2, 0, 6, 22, 2, leftSide - 32, 192, 22, 2); }
            else if (level >= 300) { ctx.drawImage(images.sideInfo2, 0, 4, 22, 2, leftSide - 32, 192, 22, 2); }
            else if (level >= 251) { ctx.drawImage(images.sideInfo2, 0, 2, 22, 2, leftSide - 32, 192, 22, 2); }
            else { ctx.drawImage(images.sideInfo2, 0, 0, 22, 2, leftSide - 32, 192, 22, 2); }
        }
        else {
            //Clear the canvas
            ctx.clearRect(leftSide, 40, (8 * settings.boardWidth), (8 * settings.boardHeight));
            ctx.drawImage(images.sideInfo4, leftSide, 40);
            //Display "Ready"
            ctx.drawImage(images.readyGo, 0, 0, 76, 19, 122, 110, 76, 19);
            if (settings.gameMechanics != "onTheBeat") setTimeout(readyGo, 1000, 2);

            //Grade
            ctx.clearRect(211, 34, 48, 32);
            ctx.drawImage(images.grades, 0, 32 * grade, 48, 32, 211, 34, 48, 32);

            //Next piece
            if (settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat") {
                setNextPieceVisuals(onTheBeatNextPieces[0], 0);
                setNextPieceVisuals(onTheBeatNextPieces[1], 1);
                setNextPieceVisuals(onTheBeatNextPieces[2], 2);
            }
            else { setNextPieceVisuals(nextPiece); }

            //Text (Copied from drawGame, any change there should also happen here)
            //This is a lot of code duplication! Find a way to reduce this ASAP
            let nextGradeString;
            let nextGradeLength;
            if (settings.visuals == "classicStyle") {
                if (grade >= 8) {
                    nextGradeString = "??????";
                    nextGradeLength = 6;
                    ctx.clearRect(leftSide + settings.boardWidth * 8 + 8, 80, 64, 9);
                    for (let i = 0; i < nextGradeLength; i++) {
                        ctx.drawImage(images.digits, 80, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 80, 8, 9)
                    }
                }
                else {
                    nextGradeString = classicStyleGradeConditions[grade + 1].toString();
                    nextGradeLength = nextGradeString.length;
                    ctx.clearRect(leftSide + settings.boardWidth * 8 + 8, 80, 64, 9);
                    for (let i = 0; i < nextGradeLength; i++) {
                        ctx.drawImage(images.digits, parseInt(nextGradeString[i]) * 8, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 80, 8, 9)
                    }
                }
            }
            else if (settings.visuals == "masterStyle") {
                if (grade >= 12) {
                    nextGradeString = "??????";
                    nextGradeLength = 6;
                    ctx.clearRect(leftSide + settings.boardWidth * 8 + 8, 80, 64, 9);
                    for (let i = 0; i < nextGradeLength; i++) {
                        ctx.drawImage(images.digits, 80, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 80, 8, 9)
                    }
                }
                else {
                    nextGradeString = masterStyleGradeConditions[grade + 1].toString();
                    nextGradeLength = nextGradeString.length;
                    ctx.clearRect(leftSide + settings.boardWidth * 8 + 8, 80, 64, 9);
                    for (let i = 0; i < nextGradeLength; i++) {
                        ctx.drawImage(images.digits, parseInt(nextGradeString[i]) * 8, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 80, 8, 9)
                    }
                }
            }
            else if (settings.visuals == "dragonStyle") {
                if (grade >= 17) {
                    nextGradeString = "??????";
                    nextGradeLength = 6;
                    ctx.clearRect(leftSide + settings.boardWidth * 8 + 8, 80, 64, 9);
                    for (let i = 0; i < nextGradeLength; i++) {
                        ctx.drawImage(images.digits, 80, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 80, 8, 9)
                    }
                }
                else {
                    nextGradeString = (Math.floor(level / 50) * 50 + 50).toString();
                    if (nextGradeString == "1000") { nextGradeString = "999"; }
                    nextGradeLength = nextGradeString.length;
                    ctx.clearRect(leftSide + settings.boardWidth * 8 + 8, 80, 64, 9);
                    for (let i = 0; i < nextGradeLength; i++) {
                        ctx.drawImage(images.digits, parseInt(nextGradeString[i]) * 8, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 80, 8, 9)
                    }
                }
            }

            let scoreString = score.toString();
            let scoreLength = scoreString.length;
            ctx.clearRect(leftSide + settings.boardWidth * 8 + 11, 142, scoreLength * 8, 9);
            for (let i = 0; i < scoreLength; i++) {
                ctx.drawImage(images.digits, parseInt(scoreString[i]) * 8, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 142, 8, 9);
            }

            let levelString = level.toString();
            let levelLength = levelString.length;
            ctx.clearRect(leftSide + settings.boardWidth * 8 + 11, 181, levelLength * 8, 9);
            for (let i = 0; i < levelLength; i++) {
                ctx.drawImage(images.digits, parseInt(levelString[i]) * 8, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 181, 8, 9);
            }

            if (settings.gameMechanics != "onTheBeat") {
                let levelString2 = (level >= 900 ? "999" : ((Math.floor(level / 100) + 1) * 100).toString());
                let levelLength2 = levelString2.length;
                ctx.clearRect(leftSide + settings.boardWidth * 8 + 11, 197, levelLength2 * 8, 9);
                for (let i = 0; i < levelLength2; i++) {
                    ctx.drawImage(images.digits, parseInt(levelString2[i]) * 8, 0, 8, 9, leftSide + settings.boardWidth * 8 + 11 + i * 8, 197, 8, 9);
                }
            }
        }
    }
    else if (stage == 2) {
        if (settings.visuals != "onTheBeat") playSound("go");
        if (settings.visuals == "tgm") {
            //Clear the canvas
            let currentBackground = Math.floor(level / 100);
            ctx.drawImage(images.background2, currentBackground * 320 + 120, 40, 80, 160, 120, 40, 80, 160);
            //Display "Go"
            ctx.drawImage(images.readyGo, 100, 0, 45, 19, 138, 110, 45, 19);
            setTimeout(readyGo, 1000, 3);
        }
        else {
            let leftSide = 160 - settings.boardWidth * 4;
            //Clear the canvas
            ctx.clearRect(leftSide, 40, (8 * settings.boardWidth), (8 * settings.boardHeight));
            ctx.drawImage(images.sideInfo4, leftSide, 40);
            //Display "Go"
            ctx.drawImage(images.readyGo, 100, 0, 45, 19, 138, 110, 45, 19);
            if (settings.gameMechanics != "onTheBeat") setTimeout(readyGo, 1000, 3);
        }
    }
    else if (stage == 3) {
        gamePlaying = true;
        gameReadying = false;

        if (settings.visuals != "tgm" && settings.visuals != "onTheBeat") {
            playSound("gameMusic");
            setSoundVolume("gameMusic", game.musicVolume);
        }
        drawGame();
        if (settings.gameMechanics == "tgm" && keysHeld[3]) { //Starting soft drop if key is held
            currentDropTime = Math.min(getDropInterval(), settings.softDropSpeed);
            softDropping = true;
        }
    }
}

function endGame() {
    gamePlaying = false;
    if (inCampaignMode()) {
        fadeOutSound('gameMusic', 1000);
        let currentBeatTime;
        if (gameMusic7) currentBeatTime = gameMusic7.seek() * (155 / 60);
        if ((level < 999 && settings.gameMechanics != "onTheBeat") || (settings.gameMechanics == "onTheBeat" && currentBeatTime < 424)) {
            playSound("end");
            landPiece();
        }
        else { playSound("finish"); }
        
        backgroundZOffsetTargetSpeed = 0;

        let leftSide = 160 - settings.boardWidth * 4;

        // Record update
        let recordIndex = {
            classicStyle: 0,
            masterStyle: 1,
            dragonStyle: 2,
        }[settings.gameMechanics] ?? -1;

        let oldPower = game.bestPowers[recordIndex] ?? NaN
        let oldScore = game.bestScores[recordIndex] ?? NaN
        let oldLevel = game.bestLevels[recordIndex] ?? NaN
        let oldAchTime = game.bestAchievementTimes[recordIndex] ?? NaN;

        // Average section time
        let averageSectionTime;

        if (sectionTimes.length > 0) {
            averageSectionTime = sectionTimes[0] ? sectionTimes[0] : 0;
            for (let i = 1; i < sectionTimes.length; i++) {
                if (sectionTimes[i] && sectionTimes[i - 1]) { averageSectionTime += (sectionTimes[i] - sectionTimes[i - 1]); }
                else if (sectionTimes[i]) { averageSectionTime += (sectionTimes[i]); }
            }
            averageSectionTime /= getSectionTimesLength();

            let timeString = formatTime(averageSectionTime);
            let sectionTimeColor = getTimeColor(averageSectionTime);

            if (inCampaign) {

                if (level >= 999 && settings.gameMechanics != "onTheBeat") {
                    //Best average section time
                    if (recordIndex >= 0 && averageSectionTime < game.bestAverageSectionTimes[recordIndex]) game.bestAverageSectionTimes[recordIndex] = averageSectionTime;

                    //Best highest section time
                    let highestSectionTime = sectionTimes[0];
                    for (let i = 1; i < sectionTimes.length; i++) {
                        if (sectionTimes[i] && sectionTimes[i] - sectionTimes[i - 1] > highestSectionTime) highestSectionTime = (sectionTimes[i] - sectionTimes[i - 1]);
                    }
                    if (recordIndex >= 0 && highestSectionTime < game.bestHighestSectionTimes[recordIndex]) game.bestHighestSectionTimes[recordIndex] = highestSectionTime;
                }

                //Individual best section times
                if (settings.gameMechanics == "classicStyle" && (sectionTimes[0] < game.classicStyleBestSectionTimes[0] || !game.classicStyleBestSectionTimes[0])) game.classicStyleBestSectionTimes[0] = sectionTimes[0];
                else if (settings.gameMechanics == "masterStyle" && (sectionTimes[0] < game.masterStyleBestSectionTimes[0] || !game.masterStyleBestSectionTimes[0])) game.masterStyleBestSectionTimes[0] = sectionTimes[0];
                else if (settings.gameMechanics == "dragonStyle" && (sectionTimes[0] < game.dragonStyleBestSectionTimes[0] || !game.dragonStyleBestSectionTimes[0])) game.dragonStyleBestSectionTimes[0] = sectionTimes[0];
                for (let i = 1; i < sectionTimes.length; i++) {
                    if (settings.gameMechanics == "classicStyle" && (sectionTimes[i] - sectionTimes[i - 1] < game.classicStyleBestSectionTimes[i] || !game.classicStyleBestSectionTimes[i])) game.classicStyleBestSectionTimes[i] = (sectionTimes[i] - sectionTimes[i - 1]);
                    else if (settings.gameMechanics == "masterStyle" && (sectionTimes[i] - sectionTimes[i - 1] < game.masterStyleBestSectionTimes[i] || !game.masterStyleBestSectionTimes[i])) game.masterStyleBestSectionTimes[i] = (sectionTimes[i] - sectionTimes[i - 1]);
                    else if (settings.gameMechanics == "dragonStyle" && (sectionTimes[i] - sectionTimes[i - 1] < game.dragonStyleBestSectionTimes[i] || !game.dragonStyleBestSectionTimes[i])) game.dragonStyleBestSectionTimes[i] = (sectionTimes[i] - sectionTimes[i - 1]);
                }
            }
        }
        
        // Update power
        if (settings.gameMechanics == "classicStyle") {
            // Level component
            runPower = Math.max((level - 24) * 20, 0); 
            // Section time component 
            if (sectionTimes.length > 0) runPower += Math.max((1500000 / averageSectionTime - 20000), 0) * (level + 1000) / 1500; 
            // Score component
            runPower += score ** 0.5 * 8;

        } else if (settings.gameMechanics == "masterStyle") {
            // Level component
            runPower = Math.max((level - 24) * 20, 0); 
            // Section time component
            if (sectionTimes.length > 0) runPower += Math.max((2100000 / averageSectionTime - 25000), 0) * (level + 1000) / 1500;

        } else if (settings.gameMechanics == "dragonStyle") {
            // Level component
            runPower = Math.max((level - 24) * 25, 0); 
            // Section time component
            if (sectionTimes.length > 0) runPower += Math.max((1000000 / averageSectionTime - 20000), 0) * (level + 1000) / 2000; 

        } else if (settings.gameMechanics == "onTheBeat") {
            oldScore = game.onTheBeatBests[0]
            oldLevel = game.onTheBeatBests[1]
            if (inCampaign && score > game.onTheBeatBests[0]) game.onTheBeatBests[0] = score;
            if (inCampaign && level > game.onTheBeatBests[1]) game.onTheBeatBests[1] = level;
        }

        if (inCampaign && recordIndex >= 0) {
            if (runPower > game.bestPowers[recordIndex]) game.bestPowers[recordIndex] = runPower;
            if (score > game.bestScores[recordIndex]) game.bestScores[recordIndex] = score;
            if (level > game.bestLevels[recordIndex])  {
                game.bestLevels[recordIndex] = level;
                game.bestAchievementTimes[recordIndex] = time;
            } else if (level == game.bestLevels[recordIndex] && game.bestAchievementTimes[recordIndex] <= time) {
                game.bestAchievementTimes[recordIndex] = time;
            }
        }

        // Clear HUD
        ctx.clearRect(0, 0, leftSide - 8, 240);
        ctx.clearRect(168 + settings.boardWidth * 4, 0, leftSide - 16, 240);
        ctx.clearRect(0, 0, 320, 112 - settings.boardHeight * 4);
        ctx.clearRect(0, 128 + settings.boardHeight * 4, 320, 240);
        
        // Draw board
        ctx.clearRect(leftSide, 40, (8 * settings.boardWidth), (8 * settings.boardHeight));
        ctx.drawImage(images.sideInfo4, leftSide, 40);
        for (let i = 0; i < settings.boardHeight; i++) {
            for (let j = 0; j < settings.boardWidth; j++) {
                if (board[i][j] != 0) {
                    if (settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll") { ctx.drawImage(images.tiles, 8, 0, 8, 8, j * 8 + leftSide, i * 8 + 40, 8, 8); }
                    else { ctx.drawImage(images.tiles, 8, (board[i][j]) * 8, 8, 8, j * 8 + leftSide, i * 8 + 40, 8, 8); }
                }
            }
        }

        // Achievement
        let timeString = formatTime(time);
        let levelString = Math.floor(level).toString();
        let highlightTime = level == oldLevel
        drawBMText(ctx, 68, 35, "ACHIEVEMENT:", "text5-white");
        let x = 252
        if (settings.gameMechanics == "onTheBeat") {
            x -= drawBMTextAnchor(ctx, x, 39, levelString, "text10-white") + 3;
            x -= drawBMTextAnchor(ctx, x, 44, "LEVEL", "text5-white");
        } else if (level == oldLevel) {
            x -= drawBMTextAnchor(ctx, x, 39, timeString, "text10-white") + 3;
            x -= drawBMTextAnchor(ctx, x, 44, "IN", "text5-white") + 3;
            x -= drawBMTextAnchor(ctx, x, 41, levelString, "text7-white") + 3;
            x -= drawBMTextAnchor(ctx, x, 44, "LEVEL", "text5-white");
        } else {
            x -= drawBMTextAnchor(ctx, x, 41, timeString, "text7-white") + 3;
            x -= drawBMTextAnchor(ctx, x, 44, "IN", "text5-white") + 3;
            x -= drawBMTextAnchor(ctx, x, 39, levelString, "text10-white") + 3;
            x -= drawBMTextAnchor(ctx, x, 44, "LEVEL", "text5-white");
        }
        if (inCampaign) {
            let oldLevelString = Math.floor(oldLevel).toString();
            let oldTimeString = formatTime(oldAchTime)
            let newAchRecord = level > oldLevel || (level == oldLevel && time < oldAchTime);
            drawBMText(ctx, 108, 53, newAchRecord ? "NEW BEST!" : "BEST:", newAchRecord ? "text5-gold" : "text5-gray");
            x = 252
            if (settings.gameMechanics != "onTheBeat") {
                x -= drawBMTextAnchor(ctx, x, 53, oldTimeString, "text5-white") + 2;
                x -= drawBMTextAnchor(ctx, x, 53, "IN", "text5-gray") + 2;
            }
            x -= drawBMTextAnchor(ctx, x, 53, oldLevelString, "text5-white") + 2;
            x -= drawBMTextAnchor(ctx, x, 53, "LEVEL", "text5-gray");
        }
        
        // Score & grade
        let scoreString = formatScore(score);
        drawBMText(ctx, 68, 75, "POINTS:", "text5-white");
        drawBMTextAnchor(ctx, 152, 75, scoreString, "text7-white");
        if (inCampaign) {
            let oldScoreString = Math.floor(oldScore).toString()
            let newScoreRecord = score > oldScore;
            drawBMText(ctx, 78, 87, newScoreRecord ? "NEW BEST!" : "BEST:", newScoreRecord ? "text5-gold" : "text5-gray");
            drawBMTextAnchor(ctx, 152, 87, oldScoreString, "text5-white");
        }
        
        drawBMText(ctx, 68, 103, "GRADE:", "text5-white");
        ctx.drawImage(images.grades, 0, 32 * grade, 48, 32, 78, 116, 48, 32);

        // Section times
        if (settings.gameMechanics != "onTheBeat") {
            drawBMText(ctx, 168, 75, "SECTION TIMES:", "text5-white");
            if (true) {
                let lastSectionTime = 0
                for (let i = 0; i < 10; i++) {
                    let sectionTime = sectionTimes[i] - lastSectionTime
                    
                    let x = 178;

                    if (sectionTime > 0) {
                        lastSectionTime += sectionTime
                        let sectionTimeString = formatTime(sectionTime);
                        let timeValue = getTimeValue(sectionTime);
                        let timeColor = getTimeColor(sectionTime);
                        x += drawBMText(ctx, 178, 86 + i * 7, Math.min(i * 100 + 100, 999).toString() + "  ", "text5-white");
                        x += drawBMText(ctx, 194, 86 + i * 7, sectionTimeString, "text5" + timeColor);
                        x += 4;
                        
                        for (let j = 0; j < timeValue; j++) {
                            ctx.drawImage(decorBlocksImage, 
                                j * 8, 16, 6, 6, 
                                x, 86 + i * 7, 6, 6
                            );
                            x += 6
                        }

                    } else {
                        drawBMText(ctx, 178, 86 + i * 7, "---  ---", "text5-gray");
                    }
                }
            }
        }

        // Power & decor
        if (settings.gameMechanics != "onTheBeat") {
            let powerString = Math.floor(runPower).toString();
            let maxPower = settings.gameMechanics == "dragonStyle" ? 39000 : 30000
            let powerColor = (runPower >= maxPower) ? "-gold" : "-white";
            drawBMText(ctx, 98, 189, "POWER THIS RUN:", "text5-white");
            drawBMTextAnchor(ctx, 221, 184, powerString, "text10" + powerColor);
            drawBMText(ctx, 221, 189, "/" + Math.floor(maxPower).toString(), "text5-gray");

            if (inCampaign) {
                let oldPowerString = Math.floor(oldPower).toString()
                let newPowerRecord = runPower > oldPower;
                drawBMText(ctx, 108, 198, newPowerRecord ? "NEW BEST!" : "BEST:", newPowerRecord ? "text5-gold" : "text5-gray");
                drawBMTextAnchor(ctx, 221, 198, oldPowerString, "text5-white");
            }

            // Decoration
            if (inCampaign) {
                let decorPointsEarned = 0;
                decorPointsEarned += (decorGradeWeights[settings.gameMechanics] ?? 0) * grade
                decorPointsEarned += (decorSectionWeights[settings.gameMechanics] ?? 0) * (level >= 999 ? 10 : Math.floor(level / 100))
                let sectionTimeMedals = 0, lastSectionTime = 0
                for (let i = 0; i < getSectionTimesLength(); i++) {
                    sectionTimeMedals += getTimeValue(sectionTimes[i] - lastSectionTime)
                    lastSectionTime = sectionTimes[i]
                }
                decorPointsEarned += (decorSectionMedalWeights[settings.gameMechanics] ?? 0) * sectionTimeMedals

                game.decorPoints += decorPointsEarned

                let decorString = formatScore(decorPointsEarned);
                drawBMText(ctx, 98, 210, "EARNED DECORATION:", "text5-white");
                drawBMTextAnchor(ctx, 215, 210, "+" + decorString, "text5-white");
                drawBMText(ctx, 217, 210, "G", "text5-gold");
            }
        }
    }

    drawInputPrompts([
        { action: "exit", label: "EXIT" },
        { action: "restart", label: "RESTART" }
    ])
    setMouseNavs(["restart", "exit"]);
}

function restartGame() {
    returnToMenu();
    startGame();
}

function returnToMenu() {
    hideBlackCover();
    stopSound("gameMusic");
    setSoundVolume('menuMusic', game.musicVolume);
    playSound('menuMusic');
    board = [];
    waitingForNextPiece = false;
    piecesDropped = [0, 0, 0, 0, 0, 0, 0];
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
    runPower = 0;
    runDecorPoints = 0;
    backgroundZOffset = backgroundZOffsetSpeed = backgroundZOffsetTargetSpeed = 0;
    restartTimer = restartTimerUI = exitTimer = exitTimerUI = 0;
    document.getElementById("game").style.display = "none";
    document.getElementById("effectOverlay").style.display = "none";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("backgroundCanvas").style.display = game.menuBackgroundEnabled ? "block" : "none";
    document.getElementById("textOverlay").style.display = "none";
    document.getElementById("textOverlay").innerHTML = "";
    document.getElementsByClassName("container")[1].style.display = "block"; //Campaign screen
    document.getElementsByClassName("container")[2].style.display = "block"; //Custom game screen
    document.getElementById("overallGradeCanvas").style.display = "block";
    updateInputPrompts(currentTab);
    if (inCampaign) {
        selectMenuMode(currentMenuMode);
        displayProfileInfo();
    } else if (currentTab == 3) {
        setActiveForm(document.getElementById("customGameForm"));
    }
    document.body.style.backgroundColor = "#333";
    document.body.style.backgroundImage = "none";
    save();
}