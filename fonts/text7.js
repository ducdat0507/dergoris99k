fonts["text7-white"] = {
    image: new Image(),
    chars: {
        "A": { x:   0, y:  0, w:  7, h: 11 },
        "B": { x:   7, y:  0, w:  7, h: 11 },
        "C": { x:  14, y:  0, w:  7, h: 11 },
        "D": { x:  21, y:  0, w:  7, h: 11 },
        "E": { x:  28, y:  0, w:  7, h: 11 },
        "F": { x:  35, y:  0, w:  7, h: 11 },
        "G": { x:  42, y:  0, w:  7, h: 11 },
        "H": { x:  49, y:  0, w:  7, h: 11 },
        "I": { x:  56, y:  0, w:  5, h: 11 },
        "J": { x:  61, y:  0, w:  6, h: 11 },
        "K": { x:  67, y:  0, w:  8, h: 11 },
        "L": { x:  75, y:  0, w:  7, h: 11 },
        "M": { x:  82, y:  0, w:  9, h: 11 },
        "N": { x:  91, y:  0, w:  8, h: 11 },
        "O": { x:  99, y:  0, w:  7, h: 11 },
        "P": { x: 106, y:  0, w:  7, h: 11 },
        "Q": { x: 113, y:  0, w:  7, h: 11 },
        "R": { x: 120, y:  0, w:  7, h: 11 },
        "S": { x: 127, y:  0, w:  7, h: 11 },
        "T": { x: 134, y:  0, w:  7, h: 11 },
        "U": { x: 141, y:  0, w:  7, h: 11 },
        "V": { x: 149, y:  0, w:  7, h: 11 },
    }
}
fonts["text10-white"].image.src = "fonts/text10.png";

{
    let variants = [
        ["text10-orange",  32],
        ["text10-gold",    64],
    ]
    for (let font of variants) {
        fonts[font[0]] = {
            image: fonts["text10-white"].image,
            chars: JSON.parse(JSON.stringify(fonts["text10-white"].chars))
        } 
        for (let char in fonts[font[0]].chars) {
            fonts[font[0]].chars[char].y += font[1];
        }
    }
}