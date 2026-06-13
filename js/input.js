let primaryInputMethod = "keyboard";
let gamepadState = {
    gamepad: null,
    type: "",
    oldButtons: {},
    oldAxes: {},
};

function doActionDown(action) {
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
                playSound('buttonClick'); 
            }
            else {
                hardDrop();
                keysHeld[2] = true;
            }
            break;

        case "softDrop":
            if (!gamePlaying && onCampaignScreen && document.getElementsByClassName("container")[1].style.display != "none") {
                selectMenuMode(Math.min(4,currentMenuMode+1));
                playSound('buttonClick'); 
            }
            else {
                softDrop();
                keysHeld[3] = true;
            }
            break;

        case "rotClockwise":
            if (!gamePlaying && onCampaignScreen && document.getElementsByClassName("container")[1].style.display != "none") {
                if (!blackCoverShown) {
                    showBlackCover(); 
                    playSound('buttonClick'); 
                    fadeOutSound('menuMusic', 500); 
                    setTimeout(startGame, 1000)
                }
            } else {
                if (keysHeld[4] == 0) keysHeld[4] = 1;
            }
            break;

        case "rotClockwiseAlt":
            if (keysHeld[6] == 0) keysHeld[6] = 1;
            break;

        case "rotAnticlockwise":
            if (!gamePlaying && document.getElementsByClassName("container")[1].style.display != "none") {
                playSound('buttonClick'); 
                switchToTab(1);
            } else {
                if (keysHeld[5] == 0) keysHeld[5] = 1;
            }
            break;

        case "rotAnticlockwiseAlt":
            if (keysHeld[7] == 0) keysHeld[7] = 1;
            break;

        case "exit":
            if (document.getElementById("keybindsContainer").style.display == "block") hideKeybinds();
            else if (document.getElementById("game").style.display == "block") {
                if (!blackCoverShown) {
                    gamePlaying = false;
                    showBlackCover();
                    setTimeout(returnToMenu, 1000);
                }
            }
            else if (!gamePlaying) switchToTab(1);
            break;

        default:
            console.warn(`Action ${action} triggered by key ${event.key} but it is missing a handler`);
            break;
    }
}

function doActionUp(action) {
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
}

function updateInputMethod() {
    let gamepad = navigator.getGamepads?.()[0];
    gamepadState.gamepad = gamepad;
    
    if (gamepad) {
        console.log(gamepad.id);
        primaryInputMethod = "gamepad"
        gamepadState.type = (gamepad.id.includes("Sony")) ? "dualshock" : "xbox"
    } else {
        primaryInputMethod = "keyboard"
    }

    redrawCurrentInputPrompts();
}



// Keyboard

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
    doActionDown(action);
})

document.addEventListener("keyup", function(event) {
    if(!(event.key in keyConfig)) return;
    const action = keyConfig[event.key];
    doActionUp(action);
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

function getActionKey(action) {
    return Object.entries(keyConfig).find(x => x[1] == action)?.[0]
}



// Gamepad

window.addEventListener("gamepadconnected", function(event) {
    updateInputMethod()
})
window.addEventListener("gamepaddisconnected", function(event) {
    updateInputMethod()
})
window.addEventListener("load", function(event) {
    updateInputMethod()
})

function gamepadLoop() {
    if (gamepadState.gamepad) {
        for (let button in gamepadState.gamepad.buttons) {
            let state = gamepadState.gamepad.buttons[button].value;
            if (gamepadState.oldButtons[button] != state) {
                let action = gamepadButtonConfig[button];
                if (action) (state ? doActionDown : doActionUp)(action);
                gamepadState.oldButtons[button] = state;
            }
        }
        for (let axis in gamepadState.gamepad.axes) {
            let state = gamepadState.gamepad.axes[axis];
            state = Math.abs(state) < 0.33 ? "" : ["-", "", "+"][Math.sign(state) + 1] + axis
            if (gamepadState.oldAxes[axis] != state) {
                if (gamepadState.oldAxes[axis]) {
                    action = gamepadAxisConfig[gamepadState.oldAxes[axis]];
                    if (action) doActionUp(action);
                }
                gamepadState.oldAxes[axis] = state;
                if (gamepadState.oldAxes[axis]) {
                    action = gamepadAxisConfig[gamepadState.oldAxes[axis]];
                    if (action) doActionDown(action);
                }
            }
        }
    }
    requestAnimationFrame(gamepadLoop);
}

function getActionGamepadButton(action) {
    return Object.entries(gamepadButtonConfig).find(x => x[1] == action)?.[0]
}

gamepadLoop();