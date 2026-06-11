// Piece placement, movement, rotation, collision, and line clear helpers

function checkPieceLanded(cells = piecePositions) {
	for (const cell of cells) {
		if (cell[0] >= settings.boardHeight-1) return true;
		if (board[cell[0]+1] && board[cell[0]+1][cell[1]] != 0) return true;
	}
	return false;
}

function checkPieceOverlap(cells = piecePositions) {
	for (const cell of cells) {
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
    
    let tempY = pieceTopCorner[0];
    let tempX = pieceTopCorner[1];
    const rotatedOrientation = clockwise ? (pieceOrientation+1)%4 : (pieceOrientation+3)%4;
    const def = getPieceDef(currentPiece);
    let tempPiecePositions = buildPieceCells(currentPiece, rotatedOrientation, tempY, tempX);
    let canRotate = true;

    // Build kick variants preserving legacy order
    function shiftCells(cells, dx, dy) {
        return cells.map(([y,x]) => [y+dy, x+dx]);
    }

    if (def.kickType === "O") {
        // O: no rotation movement, keep existing behavior (no kicks)
        canRotate = !checkPieceOverlap(tempPiecePositions);
    } else if (def.kickType === "I") {
        const right = shiftCells(tempPiecePositions, 1, 0);
        const left  = shiftCells(tempPiecePositions, -1, 0);
        const down  = shiftCells(tempPiecePositions, 0, 1);
        const downRight = shiftCells(tempPiecePositions, 1, 1);
        const downLeft  = shiftCells(tempPiecePositions, -1, 1);
        const orderCW = [tempPiecePositions, right, left, down, downRight, downLeft];
        const orderCCW = [tempPiecePositions, left, right, down, downLeft, downRight];
        const order = clockwise ? orderCW : orderCCW;
        canRotate = false;
        for (const variant of order) {
            if (!checkPieceOverlap(variant)) { tempPiecePositions = variant; canRotate = true; break; }
        }
    } else { // other pieces
        // Center column rule for T, J, L using legacy check (only in 3x3 orientation shapes)
        let centerColumnOverlap = false;
        if (currentPiece == 2 || currentPiece == 5 || currentPiece == 6) centerColumnOverlap = checkCenterColumnRule(tempPiecePositions, tempY, tempX);

        const right = shiftCells(tempPiecePositions, 1, 0);
        const left  = shiftCells(tempPiecePositions, -1, 0);
        const down  = shiftCells(tempPiecePositions, 0, 1);
        const downRight = shiftCells(tempPiecePositions, 1, 1);
        const downLeft  = shiftCells(tempPiecePositions, -1, 1);
        const orderCW = [tempPiecePositions, right, left, down, downRight, downLeft];
        const orderCCW = [tempPiecePositions, left, right, down, downLeft, downRight];
        const order = clockwise ? orderCW : orderCCW;
        if (centerColumnOverlap) {
            canRotate = !checkPieceOverlap(tempPiecePositions);
        } else {
            canRotate = false;
            for (const variant of order) {
                if (!checkPieceOverlap(variant)) { tempPiecePositions = variant; canRotate = true; break; }
            }
        }
    }

    if (canRotate) {
        piecePositions = tempPiecePositions.map(c => [...c]);
        pieceOrientation = rotatedOrientation;
        if (!checkPieceLanded(piecePositions)) {
            if (settings.lockReset == "step") locking = false;
        }
        updateVisuals();
    }
    return;
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
		} else {
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
        for (let i=0;i<piecePositions.length;i++) tempPiecePositions.push([...piecePositions[i]]);
		while (!checkPieceLanded(tempPiecePositions)) {
            for (let i=0;i<tempPiecePositions.length;i++) tempPiecePositions[i][0]++;
			if (inCampaignMode()) maxPushdown++;
		}
        for (let i=0;i<piecePositions.length;i++) piecePositions[i] = [...tempPiecePositions[i]];
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
    for (let i=0;i<piecePositions.length;i++) tempPiecePositions.push([...piecePositions[i]]);
    for (let i=0;i<2;i++) tempPieceTopCorner.push(pieceTopCorner[i]);
	while (!checkPieceLanded(tempPiecePositions)) {
        for (let i=0;i<tempPiecePositions.length;i++) tempPiecePositions[i][0]++;
		tempPieceTopCorner[0]++;
	}
    for (let i=0;i<piecePositions.length;i++) piecePositions[i] = [...tempPiecePositions[i]];
	for (let i=0;i<2;i++) pieceTopCorner[i] = tempPieceTopCorner[i];
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

function landPiece() {
    if (softDropping) boardVisualPosition[1] = 1.5; //Vertical bump
    locking = false;
    currentLockTime = 0;
    
    // Place piece on board - supports variable-sized pieces
    // Store color row index so render stays correct for extended pieces
    const def = (typeof getPieceDef === 'function') ? getPieceDef(currentPiece) : null;
    const colorRow = def ? def.colorIndex : (currentPiece + 1);
    for (let i = 0; i < piecePositions.length; i++) {
        const y = piecePositions[i][0];
        const x = piecePositions[i][1];
        if (y < 0 || y >= settings.boardHeight || x < 0 || x >= settings.boardWidth) continue; // skip cells outside board
        board[y][x] = colorRow;
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
    else {currentDropTime = 60;} //Backup
    waitingForNextPiece = true;
    if (inCampaignMode()) playSound("lock");
    updateVisuals();
    clearLines();
    //Disable softdrop until key is pressed again
    softDropping = false;
    //Add pushdown points - only for main modes
    if (settings.gameMechanics == "classicStyle" || settings.gameMechanics == "masterStyle" || settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat") {
        // Main modes don't add pushdown points
    } else {
        score += maxPushdown;
    }
    maxPushdown = 0;
    currentPushdown = 0;
}

function placePiece(pieceType) {
    if (inCampaignMode() && settings.gameMechanics != "onTheBeat" && level == 999) {
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
            if (piecePlacements[pieceType]) {
                piecePositions = piecePlacements[pieceType].map(p => [...p]);
                for (let i=0;i<piecePositions.length;i++) {
                    if (pieceType==0 || pieceType==1) {piecePositions[i][1] += settings.boardWidth/2-2;}
                    else {piecePositions[i][1] += settings.boardWidth/2-3;}
                }
                if (pieceType==0) {pieceTopCorner = [-2,1];}
                else if (pieceType==1) {pieceTopCorner = [0,1];}
                else {pieceTopCorner = [-1,1];}
                pieceTopCorner[1] += settings.boardWidth/2-3;
            } else {
                // Fallback for extended pieces: build from definitions with classic top-left
                if (pieceType==0) {pieceTopCorner = [-2,1];}
                else if (pieceType==1) {pieceTopCorner = [0,1];}
                else {pieceTopCorner = [-1,1];}
                pieceTopCorner[1] += settings.boardWidth/2-3;
                piecePositions = buildPieceCells(pieceType, 0, pieceTopCorner[0], pieceTopCorner[1]);
            }
            break;
        case "nes":
            piecePositions = piecePlacements[pieceType].map(p => [...p]);
            for (let i=0;i<piecePositions.length;i++) piecePositions[i][1] += settings.boardWidth/2-2;
            if (pieceType==0) {pieceTopCorner = [-2,0];}
            else if (pieceType==1) {pieceTopCorner = [0,1];}
            else {pieceTopCorner = [-1,1];}
            pieceTopCorner[1] += settings.boardWidth/2-2;
            break;
        case "dx":
            piecePositions = piecePlacements[pieceType].map(p => [...p]);
            for (let i=0;i<piecePositions.length;i++) {
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
            piecePositions = piecePlacements[pieceType].map(p => [...p]);
            for (let i=0;i<piecePositions.length;i++) {
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
            if (piecePlacements[pieceType]) {
                piecePositions = piecePlacements[pieceType].map(p => [...p]);
                for (let i=0;i<piecePositions.length;i++) {
                    if (pieceType==0 || pieceType==1) {piecePositions[i][1] += settings.boardWidth/2-2;}
                    else {piecePositions[i][1] += settings.boardWidth/2-3;}
                }
                if (pieceType==0) {pieceTopCorner = [-1,1];}
                else if (pieceType==1) {pieceTopCorner = [0,1];}
                else {pieceTopCorner = [-1,1];}
                pieceTopCorner[1] += settings.boardWidth/2-3;
            } else {
                // Fallback for extended pieces: build from definitions with main-mode top-left
                if (pieceType==0) {pieceTopCorner = [-1,1];}
                else if (pieceType==1) {pieceTopCorner = [0,1];}
                else {pieceTopCorner = [-1,1];}
                pieceTopCorner[1] += settings.boardWidth/2-3;
                piecePositions = buildPieceCells(pieceType, 0, pieceTopCorner[0], pieceTopCorner[1]);
            }
            break;
    }
    currentPiece = pieceType;
    pieceOrientation = 0;
    if (piecesDropped.length <= pieceType) {
        const toAdd = pieceType - piecesDropped.length + 1;
        for (let i=0;i<toAdd;i++) piecesDropped.push(0);
    }
    piecesDropped[pieceType]++;

    //Initial rotation system (IRS)
    if (settings.IRS && (keysHeld[4] || keysHeld[6])) {
        rotatePiece(true, true);
    }
    else if (settings.IRS && (keysHeld[5] || keysHeld[7])) {
        rotatePiece(false, true);
    }

    if (getDropInterval() <= 0.05) maxDrop(); //20G

    //Overriding the initial DAS if arrow keys are held (For main modes)
    if (inCampaignMode() && keysHeld[0]) {currentDASTime = getDAS();}
    else if (inCampaignMode() && keysHeld[1]) {currentDASTime = getDAS();}

    //Cancel the visual line clears if the piece is placed before the animation is finished
    if (visualInterval) {
        if (settings.gameMechanics != "classicStyle" && settings.gameMechanics != "masterStyle" && settings.gameMechanics != "dragonStyle" && settings.gameMechanics != "onTheBeat") clearInterval(visualInterval);
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

