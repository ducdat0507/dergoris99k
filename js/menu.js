//Fetch the mode info canvas element and its 2D drawing context
const modeStatsCanvas = document.getElementById("modeStatsCanvas");
const modeStatsCtx = modeStatsCanvas && modeStatsCanvas.getContext("2d");
/** @type {CanvasRenderingContext2D} */

//Fetch the overall grade canvas element and its 2D drawing context
const overallGradeCanvas = document.getElementById("overallGradeCanvas");
const overallGradeCtx = overallGradeCanvas && overallGradeCanvas.getContext("2d");
/** @type {CanvasRenderingContext2D} */

const inputPromptCanvas = document.getElementById("inputPromptCanvas");
/** @type {CanvasRenderingContext2D} */
const inputPromptCtx = inputPromptCanvas && inputPromptCanvas.getContext("2d");

const modeDescriptions = {
    1: `
        <b>
            Just your classic block-stacking game as you remember it.
            <br>Can you stack to level 999?
        </b><br>
        <br>- Gravity increases gradually
        <br>- No combo-based scoring (clear as many lines as you can in one go!)
        <br>- Auto-repeat gets faster as you go
        <br>- Hard drop is enabled! You can use it to get fast times.
        <br>- Power is based on level reached, average section time, and points.
    `,
    2: `
        <b>
            Faster-paced mode for those who want a bit more of a challenge.
            <br>Heads up: this mode can get quite <i>fast.</i>
        </b><br>
        <br>- Gravity increases very quickly
        <br>- Combo-based scoring (make the best combo as you can!)
        <br>- Power is based on level reached and average section time.
    `,
    3: `
        <b>
            Think you're good? Try stacking at the speed of a dragon.
            <br>Not for the faint of heart.
        </b><br>
        <br>- Maximum gravity, all delays get shorter as you go
        <br>- Combo-based scoring (make the best combo as you can!)
        <br>- Power is based on level reached and average section time.
    `,
    4: `
        <b>
            Bonus mode - Can you stack in time with the beat?
            <br>It's actually harder than it sounds!
        </b><br>
        <br>- Pieces drop and lock on the beat
        <br>- Grade based on distance through the song
    `
}

let modeStatsImage = new Image();
modeStatsImage.src = "img/modeInfo.png";
let digitsSmall = new Image();
digitsSmall.src = "img/main/digitsSmall.png";
let overallGradeImage = new Image();
overallGradeImage.src = "img/overallGrades.png";
let overallGradeInfoImage = new Image();
overallGradeInfoImage.src = "img/overallGradeInfo.png";
let decorBlocksImage = new Image();
decorBlocksImage.src = "img/decorBlocks.png";
let inputIconImage = new Image();
inputIconImage.src = "img/controllerButtons.png";

let currentTab = 1;

