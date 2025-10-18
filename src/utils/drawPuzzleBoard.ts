import Canvas from "@napi-rs/canvas";

const SPACE_ASPECT_RATIO = (137 / 122)
const COEFFICIENT = 2
const GAP = 10

export default function drawPuzzleBoard(context: Canvas.SKRSContext2D, text: string, x: number, y: number, width: number, height: number) {

    //Guesstimate required space width by comparing the area of the board to the sum of the areas of each space | Equating the areas to one another to solve for the space width
    const count = text.length
    const board_area = width * height
    const space_width = Math.sqrt((board_area) / (COEFFICIENT * SPACE_ASPECT_RATIO * count)) - GAP //coefficient * board_area = (space_width + gap) * (gap + space_width * aspect_ratio) * count
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

    //scale values to fit within boards bounding box
    const collective_width = Math.max(...rows.map((row) => row.join(' ').length * (space_width + GAP)))
    const scale = width / collective_width
    const scaled_width = space_width * scale
    const scaled_height = scaled_width * SPACE_ASPECT_RATIO

    //Begin drawing the rows previously defined
    for (let index = 0; index < rows.length; index++) {

        const row = rows[index]
        if (row == undefined) break
        const row_text = row.join(' ')


        const start_x = width / 2 + x - row_text.length * (scaled_width + GAP) / 2
        const space_y = y + index * (scaled_height + GAP)
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