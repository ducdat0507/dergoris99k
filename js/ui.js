// UI helpers moved from script.js

function showKeybinds() { hideSettings(); document.getElementById("keybindsContainer").style.display = "block"; }
function hideKeybinds() { document.getElementById("keybindsContainer").style.display = "none"; }
function showSettings() { hideKeybinds(); document.getElementById("settingsContainer").style.display = "block"; }
function hideSettings() { document.getElementById("settingsContainer").style.display = "none"; }

function showBlackCover() {
	document.getElementById("blackCoverLeft").style.width = "50%";
	document.getElementById("blackCoverRight").style.width = "50%";
}

function hideBlackCover() {
	document.getElementById("blackCoverLeft").style.width = "0";
	document.getElementById("blackCoverRight").style.width = "0";
	if (document.getElementsByClassName("startingButton")[0]) document.getElementsByClassName("startingButton")[0].style.display = "none";
	if (document.getElementsByClassName("startingButton")[1]) document.getElementsByClassName("startingButton")[1].style.display = "none";
}

