import PNGFromGameState from './src/core/PNGFromGameState.js'
import express from 'express'
const app = express()

//Main Endpoint To Generate Game State Image
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