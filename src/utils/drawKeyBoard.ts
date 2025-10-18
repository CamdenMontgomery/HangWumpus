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