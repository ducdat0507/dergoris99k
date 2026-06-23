popups.prompt = {
    create(elm, title, description, options) {

        let titleElm = document.createElement("h2");
        titleElm.classList.add("prompt-title");
        titleElm.innerText = title;
        elm.$elements.content.append(titleElm);

        let descElm = document.createElement("div");
        descElm.classList.add("prompt-description");
        descElm.innerText = description;
        elm.$elements.content.append(descElm);

        let form = document.createElement("div");
        buildForm(form, options.map(x => new formElements.button({
            label: x.label,
            callback: () => {
                if (!x.callback?.()) closePopup(elm);
            }
        })))
        elm.$elements.form = form;
        elm.$elements.content.append(form);

        elm.$lastActiveForm = activeForm;
        setActiveForm(form);
    },

    getInputPrompts(elm) {
        return [];
    },

    onClose(elm) {
        setActiveForm(elm.$lastActiveForm);
    }
}