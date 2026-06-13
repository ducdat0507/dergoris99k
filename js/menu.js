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
        - Gravity increases gradually
        <br>- No combo-based scoring (get as many lines as you can!)
        <br>- Faster DAS as you go
        <br>- Hard drop is enabled! You can use it to get fast times.
        <br>- Power is based on level reached, average section time, and points.
    `,
    2: `
        - Gravity increases very quickly
        <br>- Combo-based scoring (get the best combo you can!)
        <br>- Power is based on level reached and average section time.
    `,
    3: `
        - Instant gravity
        <br>- DAS, ARE and lock delay get faster as you go
        <br>- Combo-based scoring (get the best combo you can!)
        <br>- Power is based on level reached and average section time.
    `,
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
            document.getElementsByClassName("container")[0].style.top = "0";
            document.getElementsByClassName("container")[0].style.left = "0";
            document.getElementsByClassName("container")[1].style.top = "0";
            document.getElementsByClassName("container")[1].style.left = "100vw";
            document.getElementsByClassName("container")[2].style.top = "0";
            document.getElementsByClassName("container")[2].style.left = "100vw";
            document.getElementsByClassName("container")[3].style.top = "100vh";
            document.getElementsByClassName("container")[3].style.left = "0";
            break;
        case 2:
            onCampaignScreen = true;
            settings.startingLevel = 0;
            backgroundColorDestination = [50, 50, 50];
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
            break;
        case 3:
            onCampaignScreen = false;
            backgroundColorDestination = [100, 100, 100];
            if (settings.gameMechanics == "onTheBeat") setPreset("classicStyle"); //On the beat is not selectable in custom game
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
            break;
        case 4:
            onCampaignScreen = false;
            backgroundColorDestination = [50, 50, 50];
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
            break;
    }

    drawTabInputPrompts(x);
}

let currentMenuMode = 1;
let onCampaignScreen = false;
function selectMenuMode(x) {
    let containerCenter;
    if (document.getElementsByClassName("container")[1].style.display != "none") containerCenter = document.getElementById('modeSelectContainer').offsetHeight / 2; //Recalculate containerCenter
    document.getElementsByClassName("menuArrow")[0].style.top = (containerCenter - 90) + "px";
    document.getElementsByClassName("menuArrow")[1].style.top = (containerCenter + 90) + "px";
    document.getElementsByClassName("menuArrow")[0].style.display = x!=1 ? "block" : "none";
    document.getElementsByClassName("menuArrow")[1].style.display = x!=4 ? "block" : "none";
    currentMenuMode = x;
    switch(x) {
        case 1:
            setPreset("classicStyle");
            document.getElementsByClassName("menuMode")[0].style.top = containerCenter + "px";
            document.getElementsByClassName("menuMode")[1].style.top = (containerCenter + 200) + "px";
            document.getElementsByClassName("menuMode")[2].style.top = (containerCenter + 400) + "px";
            document.getElementsByClassName("menuMode")[3].style.top = (containerCenter + 600) + "px";
            document.getElementsByClassName("menuMode")[0].style.left = "60px";
            document.getElementsByClassName("menuMode")[1].style.left = "10px";
            document.getElementsByClassName("menuMode")[2].style.left = "10px";
            document.getElementsByClassName("menuMode")[3].style.left = "10px";
            document.getElementsByClassName("menuMode")[0].style.filter = "none";
            document.getElementsByClassName("menuMode")[1].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[2].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[3].style.filter = "brightness(0.7)";
            break;
        case 2:
            setPreset("masterStyle");
            document.getElementsByClassName("menuMode")[0].style.top = (containerCenter - 200) + "px";
            document.getElementsByClassName("menuMode")[1].style.top = containerCenter + "px";
            document.getElementsByClassName("menuMode")[2].style.top = (containerCenter + 200) + "px";
            document.getElementsByClassName("menuMode")[3].style.top = (containerCenter + 400) + "px";
            document.getElementsByClassName("menuMode")[0].style.left = "10px";
            document.getElementsByClassName("menuMode")[1].style.left = "60px";
            document.getElementsByClassName("menuMode")[2].style.left = "10px";
            document.getElementsByClassName("menuMode")[3].style.left = "10px";
            document.getElementsByClassName("menuMode")[0].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[1].style.filter = "none";
            document.getElementsByClassName("menuMode")[2].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[3].style.filter = "brightness(0.7)";
            break;
        case 3:
            setPreset("dragonStyle");
            document.getElementsByClassName("menuMode")[0].style.top = (containerCenter - 400) + "px";
            document.getElementsByClassName("menuMode")[1].style.top = (containerCenter - 200) + "px";
            document.getElementsByClassName("menuMode")[2].style.top = containerCenter + "px";
            document.getElementsByClassName("menuMode")[3].style.top = (containerCenter + 200) + "px";
            document.getElementsByClassName("menuMode")[0].style.left = "10px";
            document.getElementsByClassName("menuMode")[1].style.left = "10px";
            document.getElementsByClassName("menuMode")[2].style.left = "60px";
            document.getElementsByClassName("menuMode")[3].style.left = "10px";
            document.getElementsByClassName("menuMode")[0].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[1].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[2].style.filter = "none";
            document.getElementsByClassName("menuMode")[3].style.filter = "brightness(0.7)";
            break;
        case 4:
            setPreset("onTheBeat");
            document.getElementsByClassName("menuMode")[0].style.top = (containerCenter - 600) + "px";
            document.getElementsByClassName("menuMode")[1].style.top = (containerCenter - 400) + "px";
            document.getElementsByClassName("menuMode")[2].style.top = (containerCenter - 200) + "px";
            document.getElementsByClassName("menuMode")[3].style.top = containerCenter + "px";
            document.getElementsByClassName("menuMode")[0].style.left = "10px";
            document.getElementsByClassName("menuMode")[1].style.left = "10px";
            document.getElementsByClassName("menuMode")[2].style.left = "10px";
            document.getElementsByClassName("menuMode")[3].style.left = "60px";
            document.getElementsByClassName("menuMode")[0].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[1].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[2].style.filter = "brightness(0.7)";
            document.getElementsByClassName("menuMode")[3].style.filter = "none";
            break;
    }
    displayModeInfo(x);
}
selectMenuMode(1);

//Reselect the current menu mode on window resize
window.addEventListener("resize", function() {
    if (!gamePlaying) selectMenuMode(currentMenuMode);
});

function displayModeInfo(mode) {
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
    drawBMText(overallGradeCtx, 135 - measureBMText(initialString, "text7-white"), 0, initialString, "text7-white");
    

    // Overall grade info
    drawBMText(overallGradeCtx, 144, 3, "TOTAL GRADE:", "text5-gold")
    overallGradeCtx.drawImage(overallGradeImage, 0, overallGrade * 16, 24, 16, 142, 10, 48, 32);

    // Overall power string
    let overallPowerString = Math.floor(overallPower).toString();
    drawBMText(overallGradeCtx, 0, 14, "OVERALL POWER:", "text5-gold")
    drawBMText(overallGradeCtx, 135 - measureBMText(overallPowerString, "text10-white"), 17, overallPowerString, "text10-white");

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
    drawBMText(overallGradeCtx, 129 - measureBMText(decorationString, "text5-white"), 33, decorationString, "text5-white");
    drawBMText(overallGradeCtx, 131, 33, "G", "text5-gold");


    // Mode info
    let bestPowerString, bestScoreString, bestLevelString, bestLevelColor;

    document.getElementById("modeInfoImage").src = `img/style${mode}.png`;
    document.getElementById("modeInfo").innerHTML = modeDescriptions[mode];


    switch (mode) {
        case 1: case 2: case 3:

            //document.getElementById("modeInfo").innerHTML += "<br><br><img src='img/medal1.png' style='height: 30px; vertical-align: middle'> <b>Bronze medal requirements:</b><br>-Best score: 150,000<br>-Best level: 700"
            //document.getElementById("modeInfo").innerHTML += "<br><br><img src='img/medal2.png' style='height: 30px; vertical-align: middle'> <b>Silver medal requirements:</b><br>-Best score: 300,000<br>-Best level: 999<br>-All section times under 1:15:00"

            modeStatsCtx.clearRect(0, 0, 180, 160);

            //Best power
            let x = 0;
            let y = 0;
            x += drawBMText(modeStatsCtx, x, y, "BEST POWER: ", "text5-gold")
            x += drawBMText(modeStatsCtx, x, y, Math.floor(game.bestPowers[mode - 1]).toString().padStart(5, "0"), "text5-white")
            x = 0, y += 8;
            x += drawBMText(modeStatsCtx, x, y, `(MAX ${mode == 3 ? "39000" : "30000"}  TO OVERALL POWER)`, "text5-gray")

            //Best score
            x = 0, y += 8;
            x += drawBMText(modeStatsCtx, x, y, "BEST SCORE: ", "text5-white")
            x += drawBMText(modeStatsCtx, x, y, Math.floor(game.bestScores[mode - 1]).toString(), "text5-white")

            //Best level
            x = 0, y += 8;
            x += drawBMText(modeStatsCtx, x, y, "BEST LEVEL: ", "text5-white")
            x += drawBMText(modeStatsCtx, x, y, Math.floor(game.bestLevels[mode - 1]).toString(), game.bestLevels[0] >= 999 ? "text5-gold" : "text5-white")

            //Best highest section time
            x = 0, y += 8;
            if (game.bestLevels[0] >= 999) {
                x += drawBMText(modeStatsCtx, x, y, "ALL SECTION TIMES UNDER", "text5-white")

                let time = game.bestHighestSectionTimes[mode - 1];
                let timeString = formatTime(time);
                let timeColor = getTimeColor(time);
                x += drawBMText(modeStatsCtx, x, y, timeString, timeColor)
            }
            else {
                x += drawBMText(modeStatsCtx, x, y, "UNLOCKS AT ", "text5-white")
                x += drawBMText(modeStatsCtx, x, y, "LEVEL 999!", "text5-green")
            }

            //Best average section time
            x = 0, y += 8;
            if (game.bestLevels[0] >= 999) {
                x += drawBMText(modeStatsCtx, x, y, "AVG SECTION TIME AT 999: ", "text5-white")

                let time = game.bestHighestSectionTimes[mode - 1];
                let timeString = formatTime(time);
                let timeColor = getTimeColor(time);
                x += drawBMText(modeStatsCtx, x, y, timeString, timeColor)
            }
            else {
                x += drawBMText(modeStatsCtx, x, y, "UNLOCKS AT ", "text5-white")
                x += drawBMText(modeStatsCtx, x, y, "LEVEL 999!", "text5-green")
            }

            //Best individual section times
            x = 0, y += 16;
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
                    let sectionTimeColor = getTimeColor(sectionTime);

                    x = 0, y += 8;
                    x += drawBMText(modeStatsCtx, x, y, `${levelString}  `, "text5-white");
                    x += drawBMText(modeStatsCtx, x, y, timeString, "text5" + sectionTimeColor);
                }
                else {
                    x = 0, y += 8;
                    drawBMText(modeStatsCtx, x, y, "---  ---", "text5-gray");
                }
            }

            break;
        case 4:
            modeStatsCtx.clearRect(0, 0, 130, 160);
            modeStatsCtx.fillStyle = "#eaeaff";
            modeStatsCtx.fillRect(0, 1, 129, 1);
            modeStatsCtx.fillStyle = "#000008";
            modeStatsCtx.fillRect(1, 2, 129, 1);
            document.getElementById("modeInfoImage").src = "img/style5.png";
            document.getElementById("modeInfo").innerHTML = "<b>Info:</b><br>Bonus mode - Can you stack in time with the beat?<br>Extremely challenging - Only for top players!<br>- Variable DAS and ARE based on beat speed<br>- Grade based on distance through the song";
            modeStatsCtx.clearRect(0, 0, 130, 160);
            modeStatsCtx.fillStyle = "#eaeaff";
            modeStatsCtx.fillRect(0, 1, 129, 1);
            modeStatsCtx.fillStyle = "#000008";
            modeStatsCtx.fillRect(1, 2, 129, 1);
            //Best score
            modeStatsCtx.drawImage(modeStatsImage, 0, 24, 130, 16, 0, 8, 130, 16);
            bestScoreString = Math.floor(game.onTheBeatBests[0]).toString();
            for (let i = 0; i < bestScoreString.length; i++) {
                modeStatsCtx.drawImage(digitsSmall, bestScoreString[i] * 4, 0, 4, 6, 45 + i * 4, 8, 4, 6);
            }
            //Best level
            bestLevelString = Math.floor(game.onTheBeatBests[1]).toString();
            bestLevelColor = game.bestLevels[2] >= 999 ? 3 : 0;
            for (let i = 0; i < bestLevelString.length; i++) {
                modeStatsCtx.drawImage(digitsSmall, bestLevelString[i] * 4, bestLevelColor * 6, 4, 6, 44 + i * 4, 16, 4, 6);
            }
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

function drawTabInputPrompts(x) {
    switch(x) {
        case 1:
            drawInputPrompts([
                { actions: ["softDrop", "hardDrop"], label: "NAVIGATE" },
                { action: "rotClockwise", label: "SELECT" },
            ])
            break;

        case 2: 
            drawInputPrompts([
                { actions: ["softDrop", "hardDrop"], label: "NAVIGATE" },
                { action: "rotAnticlockwise", label: "BACK" },
                { action: "rotClockwise", label: "PLAY!" },
            ])
            break;

        case 3: 
            drawInputPrompts([
                { actions: ["softDrop", "hardDrop"], label: "NAVIGATE" },
                { action: "rotAnticlockwise", label: "BACK" },
                { action: "rotClockwise", label: "SELECT" },
            ])
            break;

        case 4: 
            drawInputPrompts([
                { action: "rotAnticlockwise", label: "BACK" },
            ])
            break;
    }
}