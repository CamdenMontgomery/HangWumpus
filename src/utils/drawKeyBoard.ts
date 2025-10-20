
import Canvas from '@napi-rs/canvas'

const KEY_ASPECT_RATIO = 90/76
const MAX_KEYS_PER_ROW = 10
const ROWS = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVVBNM'
]
const GAP = 10 //Pixels


const NEUTRAL_COLOR_PALETTE = {color:"white", background: "#272727"}
const RIGHT_COLOR_PALETTE = {color:"white", background: "#404EED"}
const WRONG_COLOR_PALETTE = {color:"#B8CDFF", background: "#8EA3D5"}


/**
 * Draws a stylized keyboard inside a given bounding box on a @napi-rs/canvas 2D context.
 *
 * The keyboard is composed of three rows ("QWERTYUIOP", "ASDFGHJKL", "ZXCVVBNM").
 * Each key is rendered as a rounded rectangle with its character centered. Key widths
 * are computed to fit the provided bounding width (subject to a maximum keys-per-row),
 * and key heights are computed from a fixed aspect ratio. Keys are colored according
 * to membership in the provided `right` and `wrong` lists.
 *
 * @param context - The Canvas SKRS 2D rendering context used for drawing.
 * @param right - Array of single-character strings (typically uppercase letters) that should be drawn using the "right" color palette.
 * @param wrong - Array of single-character strings that should be drawn using the "wrong" color palette. If a character appears in both `right` and `wrong`, the "wrong" palette takes precedence.
 * @param x - X coordinate (pixels) of the top-left corner of the keyboard bounding box.
 * @param y - Y coordinate (pixels) of the top-left corner of the keyboard bounding box.
 * @param width - Width (pixels) of the keyboard bounding box. The keys are laid out to fit this width.
 * @param height - Height (pixels) available for the keyboard area. The actual drawn keyboard height depends on computed key size and gaps.
 *
 * @remarks
 * - This function mutates the supplied canvas context state (it sets fillStyle, font, textBaseline and textAlign). If you need to preserve previous context state, save/restore the context externally.
 * - Visual parameters such as key aspect ratio, gap size, corner radius, and font scale are controlled by module-level constants.
 * - Units are in pixels.
 *
 * @example
 * const canvas = Canvas.createCanvas(800, 200);
 * const ctx = canvas.getContext('2d');
 * drawKeyBoard(ctx, ['A','S','D'], ['Q','Z'], 10, 10, 780, 180);
 *
 * @returns void
 */
export default function drawKeyBoard(context: Canvas.SKRSContext2D, right: string[], wrong: string[], x: number, y: number, width: number, height: number){


    const key_width = (width - GAP * (MAX_KEYS_PER_ROW - 1))/MAX_KEYS_PER_ROW
    const key_height = key_width * KEY_ASPECT_RATIO

    //Draw Rows
    for (let i = 0; i < ROWS.length; i++){
        const row_chars = ROWS[i].split('') 
        const x_offset = (width - (row_chars.length * (key_width + GAP) - GAP))/2
        for (let j = 0; j < row_chars.length; j++){
            const char = row_chars[j]
            const key_x = x + x_offset + (key_width + GAP) * j
            const key_y = y + (key_height + GAP) * i

            let palette = NEUTRAL_COLOR_PALETTE
            if (right.includes(char)) palette = RIGHT_COLOR_PALETTE
            if (wrong.includes(char)) palette = WRONG_COLOR_PALETTE
            drawKey(context, char,key_x,key_y,key_width,key_height,palette.color,palette.background)
        }
    }


}





const RECT_RADIUS = 10
const FONT_SCALE = 0.4

function drawKey(context: Canvas.SKRSContext2D, char: string, x: number, y: number, width: number, height: number, color: string, background: string){

    //Draw Background Rectangle
    const radius = RECT_RADIUS
    
    // -> Middle
    context.fillStyle = background
    context.fillRect(x + radius, y+ radius, width - radius * 2, height - radius * 2)
    
    // -> Top-Left Corner 
    fillCircle(context,x + radius, y + radius, radius)

    // -> Top-Right Corner 
    fillCircle(context,x + width - radius, y + radius, radius)

    // -> Bottom-Right Corner 
    fillCircle(context,x + width - radius, y + height - radius, radius)

    // -> Bottom-Left Corner 
    fillCircle(context,x + radius, y + height - radius, radius)

    // -> Horizontal Cross Arm
    context.fillRect(x, y+ radius, width, height -  radius * 2)

    // -> Vertical Cross Arm
    context.fillRect(x + radius, y, width - radius * 2, height)
    
    //Draw Character In Space
    context.fillStyle = color
    context.font = `normal 900 ${height * FONT_SCALE}px Inter-Black`
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillText(char, x + width/2, y + height/2)
}

//Small Helper Function For Drawing Circles
function fillCircle(context: Canvas.SKRSContext2D, x: number ,y: number, radius: number){
    context.beginPath()
    context.arc(x,y,radius, 0, 2 * Math.PI, false)
    context.fill()
    context.closePath()
}