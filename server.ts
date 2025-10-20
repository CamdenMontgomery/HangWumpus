import PNGFromGameState from './src/core/PNGFromGameState.js'
import express from 'express'
const app = express()


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


export default app