function switchToTab(x) {
    currentTab = x;
    inCampaign = (x == 2); //Set inCampaign to true if entering the campaign screen
    switch(x) {
        case 1:
            onCampaignScreen = false;
            backgroundColorDestination = [80, 120, 120];
            document.getElementById("overallGradeCanvas").style.right = "";
            document.getElementsByClassName("container")[0].style.top = "0";
            document.getElementsByClassName("container")[0].style.left = "0";
            document.getElementsByClassName("container")[1].style.top = "0";
            document.getElementsByClassName("container")[1].style.left = "100vw";
            document.getElementsByClassName("container")[2].style.top = "0";
            document.getElementsByClassName("container")[2].style.left = "100vw";
            document.getElementsByClassName("container")[3].style.top = "100vh";
            document.getElementsByClassName("container")[3].style.left = "0";
            setActiveForm(document.getElementById("mainMenuForm"));
            break;
        case 2:
            onCampaignScreen = true;
            settings.startingLevel = 0;
            backgroundColorDestination = [50, 50, 50];
            document.getElementById("overallGradeCanvas").style.right = "calc(60px - 100vw)";
            document.getElementsByClassName("container")[0].style.top = "0";
            document.getElementsByClassName("container")[0].style.left = "-100vw";
            document.getElementsByClassName("container")[1].style.top = "0";
            document.getElementsByClassName("container")[1].style.left = "0";
            document.getElementsByClassName("container")[2].style.top = "0";
            document.getElementsByClassName("container")[2].style.left = "100vw";
            document.getElementsByClassName("container")[3].style.top = "100vh";
            document.getElementsByClassName("container")[3].style.left = "-100vw";
            hideKeybinds();
            hideSettings();
            setActiveForm(document.getElementById(null));
            break;
        case 3:
            onCampaignScreen = false;
            backgroundColorDestination = [50, 50, 50];
            if (settings.gameMechanics == "onTheBeat") setPreset("classicStyle"); //On the beat is not selectable in custom game
            document.getElementById("overallGradeCanvas").style.right = "";
            document.getElementsByClassName("container")[0].style.top = "0";
            document.getElementsByClassName("container")[0].style.left = "-100vw";
            document.getElementsByClassName("container")[1].style.top = "0";
            document.getElementsByClassName("container")[1].style.left = "100vw";
            document.getElementsByClassName("container")[2].style.top = "0";
            document.getElementsByClassName("container")[2].style.left = "0";
            document.getElementsByClassName("container")[3].style.top = "100vh";
            document.getElementsByClassName("container")[3].style.left = "-100vw";
            hideKeybinds();
            hideSettings();
            setActiveForm(document.getElementById("customGameForm"));
            break;
        case 4:
            onCampaignScreen = false;
            backgroundColorDestination = [50, 50, 50];
            document.getElementById("overallGradeCanvas").style.right = "";
            document.getElementsByClassName("container")[0].style.top = "-100vh";
            document.getElementsByClassName("container")[0].style.left = "0";
            document.getElementsByClassName("container")[1].style.top = "-100vh";
            document.getElementsByClassName("container")[1].style.left = "100vw";
            document.getElementsByClassName("container")[2].style.top = "-100vh";
            document.getElementsByClassName("container")[2].style.left = "100vw";
            document.getElementsByClassName("container")[3].style.top = "0";
            document.getElementsByClassName("container")[3].style.left = "0";
            hideKeybinds();
            hideSettings();
            setActiveForm(document.getElementById(null));
            break;
    }

    updateInputPrompts();
}

let currentMenuMode = 1;
let onCampaignScreen = false;
function selectMenuMode(x) {
    let containerCenter;
    if (document.getElementsByClassName("container")[1].style.display != "none") containerCenter = document.getElementById('modeSelectContainer').offsetHeight / 2; //Recalculate containerCenter
    document.getElementsByClassName("menuArrow")[0].style.top = (containerCenter - 75) + "px";
    document.getElementsByClassName("menuArrow")[1].style.top = (containerCenter + 75) + "px";
    document.getElementsByClassName("menuArrow")[0].style.display = x!=1 ? "block" : "none";
    document.getElementsByClassName("menuArrow")[1].style.display = x!=4 ? "block" : "none";
    currentMenuMode = x;

    let menuModeImages = document.getElementsByClassName("menuMode");
    for (let i = 0; i < menuModeImages.length; i++) {
        document.getElementsByClassName("menuMode")[i].style.top = (containerCenter + 150 * (i + 1 - x)) + "px";
        document.getElementsByClassName("menuMode")[i].style.left = i + 1 == x ? "90px" : "30px";
        document.getElementsByClassName("menuMode")[i].style.filter = i + 1 == x ? "none" : "brightness(0.6)";
    }
    switch(x) {
        case 1:
            setPreset("classicStyle");
            break;
        case 2:
            setPreset("masterStyle");
            break;
        case 3:
            setPreset("dragonStyle");
            break;
        case 4:
            setPreset("onTheBeat");
            break;
    }
    displayModeInfo(x);
}

//Reselect the current menu mode on window resize
window.addEventListener("resize", function() {
    if (!gamePlaying) selectMenuMode(currentMenuMode);
});

