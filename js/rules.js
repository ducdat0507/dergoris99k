// Rules and shared utility functions moved from script.js

function convertToTime(seconds) {
	let timeString = "";
	timeString += Math.floor(seconds/60).toString().padStart(2, "0") + ":"; //minutes
	timeString += Math.floor(seconds%60).toString().padStart(2, "0") + ":"; //seconds
	timeString += Math.floor((seconds%1)*100).toString().padStart(2, "0"); //Hundredths of a second
	return timeString;
}

function getTimeColor(seconds) {
	let timeColor;
	if (seconds < 55) {timeColor = 3;}
	else if (seconds < 60) {timeColor = 2;}
	else if (seconds < 65) {timeColor = 1;}
	else {timeColor = 0;}
	return timeColor;
}

function inCampaignMode() {
	return settings.gameMechanics == "classicStyle" || settings.gameMechanics == "masterStyle" || settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat";
}

function getDropInterval() {
	if (settings.twentyGOverride) return 0.05;
	else if (settings.gameMechanics == "classicStyle") return classicStyleDropIntervals[Math.floor(level/100)];
	else if (settings.gameMechanics == "masterStyle") {
		let currentLevelPoint = 0;
		while (masterStyleIntervalLevels[currentLevelPoint+1] <= level) currentLevelPoint++;
		return masterStyleIntervals[currentLevelPoint];
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
		return tgmIntervals[currentLevelPoint];
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

function playNextPieceAudio(index) {
	switch (index) {
		case 0: playSound("pieceI"); break;
		case 1: playSound("pieceO"); break;
		case 2: playSound("pieceT"); break;
		case 3: playSound("pieceS"); break;
		case 4: playSound("pieceZ"); break;
		case 5: playSound("pieceJ"); break;
		case 6: playSound("pieceL"); break;
		default: /* no audio for extended pieces */ break;
	}
}

function getRandomPiece() {
	let chosenPiece;
	// Determine available piece count
	switch (settings.randomizer) {
		case "random":
			chosenPiece = getRandomValidPiece();
			break;
		case "tgm":
			let startingViablePieces = [0,2,5,6]; //First piece must be I, T, J or L
			if (TGMFirstMove && settings.gameMechanics != "onTheBeat") {chosenPiece = startingViablePieces[Math.floor(Math.random()*startingViablePieces.length)];}
			else {
				chosenPiece = getRandomValidPiece();
				for (let i=0; i<3; i++) { //Check 4 times if the piece is in the last 4 pieces
					if (chosenPiece == lastDroppedPieces[0] || chosenPiece == lastDroppedPieces[1] || chosenPiece == lastDroppedPieces[2] || chosenPiece == lastDroppedPieces[3]) chosenPiece = getRandomValidPiece();
				}
			}
			break;
		default:
			chosenPiece = getRandomValidPiece();
			break;
	}
	//Update last dropped pieces array
	lastDroppedPieces.unshift(chosenPiece);
	if (lastDroppedPieces.length > 7) lastDroppedPieces.pop();
	return chosenPiece;
}

function getRandomValidPiece() {
	let validIDs = [0,1,2,3,4,5,6];
	if ((settings.includePentominoes == "common" && Math.random() < 0.15) || (settings.includePentominoes == "rare" && Math.random() < 0.05)) validIDs = validIDs.concat([7,8,9,10,11,12,13,14,15,16,17]);
	if ((settings.includeDiscordant == "common" && Math.random() < 0.25) || (settings.includeDiscordant == "rare" && Math.random() < 0.08)) validIDs = validIDs.concat([18,19,20,21,22,23]);
	if ((settings.includeMega == "common" && Math.random() < 0.3) || (settings.includeMega == "rare" && Math.random() < 0.1)) {
		validIDs = validIDs.concat([24,25]);
		// Huge megaminoes are rarer
		if (Math.random() < 0.4) validIDs.push(26);
		if (Math.random() < 0.4) validIDs.push(27);
		if (Math.random() < 0.4) validIDs.push(28);
	}
	return validIDs[Math.floor(Math.random()*validIDs.length)];
}

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

