import express from 'express'
import { readFile, createWriteStream, createReadStream } from 'fs'
const app = express()

import pureImage from 'pureimage'

//Canvas Superiority | https://www.npmjs.com/package/canvas
const canvas = require('canvas')

const CHARACTER_POSITIONS = {
  "A": [815,100],
  "B": [929, 98],
  "C": [1054, 94],
  "D": [1142, 97],
  "E": [1248, 97],
  "F": [810,185],
  "G": [921,197],
  "H": [1023,197],
  "I": [1148,185],
  "J": [1248,185],
  "K": [805, 293],
  "L": [914,293],
  "M": [1023,293],
  "N": [1136,293],
  "O": [1244,284],
  "P": [818,374],
  "Q": [929,374],
  "R": [1041,393],
  "S": [1156,393],
  "T": [1232,385],
  "U": [813,472],
  "V": [881,489],
  "W": [980,480],
  "X": [1063,489],
  "Y": [1136,480],
  "Z": [1216,489]
}

const WUMPUS_PHASES = {
  0: "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/WumpusPhase0.png?v=1685172827239",
  1: "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/WumpusPhase1.png?v=1685172833750",
  2: "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/WumpusPhase2.png?v=1685172841659",
  3: "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/WumpusPhase3.png?v=1685172849276",
  4: "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/WumpusPhase4.png?v=1685172855746",
  5: "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/WumpusPhase5.png?v=1685172863786",
  6: "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/WumpusPhaseSizeV2.png?v=1685334868763",
}



const https = require('https')


//Logs Are Apprently Not Natural
function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}


function getScore(data){
  
  const possibleAnswers = data[0].replace(/[^A-Z]/gi, "").split('')
  var wrong = 0;
  var correct = 0;
  
  //Calculate Number Of Wrong Answers
  for (var i = 0; i < data[1].length; i++ ) {

    var I = data[1][i].toUpperCase()
    if ( possibleAnswers.indexOf(I) == -1 ){ wrong++ }
    else { correct++ }
    
  }
  
  return {"Correct": correct, "Wrong": wrong }
  
}

function chopWord( size, word ){
  
  if (word.length <= size) return word
  var prefix = word.substring(0, size)
  var suffix = word.substring(size, word.length)
  return {prefix: prefix, suffix: suffix}
  
}


function hasWon(data){
  
  
  //Get Possible Answers
  var possibleAnswers = data[0].replace(/[^A-Z]/gi, "").split("") 

  //Remove Duplicates
  var temp = []
  for ( var i = 0; i < possibleAnswers.length; i++){
    if ( temp.indexOf(possibleAnswers[i].toUpperCase()) == -1) { temp.push( possibleAnswers[i].toUpperCase() ) }
  }
  possibleAnswers = temp
  console.log(possibleAnswers, data[1], getScore(data))
  //Return Whether Or Not The Game Has Been Won
  if ( getScore(data).Correct >= possibleAnswers.length ){ return true }
  return false
  
  
}

function hasLost(data){
  
  
  //Return Whether Or Not The Game Has Been Lost
  if ( getScore(data).Wrong >= 6 ){ return true }
  else { return false }
  
}

function parsePathData(path){
  
  //NOTE: Discord Doesnt Allow Spaces In URLs So Keep In Mind That %20 Is The URL Code For Space
  
  var data = []
  path = decodeURI(path)
  path = path.replace(/(?<=\/.*\/.*)\/.*/g, "")//Clear anything passed the third slash
  var query = path.match(/(?<=\/)([^/\n$\r]*)*(?=\/)/gi)[0]//Get The First Path Segment
  var guesses = path.match(/(?<=\/)(([^/\n$\r]*\n)|([^/\n$\r]*$))/gi)[0]//Get The Second Path Segment
  

  //Remove Non Letters From Guesses
  guesses = guesses.replace(/[^A-Z]/gi, "")
  
  //Replace Underscores In Query With Spaces
  query = query.replace(/_/g, " ")
  

  //Remove Duplicate Answers
  var temp = []
  for ( var i = 0; i < guesses.length; i++){
    if ( temp.indexOf(guesses[i].toUpperCase()) == -1) { temp.push( guesses[i].toUpperCase() ) }
  }
  guesses = temp

  
  data[0] = query.toUpperCase()
  data[1] = guesses
  return data
  
}