function displayProfileInfo() {
    
    overallGradeCtx.clearRect(0, 0, 190, 48);
    overallGradeCtx.imageSmoothingEnabled = false;

    let overallPower = Math.min(game.bestPowers[0], 30000) + Math.min(game.bestPowers[1], 30000) + Math.min(game.bestPowers[2], 39000);
    let overallGrade = Math.floor(overallPower / 3000);

    // Decor blocks
    overallGradeCtx.filter = "brightness(0.6)";
    let decorLeft = game.decorPoints;
    let decorBlockCount = 0;
    for (let block of decorBlockPos) {
        while (decorLeft >= block[0]) {
            console.log(block[0])
            overallGradeCtx.drawImage(decorBlocksImage, 
                block[1], block[2], 8, 8, 
                4 + (decorBlockCount % 20) * 8, 36 - Math.floor(decorBlockCount / 20) * 8, 8, 8
            );
            decorLeft -= block[0];
            decorBlockCount++;
            if (decorBlockCount >= 100) break;
        }
    }
    overallGradeCtx.filter = "none";

    // Initials
    let initialString = game.playerInitials
    drawBMTextAnchor(overallGradeCtx, 135, 0, initialString, "text7-white");
    

    // Overall grade info
    drawBMText(overallGradeCtx, 144, 3, "TOTAL GRADE:", "text5-gold")
    overallGradeCtx.drawImage(overallGradeImage, 0, overallGrade * 16, 24, 16, 142, 10, 48, 32);

    // Overall power string
    let overallPowerString = Math.floor(overallPower).toString();
    drawBMText(overallGradeCtx, 0, 14, "OVERALL POWER:", "text5-gold")
    drawBMTextAnchor(overallGradeCtx, 135, 17, overallPowerString, "text10-white");

    let powX = 0;
    // Classic power string
    let classicPowerString = Math.floor(Math.min(game.bestPowers[0], 30000)).toString();
    let classicPowerColor = game.bestPowers[0] >= 30000 ? "text5-gold" : "text5-white";
    powX += drawBMText(overallGradeCtx, powX, 22, "".padStart(5 - classicPowerString.length, "0"), "text5-gray")
    powX += drawBMText(overallGradeCtx, powX, 22, classicPowerString, classicPowerColor)
    // Master power string
    let masterPowerString = Math.floor(Math.min(game.bestPowers[1], 30000)).toString();
    let masterPowerColor = game.bestPowers[1] >= 30000 ? "text5-gold" : "text5-white";
    powX += drawBMText(overallGradeCtx, powX, 22, " + ", "text5-white")
    powX += drawBMText(overallGradeCtx, powX, 22, "".padStart(5 - masterPowerString.length, "0"), "text5-gray")
    powX += drawBMText(overallGradeCtx, powX, 22, masterPowerString, masterPowerColor)
    // Dragon power string
    let dragonPowerString = Math.floor(Math.min(game.bestPowers[2], 39000)).toString();
    let dragonPowerColor = game.bestPowers[2] >= 39000 ? "text5-gold" : "text5-white";
    powX += drawBMText(overallGradeCtx, powX, 22, " + ", "text5-white")
    powX += drawBMText(overallGradeCtx, powX, 22, "".padStart(5 - dragonPowerString.length, "0"), "text5-gray")
    powX += drawBMText(overallGradeCtx, powX, 22, dragonPowerString, dragonPowerColor)
    powX += drawBMText(overallGradeCtx, powX, 22, " =", "text5-white")

    // Decor points
    let decorationString = formatScore(game.decorPoints)
    drawBMText(overallGradeCtx, 0, 33, "DECORATION:", "text5-gold")
    drawBMTextAnchor(overallGradeCtx, 129, 33, decorationString, "text5-white");
    drawBMText(overallGradeCtx, 131, 33, "G", "text5-gold");

}

