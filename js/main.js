// Main game flow and loop moved from script.js

function startGame() {
	hideBlackCover();
	stopSound("menuMusic");
	level = settings.startingLevel;
	document.getElementsByClassName("container")[1].style.display = "none"; //Campaign screen
	document.getElementsByClassName("container")[2].style.display = "none"; //Custom game screen
	document.getElementById("backgroundCanvas").style.display = "none";
	document.getElementById("game").style.display = "block";
	document.getElementById("effectOverlay").style.display = "block";
	document.getElementById("textOverlay").style.display = "block";
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
		grade = Math.floor(level/50);
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
	for (let i=0;i<settings.boardHeight;i++) board.push(Array(settings.boardWidth).fill(0));
	if (settings.visuals == "classicStyle" || settings.visuals == "masterStyle" || settings.visuals == "dragonStyle" || settings.visuals == "onTheBeat") {readyGo(1);} else {
		gamePlaying = true;
		placePiece(getRandomPiece());
		nextPiece = getRandomPiece();
		setNextPieceVisuals(nextPiece);
		updateVisuals();
	}
}

function updateVariables() {
	// Handle "On the Beat" mode intro section timing (must run even when gamePlaying is false)
	if (settings.gameMechanics == "onTheBeat" && gameMusic7) {
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

		// Handle beat-based piece landing and progression (only during gameplay)
		if (gamePlaying) {
			// Grade progression based on beat time
			while (currentBeatTime > onTheBeatGradePoints[grade]) {
				grade++;
				// Update grade visuals if needed
			}

			// Beat-based piece landing - pieces automatically land on beats
			if (currentBeatTime > onTheBeatBeats[beatsPassed+1]) {
				// Calculate beat speed for next beat
				currentBeatSpeed = 0;
				if (onTheBeatBeats[beatsPassed+2] - onTheBeatBeats[beatsPassed+1] <= 0.5) currentBeatSpeed = 3;
				else if (onTheBeatBeats[beatsPassed+2] - onTheBeatBeats[beatsPassed+1] <= 0.75) currentBeatSpeed = 2;
				else if (onTheBeatBeats[beatsPassed+2] - onTheBeatBeats[beatsPassed+1] <= 1) currentBeatSpeed = 1;

				// Auto hard drop and land the piece on the beat
				if (!waitingForNextPiece) {
					maxDrop(); // Hard drop (20G)
					landPiece(); // Land the piece
				}
			}

			// Update beats passed counter
			while (currentBeatTime > onTheBeatBeats[beatsPassed+1]) beatsPassed++;
		}
	}

    // Return early if not playing
	if (!gamePlaying) {
		timeOfLastUpdate = Date.now(); 
		return;
	}

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

	// Horizontal DAS
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

	// Lock time update when landed
	if (checkPieceLanded(piecePositions) && locking) {
		currentLockTime -= (timeMultiplier*60);
		updateVisuals();
	}

	// Gravity
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
			} else {
				placePiece(nextPiece);
				nextPiece = getRandomPiece();
				// Next piece sound removed for classic modes
				setNextPieceVisuals(nextPiece);
			}
			updateVisuals();
			if (inCampaignMode() && settings.gameMechanics != "onTheBeat" && keysHeld[3]) { //Starting soft drop if key is held
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

    updateVisuals();
	timeOfLastUpdate = Date.now();
}

setInterval(updateVariables, 1000/60);

function readyGo(stage) {
    if (stage == 1) {
        let leftSide = 160-settings.boardWidth*4;
        //Get the current piece to display as the next piece
        if (settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat") {
            onTheBeatNextPieces[0] = getRandomPiece();
            TGMFirstMove = false;
            onTheBeatNextPieces[1] = getRandomPiece();
            onTheBeatNextPieces[2] = getRandomPiece();
        }
        else {nextPiece = getRandomPiece();}
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
            let currentBackground = Math.floor(level/100);
            ctx.drawImage(images.background2, currentBackground*320+120, 40, 80, 160, 120, 40, 80, 160);
            //Display "Ready"
            ctx.drawImage(images.readyGo, 0, 0, 76, 19, 122, 110, 76, 19);
            setTimeout(readyGo, 1000, 2);

            //Grade
            ctx.drawImage(images.grades, 27*grade, 0, 27, 26, 84, 34, 27, 26);

            //Next piece
            setNextPieceVisuals(nextPiece);

            //Text (Copied from updateVisuals, any change there should also happen here)
            //This is a lot of code duplication! Find a way to reduce this ASAP
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
        else {
            //Clear the canvas
            ctx.clearRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
            ctx.drawImage(images.sideInfo4, leftSide, 40);
            //Display "Ready"
            ctx.drawImage(images.readyGo, 0, 0, 76, 19, 122, 110, 76, 19);
            if (settings.gameMechanics != "onTheBeat") setTimeout(readyGo, 1000, 2);

            //Grade
            ctx.clearRect(211, 34, 48, 32);
            ctx.drawImage(images.grades, 0, 32*grade, 48, 32, 211, 34, 48, 32);

            //Next piece
            if (settings.gameMechanics == "dragonStyle" || settings.gameMechanics == "onTheBeat") {
                setNextPieceVisuals(onTheBeatNextPieces[0],0);
                setNextPieceVisuals(onTheBeatNextPieces[1],1);
                setNextPieceVisuals(onTheBeatNextPieces[2],2);
            }
            else {setNextPieceVisuals(nextPiece);}

            //Text (Copied from updateVisuals, any change there should also happen here)
            //This is a lot of code duplication! Find a way to reduce this ASAP
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
                if (grade >= 17) {
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
    }
    else if (stage == 2) {
        if (settings.visuals != "onTheBeat") playSound("go");
        if (settings.visuals == "tgm") {
            //Clear the canvas
            let currentBackground = Math.floor(level/100);
            ctx.drawImage(images.background2, currentBackground*320+120, 40, 80, 160, 120, 40, 80, 160);
            //Display "Go"
            ctx.drawImage(images.readyGo, 100, 0, 45, 19, 138, 110, 45, 19);
            setTimeout(readyGo, 1000, 3);
        }
        else {
            let leftSide = 160-settings.boardWidth*4;
            //Clear the canvas
            ctx.clearRect(leftSide, 40, (8*settings.boardWidth), (8*settings.boardHeight));
            ctx.drawImage(images.sideInfo4, leftSide, 40);
            //Display "Go"
            ctx.drawImage(images.readyGo, 100, 0, 45, 19, 138, 110, 45, 19);
            if (settings.gameMechanics != "onTheBeat") setTimeout(readyGo, 1000, 3);
        }
    }
    else if (stage == 3) {
        gamePlaying = true;
        if (settings.visuals != "tgm" && settings.visuals != "onTheBeat") {
            playSound("gameMusic");
            setSoundVolume("gameMusic", game.musicVolume);
        }
        updateVisuals();
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

            let timeString = formatTime(averageSectionTime);
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
         
        // Power
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

        // Decoration
        let decorEarned = 0;
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