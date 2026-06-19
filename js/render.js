// Rendering and visuals moved from script.js

// Preload images / sprite handles used by multiple visuals
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

// Canvas contexts
const canvas = document.getElementById("game");
const ctx = canvas && canvas.getContext("2d");
const effectOverlayCanvas = document.getElementById("effectOverlay");
const effectCtx = effectOverlayCanvas && effectOverlayCanvas.getContext("2d");
if (ctx) ctx.imageSmoothingEnabled = false;

//Smaller game canvas sizes
if (window.innerHeight < 750) {
	document.getElementById("game").style.transform = "translate(-50%, -50%) scale(2)";
	document.getElementById("effectOverlay").style.transform = "translate(-50%, -50%) scale(2)";
	document.getElementById("textOverlay").style.transform = "translate(-50%, -50%) scale(2)";
} else {
	document.getElementById("game").style.transform = "translate(-50%, -50%) scale(3)";
	document.getElementById("effectOverlay").style.transform = "translate(-50%, -50%) scale(3)";
	document.getElementById("textOverlay").style.transform = "translate(-50%, -50%) scale(3)";
}

function initialiseCanvasBoard() {
    // Only support main modes: classicStyle, masterStyle, dragonStyle, onTheBeat
    if (settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle" || settings.visuals == "onTheBeat") {
        canvas.height = Math.max(settings.boardHeight*8, 240);
        document.getElementById("textOverlay").style.height = canvas.height + "px";
        document.body.style.backgroundImage = "none";
        let leftSide = 160-settings.boardWidth*4;
        images.tiles.src = "img/main/tiles.png";
        images.hardDropTile.src = "img/main/ghostTiles.png";
        if ((settings.visuals == "dragonStyle" && level >= 500) || settings.visuals == "onTheBeat") {images.board.src = "img/main/board3.png";}
        else if (settings.visuals == "masterStyle") {images.board.src = "img/main/board2.png";}
        else {images.board.src = "img/main/board.png";}
        images.sideInfo1.src = "img/main/sideInfo.png";
        images.sideInfo2.src = "img/main/digitsSmall.png";
        images.sideInfo3.src = "img/main/finish.png";
        images.sideInfo4.src = "img/main/boardBack.png";
        images.readyGo.src = "img/main/readyGo.png";
        images.tileVanish.src = "img/main/explosionEffect.png";
        images.digits.src = "img/main/digits.png";
        if (settings.visuals == "classicStyle") {images.grades.src = "img/main/gradesClassic.png";}
        else if (settings.visuals == "masterStyle") {images.grades.src = "img/main/gradesMaster.png";}
        else if (settings.visuals == "onTheBeat") {images.grades.src = "img/main/gradesOnTheBeat.png";}
        else {images.grades.src = "img/main/gradesDragon.png";}
        if (settings.visuals == "onTheBeat") {images.beatBar.src = "img/main/beatBar.png";}
        //Classic style DAS
        if (settings.gameMechanics == "classicStyle") {
            settings.DASInitial = classicStyleDASInitial[Math.floor(level/100)];
            settings.DAS = classicStyleDAS[Math.floor(level/100)];
        }
        //Dragon style DAS and lock delay
        else if (settings.gameMechanics == "dragonStyle") {
            settings.DASInitial = dragonStyleDASInitial[Math.floor(level/100)];
            settings.lockDelay = dragonStyleLockDelay[Math.floor(level/100)];
        }
        //Draw the board (to be improved)
        ctx.drawImage(images.board, 112, 32);
        //ctx.fillStyle = "black";
        //ctx.fillRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
        ctx.clearRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
        ctx.drawImage(images.sideInfo4, leftSide, 40);
        //Side info
        ctx.drawImage(images.sideInfo1, 60, 24);
        if (settings.visuals === "dragonStyle") {
            ctx.clearRect(208, 92, 26, 6);
        }
        else {
            ctx.clearRect(264, 71, 12, 6);
        }
        //Background colors
        if (settings.visuals === "classicStyle") {document.body.style.backgroundColor = "#0d3c78"}
        else if (settings.visuals === "masterStyle") {document.body.style.backgroundColor = "#157884"}
        else if (settings.visuals === "dragonStyle") {document.body.style.backgroundColor = "#1e1e85"}
        else {document.body.style.backgroundColor = "#080808"}
        if (settings.visuals == "onTheBeat") {
            ctx.clearRect(210, 192, 32, 2); //Level separating bar
            ctx.clearRect(210, 64, 54, 48); //Grade info
            ctx.clearRect(0, 32, 112, 176); //Left side info
            ctx.drawImage(images.beatBar, 0, 0, 14, 176, 84, 32, 14, 176);
        }
    }
}

