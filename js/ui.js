// UI helpers moved from script.js

let blackCoverShown = false;

function showKeybinds() {
	hideSettings();
	document.getElementById("keybindsContainer").style.display = "block";
	updateInputPrompts();
}
function hideKeybinds() {
	document.getElementById("keybindsContainer").style.display = "none";
	updateInputPrompts();
}
function showSettings() {
	hideKeybinds();
	document.getElementById("settingsContainer").style.display = "block";
	setActiveForm(document.getElementById("settingsForm"));
	updateInputPrompts();
}
function hideSettings() {
	document.getElementById("settingsContainer").style.display = "none";
	setActiveForm(document.getElementById("mainMenuForm"));
	updateInputPrompts();
}

function showBlackCover() {
	blackCoverShown = true;
	document.getElementById("blackCoverLeft").style.width = "50%";
	document.getElementById("blackCoverRight").style.width = "50%";
}

function hideBlackCover() {
	blackCoverShown = false;
	document.getElementById("blackCoverLeft").style.width = "0";
	document.getElementById("blackCoverRight").style.width = "0";
}



function draw9Patch(ctx, image, sx, sy, sw, sh, pTop, pLeft, pBottom, pRight, dx, dy, dw, dh) {
	const sOuterLeft = sx, sInnerLeft = sx + pLeft, sInnerRight = sx + sw - pRight;
	const sOuterTop = sy, sInnerTop = sy + pTop, sInnerBottom = sy + sh - pBottom;
	const sInnerWidth = sw - pLeft - pRight, sInnerHeight = sh - pTop - pBottom;
	const dOuterLeft = dx, dInnerLeft = dx + pLeft, dInnerRight = dx + dw - pRight;
	const dOuterTop = dy, dInnerTop = dy + pTop, dInnerBottom = dy + dh - pBottom;
	const dInnerWidth = dw - pLeft - pRight, dInnerHeight = dh - pTop - pBottom;

	// Draw the corners
	ctx.drawImage(image, sOuterLeft, sOuterTop, pLeft, pTop, dOuterLeft, dOuterTop, pLeft, pTop);
	ctx.drawImage(image, sInnerRight, sOuterTop, pRight, pTop, dInnerRight, dy, pRight, pTop);
	ctx.drawImage(image, sOuterLeft, sInnerBottom, pLeft, pBottom, dOuterLeft, dInnerBottom, pLeft, pBottom);
	ctx.drawImage(image, sInnerRight, sInnerBottom, pRight, pBottom, dInnerRight, dInnerBottom, pRight, pBottom);

	// Draw the edges
	ctx.drawImage(image, sInnerLeft, sOuterTop, sInnerWidth, pTop, dInnerLeft, dOuterTop, dInnerWidth, pTop);
	ctx.drawImage(image, sInnerLeft, sInnerBottom, sInnerWidth, pBottom, dInnerLeft, dInnerBottom, dInnerWidth, pBottom);
	ctx.drawImage(image, sOuterLeft, sInnerTop, pLeft, sInnerHeight, dOuterLeft, dInnerTop, pLeft, dInnerHeight);
	ctx.drawImage(image, sInnerRight, sInnerTop, pRight, sInnerHeight, dInnerRight, dInnerTop, pRight, dInnerHeight);

	// Draw the center
	ctx.drawImage(image, sInnerLeft, sInnerTop, sInnerWidth, sInnerHeight, dInnerLeft, dInnerTop, dInnerWidth, dInnerHeight);
}