import Canvas from '@napi-rs/canvas'
import path from 'path';

const PHASE_IMAGES = [
    path.join(process.cwd(), "public","images","phase0.png"),
    path.join(process.cwd(), "public","images","phase1.png"),
    path.join(process.cwd(), "public","images","phase2.png"),
    path.join(process.cwd(), "public","images","phase3.png"),
    path.join(process.cwd(), "public","images","phase4.png"),
    
]
const MAX_PHASE = PHASE_IMAGES.length - 1



/**
 * Draws a background image for the given phase onto the supplied canvas context.
 *
 * The function selects an image from a predefined list of phase images, clamps the requested
 * phase to the available range, synchronously loads the image via Canvas.loadImage, and
 * draws it stretched to the specified width and height at the top-left corner (0,0).
 *
 * @param context - The @napi-rs/canvas SKRSContext2D rendering context to draw onto.
 * @param phase - The desired phase index. Values greater than the maximum available phase will be clamped.
 * @param width - The destination width (in pixels) to draw the image.
 * @param height - The destination height (in pixels) to draw the image.
 * @returns A Promise that resolves once the image has been loaded and drawn. If image loading fails,
 * the promise will reject with the underlying error.
 *
 * @remarks
 * - Image file paths are resolved relative to process.cwd() under "public/images/phase{n}.png".
 * - The function mutates the provided canvas context by drawing the image; callers should manage
 *   context state (transforms, globalAlpha, composite operations, etc.) if necessary.
 *
 * @example
 * const canvas = Canvas.createCanvas(800, 600);
 * const ctx = canvas.getContext('2d');
 * await drawBackground(ctx, 2, 800, 600);
 */
export default async function drawBackground(context: Canvas.SKRSContext2D, phase: number, width: number, height: number){

    const image_path = PHASE_IMAGES[Math.min(phase, MAX_PHASE)] as string
    const image = await Canvas.loadImage(image_path)
    context.drawImage(image, 0, 0, width, height)

}