async function drawCharacterBoxes(data, ctx){
  
  const boxWidth = 127; const boxHeight = 143; const gap = 20;
  const canvasWidth = 1366; const canvasHeight = 768;
  var len = data[0].length//String Length
  var center = canvasWidth/2
  
  const chrboxURL = "https://cdn.glitch.global/09e3b4f2-abe8-42df-9e55-7540c1634620/CharacterBox.png?v=1685156383515"
  const b = await canvas.loadImage(chrboxURL)
  
  if (len <= 9) { 
    
    var start = center - (len * (boxWidth + gap) - gap)/2
    
    for ( var i = 0; i < len; i++ ){
        if (data[0][i] == " ") continue;//Skip If The Character Is A Space
        ctx.drawImage(b, i * (boxWidth + gap) + start, canvasHeight - boxHeight/2 - 100, b.width, b.height)
    }
    
  } 
  else if ( len >= 18 ){
    
    const wordList = data[0].split(/[ -]/g)
    var characterCount = 0
    var residents = {}
    
    const spanAttempt = len * ( boxWidth + gap ) - gap //How Much Space It Would Take Up
    const maxSpan = 9 * ( boxWidth + gap ) - gap //How Much Space It Can Take Up

    
    const rows = Math.floor( getBaseLog(2, len/18 ) + 2)
    console.log(rows)
    const correctedBoxHeight = (boxHeight/rows) - (gap/(rows * rows))
    const coefficient = correctedBoxHeight/boxHeight
    const correctedBoxWidth = boxWidth * coefficient
    const correctedGap = gap * coefficient
    
    
    const rowMax = Math.ceil(len/rows)
    
    
    //Determine Placement
    for (var n = 0; n < wordList.length; n++){
      var characters = wordList[n].length
      var word = wordList[n]
      
      if (word.length <= rowMax) {
        characterCount += characters + (residents[ row ] != undefined ? 1 : 0)//To Account For The Space
        var row = Math.floor((characterCount - 1)/rowMax)

        if (residents[ row ] == undefined){ residents[ row ] = "" }
        residents[ row ] += (( residents[ row ] == "" ? "" : " ") + wordList[n].toString() ) //Which Row Each Word Should Be On
      }
      
      //If Too Many Characters In A Word
      while (word.length > rowMax){
        
        var chopped = chopWord( rowMax, word )
        characterCount += chopped.prefix.length + (residents[ row ] != undefined ? 1 : 0)//To Account For The Space
        console.log(word)
        row = Math.floor((characterCount - 1)/rowMax)
        if (residents[ row ] == undefined){ residents[ row ] = "" }
        residents[ row ] += (( residents[ row ] == "" ? "" : " ") + chopped.prefix.toString() + "-" ) //Which Row Each Word Should Be On
        word = chopped.suffix
   
        
        if ( word.length <= rowMax){ 
          console.log("Went in")
          characterCount += word.length + (residents[ row ] != undefined ? 1 : 0)//To Account For The Space
          row = Math.floor((characterCount - 1)/rowMax)
          if (residents[ row ] == undefined){ residents[ row ] = "" }
          residents[ row ] += (( residents[ row ] == "" ? "" : " ") + chopped.suffix.toString() ) //Which Row Each Word Should Be On 
        }
      }

    }
    
        
    console.log("----Report----")
    console.log("Rows: ", rows)
    console.log("Residents: ", residents)
    
    //Draw Each 
    for (var n = 0; n < Object.keys(residents).length; n++){
      var string = residents[n].replace(/ *[$\n]/g,"")//Remove Trailing Spaces
      console.log(string)
      const start = center - ( string.length * (correctedBoxWidth + correctedGap) - correctedGap)/2
      
      for (var i = 0; i < string.length; i++ ){
        if (string[i] == " ") continue;
        ctx.drawImage(b, i * (correctedBoxWidth + correctedGap) + start, canvasHeight - boxHeight/2 - 100 + (correctedBoxHeight + correctedGap) * n, correctedBoxWidth, correctedBoxHeight)
      }
      
      
    }
    
    
  }
  else {
    
    const spanAttempt = len * ( boxWidth + gap ) - gap //How Much Space It Would Take Up
    const start = center - (9 * (boxWidth + gap) - gap)/2 //Where The First Box Should Be Placed
    const maxSpan = 9 * ( boxWidth + gap ) - gap //How Much Space It Can Take Up
    const coefficient = maxSpan/spanAttempt
    
    const correctedBoxWidth = boxWidth * coefficient
    const correctedBoxHeight = boxHeight * coefficient
    const correctedGap = gap * coefficient
    
    for ( var i = 0; i < len; i++ ){
      if (data[0][i] == " ") continue;//Skip If The Character Is A Space
      ctx.drawImage(b, i * (correctedBoxWidth + correctedGap) + start, canvasHeight - correctedBoxHeight/2 - 100, correctedBoxWidth, correctedBoxHeight)
    }
    
  }
}


