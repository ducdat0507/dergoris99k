
/** @type {HTMLDivElement} */
let activeForm = null;

/** 
 * @param {HTMLDivElement} holder  
 * @param {GamepadFormElement[]} items  
*/
function buildForm(holder, items) {
    holder.$selectedItem = 0;
    holder.classList.add("form-holder");
    for (let item of items) {
        holder.append(item.element);
    }
}


/** @param {HTMLDivElement} form */
function setActiveForm(form) {
    activeForm = form;
    if (form) {
        let item = form.children[form.$selectedItem].$form;
        item.doFocus();
    }
}

function handleFormInput(action) {
    if (!activeForm) return;
    let item = activeForm.children[activeForm.$selectedItem].$form;
    return item.doInput(action);
}

function navigateForm(direction) {
    document.body.classList.add("prefer-key-nav");
    let pointer = activeForm.$selectedItem;
    while (true) {
        pointer += direction;
        if (pointer < 0 || pointer >= activeForm.childElementCount) return;
        if (activeForm.children[activeForm.$selectedItem]?.$form?.canFocus()) break;
    }
    activeForm.$selectedItem = pointer;
    activeForm.children[activeForm.$selectedItem].$form.doFocus();
    playSound("buttonHover");
}


function initForms() {
    // Play with/without sound intro
    buildForm(document.getElementById("introSoundForm"), [
        new formElements.button({
            label: "PLAY WITH SOUND",
            callback() {
                initializeGameMusic(); 
                playSound('menuMusic');

                hideBlackCover(); 
                drawTabInputPrompts(1); 
                document.getElementById("introSoundForm").style.display = "none";
                setActiveForm(document.getElementById("mainMenuForm"));
                displayModeInfo(currentMenuMode);
            },
        }),
        new formElements.button({
            label: "PLAY WITHOUT SOUND",
            callback() {
                soundEnabled = false; 

                hideBlackCover();
                drawTabInputPrompts(1); 
                document.getElementById("introSoundForm").style.display = "none";
                setActiveForm(document.getElementById("mainMenuForm"));
                displayModeInfo(currentMenuMode);
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
}

document.body.addEventListener("pointermove", () => {
    document.body.classList.remove("prefer-key-nav");
})