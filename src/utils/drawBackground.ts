import Canvas from '@napi-rs/canvas'
import path from 'path';

const PHASE_IMAGES = [
    path.join(process.cwd(), "public","images","Phase_0.png")
    
]
const MAX_PHASE = PHASE_IMAGES.length - 1

export default async function drawBackground(context: Canvas.SKRSContext2D, phase: number, width: number, height: number){

    const image_path = PHASE_IMAGES[Math.min(phase, MAX_PHASE)] as string
    const image = await Canvas.loadImage(image_path)
    context.drawImage(image, 0, 0, width, height)

}