function displayModeInfo(mode) {

    // Mode info
    let bestPowerString, bestScoreString, bestLevelString, bestLevelColor, x, y;

    // document.getElementById("modeInfoImage").src = `img/style${mode}.png`;
    document.getElementById("modeInfo").innerHTML = modeDescriptions[mode];

    modeStatsCtx.clearRect(0, 0, 320, 160);

    switch (mode) {

        case 1: case 2: case 3:

            //document.getElementById("modeInfo").innerHTML += "<br><br><img src='img/medal1.png' style='height: 30px; vertical-align: middle'> <b>Bronze medal requirements:</b><br>-Best score: 150,000<br>-Best level: 700"
            //document.getElementById("modeInfo").innerHTML += "<br><br><img src='img/medal2.png' style='height: 30px; vertical-align: middle'> <b>Silver medal requirements:</b><br>-Best score: 300,000<br>-Best level: 999<br>-All section times under 1:15:00"


            //Best power
            x = 0;
            y = 0;
            x += drawBMText(modeStatsCtx, x, y, "BEST POWER: ", "text5-gold")
            x = 140, y += 4;
            x -= drawBMTextAnchor(modeStatsCtx, x, y + 5, mode == 3 ? "/39000" : "/30000", "text5-gray")
            x -= drawBMTextAnchor(modeStatsCtx, x, y, Math.floor(game.bestPowers[mode - 1]).toString(), "text10-white")

            //Best achievement
            x = 0, y += 20;
            x += drawBMText(modeStatsCtx, x, y, "BEST ACHIEVEMENT: ", "text5-white")
            let highlightTime = game.bestLevels[mode - 1] == 999
            x = 140, y += 8;
            x -= drawBMTextAnchor(modeStatsCtx, x, y + (highlightTime ? 0 : 2), formatTime(game.bestAchievementTimes[mode - 1]), highlightTime ? "text10-white" : "text7-white") + 3
            x -= drawBMTextAnchor(modeStatsCtx, x, y + 5, "IN", "text5-white") + 3
            x -= drawBMTextAnchor(modeStatsCtx, x, y + (highlightTime ? 2 : 0), Math.floor(game.bestLevels[mode - 1]).toString(), highlightTime ? "text7-white" : "text10-white") + 3
            x -= drawBMTextAnchor(modeStatsCtx, x, y + 5, "LEVEL", "text5-white")

            //Best score
            x = 0, y += 20;
            x += drawBMText(modeStatsCtx, x, y, "BEST SCORE: ", "text5-white")
            x = 140, y += 4;
            x -= drawBMTextAnchor(modeStatsCtx, x, y, Math.floor(game.bestScores[mode - 1]).toString(), "text10-white")


            //Best highest section time
            x = 0, y += 20;
            if (game.bestLevels[0] >= 999) {
                x += drawBMText(modeStatsCtx, x, y, "ALL SECTION TIMES UNDER", "text5-white")

                let time = game.bestHighestSectionTimes[mode - 1];
                let timeString = formatTime(time);
                let timeColor = getTimeColor(time);
                x += drawBMText(modeStatsCtx, x, y, timeString, "text5-" + timeColor)
            }
            else {
                x += drawBMText(modeStatsCtx, x, y, "MORE STATS UNLOCK AT ", "text5-gray")
                x += drawBMText(modeStatsCtx, x, y, "LEVEL 999!", "text5-green")
            }

            //Best average section time
            x = 0, y += 8;
            if (game.bestLevels[0] >= 999) {
                x += drawBMText(modeStatsCtx, x, y, "AVG SECTION TIME AT 999: ", "text5-white")

                let time = game.bestHighestSectionTimes[mode - 1];
                let timeString = formatTime(time);
                let timeColor = getTimeColor(time);
                x += drawBMText(modeStatsCtx, x, y, timeString, "text5-" + timeColor)
            }

            //Best individual section times
            x = 160, y =0;
            drawBMText(modeStatsCtx, x, y, "BEST INDIVIDUAL SECTION TIMES: ", "text5-gold");
            let bestSectionTimes = {
                1: game.classicStyleBestSectionTimes,
                2: game.masterStyleBestSectionTimes,
                3: game.dragonStyleBestSectionTimes
            }[mode]
            for (let i = 0; i < 10; i++) {
                if (bestSectionTimes[i]) {
                    let sectionTime = bestSectionTimes[i];
                    let levelString = Math.min((i + 1) * 100, 999).toString();
                    let timeString = formatTime(sectionTime);
                    let timeValue = getTimeValue(sectionTime);
                    let sectionTimeColor = getTimeColor(sectionTime);

                    x = 160, y += 8;
                    x += drawBMText(modeStatsCtx, x, y, `${levelString}  `, "text5-white");
                    x += drawBMText(modeStatsCtx, x, y, timeString, "text5" + sectionTimeColor);x
                    x += 4;
                    
                    for (let i = 0; i < timeValue; i++) {
                        console.log(i, x, y);
                        modeStatsCtx.drawImage(decorBlocksImage, 
                            i * 8, 16, 6, 6, 
                            x, y, 6, 6
                        );
                        x += 6
                    }
                }
                else {
                    x = 160, y += 8;
                    drawBMText(modeStatsCtx, x, y, "---  ---", "text5-gray");
                }
            }

            break;
        case 4:
            x = 0;
            y = 0;

            x += drawBMText(modeStatsCtx, x, y, "BEST ACHIEVEMENT: ", "text5-white")
            x = 140, y += 8;
            x -= drawBMTextAnchor(modeStatsCtx, x, y, Math.floor(game.onTheBeatBests[1]).toString(), "text10-white") + 3
            x -= drawBMTextAnchor(modeStatsCtx, x, y + 5, "LEVEL", "text5-white")
            
            //Best score
            x = 0, y += 20;
            x += drawBMText(modeStatsCtx, x, y, "BEST SCORE: ", "text5-white")
            x = 140, y += 4;
            x -= drawBMTextAnchor(modeStatsCtx, x, y, Math.floor(game.onTheBeatBests[0]).toString(), "text10-white")

            break;
    }
}