function drawGame() {
    if (!gamePlaying) return;
    // Only support main modes: classicStyle, masterStyle, dragonStyle, onTheBeat
    if (settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle" || settings.visuals == "onTheBeat") {
        let leftSide = 160-settings.boardWidth*4;

        ctx.clearRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
        ctx.drawImage(images.sideInfo4, leftSide, 40);

        if (!waitingForNextPiece) {
            //Draw the ghost piece if lower than level 200
            if (level < 200) {
                let tempPiecePositions = [];
                for (let i=0;i<piecePositions.length;i++) tempPiecePositions.push([...piecePositions[i]])
                while (!checkPieceLanded(tempPiecePositions)) {
                    for (let i=0;i<tempPiecePositions.length;i++) tempPiecePositions[i][0]++;
                }
                for (let i=0;i<tempPiecePositions.length;i++) {
                    if (tempPiecePositions[i][0] < 0) continue;
                    if (settings.pieceColouring === "monotoneAll") {ctx.drawImage(images.hardDropTile, 0, 0, 8, 8, tempPiecePositions[i][1]*8+leftSide, tempPiecePositions[i][0]*8+40, 8, 8);}
                    else {
                        const def = (typeof getPieceDef === 'function') ? getPieceDef(currentPiece) : null;
                        const row = def ? def.colorIndex : (currentPiece+1);
                        ctx.drawImage(images.hardDropTile, 0, row*8, 8, 8, tempPiecePositions[i][1]*8+leftSide, tempPiecePositions[i][0]*8+40, 8, 8);
                    }
                }
            }
            //Regular piece
            for (let i=0;i<piecePositions.length;i++) {
                if (piecePositions[i][0] < 0) continue;
                if (settings.pieceColouring === "monotoneAll") {
                    ctx.drawImage(images.tiles, 0, 0, 8, 8, piecePositions[i][1]*8+leftSide, piecePositions[i][0]*8+40, 8, 8);
                }
                else {
                    const def = (typeof getPieceDef === 'function') ? getPieceDef(currentPiece) : null;
                    const row = def ? def.colorIndex : (currentPiece+1);
                    ctx.drawImage(images.tiles, 0, row*8, 8, 8, piecePositions[i][1]*8+leftSide, piecePositions[i][0]*8+40, 8, 8);
                }
            }
        }

        // Board pieces
        let currentBeatTime;
        if (gameMusic7) currentBeatTime = gameMusic7.seek() * (155/60);

        if (!settings.invisible && (settings.gameMechanics != "onTheBeat" || (currentBeatTime < 392 && (currentBeatTime < 376 || currentBeatTime >= 377)))) {
            for (let i=0;i<settings.boardHeight;i++) {
                for (let j=0;j<settings.boardWidth;j++) {
                    if (board[i][j] != 0) {
                        if (settings.pieceColouring === "monotoneFixed" || settings.pieceColouring === "monotoneAll") {ctx.drawImage(images.tiles, 8, 0, 8, 8, j*8+leftSide, i*8+40, 8, 8);}
                        else {
                            // board stores pieceIndex+1, which maps to row*8 already
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

        drawHud();
    }
}

function drawHud() {
    let leftSide = 160-settings.boardWidth*4;
    
    // Grade
    ctx.clearRect(211, 34, 48, 32);
    ctx.drawImage(images.grades, 0, 32*grade, 48, 32, 211, 34, 48, 32);

    // Text
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

        if (settings.timeDisplay) {
            let leftSide = 160-settings.boardWidth*4;
            let timeString = formatTime(time);
            let timeLength = 8;
            ctx.clearRect(leftSide-74, 82, 64, 9);
            for (let i=0;i<timeLength;i++) {
                if (timeString[i] == ":") {ctx.drawImage(images.digits, 88, 0, 8, 9, leftSide-74+i*8, 82, 8, 9);}
                else {ctx.drawImage(images.digits, parseInt(timeString[i])*8, 0, 8, 9, leftSide-74+i*8, 82, 8, 9);}
            }
            //Current section time
            if (level < 999) {
                let currentSection = Math.floor(level/100);
                let currentSectionTime = time - timeAtLastSection;
                ctx.clearRect(61, 117+7*currentSection, 48, 6);

                let levelString = (currentSection*100+100).toString().padStart(2, "0");
                if (levelString == "1000") {levelString = "999";}
                for (let i=0;i<3;i++) ctx.drawImage(images.sideInfo2, levelString[i]*4, 0, 4, 6, 61+4*i, 117+7*currentSection, 4, 6);

                let sectionTimeString = formatTime(currentSectionTime);
                for (let i=0;i<8;i++) {
                    if (sectionTimeString [i] == ":") {ctx.drawImage(images.sideInfo2, 40, 0, 4, 6, 77+4*i, 117+7*currentSection, 4, 6);}
                    else {ctx.drawImage(images.sideInfo2, sectionTimeString[i]*4, 0, 4, 6, 77+4*i, 117+7*currentSection, 4, 6);}
                }
            }
        }
    }

    if (restartTimerUI > 0)
    {
        ctx.globalAlpha = Math.min(1, restartTimerUI * 2);
        drawBMTextAnchor(ctx, 161, 186, "HOLD TO RESTART", "text5-white", 0.5);
        let barWidth = settings.boardWidth * 8 - 8;
        ctx.fillStyle = "#fff3";
        ctx.fillRect(160 - barWidth / 2, 195, barWidth, 1);
        let fillWidth = Math.floor(barWidth * restartTimer ** 2 / 2) * 2;
        ctx.fillStyle = "#fff";
        ctx.fillRect(160 - fillWidth / 2, 195, fillWidth, 1);
        ctx.globalAlpha = 1;
    }
    if (exitTimerUI > 0)
    {
        ctx.globalAlpha = Math.min(1, exitTimerUI * 2);
        drawBMTextAnchor(ctx, 161, 186, "HOLD TO FORFEIT", "text5-white", 0.5);
        let barWidth = settings.boardWidth * 8 - 8;
        ctx.fillStyle = "#fff3";
        ctx.fillRect(160 - barWidth / 2, 195, barWidth, 1);
        let fillWidth = Math.floor(barWidth * exitTimer ** 2 / 2) * 2;
        ctx.fillStyle = "#fff";
        ctx.fillRect(160 - fillWidth / 2, 195, fillWidth, 1);
        ctx.globalAlpha = 1;
    }
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
    drawBMText(ctx, 61, 117+7*index, levelString, "text5-white");

    let timeString = formatTime(sectionTime);
    let sectionTimeColor = getTimeColor(sectionTime);
    drawBMText(ctx, 77, 117+7*index, timeString, "text5" + sectionTimeColor);
}

function displayEndingLine(x) {
    if (document.getElementById("game").style.display == "none") return;
    // Main modes don't have special ending line animations, just return to menu
    setTimeout(returnToMenu, 1000);
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

function setNextPieceVisuals(index, xOffset=0) {
    // Main modes use generic renderer based on piece definitions
    if (settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle" || settings.visuals == "onTheBeat") {
        const leftSide = 160-settings.boardWidth*4;
        if (typeof drawNextPieceGeneric === 'function') {
            drawNextPieceGeneric(ctx, images, index, xOffset, leftSide);
            return;
        }
    }
    // Fallback: keep old behavior for other styles if needed (no-op here)
}

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

// Global text elements
let scoreText = null;
let levelText = null;
let linesText = null;
let timeText = null;