let popups = {}

let activePopups = [];

function spawnPopup(popup, ...args) {
    let elm = document.createElement("div");
    elm.classList.add("popup");
    elm.$elements = {};
    elm.role = "dialog";

    let content = document.createElement("div");
    content.classList.add("popupContent");
    elm.$elements.content = content;
    elm.append(content);

    popup.create(elm, ...args);

    document.getElementById("popupHolder").appendChild(elm);
    activePopups.unshift({popup, elm});
	updateInputPrompts();
}

function closePopup(elm) {
    elm.remove();
    let index = activePopups.findIndex(x => x.elm == elm);
    if (index >= 0) {
        activePopups[index].popup.onClose?.(activePopups[index].elm);
        activePopups.splice(index, 1);
    }
    
	updateInputPrompts();
}

function handlePopupInput(action) {
    for (let popup of activePopups) {
        if (popup.popup.handleAction(popup.elm, action)) {
            return true;
        }
    }
    return false;
}