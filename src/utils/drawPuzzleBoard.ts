import Canvas from "@napi-rs/canvas";

const SPACE_ASPECT_RATIO = (137 / 122)
const MAX_SPACE_WIDTH = 100
const COEFFICIENT = 2
const GAP = 10



/**
 * Draws a puzzle board (a grid of rounded rectangular "spaces" with characters) into a given canvas context,
 * constrained to a specified bounding box.
 *
 * The function:
 *  - Estimates an initial per-space width from the board area and the length of the provided text.
 *  - Splits the text into tokens on single space characters and lays out tokens into rows without breaking words.
 *  - Scales the computed space size to fit the bounding box width, then re-scales if the total height exceeds the
 *    bounding box height. A hard maximum per-space width is enforced.
 *  - Centers rows horizontally and vertically within the bounding box.
 *  - Renders one "space" per character position; actual space characters (' ') are left blank (consume layout width but are not drawn).
 *  - Draws each non-space character centered inside its space using a bold font.
 *
 * Implementation notes:
 *  - Uses constants defined in the module for spacing, aspect ratio, max size, corner radius and visual style.
 *  - Uses token-based wrapping, so words are not broken across rows.
 *  - Consecutive space characters in the input will create empty layout slots (they affect spacing but are not rendered).
 *  - Debug information (board area, computed space width, and row layout) may be logged to the console.
 *
 * @param context - A Canvas.SKRSContext2D rendering context (from @napi-rs/canvas) to draw onto.
 * @param text - The text to render on the board. Tokens are determined by splitting on the ASCII space character.
 * @param x - X coordinate of the top-left corner of the bounding box (in canvas pixels).
 * @param y - Y coordinate of the top-left corner of the bounding box (in canvas pixels).
 * @param width - Width of the bounding box available for the board (in canvas pixels).
 * @param height - Height of the bounding box available for the board (in canvas pixels).
 *
 * @returns void
 *
 * @example
 * // Draw "HELLO WORLD" centered inside a 400x120 box at position (10, 20)
 * drawPuzzleBoard(ctx, "HELLO WORLD", 10, 20, 400, 120);
 *
 * @remarks
 * - If the provided bounding box is too small to display all characters at a reasonable size, the function will scale
 *   spaces down to fit but will not perform word hyphenation or character truncation.
 * - The appearance (gap between spaces, aspect ratio of spaces, max space width, corner radius, font scale, background color)
 *   is controlled by module-level constants and can be adjusted there.
 */
export default function drawPuzzleBoard(context: Canvas.SKRSContext2D, text: string, x: number, y: number, width: number, height: number) {

    //Guesstimate required space width by comparing the area of the board to the sum of the areas of each space | Equating the areas to one another to solve for the space width
    const count = text.length
    const board_area = width * height
    const space_width = Math.sqrt((board_area) / (COEFFICIENT * SPACE_ASPECT_RATIO * count)) - GAP //coefficient * board_area = (space_width + gap) * (gap + space_width * aspect_ratio) * count [TODO: Validate]
    console.log(board_area, count, space_width)

    //Dont break up words, iterate through token list fitting as many tokens into each line as possible
    const tokens = text.split(' ')
    let rows: string[][] = []
    let row_width = 0
    let row_index = 0
    for (const token of tokens) {
        const num_spaces = token.length + 1
        const allocate_width = num_spaces * space_width
        if (row_width + allocate_width > width) {
            row_width = 0
            row_index++
        }

        row_width += allocate_width
        if (rows[row_index] == undefined) { rows[row_index] = [token] }
        else rows[row_index]!.push(token)
    }

    //Clean rows of empty rows
    rows = rows.filter((row) => !!row)
    console.log(rows)

    //scale values to fit within boards bounding box | relative to width first
    const collective_width = Math.max(...rows.map((row) => row.join(' ').length * (space_width + GAP)))
    const scale = width / collective_width
    let scaled_width = space_width * scale
    let scaled_height = scaled_width * SPACE_ASPECT_RATIO

    //Check if the scaled height exceeds the bounding box height
    const total_height = rows.length * (scaled_height + GAP) - GAP
    if (total_height > height) {
        const height_scale = height / total_height
        //Rescale width and height based on height scale
        scaled_width *= height_scale
        scaled_height *= height_scale
    }

    //Force a maximum size for each space
    if (scaled_width > MAX_SPACE_WIDTH) {
        scaled_width = MAX_SPACE_WIDTH
        scaled_height = scaled_width * SPACE_ASPECT_RATIO
    }

    //Begin drawing the rows previously defined
    for (let index = 0; index < rows.length; index++) {

        const row = rows[index]
        if (row == undefined) break
        const row_text = row.join(' ')


        const start_x = width / 2 + x - row_text.length * (scaled_width + GAP) / 2 //Center the row based on its length
        const space_y = y + index * (scaled_height + GAP) + (height - (rows.length * (scaled_height + GAP) - GAP)) / 2 //Center all rows vertically within the bounding box
        let space_x = start_x

        for (const char of row_text.split('')) {
            //Skip draw call if a 'space' character
            if (char != ' ') drawPuzzleBoardSpace(context, char, space_x, space_y, scaled_width, scaled_height)
            space_x += scaled_width + GAP
        }
    }

}

const RECT_RADIUS = 10
const BACKGROUND_COLOR = "#272727"
const FONT_SCALE = 0.6

function drawPuzzleBoardSpace(context: Canvas.SKRSContext2D, char: string, x: number, y: number, width: number, height: number) {

    //Draw Background Rectangle
    const radius = RECT_RADIUS
    
    // -> Middle
    context.fillStyle = BACKGROUND_COLOR
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
    context.fillStyle = "white"
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