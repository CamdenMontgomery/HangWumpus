import PNGFromGameState from './src/core/PNGFromGameState.js'
import express from 'express'
const app = express()

/**
 * Express route handler for GET /play.
 *
 * Main Endpoint for HangWumpus game image generation.
 * Generates and returns a PNG representation of the HangWumpus game state
 * based on query parameters.
 *
 * Expected query parameters:
 * - answer: string (required) — the answer word/phrase. '-' and '_' are replaced with spaces
 *   to support URLs from messaging platforms that don't allow spaces.
 * - guesses: string (optional) — a sequence of guessed characters; will be split into an array
 *   of single-character strings.
 *
 * Behavior:
 * - If the "answer" query parameter is missing or empty, responds with plain-text
 *   error "Error: No answer provided".
 * - Otherwise, calls PNGFromGameState(answer, guessesArray) to obtain a PNG buffer,
 *   sets response headers ("Content-Type": "image/png", "Content-Length": buffer.length),
 *   and sends the image buffer as the response body.
 *
 * @param request - The Express request object. Query params 'answer' and 'guesses' are read from request.query.
 * @param response - The Express response object used to send errors or the PNG image.
 * @returns A Promise that resolves when the response has been sent (Promise<void>).
 * @throws May propagate errors thrown by PNGFromGameState; these should be handled by Express error middleware if needed.
 *
 * @example
 * // Request:
 * // GET /play?answer=hello_world&guesses=helo
 * // Treats answer as "hello world" and guesses as ['h','e','l','o'], then returns a PNG image.
 */
app.get('/play',  async ( request, response ) => { 
  

  const answer = String(request.query.answer ?? '').replace(/[-_]/,' ') //'-' & '_' Characters Replaced With Spaces To Support URLS From Messaging Platforms Which Dont SUpport Spaces in URLs
  const guesses = String(request.query.guesses ?? '').split('') //Blank If Undefined. Split Into Singular Characters
  
  if (answer.length == 0)
  {
    response.send('Error: No answer provided')
    return
  }

  const image = await PNGFromGameState(answer, guesses)

  response.setHeader("Content-Type", "image/png")
  response.setHeader("Content-Length", image.length)
  response.send(image)
  
  
})

//Catch-All For Invalid URLs | Provides Usage Instructions
app.get('/*',  async ( request, response ) => { 

  response.send('Error: Invalid URL | Please use this URL format: <a href="https://hangwumpus.com/play?answer=[YOUR_ANSWER]&guesses=[GUESSED_LETTERS]">https://hangwumpus.com/play?answer=[YOUR_ANSWER]&guesses=[GUESSED_LETTERS]</a>')

})


export default app