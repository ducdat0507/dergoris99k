
/** @type {HTMLDivElement} */
let activeForm = null;

/** 
 * @param {HTMLDivElement} holder  
 * @param {GamepadFormElement | HTMLElement[]} items  
*/
function buildForm(holder, items) {
    holder.$selectedItem = 0;
    holder.classList.add("form-holder");
    for (let item of items) {
        if (item instanceof GamepadFormElement) holder.append(item.element);
        else holder.append(item);
    }
}


/** @param {HTMLDivElement} form */
function setActiveForm(form) {
    if (form) {
        activeForm = form;
        let item = form.children[form.$selectedItem].$form;
        item.doFocus();
    } else {
        activeForm?.blur();
        activeForm = null;
    }
}

function handleFormInput(action, repeat) {
    if (!activeForm) return;
    let item = activeForm.children[activeForm.$selectedItem].$form;
    return item.doInput(action, repeat);
}

function navigateForm(direction) {
    document.body.classList.add("prefer-key-nav");
    let pointer = activeForm.$selectedItem;
    while (true) {
        pointer += direction;
        if (pointer < 0 || pointer >= activeForm.childElementCount) {
            activeForm.children[activeForm.$selectedItem].animate([
                { transform: `translateY(${6 * direction}px)` },
                { transform: `translateY(0px)` },
            ], {
                duration: 500,
                easing: "cubic-bezier(0.19, 1, 0.22, 1)",
            })
            playSound("buttonHover");
            return;
        }
        if (activeForm.children[pointer]?.$form?.canFocus()) {
            activeForm.$selectedItem = pointer;
            activeForm.children[pointer].$form.doFocus();
            activeForm.children[pointer].scrollIntoView({ behavior: "smooth", block: "center" })
            updateInputPrompts();
            playSound("buttonHover");
            return;
        }
    }
}


