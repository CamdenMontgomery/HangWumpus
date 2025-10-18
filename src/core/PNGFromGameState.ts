import Canvas from '@napi-rs/canvas'
import drawBackground from '../utils/drawBackground.js'
import drawKeyBoard from '../utils/drawKeyBoard.js'
import drawPuzzleBoard from '../utils/drawPuzzleBoard.js'

const IMAGE_WIDTH = 1920
const IMAGE_HEIGHT = 1080


export default async function PNGFromGameState(answer: string, guesses: string[], hint?:string, mode: 'CLEAR' | 'OBFUSCATED'  = 'CLEAR') : Promise<Buffer> {

    //Clean The Input
    answer = answer.toUpperCase().replaceAll(/[^A-Z ]/g,'')
    guesses = guesses.join().toUpperCase().replaceAll(/[^A-Z]/g,'').split('')

    //Validate That We Have The Necessary Information
    if (answer.length == 0) throw Error('No Answer Provided | Try Different Input')

    const canvas = Canvas.createCanvas(IMAGE_WIDTH,IMAGE_HEIGHT)
    const ctx = canvas.getContext('2d')

    //Count # of Wrong Guesses To Determine Phase
    console.log(answer,guesses)
    const phase = guesses.reduce((acc, val) => !answer.includes(val) ? acc + 1 : acc, 0)
    drawBackground(ctx, phase, IMAGE_WIDTH, IMAGE_HEIGHT)

    //Recreate the answer with '_' characters as unknown spaces | Leave Spaces As Is
    const board_text = answer.split('').map((char) => guesses.includes(char) || char == ' ' ? char : '_' ).join()
    drawPuzzleBoard(ctx, board_text, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)

    //Deduce which guesses are correct and incorrect
    const right_guesses = guesses.filter((char) => answer.includes(char))
    const wrong_guesses = guesses.filter((char) => !answer.includes(char))
    drawKeyBoard(right_guesses, wrong_guesses)

    return await canvas.encode('png')

}