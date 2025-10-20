
import Canvas from '@napi-rs/canvas'
import drawBackground from '../utils/drawBackground.js'
import drawKeyBoard from '../utils/drawKeyBoard.js'
import drawPuzzleBoard from '../utils/drawPuzzleBoard.js'
import initializeGlobalFonts from '../utils/initializeGlobalFonts.js'
import drawWinScreen from '../utils/drawWinScreen.js'
import drawLoseScreen from '../utils/drawLoseScreen.js'

type GameState = 'IN_PROGRESS' | 'WON' | 'LOST'


const IMAGE_WIDTH = 1920
const IMAGE_HEIGHT = 1080
const PUZZLEBOARD_PARAMS = {
    x: 990,
    y: 250,
    width: 900,
    height: 320
}
const KEYBOARD_PARAMS = {
    x: 1025,
    y: 700,
    width: 820,
    height: 412
}

const MAX_INCORRECT = 5




/**
 * Generate a PNG image buffer that visualizes a Hangman-like game state.
 *
 * This asynchronous function builds a 1920x1080 PNG representation of the current
 * game given the secret answer and a list of guessed letters. It:
 *  - Normalizes inputs (forces uppercase, strips non-alphabetic characters from the answer,
 *    removes duplicates and non-alphabetic chars from guesses).
 *  - Computes the number of incorrect guesses and derives a game state: WON, LOST, or IN_PROGRESS.
 *  - For WON/LOST states, draws the appropriate end screen.
 *  - For IN_PROGRESS, computes a masked puzzle board (unknown letters replaced with '_'),
 *    separates right and wrong guesses, determines the current phase from the incorrect count,
 *    and draws the background, puzzle board, and keyboard with guessed letters.
 *  - Returns the resulting PNG image as a Buffer.
 *
 * Remarks:
 *  - The answer preserves spaces; spaces are never masked.
 *  - The guesses array will be deduplicated and converted to an array of single uppercase characters
 *    before use.
 *  - The function calls external drawing utilities and initializes global fonts before rendering.
 *  - The optional `hint` and `mode` parameters are accepted but not used by the rendering logic.
 *
 * @param answer - The secret answer phrase. Non-letter characters (except space) will be removed and
 *                 the string will be converted to uppercase before processing. Must not be empty
 *                 after sanitization.
 * @param guesses - An array of guessed letters (strings). The array will be deduplicated and sanitized:
 *                  converted to uppercase and non-letter characters removed. After sanitization each
 *                  element is treated as a single character guess.
 * @param hint - Optional hint text (currently unused by the renderer).
 * @param mode - Optional rendering mode, either 'CLEAR' or 'OBFUSCATED'. Defaults to 'CLEAR'.
 *               (Currently unused by the renderer.)
 *
 * @returns A Promise that resolves to a Buffer containing the encoded PNG image.
 *
 * @throws {Error} If the provided answer is empty (after sanitization), an Error with message
 *                 'No Answer Provided | Try Different Input' is thrown.
 *
 * @example
 * // (async context)
 * const pngBuffer = await PNGFromGameState("hello world", ["h", "x", "e"], undefined, "CLEAR");
 */
export default async function PNGFromGameState(answer: string, guesses: string[], hint?:string /*Unused*/, mode: 'CLEAR' | 'OBFUSCATED'  = 'CLEAR' /*Unused*/) : Promise<Buffer> {

    //Clean The Input
    answer = answer.toUpperCase().replaceAll(/[^A-Z ]/g,'') //Force Uppercase and Remove Non-Alphabetic
    guesses = ([...(new Set(guesses))]).join('').toUpperCase().replaceAll(/[^A-Z]/g,'').split('') //Remove Duplicates, Force Uppercase and Remove Non-Alphabetic


    //Validate That We Have The Necessary Information
    if (answer.length == 0) throw Error('No Answer Provided | Try Different Input')


    //Initialize Canvas For Image Drawing
    const canvas = Canvas.createCanvas(IMAGE_WIDTH,IMAGE_HEIGHT)
    const ctx = canvas.getContext('2d')


    //Initialize Global Fonts For Use In Drawing
    initializeGlobalFonts()

    
    //Determine Gamestate
    const num_incorrect = guesses.reduce((acc, val) => !answer.includes(val) ? acc + 1 : acc, 0)
    const gameState: GameState = num_incorrect >= MAX_INCORRECT ? 'LOST' : answer.split('').every(char => guesses.includes(char) || char == ' ') ? 'WON' : 'IN_PROGRESS'



    switch (gameState){
        case 'WON': {


            await drawWinScreen(ctx, answer)
            break

        }
        case 'LOST': {


            await drawLoseScreen(ctx, answer)
            break

        }
        case 'IN_PROGRESS': {

            //Count # of Wrong Guesses To Determine Phase
            const phase = Math.min(num_incorrect, MAX_INCORRECT - 1)
            

            //Recreate the answer with '_' characters as unknown spaces | Leave Spaces As Is
            const board_text = answer.split('').map((char) => guesses.includes(char) || char == ' ' ? char : '_' ).join('')


            //Deduce which guesses are correct and incorrect
            const right_guesses = guesses.filter((char) => answer.includes(char))
            const wrong_guesses = guesses.filter((char) => !answer.includes(char))


            //Draw Stack
            await drawBackground(ctx, phase, IMAGE_WIDTH, IMAGE_HEIGHT)
            drawPuzzleBoard(ctx, board_text, PUZZLEBOARD_PARAMS.x,PUZZLEBOARD_PARAMS.y,PUZZLEBOARD_PARAMS.width,PUZZLEBOARD_PARAMS.height)
            drawKeyBoard(ctx,right_guesses, wrong_guesses,KEYBOARD_PARAMS.x,KEYBOARD_PARAMS.y,KEYBOARD_PARAMS.width,KEYBOARD_PARAMS.height)
            
            break

        }
    }


    return await canvas.encode('png')

}