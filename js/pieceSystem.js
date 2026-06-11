// Generic helpers for new piece system (main modes)

function getOrientation(pieceType, orientation) {
	const def = window.getPieceDef ? window.getPieceDef(pieceType) : null;
	if (!def) return null;
	return def.orientations[orientation % 4];
}

// Compute absolute board cells for a piece at top-left corner (pieceTopCorner)
function buildPieceCells(pieceType, orientation, topY, topX) {
	const ori = getOrientation(pieceType, orientation);
	if (!ori) return [];
	return ori.cells.map(([dy, dx]) => [topY + dy, topX + dx]);
}

// Compute default spawn top-left for main modes given piece type
// Keeps legacy spawn positions so gameplay doesn't change.
function getSpawnTopLeft(pieceType) {
	// Matches logic in placePiece for main modes (classic/master/dragon/onTheBeat/tgm path)
	// piecePlacements still defines individual cell coordinates used to seed piecePositions,
	// but top-left is used for rotation bounding boxes. Keep same as old behavior:
	if (pieceType === 0) return [-1, 1]; // I
	if (pieceType === 1) return [0, 1];  // O
	return [-1, 1]; // others
}

// Draw a next piece in the side panel generically for main modes
function drawNextPieceGeneric(ctx, images, index, xOffset, leftSide) {
	const def = getPieceDef(index);
	const ori = def.orientations[0];
	ctx.clearRect(leftSide + xOffset*36 + 24, 0, 32, 32);
	ctx.fillStyle = "#080808";
	// Center within a 4x2 tile area (32x16) used by previous code
	const cellSize = 8;
	const areaW = 4, areaH = 2;
	const offsetX = 24 + Math.floor((areaW - ori.width) / 2) * cellSize;
	const offsetY = 32 - def.nextPieceYPos * cellSize; // bias to bottom
	const tileSY = def.colorIndex * 8;
	for (const [dy, dx] of ori.cells) {
		const px = leftSide + xOffset*36 + offsetX + dx*cellSize;
		const py = offsetY + dy*cellSize;
		ctx.drawImage(images.tiles, 0, tileSY, 8, 8, px, py, 8, 8);
	}
}
