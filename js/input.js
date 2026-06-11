document.addEventListener("keydown", function(event) {
    if (keybindToReplace != "") {
        if (event.key == "Escape") {
            keybindToReplace = "";
            updateKeybindList();
            return;
        }
        //Find the key that maps to the value
        let keyToReplace = getKeybind(keybindToReplace);
        //Replace the key
        delete keyConfig[keyToReplace];
        keyConfig[event.key] = keybindToReplace;
        keybindToReplace = "";
        localStorage.setItem("dergorisKeybinds", JSON.stringify(keyConfig));
        updateKeybindList();
        return;
    }
    if(!(event.key in keyConfig)) return;

    const action = keyConfig[event.key];

    switch (action) {
        case "left":
            if (!waitingForNextPiece) setInitialDAS(0);
            keysHeld[0] = true;
            break;
        case "right":
            if (!waitingForNextPiece) setInitialDAS(1);
            keysHeld[1] = true;
            break;
        case "hardDrop":
            if (!gamePlaying && onCampaignScreen && document.getElementsByClassName("container")[1].style.display != "none") {
                selectMenuMode(Math.max(1,currentMenuMode-1));
            }
            else {
                hardDrop();
                keysHeld[2] = true;
            }
            break;
        case "softDrop":
            if (!gamePlaying && onCampaignScreen && document.getElementsByClassName("container")[1].style.display != "none") {
                selectMenuMode(Math.min(4,currentMenuMode+1));
            }
            else {
                softDrop();
                keysHeld[3] = true;
            }
            break;
        case "rotClockwise":
            //rotatePiece(true);
            if (keysHeld[4] == 0) keysHeld[4] = 1;
            break;
        case "rotClockwiseAlt":
            //rotatePiece(true, false, true);
            if (keysHeld[6] == 0) keysHeld[6] = 1;
            break;
        case "rotAnticlockwise":
            //rotatePiece(false);
            if (keysHeld[5] == 0) keysHeld[5] = 1;
            break;
        case "rotAnticlockwiseAlt":
            //rotatePiece(false, false, true);
            if (keysHeld[7] == 0) keysHeld[7] = 1;
            break;
        case "exit":
            if (!gamePlaying && document.getElementById("keybindsContainer").style.display == "block") hideKeybinds();
            else if (!gamePlaying && document.getElementById("game").style.display == "block") {
                showBlackCover();
                setTimeout(returnToMenu, 1000);
            }
            else if (!gamePlaying) switchToTab(1);
            break;
        default:
            console.warn(`Action ${action} triggered by key ${event.key} but it is missing a handler`);
            break;
    }
})

document.addEventListener("keyup", function(event) {
    if(!(event.key in keyConfig)) return;

    const action = keyConfig[event.key];

    switch (action) {
        case "left":
            keysHeld[0] = false;
            break;
        case "right":
            keysHeld[1] = false;
            break;
        case "hardDrop":
            keysHeld[2] = false;
            break;
        case "softDrop":
            softDropping = false;
            keysHeld[3] = false;
            break;
        case "rotClockwise":
            keysHeld[4] = 0;
            break;
        case "rotClockwiseAlt":
            keysHeld[6] = 0;
            break;
        case "rotAnticlockwise":
            keysHeld[5] = 0;
            break;
        case "rotAnticlockwiseAlt":
            keysHeld[7] = 0;
            break;
    }
})

function getKeybind(action) {
    for (const [key, value] of Object.entries(keyConfig)) {
        if (value == action) return key;
    }
    return "";
}

function changeKeybind(index) {
    keybindToReplace = keybindNames[index-1];
    document.getElementsByClassName("keybindButton")[index-1].innerText = "PRESS A KEY..."
    document.getElementsByClassName("keybindButton")[index-1].blur();
}

function updateKeybindList() {
    for (let i=0;i<8;i++) {
        if (getKeybind(keybindNames[i]) == " ") {document.getElementsByClassName("keybind")[i].innerText = "Space";}
        else {document.getElementsByClassName("keybind")[i].innerText = getKeybind(keybindNames[i]);}
        document.getElementsByClassName("keybindButton")[i].innerText = "CHANGE"
    }
}
