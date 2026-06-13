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
} else if (window.innerHeight < 950) {
	document.getElementById("game").style.transform = "translate(-50%, -50%) scale(3)";
	document.getElementById("effectOverlay").style.transform = "translate(-50%, -50%) scale(3)";
	document.getElementById("textOverlay").style.transform = "translate(-50%, -50%) scale(3)";
}

function initialiseCanvasBoard() {
    if (settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle" || settings.visuals == "onTheBeat") {
        canvas.height = Math.max(settings.boardHeight*8, 240);
        document.getElementById("textOverlay").style.height = Math.max(settings.boardHeight*8, 240) + "px";
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
    else if (settings.visuals == "nes") {
        canvas.height = Math.max(settings.boardHeight*8+40, 200);
        document.getElementById("textOverlay").style.height = Math.max(settings.boardHeight*8+40, 200) + "px";
        let leftSide = 160-settings.boardWidth*4;
        document.body.style.backgroundColor = "#747474";
        document.body.style.backgroundImage = "none";
        images.tiles.src = "img/nes/tiles.png";
        images.hardDropTile.src = "img/nes/hardDropTile.png";
        images.board.src = "img/nes/boardSmall.png";
        //Draw the corners
        ctx.drawImage(images.board, 0, 0, 8, 8, leftSide, 24, 8, 8);
        ctx.drawImage(images.board, 16, 0, 8, 8, 8*settings.boardWidth+leftSide+8, 24, 8, 8);
        ctx.drawImage(images.board, 0, 16, 8, 8, leftSide, 8*settings.boardHeight+32, 8, 8);
        ctx.drawImage(images.board, 16, 16, 8, 8, 8*settings.boardWidth+leftSide+8, 8*settings.boardHeight+32, 8, 8);
        ctx.drawImage(images.board, 8, 8, 8, 8, leftSide+8, 32, settings.boardWidth*8, settings.boardHeight*8);
        //Draw the sides
        for (let i=0;i<settings.boardWidth;i++) {
            ctx.drawImage(images.board, 8, 0, 8, 8, leftSide+8+i*8, 24, 8, 8);
            ctx.drawImage(images.board, 8, 16, 8, 8, leftSide+8+i*8, 8*settings.boardHeight+32, 8, 8);
        }
        for (let i=0;i<settings.boardHeight;i++) {
            ctx.drawImage(images.board, 0, 8, 8, 8, leftSide, 32+i*8, 8, 8);
            ctx.drawImage(images.board, 16, 8, 8, 8, leftSide+8*settings.boardWidth+8, 32+i*8, 8, 8);
        }
        //Draw the side info
        images.sideInfo1.src = "img/nes/sideInfo.png";
        ctx.drawImage(images.sideInfo1, 8*settings.boardWidth+leftSide+16, 0);
        if (!settings.timeDisplay) {
            ctx.fillStyle = "black";
            ctx.fillRect(8*settings.boardWidth+leftSide+24, 16, 32, 8);
        }

        images.sideInfo2.src = "img/nes/linesBoxSmall.png";
        ctx.drawImage(images.sideInfo2, 0, 0, 8, 24, leftSide, 0, 8, 24);
        ctx.drawImage(images.sideInfo2, 16, 0, 8, 24, 8*settings.boardWidth+leftSide+8, 0, 8, 24);
        for (let i=0;i<settings.boardWidth;i++) ctx.drawImage(images.sideInfo2, 8, 0, 8, 24, leftSide+8+i*8, 0, 8, 24);

        images.sideInfo3.src = "img/nes/statistics.png";
        ctx.drawImage(images.sideInfo3, 0, 0, 80, 152, leftSide-80, 48, 80, 152);

        images.sideInfo4.src = "img/nes/statPieces.png";
        let pieceColorSet;
        if (inCampaignMode()) {pieceColorSet = Math.floor(level/100);}
        else {pieceColorSet = level%10;}
        ctx.drawImage(images.sideInfo4, pieceColorSet*24, 0, 24, 112, leftSide-64, 72, 24, 112);

        //Add the text
        let timeText = document.createElement("p");
        timeText.classList = "NESText";
        timeText.innerText = "0:00";
        timeText.style.top = "24px";
        timeText.style.left = (leftSide+104) + "px";
        document.getElementById("textOverlay").appendChild(timeText);
        let scoreText = document.createElement("p");
        scoreText.classList = "NESText";
        scoreText.innerText = "000000";
        scoreText.style.top = "48px";
        scoreText.style.left = (leftSide+104) + "px";
        document.getElementById("textOverlay").appendChild(scoreText);
        let levelText = document.createElement("p");
        levelText.classList = "NESText";
        levelText.innerText = "00";
        levelText.style.top = "152px";
        levelText.style.left = (leftSide+120) + "px";
        document.getElementById("textOverlay").appendChild(levelText);
        let linesText = document.createElement("p");
        linesText.classList = "NESText";
        linesText.innerText = "LINES-000";
        linesText.style.top = "8px";
        linesText.style.left = (leftSide+16) + "px";
        document.getElementById("textOverlay").appendChild(linesText);
        let statsText = document.createElement("p");
        statsText.classList = "NESText";
        statsText.style.color = "#b53121";
        statsText.innerHTML = "000<br><br>000<br><br>000<br><br>000<br><br>000<br><br>000<br><br>000";
        statsText.style.top = "80px";
        statsText.style.left = (leftSide-40) + "px";
        document.getElementById("textOverlay").appendChild(statsText);
    }
    else if (settings.visuals == "dx") {
        if (settings.timeDisplay) {
            canvas.height = Math.max(settings.boardHeight*8, 160);
            document.getElementById("textOverlay").style.height = Math.max(settings.boardHeight*8, 160) + "px";
        }
        else {
            canvas.height = Math.max(settings.boardHeight*8, 144);
            document.getElementById("textOverlay").style.height = Math.max(settings.boardHeight*8, 144) + "px";
        }
        let leftSide = 120-settings.boardWidth*4;
        document.body.style.backgroundColor = "#28a078";
        document.body.style.backgroundImage = "none";
        images.tiles.src = "img/dx/tiles.png";
        images.hardDropTile.src = "img/dx/hardDropTile.png";
        images.board.src = "img/dx/boardSmall.png";
        //Draw the board
        for (let i=0;i<settings.boardHeight;i++) {
            ctx.drawImage(images.board, 0, (i*8)%48, 16, 8, leftSide, i*8, 16, 8);
            ctx.drawImage(images.board, 8, (i*8)%24, 8, 8, (8*settings.boardWidth)+leftSide+16, i*8, 8, 8);
        }
        let backgroundColor = Math.floor(Math.min(level,30)/5);
        ctx.fillStyle = dxBackgroundColours[backgroundColor];
        ctx.fillRect(leftSide+16, 0, (8*settings.boardWidth), (8*settings.boardHeight));
        //Draw the side info
        images.sideInfo1.src = "img/dx/sideInfo.png";
        ctx.drawImage(images.sideInfo1, 0, 0, 56, 144, (8*settings.boardWidth)+leftSide+24, 0, 56, 144);
        if (settings.boardHeight > 18) {
            for (let i=18;i<settings.boardHeight;i++) {
                ctx.drawImage(images.sideInfo1, 0, 160+(i*8)%16, 56, 8, (8*settings.boardWidth)+leftSide+24, i*8, 56, 8);
            }
        }

        //Add the text
        let scoreText = document.createElement("p");
        scoreText.classList = "DXText";
        scoreText.innerText = "0";
        scoreText.style.top = "78px";
        scoreText.style.right = (leftSide-1) + "px";
        scoreText.style.textAlign = "right";
        document.getElementById("textOverlay").appendChild(scoreText);
        let levelText = document.createElement("p");
        levelText.classList = "DXText";
        levelText.innerText = "0";
        levelText.style.top = "102px";
        levelText.style.right = (leftSide+7) + "px";
        scoreText.style.textAlign = "right";
        document.getElementById("textOverlay").appendChild(levelText);
        let linesText = document.createElement("p");
        linesText.classList = "DXText";
        linesText.innerText = "0";
        linesText.style.top = "126px";
        linesText.style.right = (leftSide+7) + "px";
        scoreText.style.textAlign = "right";
        document.getElementById("textOverlay").appendChild(linesText);
    }
    else if (settings.visuals == "sega") {
        canvas.height = Math.max(settings.boardHeight*8+48, 225);
        document.getElementById("textOverlay").style.height = Math.max(settings.boardHeight*8+48, 225) + "px";
        let leftSide = 152-settings.boardWidth*4;
        document.body.style.backgroundColor = "#333";
        document.body.style.backgroundImage = "none";
        images.tiles.src = "img/sega/tiles.png";
        images.hardDropTile.src = "img/sega/hardDropTile.png";
        images.board.src = "img/sega/board.png";
        images.background.src = "img/sega/backgrounds.png";
        images.tileVanish.src = "img/sega/tileVanish.png";
        images.digits.src = "img/sega/digits.png";
        let currentBackground = segaBackgroundLevels[Math.min(level, 15)];
        ctx.drawImage(images.background, currentBackground*320, 0, 320, 225, 0, 0, 320, 225);
        //Draw the corners
        ctx.drawImage(images.board, 0, 0, 8, 8, leftSide, 24, 8, 8);
        ctx.drawImage(images.board, 88, 0, 8, 8, 8*settings.boardWidth+leftSide+8, 24, 8, 8);
        ctx.drawImage(images.board, 0, 168, 8, 16, leftSide, 8*settings.boardHeight+32, 8, 16);
        ctx.drawImage(images.board, 88, 168, 8, 16, 8*settings.boardWidth+leftSide+8, 8*settings.boardHeight+32, 8, 16);
        ctx.fillStyle = "black"
        ctx.fillRect(leftSide+8, 32, settings.boardWidth*8, settings.boardHeight*8);
        //Draw the sides
        for (let i=0;i<Math.min(settings.boardHeight,20);i++) {
            ctx.drawImage(images.board, 0, i*8+8, 8, 8, leftSide, i*8+32, 8, 8);
            ctx.drawImage(images.board, 88, i*8+8, 8, 8, 8*settings.boardWidth+leftSide+8, i*8+32, 8, 8);
        }
        if (settings.boardHeight > 20) {
            for (let i=20;i<settings.boardHeight;i++) {
                ctx.drawImage(images.board, 0, 160, 8, 8, leftSide, i*8+32, 8, 8);
                ctx.drawImage(images.board, 88, 160, 8, 8, 8*settings.boardWidth+leftSide+8, i*8+32, 8, 8);
            }
        
        }
        for (let i=0;i<settings.boardWidth/2;i++) {
            ctx.drawImage(images.board, 8+Math.min(i,5)*8, 0, 8, 8, leftSide+i*8+8, 24, 8, 8);
            ctx.drawImage(images.board, 80-Math.min(i,5)*8, 0, 8, 8, 8*settings.boardWidth+leftSide-i*8, 24, 8, 8);
            ctx.drawImage(images.board, 8+Math.min(i,5)*8, 168, 8, 16, leftSide+i*8+8, 8*settings.boardHeight+32, 8, 16);
            ctx.drawImage(images.board, 80-Math.min(i,5)*8, 168, 8, 16, 8*settings.boardWidth+leftSide-i*8, 8*settings.boardHeight+32, 8, 16);
        }
        //Draw the side info
        images.sideInfo1.src = "img/sega/sideInfo.png";
        ctx.drawImage(images.sideInfo1, leftSide-56, 16);
    }
    else if (settings.visuals == "tgm") {
        canvas.height = Math.max(settings.boardHeight*8+48, 240);
        document.getElementById("textOverlay").style.height = Math.max(settings.boardHeight*8+48, 240) + "px";
        let leftSide = 160-settings.boardWidth*4;
        document.body.style.backgroundColor = "#333";
        document.body.style.backgroundImage = "none";
        images.tiles.src = "img/tgm/tiles.png";
        images.hardDropTile.src = "img/tgm/ghostTiles.png";
        images.board.src = "img/tgm/board.png";
        images.background.src = "img/tgm/backgrounds.png";
        images.background2.src = "img/tgm/backgroundsDark.png";
        images.sideInfo1.src = "img/tgm/sideInfo.png";
        images.sideInfo2.src = "img/tgm/levelBars.png";
        images.sideInfo3.src = "img/tgm/timeDigits.png";
        images.readyGo.src = "img/tgm/readyGo.png";
        images.digits.src = "img/tgm/digits.png";
        images.grades.src = "img/tgm/grades.png";
        let currentBackground = Math.floor(level/100);
        ctx.drawImage(images.background, currentBackground*320, 0, 320, 240, 0, 0, 320, 240);
        //Draw the board (to be improved)
        ctx.drawImage(images.board, 114, 34);
        ctx.drawImage(images.background2, currentBackground*320+120, 40, 80, 160, 120, 40, 80, 160);
        //Draw the side info
        if (level >= 500) {ctx.drawImage(images.sideInfo1, 64, 0, 64, 150, 70, 26, 64, 150);}
        else {ctx.drawImage(images.sideInfo1, 0, 0, 64, 150, 70, 26, 64, 150);}
    }
}

function drawGame() {
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

    //TGM bar flashing (needs to go here because this updates every frame)
    if (settings.visuals == "tgm" && level >= 500) {
        TGMBarState = (TGMBarState+1)%4;
        let leftSide = 160-settings.boardWidth*4;
        ctx.drawImage(images.sideInfo2, 0, (TGMBarState>1 ? 14 : 12), 22, 2, leftSide-32, 192, 22, 2);
    }
    //Main modes time display
    if ((settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle") && settings.timeDisplay) {
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
    //TGM time display
    else if (settings.visuals == "tgm" && settings.timeDisplay) {
        let leftSide = 160-settings.boardWidth*4;
        let currentBackground = Math.floor(level/100);
        ctx.drawImage(images.background, currentBackground*320+leftSide, 206, 80, 24, leftSide, 206, 80, 24);
        let timeString = formatTime(time);
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

// On the Beat visuals driver (uses global sound state)
let beatSunColors = [
	[255, 0, 0],
	[255, 128, 0],
	[255, 255, 0],
	[0, 255, 0],
	[0, 255, 255],
	[0, 0, 255],
	[128, 0, 255],
	[255, 0, 255]
];
let lastBeatSunColors = [0,1];
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
requestAnimationFrame(updateBeatVisuals);

// Export a minimal surface for other modules if needed (none yet as we remain global-style)

