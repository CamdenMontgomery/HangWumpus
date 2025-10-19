import Canvas from '@napi-rs/canvas'
import drawBackground from '../utils/drawBackground.js'
import drawKeyBoard from '../utils/drawKeyBoard.js'
import drawPuzzleBoard from '../utils/drawPuzzleBoard.js'
import initializeGlobalFonts from '../utils/initializeGlobalFonts.js'
import drawWinScreen from '../utils/drawWinScreen.js'

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

const MAX_INCORRECT = 4

export default async function PNGFromGameState(answer: string, guesses: string[], hint?:string /*Unused*/, mode: 'CLEAR' | 'OBFUSCATED'  = 'CLEAR' /*Unused*/) : Promise<Buffer> {

    //Clean The Input
    answer = answer.toUpperCase().replaceAll(/[^A-Z ]/g,'') //Force Uppercase and Remove Non-Alphabetic
    guesses = ([...(new Set(guesses))]).join('').toUpperCase().replaceAll(/[^A-Z]/g,'').split('') //Remove Duplicates, Force Uppercase and Remove Non-Alphabetic


    //Validate That We Have The Necessary Information
    if (answer.length == 0) throw Error('No Answer Provided | Try Different Input')


    //Initialize Canvas For Image Drawing
    const canvas = Canvas.createCanvas(IMAGE_WIDTH,IMAGE_HEIGHT)
    const ctx = canvas.getContext('2d')


    //Determine Gamestate
    const num_incorrect = guesses.reduce((acc, val) => !answer.includes(val) ? acc + 1 : acc, 0)
    const gameState = num_incorrect >= MAX_INCORRECT ? 'LOST' : answer.split('').every(char => guesses.includes(char) || char == ' ') ? 'WON' : 'IN_PROGRESS'

    switch (gameState){
        case 'WON': {

            //Initialize Global Fonts For Use In Drawing
            initializeGlobalFonts()
            await drawWinScreen(ctx, answer)
            break

        }
        case 'LOST': {

            break

        }
        case 'IN_PROGRESS': {

            //Count # of Wrong Guesses To Determine Phase
            const phase = Math.min(num_incorrect, MAX_INCORRECT)
            

            //Recreate the answer with '_' characters as unknown spaces | Leave Spaces As Is
            const board_text = answer.split('').map((char) => guesses.includes(char) || char == ' ' ? char : '_' ).join('')


            //Deduce which guesses are correct and incorrect
            const right_guesses = guesses.filter((char) => answer.includes(char))
            const wrong_guesses = guesses.filter((char) => !answer.includes(char))

            //Initialize Global Fonts For Use In Drawing
            initializeGlobalFonts()

            //Draw Stack
            await drawBackground(ctx, phase, IMAGE_WIDTH, IMAGE_HEIGHT)
            drawPuzzleBoard(ctx, board_text, PUZZLEBOARD_PARAMS.x,PUZZLEBOARD_PARAMS.y,PUZZLEBOARD_PARAMS.width,PUZZLEBOARD_PARAMS.height)
            drawKeyBoard(ctx,right_guesses, wrong_guesses,KEYBOARD_PARAMS.x,KEYBOARD_PARAMS.y,KEYBOARD_PARAMS.width,KEYBOARD_PARAMS.height)
            
            break

        }
    }


    return await canvas.encode('png')

}