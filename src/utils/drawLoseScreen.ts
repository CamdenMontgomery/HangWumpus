import Canvas from '@napi-rs/canvas'
import path from 'path';

const IMAGE_PATH = path.join(process.cwd(), "public","images","lose.png")
const IMAGE_WIDTH = 1920
const IMAGE_HEIGHT = 1080
const TEXT_PARAMS = {
    x: 1265,
    y: 187,
    width: 500,
    height: 200
}

export default async function drawLoseScreen(context: Canvas.SKRSContext2D , answer: string) {
    
    //Draw Background
    const image = await Canvas.loadImage(IMAGE_PATH)
    context.drawImage(image, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)
    
    //Draw Answer Text
    context.fillStyle = "white"
    context.font = `normal 900 60px Inter-Black`
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.letterSpacing = '8px'
    context.fillText(answer, TEXT_PARAMS.x + TEXT_PARAMS.width / 2, TEXT_PARAMS.y + TEXT_PARAMS.height / 2, TEXT_PARAMS.width)
}