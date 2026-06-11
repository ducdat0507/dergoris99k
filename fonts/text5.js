fonts["text5-white"] = {
    image: new Image(),
    chars: {
        "A": { x:   0, y: 0, w: 4, h: 6 },
        "B": { x:   4, y: 0, w: 4, h: 6 },
        "C": { x:   8, y: 0, w: 4, h: 6 },
        "D": { x:  12, y: 0, w: 4, h: 6 },
        "E": { x:  16, y: 0, w: 4, h: 6 },
        "F": { x:  20, y: 0, w: 4, h: 6 },
        "G": { x:  24, y: 0, w: 4, h: 6 },
        "H": { x:  28, y: 0, w: 4, h: 6 },
        "I": { x:  32, y: 0, w: 2, h: 6 },
        "J": { x:  34, y: 0, w: 4, h: 6 },
        "K": { x:  38, y: 0, w: 5, h: 6 },
        "L": { x:  43, y: 0, w: 4, h: 6 },
        "M": { x:  47, y: 0, w: 6, h: 6 },
        "N": { x:  53, y: 0, w: 5, h: 6 },
        "O": { x:  58, y: 0, w: 4, h: 6 },
        "P": { x:  62, y: 0, w: 4, h: 6 },
        "Q": { x:  66, y: 0, w: 5, h: 6 },
        "R": { x:  71, y: 0, w: 5, h: 6 },
        "S": { x:  76, y: 0, w: 4, h: 6 },
        "T": { x:  80, y: 0, w: 4, h: 6 },
        "U": { x:  84, y: 0, w: 4, h: 6 },
        "V": { x:  88, y: 0, w: 4, h: 6 },
        "W": { x:  92, y: 0, w: 6, h: 6 },
        "X": { x:  98, y: 0, w: 6, h: 6 },
        "Y": { x: 104, y: 0, w: 6, h: 6 },
        "Z": { x: 110, y: 0, w: 4, h: 6 },
        "0": { x: 114, y: 0, w: 4, h: 6 },
        "1": { x: 118, y: 0, w: 4, h: 6 },
        "2": { x: 122, y: 0, w: 4, h: 6 },
        "3": { x: 126, y: 0, w: 4, h: 6 },
        "4": { x: 130, y: 0, w: 4, h: 6 },
        "5": { x: 134, y: 0, w: 4, h: 6 },
        "6": { x: 138, y: 0, w: 4, h: 6 },
        "7": { x: 142, y: 0, w: 4, h: 6 },
        "8": { x: 146, y: 0, w: 4, h: 6 },
        "9": { x: 150, y: 0, w: 4, h: 6 },
        ":": { x: 154, y: 0, w: 4, h: 6 },
        "-": { x: 158, y: 0, w: 4, h: 6 },
        "+": { x: 162, y: 0, w: 4, h: 6 },
        " ": { x: 166, y: 0, w: 2, h: 6 },
        "(": { x: 168, y: 0, w: 3, h: 6 },
        ")": { x: 171, y: 0, w: 3, h: 6 },
        "!": { x: 174, y: 0, w: 4, h: 6 },
        "@": { x: 178, y: 0, w: 5, h: 6 },
        "'": { x: 183, y: 0, w: 4, h: 6 },
    }
}
fonts["text5-white"].image.src = "fonts/text5.png";

{
    let variants = [
        ["text5-blue",   6],
        ["text5-green", 12],
        ["text5-gold",  18],
        ["text5-gray",  24],
    ]
    for (let font of variants) {
        fonts[font[0]] = {
            image: fonts["text5-white"].image,
            chars: JSON.parse(JSON.stringify(fonts["text5-white"].chars))
        } 
        for (let char in fonts[font[0]].chars) {
            fonts[font[0]].chars[char].y += font[1];
        }
    }
}