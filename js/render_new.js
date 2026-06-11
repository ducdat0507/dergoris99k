let canvas;
let ctx;
let images = {};

function initImages() {
    images.board = new Image();
    images.board.src = "img/main/board.png";
    images.background = new Image();
    images.sideInfo = new Image();
    images.tiles = new Image();
    images.tiles.src = "img/main/tiles.png";
    images.hardDropTile = new Image();
    images.hardDropTile.src = "img/main/ghostTiles.png";
    images.grades = new Image();
    images.grades.src = "img/main/gradesClassic.png";
    images.fishingPieces = new Image();
    images.fishingPieces.src = "img/main/fishingPieces.png";
    images.readyGo = new Image();
    images.readyGo.src = "img/main/readyGo.png";
    images.digits = new Image();
    images.digits.src = "img/main/digits.png";
    images.styles = new Image();
    images.styles.src = "img/main/styles.png";
    images.finish = new Image();
    images.finish.src = "img/main/finish.png";
    images.explosionEffect = new Image();
    images.explosionEffect.src = "img/main/explosionEffect.png";
    images.digitsSmall = new Image();
    images.digitsSmall.src = "img/main/digitsSmall.png";
    images.beatBar = new Image();
    images.beatBar.src = "img/main/beatBar.png";
}

function initCanvas() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    
    // Only support main visuals
    if (settings.visuals == "classicStyle" || !settings.visuals) {
        images.board.src = "img/main/board.png";
        images.grades.src = "img/main/gradesClassic.png";
    }
    else if (settings.visuals == "masterStyle") {
        images.board.src = "img/main/board2.png";
        images.grades.src = "img/main/gradesMaster.png";
    }
    else if (settings.visuals == "dragonStyle") {
        images.board.src = "img/main/board3.png";
        images.grades.src = "img/main/gradesDragon.png";
    }
    else if (settings.visuals == "onTheBeat") {
        images.grades.src = "img/main/gradesOnTheBeat.png";
    }

    canvas.height = 208;
    document.getElementById("textOverlay").style.height = "208px";
    if (settings.visuals === "classicStyle" || !settings.visuals) {
        document.body.style.backgroundColor = "#424b83";
    }
    else if (settings.visuals === "masterStyle") {
        document.body.style.backgroundColor = "#157884";
    }
    else if (settings.visuals === "dragonStyle") {
        document.body.style.backgroundColor = "#1e1e85";
    }
    else {
        document.body.style.backgroundColor = "#080808";
    }
    
    if (settings.visuals == "onTheBeat") {
        ctx.clearRect(210, 192, 32, 2); //Level separating bar
        ctx.clearRect(210, 64, 54, 48); //Grade info
        ctx.clearRect(0, 32, 112, 176); //Left side info
        ctx.drawImage(images.beatBar, 0, 0, 14, 176, 84, 32, 14, 176);
    }
}

function drawBoard() {
    for (let row=0;row<settings.boardHeight;row++) {
        for (let col=0;col<settings.boardWidth;col++) {
            let tileColor = board[row][col];
            if (tileColor != 0) {
                drawTile(col, row, tileColor);
            }
        }
    }
}

function drawTile(x, y, color, alpha=1) {
    if (alpha < 1) {
        ctx.globalAlpha = alpha;
    }
    
    // Main mode tile rendering
    let tileX = (color-1) * 16;
    let canvasX = 96 + x * 8;
    let canvasY = 32 + y * 8;
    
    ctx.drawImage(images.tiles, tileX, 0, 16, 16, canvasX, canvasY, 16, 16);
    
    if (alpha < 1) {
        ctx.globalAlpha = 1;
    }
}

function drawGhostPiece() {
    if (!gamePlaying || !settings.ghostPiece) return;
    
    let ghostY = getGhostPosition();
    let alpha = 0.5;
    
    for (let i = 0; i < piecePositions.length; i++) {
        let x = piecePositions[i][1];
        let y = ghostY + (piecePositions[i][0] - pieceTopCorner[0]);
        
        if (y >= 0 && y < settings.boardHeight) {
            drawTile(x, y, currentPiece + 1, alpha);
        }
    }
}

