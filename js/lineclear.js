// Line clearing logic and visual effects

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
        drawGame();
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
            drawGame();
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
        drawGame();
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
        drawGame();
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
        drawGame();
    }
    //Update master style grade
    else if (settings.gameMechanics == "masterStyle" && score > masterStyleGradeConditions[grade+1]) {
        while (score > masterStyleGradeConditions[grade+1]) grade++;
        drawGame();
    }
    //Update dragon style grade
    else if (settings.gameMechanics == "dragonStyle" && Math.floor(level/50) > grade && grade < 19) {
        grade = Math.floor(level/50);
        drawGame();
    }
    else if (settings.gameMechanics == "dragonStyle" && level >= 999 && grade == 19) {
        grade = 20;
        drawGame();
    }

    //Update TGM grade
    if (settings.gameMechanics == "tgm" && score > tgmGradeConditions[grade+1]) {
        while (score > tgmGradeConditions[grade+1]) grade++;
        drawGame();
    }
    if (level == 999 && GMQualifying && score >= 126000 && time < 810) {grade = 18; drawGame();} //GM grade

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
        drawGame();
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
        drawGame();
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
    drawGame();
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
            setTimeout(drawGame, 1000/3);
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
            setTimeout(drawGame, 1000/15);
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
        drawGame();
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
        drawGame();
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
        drawGame();
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
        drawGame();
    }
}
