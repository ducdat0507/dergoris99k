/** 
 * @typedef {Object} BMFontData 
 * @property {HTMLImageElement} image
 * @property {Record<BMFontChar>} chars
*/

/** 
 * @typedef {Object} BMFontChar
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
*/

/** @type {Record<string, BMFontData>} */
let fonts = {}

function drawBMText(ctx, x, y, text, font="text5-white") 
{
    const fontData = fonts[font];

    let offset = 0;

    for (let char of text) 
    {
        if (!fontData.chars[char]) continue;
        const charData = fontData.chars[char];
        ctx.drawImage(fontData.image, charData.x, charData.y, charData.w, charData.h, x, y, charData.w, charData.h)
        x += charData.w;
        offset += charData.w;
    }

    return offset;
}