function drawActivePiece() {
    if (!gamePlaying) return;
    
    for (let i = 0; i < piecePositions.length; i++) {
        let x = piecePositions[i][1];
        let y = piecePositions[i][0];
        
        if (y >= 0) {
            drawTile(x, y, currentPiece + 1);
        }
    }
}

function drawHoldPiece() {
    if (holdPiece === null) return;
    
    // Main mode hold piece rendering
    let startX = 35;
    let startY = 100;
    
    ctx.drawImage(images.fishingPieces, holdPiece * 32, 0, 32, 32, startX, startY, 32, 32);
}

function drawNextPieces() {
    // Main mode next piece rendering
    let startX = 210;
    let startY = 100;
    
    for (let i = 0; i < Math.min(nextPieces.length, 6); i++) {
        let piece = nextPieces[i];
        let x = startX;
        let y = startY + i * 20;
        
        ctx.drawImage(images.fishingPieces, piece * 32, 0, 32, 32, x, y, 16, 16);
    }
}

function updateVisuals() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.board, 0, 0);
    
    drawBoard();
    drawGhostPiece();
    drawActivePiece();
    drawHoldPiece();
    drawNextPieces();
    
    updateUI();
}

function updateUI() {
    // Update score, level, lines, etc.
    if (scoreText) scoreText.innerText = score.toLocaleString();
    if (levelText) levelText.innerText = level;
    if (linesText) linesText.innerText = linesCleared;
    if (timeText && settings.timeDisplay) {
        let minutes = Math.floor(timeElapsed / 60000);
        let seconds = Math.floor((timeElapsed % 60000) / 1000);
        timeText.innerText = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }
}

function drawNumber(num, x, y, digits=6) {
    let numStr = num.toString().padStart(digits, '0');
    for (let i = 0; i < numStr.length; i++) {
        let digit = parseInt(numStr[i]);
        ctx.drawImage(images.digits, digit * 8, 0, 8, 16, x + i * 8, y, 8, 16);
    }
}

function initText() {
    // Clear any existing text
    document.getElementById("textOverlay").innerHTML = "";
    
    // Main mode text elements
    if (!scoreText) {
        scoreText = document.createElement("p");
        scoreText.style.position = "absolute";
        scoreText.style.color = "white";
        scoreText.style.fontFamily = "monospace";
        scoreText.style.fontSize = "14px";
        scoreText.style.margin = "0";
        scoreText.style.top = "50px";
        scoreText.style.left = "20px";
        document.getElementById("textOverlay").appendChild(scoreText);
    }
    
    if (!levelText) {
        levelText = document.createElement("p");
        levelText.style.position = "absolute";
        levelText.style.color = "white";
        levelText.style.fontFamily = "monospace";
        levelText.style.fontSize = "14px";
        levelText.style.margin = "0";
        levelText.style.top = "80px";
        levelText.style.left = "20px";
        document.getElementById("textOverlay").appendChild(levelText);
    }
    
    if (!linesText) {
        linesText = document.createElement("p");
        linesText.style.position = "absolute";
        linesText.style.color = "white";
        linesText.style.fontFamily = "monospace";
        linesText.style.fontSize = "14px";
        linesText.style.margin = "0";
        linesText.style.top = "110px";
        linesText.style.left = "20px";
        document.getElementById("textOverlay").appendChild(linesText);
    }
    
    if (settings.timeDisplay && !timeText) {
        timeText = document.createElement("p");
        timeText.style.position = "absolute";
        timeText.style.color = "white";
        timeText.style.fontFamily = "monospace";
        timeText.style.fontSize = "14px";
        timeText.style.margin = "0";
        timeText.style.top = "140px";
        timeText.style.left = "20px";
        document.getElementById("textOverlay").appendChild(timeText);
    }
}

// Global text elements
let scoreText = null;
let levelText = null;
let linesText = null;
let timeText = null;