let currentInputPrompts = []

function drawInputPrompts(prompts) {
    currentInputPrompts = prompts

    inputPromptCtx.clearRect(0, 0, 320, 12);
    let x = 320;

    for (let prompt of prompts) {
        let labelWidth = prompt

        x -= measureBMText(prompt.label, "text5-white")
        drawBMText(inputPromptCtx, x, 3, prompt.label, "text5-white")

        x -= 6
        if (primaryInputMethod == "keyboard") {
            let actions = prompt.actions ?? [prompt.action]
            for (let action of actions) {
                let keyString = getActionKey(action)?.toUpperCase() ?? "???"
                let keyWidth = measureBMText(keyString, "text5-white")
                let buttonWidth = Math.max(keyWidth + 5, 11);
                draw9Patch(inputPromptCtx, inputIconImage, 0, 0, 11, 12, 3, 3, 4, 3, x - buttonWidth, 0, buttonWidth, 12)
                drawBMText(inputPromptCtx, Math.round(x - (buttonWidth + keyWidth) / 2), 3, keyString, "text5-flat-black")
                x -= keyWidth + 8
            }
        } else if (primaryInputMethod == "gamepad") {
            let actions = prompt.actions ?? [prompt.action]
            let iconPack = controllerButtonIconPos[gamepadState.type]
            if (iconPack) {
                let buttons = actions.map(x => getActionGamepadButton(x)).sort()
                let iconPos = iconPack[buttons.join(",")]
                if (iconPos) {
                    inputPromptCtx.drawImage(inputIconImage, iconPos[0], iconPos[1], iconPos[2], iconPos[3], x -= iconPos[2], 0, iconPos[2], iconPos[3]);
                    x -= 2
                } else for (let icon of buttons) {
                    let iconPos = iconPack[icon]
                    inputPromptCtx.drawImage(inputIconImage, iconPos[0], iconPos[1], iconPos[2], iconPos[3], x -= iconPos[2], 0, iconPos[2], iconPos[3]);
                    x -= 2
                }
            }
        }

        x -= 10
    }
}

function redrawCurrentInputPrompts() {
    drawInputPrompts(currentInputPrompts);
}

function updateInputPrompts() {
    let inputPrompts = []

    if (document.getElementById("settingsContainer").style.display != "none" || document.getElementById("keybindsContainer").style.display != "none") {
        inputPrompts.push(
            { action: "rotAnticlockwise", label: "BACK" },
        )
    } else switch(currentTab) {
        case 1:
            break;

        case 2: 
            inputPrompts.push(
                { actions: ["softDrop", "hardDrop"], label: "NAVIGATE" },
                { action: "rotAnticlockwise", label: "BACK" },
                { action: "rotClockwise", label: "START GAME" },
            )
            break;

        case 3: 
            inputPrompts.push(
                { action: "rotAnticlockwise", label: "BACK" },
                { action: "rotClockwiseAlt", label: "START GAME" },
            )
            break;

        case 4: 
            inputPrompts.push(
                { action: "rotAnticlockwise", label: "BACK" },
            )
            break;
    }

    if (activeForm) {
        inputPrompts.unshift(
            { actions: ["softDrop", "hardDrop"], label: "NAVIGATE" },
        )
        inputPrompts.push(
            ...activeForm.children[activeForm.$selectedItem]?.$form?.getActionPrompts() ?? []
        )
    }

    drawInputPrompts(inputPrompts);
}