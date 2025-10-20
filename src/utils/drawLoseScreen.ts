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


/**
 * Draws the "lose" screen onto the provided 2D canvas context.
 *
 * The function loads a predefined lose background image and renders it to fill
 * the target canvas area. It then draws the provided answer string on top of
 * the image using the configured typography and layout constants.
 *
 * @remarks
 * - Expected to be called with a SKRSContext2D from the @napi-rs/canvas package.
 * - Uses synchronous drawing APIs after asynchronously loading the image.
 * - Positioning, font, and size are determined by module-level constants.
 *
 * @param context - A 2D rendering context (Canvas.SKRSContext2D) to draw onto.
 * @param answer - The answer text to render on the win screen. Will be centered
 *                 within the configured text rectangle and clipped to the max width.
 *
 * @returns A Promise that resolves once drawing is complete.
 *
 * @throws If the background image fails to load (e.g., file not found or I/O error).
 */
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