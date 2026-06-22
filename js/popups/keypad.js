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
                { action: "backspace", width: 2 },
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
                { char: "-", shiftChar: "_" },
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
                { action: "enter", width: 3 },
            ],
            [
                { char: "z" },
                { char: "x" },
                { char: "c" },
                { char: "v" },
                { char: "b" },
                { char: "n" },
                { char: "m" },
                { char: " ", width: 2 },
                { action: "shift", width: 3 },
            ],
        ]
    },

    create(elm, field, type="regular") {
        let fieldInput = field.element.querySelector("input");

        let inputHolder = document.createElement("div");
        inputHolder.classList.add("form-element");
        inputHolder.style.animation = "none";
        elm.$elements.content.append(inputHolder);

        let input = document.createElement("input");
        input.classList.add("value");
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
                button.onclick = () => this.clickKey(elm, button);
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

        input.focus();
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
    },

    moveActiveKey(elm, x, y) {
        if (elm.$activeKey) {
            if (x >= 1) x += (elm.$activeKey.style.getPropertyValue("--width") || 1) - 1;
            this.setActiveKey(elm, elm.$activeKey.$x + x, elm.$activeKey.$y + y);
        }
    },

    clickKey(elm, button) {
        let input = elm.$elements.input
        input.focus();
        let key = button.$key;
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
                    backspace: "Backspace",
                    enter: "Enter",
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
        if (action == "left") {
            this.moveActiveKey(elm, -1, 0);
        } else if (action == "right") {
            this.moveActiveKey(elm, 1, 0);
        } else if (action == "hardDrop") {
            this.moveActiveKey(elm, 0, -1);
        } else if (action == "softDrop") {
            this.moveActiveKey(elm, 0, 1);
        } else if (action == "rotClockwise") {
            elm.$activeKey?.click();
        } else if (action == "exit") {
            closePopup(elm);
        }
        
        return true;
    },

    onClose(elm) {
        setActiveForm(elm.$lastActiveForm);
    }
}