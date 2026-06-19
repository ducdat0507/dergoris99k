let primaryInputMethod = "keyboard";
let gamepadState = {
    gamepad: null,
    type: "",
    oldButtons: {},
    oldAxes: {},
};

function doActionDown(action) {
    if (activeForm && handleFormInput(action)) {
        return;
    }

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
            if (activeForm) {
                navigateForm(-1);
            } else if (!gamePlaying && onCampaignScreen && document.getElementsByClassName("container")[1].style.display != "none") {
                selectMenuMode(Math.max(1,currentMenuMode-1));
                playSound('buttonHover'); 
            }
            else {
                hardDrop();
                keysHeld[2] = true;
            }
            break;

        case "softDrop":
            if (activeForm) {
                navigateForm(1);
            } else if (!gamePlaying && onCampaignScreen && document.getElementsByClassName("container")[1].style.display != "none") {
                selectMenuMode(Math.min(4,currentMenuMode+1));
                playSound('buttonHover'); 
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
            if (!gamePlaying && currentTab == 3 && document.getElementsByClassName("container")[1].style.display != "none") {
                if (!blackCoverShown) {
                    setActiveForm(null);
                    showBlackCover(); 
                    playSound('buttonClick'); 
                    fadeOutSound('menuMusic', 500); 
                    setTimeout(startGame, 1000)
                }
            } else {
                if (keysHeld[6] == 0) keysHeld[6] = 1;
            }
            break;

        case "rotAnticlockwise":
            if (!gamePlaying && document.getElementsByClassName("container")[1].style.display != "none") {
                if (currentTab != 1) {
                    playSound('buttonClick'); 
                    switchToTab(1);
                } else if (document.getElementById("settingsContainer").style.display != "none") {
                    playSound('buttonClick'); 
                    hideSettings();
                } else if (document.getElementById("keybindsContainer").style.display != "none") {
                    playSound('buttonClick'); 
                    hideKeybinds();
                }
            } else {
                if (keysHeld[5] == 0) keysHeld[5] = 1;
            }
            break;

        case "rotAnticlockwiseAlt":
            if (keysHeld[7] == 0) keysHeld[7] = 1;
            break;

        case "restart":
            if (document.getElementById("game").style.display == "block") {
                if (!blackCoverShown) {
                    if (gameReadying || gamePlaying) {
                        keysHeld[8] = true;
                    } else {
                        restartGame();
                    }
                }
            }
            break;

        case "exit":
            if (document.getElementById("settingsContainer").style.display != "none") {
                hideSettings();
            } else if (document.getElementById("keybindsContainer").style.display != "none") {
                hideKeybinds();
            } else if (document.getElementById("game").style.display == "block") {
                if (!blackCoverShown) {
                    if (gameReadying || gamePlaying) {
                        keysHeld[9] = true;
                    } else {
                        showBlackCover();
                        setTimeout(returnToMenu, 1000);
                    }
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
        case "restart":
            keysHeld[8] = false;
            break;
        case "exit":
            keysHeld[9] = false;
            break;
    }
}

function setActiveInputMethod(method) {
    if (method == primaryInputMethod) return;

    primaryInputMethod = method;
    redrawCurrentInputPrompts();
}

function updateInputMethod() {
    let gamepad = navigator.getGamepads?.()[0];
    gamepadState.gamepad = gamepad;
    
    if (gamepad) {
        console.log(gamepad.id);
        gamepadState.type = testGamepadProvider(gamepad)
        setActiveInputMethod("gamepad");
    } else {
        setActiveInputMethod("keyboard");
    }

}

function testGamepadProvider(gamepad) {
    if (gamepad.id.includes("054c")) return "dualshock";
    return "xbox";
}



// Keyboard

document.addEventListener("keydown", function(event) {
    if (event.repeat) return;

    setActiveInputMethod("keyboard");

    if (keybindToReplace) {
        keybindToReplace(event.key);
        localStorage.setItem("dergorisKeybinds", JSON.stringify(keyConfig));
        keybindToReplace = null;
        return;
    }

    if(event.key in keyConfig) {
        const action = keyConfig[event.key];
        doActionDown(action);
        event.preventDefault();
    } else if (event.key == "Tab" && activeForm) {
        navigateForm(event.shiftKey ? -1 : 1)
        event.preventDefault();
    }
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

function changeKeybind(callback) {
    if (!keybindToReplace) {
        keybindToReplace = callback
        return true;
    }
    return false;
}
function getActionKey(action) {
    return Object.entries(keyConfig).find(x => x[1] == action)?.[0]
}
function setActionKey(action, value) {
    let oldKey = getActionKey(action)
    if (oldKey) delete keyConfig[oldKey];
    keyConfig[value] = action;
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
    try {
        if (navigator.getGamepads?.()[0]) {
            gamepadState.gamepad = navigator.getGamepads?.()[0];
            
            for (let button in gamepadState.gamepad.buttons) {
                let state = gamepadState.gamepad.buttons[button].value;
                if (gamepadState.oldButtons[button] != state) {
                    setActiveInputMethod("gamepad");
                    let action = gamepadButtonConfig[button];
                    if (action) (state ? doActionDown : doActionUp)(action);
                    gamepadState.oldButtons[button] = state;
                }
            }
            for (let axis in gamepadState.gamepad.axes) {
                let state = gamepadState.gamepad.axes[axis];
                state = Math.abs(state) < 0.33 ? "" : ["-", "", "+"][Math.sign(state) + 1] + axis
                if (gamepadState.oldAxes[axis] != state) {
                    setActiveInputMethod("gamepad");
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
    } catch (e) {
        console.error(e);
    }

    requestAnimationFrame(gamepadLoop);
}

function getActionGamepadButton(action) {
    return Object.entries(gamepadButtonConfig).find(x => x[1] == action)?.[0]
}

gamepadLoop();