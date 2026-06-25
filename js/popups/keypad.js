popups.keypad = {
    keyTable: {
        regular: [
            [
                { char: "1" },
                { char: "2" },
                { char: "3" },
                { char: "4" },
                { char: "5" },
                { char: "6" },
                { char: "7" },
                { char: "8" },
                { char: "9" },
                { char: "0" },
            ],
            [
                { char: "q" },
                { char: "w" },
                { char: "e" },
                { char: "r" },
                { char: "t" },
                { char: "y" },
                { char: "u" },
                { char: "i" },
                { char: "o" },
                { char: "p" },
            ],
            [
                { char: "a" },
                { char: "s" },
                { char: "d" },
                { char: "f" },
                { char: "g" },
                { char: "h" },
                { char: "j" },
                { char: "k" },
                { char: "l" },
                { char: "m" },
            ],
            [
                { char: "z" },
                { char: "x" },
                { char: "c" },
                { char: "v" },
                { char: "b" },
                { char: "n" },
                { char: "-" },
                { char: "_" },
                { char: "." },
                { char: ":" },
            ],
            [
                { action: "shift", width: 2 },
                { char: " ", width: 4 },
                { action: "backspace", width: 2 },
                { action: "enter", width: 2 },
            ]
        ],
        number: [
            [
                { char: "1" },
                { char: "2" },
                { char: "3" },
                { action: "backspace", width: 2 },
            ],
            [
                { char: "4" },
                { char: "5" },
                { char: "6" },
                { action: "enter", width: 2 },
            ],
            [
                { char: "7" },
                { char: "8" },
                { char: "9" },
            ],
            [
                { char: "0", width: 2 },
                { char: "." },
            ],
        ],
    },

    create(elm, field, type="regular") {
        let fieldLabel = field.element.querySelector("label");
        let fieldInput = field.element.querySelector("input");

        let inputId = "keypad-field-" + Math.random().toString().substring(2);

        let label = document.createElement("label");
        label.classList.add("keypad-label");
        label.innerText = fieldLabel.innerText;
        label.htmlFor = inputId;
        elm.$elements.content.append(label);

        let inputHolder = document.createElement("div");
        inputHolder.classList.add("form-element", "keypad-input");
        inputHolder.style.animation = "none";
        elm.$elements.content.append(inputHolder);

        let input = document.createElement("input");
        input.classList.add("value");
        input.id = inputId;
        input.type = fieldInput.type;
        input.value = fieldInput.value;
        input.min = fieldInput.min;
        input.max = fieldInput.max;
        input.addEventListener("change", () => {
            field.value = input.value;
        })
        elm.$elements.input = input;
        inputHolder.append(input);
        
        let keypad = document.createElement("div")
        keypad.classList.add("keypad");
        elm.$elements.content.append(keypad);
        elm.$keys = [];
        elm.$keyMatrix = {};

        let y = 0;
        for (let row of this.keyTable[type]) {
            let rowDiv = document.createElement("span");
            keypad.append(rowDiv);
            let x = 0;
            for (let key of row) {
                let button = document.createElement("button");
                button.$key = key;
                button.$x = x;
                button.$y = y;
                button.onclick = () => this.clickKey(elm, button.$key);
                if (key.width > 1) {
                    button.style.setProperty("--width", key.width);
                    for (let i = 0; i < key.width; i++) {
                        elm.$keyMatrix[x + "," + y] = button;
                        x++;
                    }
                } else {
                    elm.$keyMatrix[x + "," + y] = button;
                    x++;
                }
                rowDiv.append(button);
                elm.$keys.push(button);
            }
            elm.$keyWidth = x;
            y++;
        }
        elm.$keyWidth = y;

        elm.$lastActiveForm = activeForm;
        setActiveForm(null);

        setTimeout(() => input.focus(), 0);
        this.updateButtons(elm);
        this.setActiveKey(elm, 0, 0);
    },

    setActiveKey(elm, x, y) {
        let key = elm.$keyMatrix[x + "," + y];
        if (!key) return false;
        if (elm.$activeKey) {
            elm.$activeKey.ariaSelected = false;
        }
        elm.$activeKey = key;
        {
            elm.$activeKey.ariaSelected = true;
        }
        return true;
    },

    moveActiveKey(elm, x, y) {
        if (elm.$activeKey) {
            if (x >= 1) x += (elm.$activeKey.style.getPropertyValue("--width") || 1) - 1;
            if (!this.setActiveKey(elm, elm.$activeKey.$x + x, elm.$activeKey.$y + y)) {
                elm.$activeKey.animate([
                    { transform: `translate(${6 * x}px, ${6 * y}px)` },
                    { transform: `translate(0px, 0px)` },
                ], {
                    duration: 500,
                    easing: "cubic-bezier(0.19, 1, 0.22, 1)",
                })
                return;
            }
        }
    },

    clickKey(elm, key) {
        let input = elm.$elements.input
        input.focus();
        if (key.action) {
            switch (key.action) {
                case "backspace":
                    let start = input.selectionStart;
                    let end = input.selectionEnd;
                    if (start == end) start = Math.max(start - 1, 0)
                    input.setRangeText("", start, end);
                    input.setSelectionRange(start, start);
                    break;
                case "shift":
                    elm.$shift = !elm.$shift;
                    this.updateButtons(elm);
                    break;
                case "enter":
                    input.dispatchEvent(new Event("change"))
                    closePopup(elm);
                    break;
            }
        } else {
            let char = elm.$shift && key.shiftChar ? key.shiftChar : key.char;
            input.setRangeText(char, input.selectionStart, input.selectionEnd);
            input.setSelectionRange(input.selectionStart + 1, input.selectionEnd + 1);
        }
    },

    updateButtons(elm) {
        for (let button of elm.$keys) {
            let key = button.$key;
            if (key.action) {
                button.innerText = {
                    backspace: "B/K",
                    enter: "E/D",
                    shift: "Shift",
                }[key.action];
            } else {
                let char = elm.$shift ? key.shiftChar ?? key.char.toUpperCase() : key.char;
                button.innerText = {
                    " ": "Space"
                }[char] ?? char;
            }
        }
    },

    handleAction(elm, action) {
        if (action == "exit") {
            elm.$elements.input.dispatchEvent(new Event("change"))
            closePopup(elm);
            playSound("buttonClick");
        } else if (primaryInputMethod == "gamepad") {
            if (action == "left") {
                this.moveActiveKey(elm, -1, 0);
                playSound("buttonHover");
            } else if (action == "right") {
                this.moveActiveKey(elm, 1, 0);
                playSound("buttonHover");
            } else if (action == "hardDrop") {
                this.moveActiveKey(elm, 0, -1);
                playSound("buttonHover");
            } else if (action == "softDrop") {
                this.moveActiveKey(elm, 0, 1);
                playSound("buttonHover");
            } else if (action == "rotClockwise") {
                elm.$activeKey?.click();
                playSound("buttonClick");
            } else if (action == "rotClockwiseAlt") {
                this.clickKey(elm, { action: "backspace" });
                playSound("buttonClick");
            }  else if (action == "rotAnticlockwise") {
                elm.$elements.input.dispatchEvent(new Event("change"))
                closePopup(elm);
                playSound("buttonClick");
            } 
        } else if (primaryInputMethod == "keyboard") {
            // throwing an exception here so all action logic is skipped
            // including the event consumption so the input re
            // I probably shouldn't rely on this
            throw new Error();
        }
        
        return true;
    },

    getInputPrompts(elm) {
        if (primaryInputMethod == "gamepad") {
            return [
                { actions: ["left", "right", "softDrop", "hardDrop"], label: "NAVIGATE" },
                { action: "rotAnticlockwise", label: "E/D" },
                { action: "rotClockwiseAlt", label: "B/K" },
                { action: "rotClockwise", label: "SELECT" },
            ]
        } else {
            return [
                { action: "exit", label: "E/D" },
            ]
        }
    },

    onClose(elm) {
        setActiveForm(elm.$lastActiveForm);
    }
}