function initForms() {
    // Play with/without sound intro
    buildForm(document.getElementById("introSoundForm"), [
        new formElements.button({
            label: "PLAY WITH SOUND",
            callback() {
                soundEnabled = true; 
                initializeGameMusic(); 
                playSound('menuMusic');
                
                document.getElementById("inputPromptCanvas").style.zIndex = "";
                hideBlackCover(); 
                updateInputPrompts(1); 
                document.getElementById("introSoundForm").style.display = "none";
                setActiveForm(document.getElementById("mainMenuForm"));
                displayProfileInfo();
            },
        }),
        new formElements.button({
            label: "PLAY WITHOUT SOUND",
            callback() {
                soundEnabled = false; 

                document.getElementById("inputPromptCanvas").style.zIndex = "";
                hideBlackCover();
                updateInputPrompts(1); 
                document.getElementById("introSoundForm").style.display = "none";
                setActiveForm(document.getElementById("mainMenuForm"));
                displayProfileInfo();
            },
        }),
    ])

    // Main menu
    buildForm(document.getElementById("mainMenuForm"), [
        new formElements.menuButton({
            label: "CAMPAIGN",
            callback() {
                switchToTab(2); 
                displayModeInfo(currentMenuMode);
            },
        }),
        new formElements.menuButton({
            label: "CUSTOM GAME",
            callback() {
                switchToTab(3)
            },
        }),
        new formElements.menuButton({
            label: "KEYBINDS",
            callback() {
                showKeybinds()
            },
        }),
        new formElements.menuButton({
            label: "SETTINGS",
            callback() {
                showSettings()
            },
        }),
        new formElements.menuButton({
            label: "CREDITS",
            callback() {
                switchToTab(4)
            },
        }),
    ])

    // Settings
    let resetSaveButton;
    buildForm(document.getElementById("settingsForm"), [
        new formElements.heading("PROFILE"),
        new formElements.text({
            label: "PLAYER INITIALS",
            value: game.playerInitials,
            onSet(value) {
                game.playerInitials = value;
                save();
            }
        }),
        new formElements.spacing(4),
        new formElements.heading("SOUND"),
        new formElements.slider({
            label: "OVERALL VOLUME",
            value: game.volume * 100,
            min: 0,
            max: 100,
            arrowStep: 5,
            onSet(value) {
                game.volume = value / 100;
                Howler.volume(game.volume);
                save();
            }
        }),
        new formElements.slider({
            label: "MUSIC VOLUME",
            value: game.musicVolume * 100,
            min: 0,
            max: 100,
            arrowStep: 5,
            onSet(value) {
                game.musicVolume = value / 100;
                setSoundVolume("menuMusic", game.musicVolume);
                save();
            }
        }),
        new formElements.spacing(4),
        new formElements.heading("VISUALS"),
        new formElements.boolean({
            label: "MENU BACKGROUND",
            value: game.menuBackgroundEnabled,
            onSet(value) {
                game.menuBackgroundEnabled = value;
                backgroundCanvas.style.display = game.menuBackgroundEnabled ? "block" : "none";
                save();
            }
        }),
        new formElements.boolean({
            label: "GAME BACKGROUND",
            value: game.gameBackgroundEnabled,
            onSet(value) {
                game.gameBackgroundEnabled = value;
                save();
            }
        }),
        new formElements.boolean({
            label: "BOARD BUMP VISUALS",
            value: game.boardBumpVisuals,
            onSet(value) {
                game.boardBumpVisuals = value;
                save();
            }
        }),
        new formElements.spacing(4),
        new formElements.heading("STORAGE"),
        new formElements.button({
            label: "EXPORT GAME",
            callback() {
                exportGame();
            },
        }),
        new formElements.button({
            label: "IMPORT GAME",
            callback() {
                importGame();
            },
        }),
        resetSaveButton = new formElements.button({
            label: "RESET SAVE",
            callback() {
                hardReset();
            },
        }),
    ]);
    document.getElementById("settingsForm").$selectedItem = 1;
    resetSaveButton.element.classList.add("dangerous")
    
    // Keybinds
    buildForm(document.getElementById("keybindsForm"), [
        new formElements.keybind({
            label: "LEFT",
            value: getActionKey("left"),
            onSet(value) {
                setActionKey("left", value)
            }
        }),
        new formElements.keybind({
            label: "RIGHT",
            value: getActionKey("right"),
            onSet(value) {
                setActionKey("right", value)
            }
        }),
        new formElements.keybind({
            label: "HARD DROP or UI UP",
            value: getActionKey("hardDrop"),
            onSet(value) {
                setActionKey("hardDrop", value)
            }
        }),
        new formElements.keybind({
            label: "SOFT DROP or UI DOWN",
            value: getActionKey("softDrop"),
            onSet(value) {
                setActionKey("softDrop", value)
            }
        }),
        new formElements.keybind({
            label: "ROTATE CW or UI SELECT",
            value: getActionKey("rotClockwise"),
            onSet(value) {
                setActionKey("rotClockwise", value)
            }
        }),
        new formElements.keybind({
            label: "ROTATE CCW or UI BACK",
            value: getActionKey("rotAnticlockwise"),
            onSet(value) {
                setActionKey("rotAnticlockwise", value)
            }
        }),
        new formElements.keybind({
            label: "ROTATE CW ALT",
            value: getActionKey("rotClockwiseAlt"),
            onSet(value) {
                setActionKey("rotClockwiseAlt", value)
            }
        }),
        new formElements.keybind({
            label: "ROTATE CCW ALT",
            value: getActionKey("rotAnticlockwiseAlt"),
            onSet(value) {
                setActionKey("rotAnticlockwiseAlt", value)
            }
        }),
        new formElements.keybind({
            label: "RESTART",
            value: getActionKey("restart"),
            onSet(value) {
                setActionKey("restart", value)
            }
        }),
        new formElements.keybind({
            label: "EXIT",
            value: getActionKey("exit"),
            onSet(value) {
                setActionKey("exit", value)
            }
        }),
    ])

    // Custom game
    buildForm(document.getElementById("customGameForm"), [
        new formElements.select({
            label: "PRESETS",
            value: "classicStyle",
            values: [
                { value: "classicStyle", label: "Classic Style" },
                { value: "masterStyle", label: "Master Style" },
                { value: "dragonStyle", label: "Dragon Style" },
            ],
            onSet(value) {
                setPreset(value);
            }
        }),
        new formElements.spacing(4),
        gameSettingElements.visuals = new formElements.select({
            label: "VISUAL PRESET",
            value: settings.visuals,
            values: [
                { value: "classicStyle", label: "Classic Style" },
                { value: "masterStyle", label: "Master Style" },
                { value: "dragonStyle", label: "Dragon Style" },
            ],
            onSet(value) {
                settings.visuals = value;
            }
        }),
        gameSettingElements.gameMechanics = new formElements.select({
            label: "MECHANICS PRESET",
            value: settings.gameMechanics,
            values: [
                { value: "classicStyle", label: "Classic Style" },
                { value: "masterStyle", label: "Master Style" },
                { value: "dragonStyle", label: "Dragon Style" },
            ],
            onSet(value) {
                settings.gameMechanics = value;
                gameSettingElements.DASInitial.disabled = (settings.gameMechanics == "dragonStyle");
                gameSettingElements.DAS.disabled = (settings.gameMechanics == "dragonStyle");
                gameSettingElements.lockDelay.disabled = (settings.gameMechanics == "dragonStyle");
            }
        }),
        new formElements.description("Controls general gameplay rules, including speed curves and scoring system."),
        new formElements.spacing(4),
        new formElements.heading("LEVEL"),
        gameSettingElements.startingLevel = new formElements.number({
            label: "STARTING LEVEL",
            value: settings.startingLevel,
            min: 0,
            max: 998,
            arrowStep: 25,
            onSet(value) {
                const capTable = {
                    classicStyle: 998,
                    masterStyle: 998,
                    dragonStyle: 998,
                    onTheBeat: 998
                };
                const max = capTable[settings.gameMechanics] || 998;
                startingLevel = clamp(0, value, max);
                settings.startingLevel = startingLevel;
            }
        }),
        gameSettingElements.levelLock = new formElements.boolean({
            label: "FREEZE LEVEL",
            value: settings.levelLock,
            onSet(value) {
                settings.levelLock = value;
            }
        }),
        // new formElements.spacing(4),
        // gameSettingElements.boardWidth = new formElements.number({
        //     label: "BOARD WIDTH",
        //     value: settings.boardWidth,
        //     min: 4,
        //     max: 20,
        //     onSet(value) {
        //         settings.boardWidth = value;
        //     }
        // }),
        // gameSettingElements.boardHeight = new formElements.number({
        //     label: "BOARD HEIGHT",
        //     value: settings.boardHeight,
        //     min: 4,
        //     max: 25,
        //     onSet(value) {
        //         settings.boardHeight = value;
        //     }
        // }),
        new formElements.spacing(4),

        new formElements.heading("APPEARANCE"),
        gameSettingElements.pieceColouring = new formElements.select({
            label: "PIECE COLOURING",
            value: settings.pieceColouring,
            values: [
                { value: "regular", label: "Regular" },
                { value: "monotoneFixed", label: "Monochrome board" },
                { value: "monotoneAll", label: "Monochrome board & active piece" },
                { value: "border", label: "Border-only board" },
            ],
            onSet(value) {
                settings.pieceColouring = value;
            }
        }),
        gameSettingElements.invisible = new formElements.boolean({
            label: "INVISIBLE BOARD",
            value: settings.invisible,
            onSet(value) {
                settings.invisible = value;
            }
        }),
        new formElements.spacing(4),

        new formElements.heading("PIECES"),
        gameSettingElements.includePentominoes = new formElements.select({
            label: "PENTOMINOES",
            value: settings.includePentominoes,
            values: [
                { value: "none", label: "None" },
                { value: "rare", label: "Rare" },
                { value: "common", label: "Common" },
            ],
            onSet(value) {
                settings.includePentominoes = value;
            }
        }),
        gameSettingElements.includeDiscordant = new formElements.select({
            label: "DISCORDANT PIECES",
            value: settings.includeDiscordant,
            values: [
                { value: "none", label: "None" },
                { value: "rare", label: "Rare" },
                { value: "common", label: "Common" },
            ],
            onSet(value) {
                settings.includeDiscordant = value;
            }
        }),
        gameSettingElements.includeMega = new formElements.select({
            label: "MEGA PIECES",
            value: settings.includeMega,
            values: [
                { value: "none", label: "None" },
                { value: "rare", label: "Rare" },
                { value: "common", label: "Common" },
            ],
            onSet(value) {
                settings.includeMega = value;
            }
        }),
        new formElements.spacing(4),
        gameSettingElements.randomizer = new formElements.select({
            label: "RANDOMIZER",
            value: settings.randomizer,
            values: [
                { value: "random", label: "Random" },
                { value: "tgm", label: "The Grand Master" },
            ],
            onSet(value) {
                settings.randomizer = value;
            }
        }),
        new formElements.description("Influences how next pieces are chosen."),
        new formElements.spacing(4),

        new formElements.heading("DROPS AND GRAVITY"),
        gameSettingElements.softDrop = new formElements.boolean({
            label: "SOFT DROP",
            value: settings.softDrop,
            onSet(value) {
                settings.softDrop = value;
                gameSettingElements.softDropSpeed.disabled = !settings.softDrop;
            }
        }),
        gameSettingElements.softDropSpeed = new formElements.number({
            label: "SOFT DROP INTERVAL",
            value: settings.softDropSpeed,
            min: 1,
            max: 20,
            step: 1,
            onSet(value) {
                settings.softDropSpeed = value;
            }
        }),
        new formElements.description("Hold soft drop to make pieces descend faster."),
        new formElements.spacing(4),
        gameSettingElements.hardDrop = new formElements.boolean({
            label: "HARD DROP",
            value: settings.hardDrop,
            onSet(value) {
                settings.hardDrop = value ?? gameSettingElements.hardDrop.value;
                gameSettingElements.sonicDrop.disabled = !settings.hardDrop;
            }
        }),
        gameSettingElements.sonicDrop = new formElements.boolean({
            label: "SONIC DROP",
            value: settings.sonicDrop,
            onSet(value) {
                settings.sonicDrop = value;
            }
        }),
        new formElements.description(
            "Press hard drop to instantly drop pieces to the bottom of the board." +
            "\nSonic drop does not automatically lock pieces."
        ),
        new formElements.spacing(4),
        gameSettingElements.twentyGOverride = new formElements.boolean({
            label: "INSTANT GRAVITY",
            value: settings.twentyGOverride,
            onSet(value) {
                settings.twentyGOverride = value;
            }
        }),
        new formElements.spacing(4),

        new formElements.heading("ROTATION"),
        gameSettingElements.rotationSystem = new formElements.select({
            label: "ROTATION SYSTEM",
            value: settings.rotationSystem,
            values: [
                { value: "nintendo-r", label: "Classic Rotation" },
                { value: "dergoris", label: "Dergoris Custom Rotation" },
            ],
            onSet(value) {
                settings.rotationSystem = value;
            }
        }),
        new formElements.description("Different rotation systems define different rotation anchors and kick tests which can affect game feel significantly."),
        gameSettingElements.IRS = new formElements.boolean({
            label: "CHARGED ROTATION",
            value: settings.IRS,
            onSet(value) {
                settings.IRS = value;
            }
        }),
        new formElements.description("Allow pieces to spawn pre-rotated when rotation buttons are held during entry delay."),
        new formElements.spacing(4),

        new formElements.heading("AUTO-REPEAT"),
        gameSettingElements.DASInitial = new formElements.number({
            label: "INITIAL DELAY",
            value: settings.DASInitial,
            min: 1,
            max: 60,
            step: 1,
            onSet(value) {
                settings.DASInitial = value;
            }
        }),
        gameSettingElements.DAS = new formElements.number({
            label: "REPEAT INTERVAL",
            value: settings.DAS,
            min: 1,
            max: 60,
            step: 1,
            onSet(value) {
                settings.DAS = value;
            }
        }),
        new formElements.description("Hold left or right to continuously move pieces to that direction."),
        new formElements.spacing(4),

        new formElements.heading("ENTRY DELAY"),
        gameSettingElements.overrideGameARE = new formElements.boolean({
            label: "USE GAME-SPECIFIC VALUES",
            value: !settings.overrideGameARE,
            onSet(value) {
                settings.overrideGameARE = !value;
                gameSettingElements.ARE.disabled = !settings.overrideGameARE;
                gameSettingElements.ARELineClear.disabled = !settings.overrideGameARE;
            }
        }),
        gameSettingElements.ARE = new formElements.number({
            label: "NORMAL DELAY",
            value: settings.ARE,
            min: 0,
            max: 200,
            step: 1,
            onSet(value) {
                settings.ARE = value;
            }
        }),
        gameSettingElements.ARELineClear = new formElements.number({
            label: "LINE CLEAR DELAY",
            value: settings.ARELineClear,
            min: 0,
            max: 200,
            step: 1,
            onSet(value) {
                settings.ARELineClear = value;
            }
        }),
        new formElements.description(
            "Adjusts the delay between a piece locking into place and the next piece spawns."
        ),
        new formElements.spacing(4),

        new formElements.heading("LOCK DELAY"),
        gameSettingElements.lockDelay = new formElements.number({
            label: "LOCK DELAY",
            value: settings.lockDelay,
            min: 0,
            max: 9999,
            step: 1,
            onSet(value) {
                settings.lockDelay = value;
            }
        }),
        new formElements.description(
            "Adjusts the delay between a piece landing and it locking into place." +
            "\nSet to 0 to disable."
        ),
        gameSettingElements.lockReset = new formElements.select({
            label: "LOCK DELAY RESET",
            value: settings.lockReset,
            values: [
                { value: "move", label: "Move" },
                { value: "step", label: "Step" },
            ],
            onSet(value) {
                settings.lockReset = value;
            }
        }),
        new formElements.description(
            "Move = reset lock delay when piece moves or rotate in any direction." +
            "\nStep = reset lock delay only when piece moves down."
        ),
    ])
}

document.body.addEventListener("pointermove", () => {
    document.body.classList.remove("prefer-key-nav");
})