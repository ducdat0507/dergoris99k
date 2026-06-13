

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
    button: class extends GamepadFormElement {
        #elements = {}
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
}

formElements.menuButton = class extends formElements.button {
    constructor(options = {}) {
        super(options);
        this.element.classList.add("menuButton");
    }
}