import Canvas from "@napi-rs/canvas";

const SPACE_ASPECT_RATIO = (122/137)
const COEFFICIENT = 1
const GAP = 10

export default function drawPuzzleBoard(context: Canvas.SKRSContext2D, text: string, x: number, y: number, width: number, height: number){
    
    const count = text.length
    const board_area = width * height
    const space_width = Math.sqrt((COEFFICIENT * board_area)/(SPACE_ASPECT_RATIO * count)) - GAP //coefficient * board_area = (space_width + gap) * (gap + space_width * aspect_ratio) * num
    const space_height = space_width * SPACE_ASPECT_RATIO

    const rows: string[][] = []
    const tokens = text.split(' ')
    let row_width = 0
    let row_index = 0
    for (const token of tokens){
        const num_spaces = token.length + 1
        const allocate_width = num_spaces * space_width
        if (row_width + allocate_width > width){
            row_width = 0
            row_index++
        }


        if (rows[row_index] == undefined) {rows[row_index] = [token]}
        else rows[row_index]!.push(token)
    }

    for (let index = 0; index < rows.length; index++){
        const row = rows[index]
        if (row == undefined) break
        const row_text = row.join(' ')
        const space_y =  y + index * (space_height + GAP)
        const start_x = width/2 + x - text.length * (space_width + GAP) / 2
        let space_x = start_x
        for (const char in row_text.split('')){
            drawPuzzleBoardSpace(context,char,space_x,space_y,space_width,space_height)
        }
    }

}

function drawPuzzleBoardSpace( context: Canvas.SKRSContext2D, char: string, x: number, y: number, width: number, height: number){
    context.fillStyle = "black"
    context.fillRect(x,y,width,height)
}