async function drawMarks(data, ctx){
  
  const OFFSETCX = 53; const OFFSETCY = 60;
  const OFFSETWX = 53; const OFFSETWY = 50;
  const possibleAnswers = data[0].replace(/[^A-Z]/gi, "").split('')//Only Letters In The Query Are Valid
  const chkmrkURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/CheckMark.png?v=1685169804423" 
  var xmrkURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/XMarkBlue.png?v=1685172348715" 
  
  //XMark Color Change
  if ( hasWon(data) ){ xmrkURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/XMarkGreen.png?v=1685319309360"}
  else if ( hasLost(data) ){ xmrkURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/XMarkRed.png?v=1685319315296" }
  
  
  const c = await canvas.loadImage(chkmrkURL)
  const x = await canvas.loadImage(xmrkURL)

  //Keep A List Of Correct Letters And Wrong Letters
  var correct = []
  var wrong = []
  
  //Determine Which Are Wrong And Right
  for (var i = 0; i < data[1].length; i++ ) {

    var I = data[1][i].toUpperCase()
    if ( possibleAnswers.indexOf(I) != -1 ){ correct.push(I) }
    else { wrong.push(I) }
    
  }
  
  //Draw All X Marks
  for ( var i = 0; i < wrong.length; i++){
        
      var I = wrong[i].toUpperCase()
      var pos = CHARACTER_POSITIONS[I]
      ctx.drawImage(x, pos[0] - OFFSETWX, pos[1] - OFFSETWY, x.width, x.height) 
    
  }
  
  //The Draw All The Check Marks So That They Are Placed Above The X Marks
   for ( var i = 0; i < correct.length; i++){
        
      var I = correct[i].toUpperCase()
      var pos = CHARACTER_POSITIONS[I]
      ctx.drawImage(c, pos[0] - OFFSETCX, pos[1] - OFFSETCY, c.width, c.height) 
    
  } 
          

}

async function drawWumpus(data, ctx){
  
  var counter = getScore(data).Wrong
  
  //Draw Wumpus
  counter = counter > 6 ? 6 : counter;
  const phaseURL = WUMPUS_PHASES[counter]
  const w = await canvas.loadImage(phaseURL)
  ctx.drawImage(w, 159, 40, 432, 474) 
    
  
}


//TODO: CLEAN UP
function drawQueryText(data,ctx){
  

  
  const boxWidth = 127; const boxHeight = 143; const gap = 20;
  const canvasWidth = 1366; const canvasHeight = 768;
  var len = data[0].length//String Length
  var center = canvasWidth/2
  
  
  //Doing it outside of the loop, becuase otherwise it gets too taxing
  if ( len >= 18 ){
    
    const wordList = data[0].split(/[ -]/g)
    var characterCount = 0
    var residents = {}
    
    const spanAttempt = len * ( boxWidth + gap ) - gap //How Much Space It Would Take Up
    const maxSpan = 9 * ( boxWidth + gap ) - gap //How Much Space It Can Take Up

    
    const rows = Math.floor( getBaseLog(2, len/18 ) + 2)
    const correctedBoxHeight = (boxHeight/rows) - (gap/(rows * rows))
    const coefficient = correctedBoxHeight/boxHeight
    const correctedBoxWidth = boxWidth * coefficient
    const correctedGap = gap * coefficient
    
    
  //Determine Placement
    for (var n = 0; n < wordList.length; n++){
      var characters = wordList[n].length
      var word = wordList[n]
      
      if (word.length <= Math.ceil(len/rows)) {
        characterCount += characters + (residents[ row ] != undefined ? 1 : 0)//To Account For The Space
        var row = Math.floor((characterCount - 1)/Math.ceil(len/rows))

        if (residents[ row ] == undefined){ residents[ row ] = "" }
        residents[ row ] += (( residents[ row ] == "" ? "" : " ") + wordList[n].toString() ) //Which Row Each Word Should Be On
      }
      
      //If Too Many Characters In A Word
      while (word.length > Math.ceil(len/rows)){
        
        var chopped = chopWord( Math.ceil(len/rows), word )
        characterCount += chopped.prefix.length + (residents[ row ] != undefined ? 1 : 0)//To Account For The Space
        console.log(word)
        row = Math.floor((characterCount - 1)/Math.ceil(len/rows))
        if (residents[ row ] == undefined){ residents[ row ] = "" }
        residents[ row ] += (( residents[ row ] == "" ? "" : " ") + chopped.prefix.toString() + "-" ) //Which Row Each Word Should Be On
        word = chopped.suffix
        
        if ( word.length <= Math.ceil(len/rows)){ 
          characterCount += word.length + (residents[ row ] != undefined ? 1 : 0)//To Account For The Space
          row = Math.floor((characterCount - 1)/Math.ceil(len/rows))
          console.log(chopped.prefix.length)
          if (residents[ row ] == undefined){ residents[ row ] = "" }
          residents[ row ] += (( residents[ row ] == "" ? "" : " ") + chopped.suffix.toString() ) //Which Row Each Word Should Be On 
        }
      }
    }
    

    //Draw Each 
    for (var n = 0; n < Object.keys(residents).length; n++){
      var string = residents[n].replace(/ *[$\n]/g,"")//Remove Trailing Spaces
      console.log(string)
      const start = center - ( string.length * (correctedBoxWidth + correctedGap) - correctedGap)/2
      
      const scalar = 60/143
      ctx.font = 'bold ' + (scalar * correctedBoxHeight) +'px Impact'
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      for (var i = 0; i < string.length; i++ ){
        if (string[i] == " ") continue;
        var I = string[i].toUpperCase()
        if ( data[1].indexOf(I) == -1 && I.match(/[^A-Z]/gi) == undefined ){ continue }
      ctx.fillText(I, i * (correctedBoxWidth + correctedGap) + start + correctedBoxWidth/2, canvasHeight - boxHeight/2 - 100 + (correctedBoxHeight + correctedGap) * n + correctedBoxHeight/2)      
      }  
    }
    return;
  }
  

  //Iterate Over Each Character
  for ( var i = 0; i < data[0].length; i++ ){
    

    //If Character Is A Letter 
    if ( data[0][i].toString().match(/[A-Z]/gi) != undefined ){

      
      //Check If Correct
      var I = data[0][i].toUpperCase()
      if ( data[1].indexOf(I) != -1 ){

        //Print If Correct
        if (len <= 9) { 

          var start = center - (len * (boxWidth + gap) - gap)/2 + boxWidth/2//Centered
          
          ctx.font = 'bold 60px Impact'
          ctx.fillStyle = "white"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(I, i * (boxWidth + gap) + start, canvasHeight - 100)

        } 
        else {

          const spanAttempt = len * ( boxWidth + gap ) - gap //How Much Space It Would Take Up
          const maxSpan = 9 * ( boxWidth + gap ) - gap //How Much Space It Can Take Up
          const coefficient = maxSpan/spanAttempt

          const correctedBoxWidth = boxWidth * coefficient
          const correctedBoxHeight = boxHeight * coefficient
          const correctedGap = gap * coefficient
          
          const start = center - (9 * (boxWidth + gap) - gap)/2 + correctedBoxWidth/2 //Centered

          //FontSize Scalar
          const scalar = 60/143
          
          ctx.font = 'bold ' + (scalar * correctedBoxHeight) +'px Impact'
          ctx.fillStyle = "white"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(I, i * (correctedBoxWidth + correctedGap) + start, canvasHeight - 100)
        
        }
      }
    }
    else if ( data[0][i].toString().match(/ /gi) != undefined  ) { continue }
    else{ 
    
        var I = data[0][i].toUpperCase()
        if (len <= 9) { 

          var start = center - (len * (boxWidth + gap) - gap)/2 + boxWidth/2//Centered
          
          ctx.font = 'bold 60px Impact'
          ctx.fillStyle = "white"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(I, i * (boxWidth + gap) + start, canvasHeight - 100)

        } 
        else {

          const spanAttempt = len * ( boxWidth + gap ) - gap //How Much Space It Would Take Up
          const maxSpan = 9 * ( boxWidth + gap ) - gap //How Much Space It Can Take Up
          const coefficient = maxSpan/spanAttempt

          const correctedBoxWidth = boxWidth * coefficient
          const correctedBoxHeight = boxHeight * coefficient
          const correctedGap = gap * coefficient
          
          const start = center - (9 * (boxWidth + gap) - gap)/2 + correctedBoxWidth/2 //Centered

          //FontSize Scalar
          const scalar = 60/143
          
          ctx.font = 'bold ' + (scalar * correctedBoxHeight) +'px Impact'
          ctx.fillStyle = "white"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(I, i * (correctedBoxWidth + correctedGap) + start, canvasHeight - 100)
        
        }
    
    }
    
  }

}

async function drawWinScreen(data, ctx){
  
  const canvasWidth = 1366; const canvasHeight = 768;

  
  const confettiURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/Fixed%20Confetti.png?v=1685211686516"
  const f = await canvas.loadImage(confettiURL)
  ctx.drawImage(f, 0, 0, canvasWidth, canvasHeight)
  
  
  ctx.fillStyle = "black"
  ctx.globalAlpha = 0.7
  ctx.fillRect(0,0,canvasWidth,canvasHeight)
  ctx.globalAlpha = 1
  
  const partyHatURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/partyhat.png?v=1685211985572"
  const p = await canvas.loadImage(partyHatURL)
  ctx.drawImage(p, canvasWidth/2 - p.width*3/2, canvasHeight - p.height*3, p.width*3, p.height*3)
  
  const cornersURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/RoundedCorners.png?v=1685212734119"
  const n = await canvas.loadImage(cornersURL)
  ctx.drawImage(n, 0, 0, canvasWidth, canvasHeight)

  
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  //ctx.rotate(2 * Math.PI / 180);
  
  ctx.font = "bold 90px impact"
  ctx.textBaseline = "bottom"
  ctx.fillText("You Won!", canvasWidth/2, canvasHeight/2)
  
  ctx.font = "bold 30px impact"
  ctx.textBaseline = "top"
  ctx.fillText("The Answer Was '" + data[0] + "'", canvasWidth/2, canvasHeight/2)
  
}

async function drawLossScreen(data, ctx){
  
  const canvasWidth = 1366; const canvasHeight = 768;
  
  const pieURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/PiBois3.png?v=1685336573240"
  const e = await canvas.loadImage(pieURL)
  ctx.drawImage(e, 0, 0, canvasWidth, canvasHeight)
  
  ctx.fillStyle = "black"
  ctx.globalAlpha = 0.7
  ctx.fillRect(0,0,canvasWidth,canvasHeight)
  ctx.globalAlpha = 1
  
  //ctx.rotate(2 * Math.PI / 180);
  const partyHatURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/PartyHatTipped.png?v=1685212515543"
  const p = await canvas.loadImage(partyHatURL)
  ctx.drawImage(p, canvasWidth/2 - p.width*3/2, canvasHeight - p.height*3, p.width*3, p.height*3)
  
  const cornersURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/RoundedCorners.png?v=1685212734119"
  const n = await canvas.loadImage(cornersURL)
  ctx.drawImage(n, 0, 0, canvasWidth, canvasHeight)
  
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  
  
  ctx.font = "bold 90px impact"
  ctx.textBaseline = "bottom"
  ctx.fillText("You Lost...", canvasWidth/2, canvasHeight/2)
  
  ctx.font = "bold 30px impact"
  ctx.textBaseline = "top"
  ctx.fillText("The Answer Was '" + data[0] + "'", canvasWidth/2, canvasHeight/2)
  
}

//Respond To Get Request At Base URL '/'
app.get('/*',  async ( request, response ) => { //So Adding The Asterisk Does Indeed Make It Accept Any Text That Gets Passed Into The URL
  
  //Found A Package Called 'pureImage' Which May Help With Generating Images | https://www.npmjs.com/package/pureimage 
  
  //It Turns Out Glitch Store Images Exclusively On The Web And So We Can Only Obtain A URL For The Image. Luckily The Examples For PureImage Teach How To Get Images From URLs
 
  //Use This To Determine The State Of The Game
  const path = request.path
  
  
  
  //Step 1:
  const data = parsePathData(path)

  //Default Background
  var bkgrndURL = "https://cdn.glitch.global/09e3b4f2-abe8-42df-9e55-7540c1634620/BackgroundWithSmudge.jpg?v=1685146803387"

  //Change Color Based Off Win/Loss Condition
  if ( hasWon(data) ){ bkgrndURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/MintBackgroundWithSmudge(1).jpg?v=1685318642939"}
  else if ( hasLost(data) ){ bkgrndURL = "https://cdn.glitch.global/1f301a5f-1708-4eeb-a31a-5dd858f99b73/RedBackgroundWithSmudge.jpg?v=1685209143229" }
  const i = await canvas.loadImage(bkgrndURL)


  const c = canvas.createCanvas(i.width, i.height)
  const ctx = c.getContext('2d')
  ctx.drawImage(i, 0, 0, i.width, i.height)
  await drawCharacterBoxes(data, ctx)
  await drawMarks(data, ctx)
  await drawWumpus(data, ctx)
  drawQueryText(data, ctx)

  if ( hasWon(data) ){ await drawWinScreen(data, ctx) }
  else if ( hasLost(data) ){ await drawLossScreen(data, ctx) }
  
  //Send Image To Client
  const out = createWriteStream(__dirname + '/test.png')
  const stream = c.createPNGStream()
  stream.pipe(out)
  out.on('finish', () =>  { response.sendFile('./test.png', { root: __dirname }) })
  

  
})

//The Server Will Get Stuck 'On Starting...' If I Dont Make The App Listen 
//https://support.glitch.com/t/glitch-me-project-appears-down-even-though-not-uptime-robot/6341/5
//https://support.glitch.com/t/project-wont-start/13337
//https://nodejs.dev/en/learn/reading-files-with-nodejs/

export default app