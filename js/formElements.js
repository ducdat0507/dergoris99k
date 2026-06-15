

/** @abstract */
class GamepadFormElement {
    /** @type {HTMLElement & {$form: GamepadFormElement}} */
    element;

    /** @returns {boolean} */
    canFocus() {}
    doFocus() {}

    getActionPrompts() {}
    doInput(action) {}

}

const formElements = {
    heading: class extends GamepadFormElement {
        #elements = {}
        constructor(text) {
            super();

            this.element = document.createElement("h2");
            this.element.classList.add("form-heading");
            this.element.innerText = text;
            this.element.$form = this;
        }
    },
    description: class extends GamepadFormElement {
        #elements = {}
        constructor(text) {
            super();
            
            this.element = document.createElement("p");
            this.element.classList.add("form-description");
            this.element.innerText = text;
            this.element.$form = this;
        }
    },
    spacing: class extends GamepadFormElement {
        #elements = {}

        #disabled;
        get disabled() { return this.#disabled; }
        set disabled(val) { this.#disabled = val; this.updateDisabled() }

        constructor(spacing) {
            super();
            
            this.element = document.createElement("hr");
            this.element.classList.add("form-spacing");
            this.element.style.height = spacing * 3 + "px";
            this.element.$form = this;
        }
    },
    button: class extends GamepadFormElement {
        #elements = {}

        #disabled;
        get disabled() { return this.#disabled; }
        set disabled(val) { this.#disabled = val; this.updateDisabled() }

        constructor(options = {}) {
            super();

            let {
                label,
                callback,
            } = options
            
            this.element = document.createElement("div");
            this.element.$form = this;
            this.element.classList.add("form-element", "form-element-button");

            this.#elements.button = document.createElement("button");
            this.#elements.button.innerText = label;
            this.#elements.button.tabIndex = -1;
            this.#elements.button.addEventListener("click", () => {
                callback();
                playSound("buttonClick");
            });
            this.element.append(this.#elements.button);
        }

        updateDisabled() {
            this.element.ariaDisabled = this.#disabled
        }

        canFocus() {
            return true;
        }
        doFocus() {
            this.#elements.button.focus();
        }

        getActionPrompts() {
            return [
                { "action": "rotClockwise", "label": "SELECT" },
            ];
        }
        doInput(action) {
            if (action == "rotClockwise") {
                this.#elements.button.click();
                return true;
            }
        }
    },
    select: class extends GamepadFormElement {
        #elements = {}

        #values;
        get values() { return this.#values; }
        set values(val) { this.#values = val; this.updateLabels(); }

        #value;
        get value() { return this.#value; }
        set value(val) { this.#value = val; this.updateLabels(); this.onSet?.(val) }

        #disabled;
        get disabled() { return this.#disabled; }
        set disabled(val) { this.#disabled = val; this.updateDisabled() }

        onSet = null;

        constructor(options = {}) {
            super();

            let {
                label,
                value,
                values,
                onSet,
            } = options
            
            this.#value = value;
            this.#values = values;
            this.onSet = onSet;
            
            this.element = document.createElement("div");
            this.element.$form = this;
            this.element.classList.add("form-element", "form-element-select");

            this.#elements.label = document.createElement("div");
            this.#elements.label.classList.add("label");
            this.#elements.label.innerText = label;
            this.element.append(this.#elements.label);

            this.#elements.leftButton = document.createElement("button");
            this.#elements.leftButton.classList.add("left-button");
            this.#elements.leftButton.tabIndex = -1;
            this.#elements.leftButton.addEventListener("click", () => {
                this.adjustValue(-1);
                playSound("buttonClick");
            });
            this.element.append(this.#elements.leftButton);

            this.#elements.value = document.createElement("button");
            this.#elements.value.classList.add("value");
            this.#elements.value.tabIndex = -1;
            this.element.append(this.#elements.value);

            this.#elements.rightButton = document.createElement("button");
            this.#elements.rightButton.classList.add("right-button");
            this.#elements.rightButton.tabIndex = -1;
            this.#elements.rightButton.addEventListener("click", () => {
                this.adjustValue(1);
                playSound("buttonClick");
            });
            this.element.append(this.#elements.rightButton);

            this.updateLabels();
        }

        updateLabels() {
            let index = this.#values.findIndex(x => x.value == this.value);
            if (index >= 0) this.#elements.value.innerText = this.#values[index].label;
            else this.#elements.value.innerText = this.value;
        }

        updateDisabled() {
            this.element.ariaDisabled = this.#disabled
        }

        adjustValue(amount) {
            let curIndex = this.#values.findIndex(x => x.value == this.value);
            let newIndex = ((curIndex + amount) % this.values.length + this.values.length) % this.values.length
            this.value = this.values[newIndex].value;
        }

        canFocus() {
            return !this.disabled;
        }
        doFocus() {
            this.#elements.value.focus();
        }

        getActionPrompts() {
            return [
                { "actions": ["right", "left"], "label": "ADJUST" },
            ];
        }
        doInput(action) {
            if (action == "left") {
                this.#elements.leftButton.click();
            } else if (action == "right") {
                this.#elements.rightButton.click();
            }
        }
    },
    number: class extends GamepadFormElement {
        #elements = {}

        #lastGoodValue;
        get value() { return +this.#elements.value.value; }
        set value(val) { 
            val = +val;
            if (!Number.isFinite(val)) return;
            if (Number.isFinite(+this.#elements.value.min) && val < this.#elements.value.min) val = +this.#elements.value.min;
            if (Number.isFinite(+this.#elements.value.max) && val > this.#elements.value.max) val = +this.#elements.value.max;
            this.#lastGoodValue = this.#elements.value.value = val; this.onSet?.(val)
        }

        #disabled;
        get disabled() { return this.#disabled; }
        set disabled(val) { this.#disabled = val; this.updateDisabled() }

        onSet = null;

        constructor(options = {}) {
            super();

            let {
                label,
                value,
                onSet,
                arrowStep,
                ...fieldOptions
            } = options
            
            this.arrowStep = arrowStep;
            this.onSet = onSet;

            let id = "form-element-" + Math.random().toString().substring(2)
            
            this.element = document.createElement("div");
            this.element.$form = this;
            this.element.classList.add("form-element", "form-element-number");

            this.#elements.label = document.createElement("label");
            this.#elements.label.classList.add("label");
            this.#elements.label.innerText = label;
            this.#elements.label.htmlFor = id;
            this.element.append(this.#elements.label);

            this.#elements.leftButton = document.createElement("button");
            this.#elements.leftButton.classList.add("left-button");
            this.#elements.leftButton.tabIndex = -1;
            this.#elements.leftButton.addEventListener("click", () => {
                this.adjustValue(-1);
                playSound("buttonClick");
            });
            this.element.append(this.#elements.leftButton);

            this.#elements.value = document.createElement("input");
            this.#elements.value.id = id;
            this.#elements.value.type = "number"
            this.#elements.value.value = value
            this.#elements.value.classList.add("value");
            this.#elements.value.tabIndex = -1;
            for (let opt in fieldOptions) this.#elements.value[opt] = fieldOptions[opt];
            this.#elements.value.addEventListener("input", () => {
                this.value = this.#elements.value.value;
            })
            this.#elements.value.addEventListener("blur", () => {
                this.#elements.value.value = this.#lastGoodValue;
            })
            this.element.append(this.#elements.value);

            this.#elements.rightButton = document.createElement("button");
            this.#elements.rightButton.classList.add("right-button");
            this.#elements.rightButton.tabIndex = -1;
            this.#elements.rightButton.addEventListener("click", () => {
                this.adjustValue(1);
                playSound("buttonClick");
            });
            this.element.append(this.#elements.rightButton);
        }

        adjustValue(amount) {
            this.value += amount * (this.arrowStep || this.#elements.value.step || 1);
        }

        updateDisabled() {
            this.element.ariaDisabled = this.#disabled
        }

        canFocus() {
            return !this.disabled;
        }
        doFocus() {
            this.#elements.value.focus();
        }

        getActionPrompts() {
            if (primaryInputMethod == "keyboard") {
                return [
                    { "actions": ["right", "left"], "label": "ADJUST" },
                ];
            } else {
                return [
                    { "actions": ["rotClockwise"], "label": "SET" },
                    { "actions": ["right", "left"], "label": "ADJUST" },
                ];
            }
        }
        doInput(action) {
            if (action == "left") {
                this.#elements.leftButton.click();
            } else if (action == "right") {
                this.#elements.rightButton.click();
            }
        }
    },
    boolean: class extends GamepadFormElement {
        #elements = {}

        get value() { return this.#elements.value.checked; }
        set value(val) { this.#elements.value.checked = val; this.onSet?.(val) }

        #disabled;
        get disabled() { return this.#disabled; }
        set disabled(val) { this.#disabled = val; this.updateDisabled() }

        onSet = null;

        constructor(options = {}) {
            super();

            let {
                label,
                value,
                onSet,
                ...fieldOptions
            } = options
            
            this.onSet = onSet;
            
            this.element = document.createElement("div");
            this.element.$form = this;
            this.element.classList.add("form-element", "form-element-boolean");

            let id = "form-element-" + Math.random().toString().substring(2)

            this.#elements.label = document.createElement("label");
            this.#elements.label.classList.add("label");
            this.#elements.label.innerText = label;
            this.#elements.label.htmlFor = id;
            this.element.append(this.#elements.label);

            this.#elements.value = document.createElement("input");
            this.#elements.value.id = id;
            this.#elements.value.type = "checkbox"
            this.#elements.value.value = value
            this.#elements.value.classList.add("value");
            this.#elements.value.tabIndex = -1;
            for (let opt in fieldOptions) this.#elements.value[opt] = fieldOptions[opt];
            this.#elements.value.addEventListener("change", () => {
                this.onSet?.(this.value);
                playSound("buttonClick");
            })
            this.element.append(this.#elements.value);
        }

        updateDisabled() {
            this.element.ariaDisabled = this.#disabled
        }

        canFocus() {
            return !this.disabled;
        }
        doFocus() {
            this.#elements.value.focus();
        }

        getActionPrompts() {
            return [
                { "actions": ["rotClockwise"], "label": "TOGGLE" },
            ];
        }
        doInput(action) {
            if (action == "rotClockwise") {
                this.#elements.value.click();
            }
        }
    },
}

formElements.menuButton = class extends formElements.button {
    constructor(options = {}) {
        super(options);
        this.element.classList.add("menuButton");
    }
}