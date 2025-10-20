
<img width="1920" height="681" alt="Frame 932" src="https://github.com/user-attachments/assets/d4c808b5-5fcf-4aa4-9d73-2ee3d1ae8728" />


# HangWumpus — Version 2

![Release](https://img.shields.io/github/v/release/CamdenMontgomery/hangwumpus?sort=semver)
![License](https://img.shields.io/github/license/CamdenMontgomery/hangwumpus)
![Last Commit](https://img.shields.io/github/last-commit/CamdenMontgomery/hangwumpus)
![Top Language](https://img.shields.io/github/languages/top/CamdenMontgomery/hangwumpus)
![Open Issues](https://img.shields.io/github/issues/CamdenMontgomery/hangwumpus)
![Open PRs](https://img.shields.io/github/issues-pr/CamdenMontgomery/hangwumpus)

> A URL-to-image game playable in Discord — just paste a link to the web app in chat and it renders a playable Hangman-like image.

---

## Table of Contents

* [Introduction](#introduction)
* [How to Play](#how-to-play)
* [Installation & Development](#installation--development)
* [API / Usage](#api--usage)
* [Tech Stack](#tech-stack)
* [Legacy / History](#legacy--history)
* [Future Plans](#future-plans)
* [FAQ](#faq)
* [License](#license)
* [Contributing](#contributing)
* [Credits](#credits)

---

## Introduction

HangWumpus is a fun, easy-to-play Hangman-style game that works right in Discord — no bots, no setup, just copy and paste a link. Instead of plain text, it generates a visual game featuring Wumpus in a playful hangman scenario, letting you and your friends guess letters in a more engaging, interactive way. It’s instant, shareable, and perfect for casual gaming in chat, making Hangman more lively and entertaining than ever.

---

## How to Play

HangWumpus is a URL-based hangman game designed to be played directly in Discord. It works as follows:

1. Copy or save the HangWumpus link format:

   ```
   https://hangwumpus.com/play?answer=[your answer here]&guesses=[characters guessed here]
   ```
2. Paste it in a Discord chat. For spoiler safety, use Discord’s spoiler command (`||` around text) to hide the answer from other players.
3. Discord will render an image showing Wumpus in a friendly hangman scene — progress is displayed visually based on the letters guessed.
4. The judge player edits the `guesses` parameter to reflect each new guessed letter, updating the image link in chat until the game is won or lost.

Examples:

* `https://hangwumpus.com/play?answer=discord&guesses=dil` → Shows two correct guesses and one wrong.
* `https://hangwumpus.com/play?answer=discord&guesses=dilgnhyu` → Shows the losing screen and message.

The judge can freely update the guesses and answer to keep the game flowing.

---

## Installation & Development

### Requirements

* Node.js v22.x or newer
* npm (bundled with Node)
* Vercel CLI (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/CamdenMontgomery/hangwumpus.git
cd hangwumpus
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

With Vercel CLI installed:

```bash
vercel dev
```

Without installation, you can use npx:

```bash
npx vercel dev
```

If `vercel dev` fails, you can also run:

```bash
npm run build
npm start
```

### 4. Deploy to Vercel

1. Create a free [Vercel account](https://vercel.com/signup)
2. Run either:

   ```bash
   npm install -g vercel
   vercel
   ```

   or without installation:

   ```bash
   npx vercel
   ```
3. Follow the prompts to link your GitHub repo and deploy
4. Your app will be live at:

   ```
   https://your-project-name.vercel.app
   ```

---

## API / Usage

### Endpoint

```
GET /play
```

Returns: image/png

### Query Parameters

| Name        | Type   | Required | Description                                                              | Example     |
| ----------- | ------ | -------- | ------------------------------------------------------------------------ | ----------- |
| answer      | string | yes      | The hidden word or phrase to be guessed. Letters and spaces are allowed. | hello world |
| guesses     | string | no       | Letters guessed so far. Repeating letters are ignored.                   | dil         |
| hint        | string | no       | Reserved for future use                                                  | —           |
| obfuscation | string | no       | Reserved for future use                                                  | —           |

### Behavior

* Returns a PNG image representing the game state.
* Missing or invalid parameters return a 400 Bad Request with a plain text error message.
* `answer` may contain letters and spaces. Repeating letters in `guesses` are ignored.
* Future versions will include instructional images for invalid requests.

### Example Requests

#### cURL

```bash
curl "https://hangwumpus.com/play?answer=hello world&guesses=dil" --output game.png
```

#### JavaScript (Node / Browser)

```js
fetch('https://hangwumpus.com/play?answer=hello world&guesses=dil')
  .then(res => res.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    console.log('Image ready at:', url);
  });
```

---

## Tech Stack


![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![napi-canvas](https://img.shields.io/badge/napi--canvas-F76C0F?style=for-the-badge&logoColor=white)

* Backend: Single Express app (`server.ts`)
* Runtime: Node.js (Vercel serverless)
* Language: TypeScript with ES modules
* Rendering: `napi-canvas` (no native binaries)
* Build Tool: TypeScript compiler (`tsc`)
* Hosting: Vercel




Project structure:

```
public/images   # static images
public/fonts    # fonts
src/core        # game logic
src/utils       # drawing utilities
server.ts       # entrypoint
```

---

## Legacy / History

The original HangWumpus was a Glitch project two years ago, consisting of one large JS file with minimal structure or comments. Version 2 is a complete overhaul:

* Redesigned artwork matching Discord style
* Clean modular file structure
* Modern TypeScript syntax
* Hosted on Vercel instead of Glitch

Legacy branch: [`legacy`](../../tree/legacy)

---

## Future Plans

* Error and instructional image for invalid URLs
* URL generator page with optional hint and obfuscation
* Lightweight cipher for `answer` to share URLs safely
* QR code linking to the generator page
* API expansions and better edge-case handling
* Optional themes, animations, accessibility improvements

---

## FAQ

**Q: Why doesn’t it use a Discord bot?**  
A: Using a bot requires setup, permissions, and a server. HangWumpus works instantly with a URL — copy, paste, play.

**Q: Can it be used outside Discord?**  
A: Yes, any platform that loads images from URLs will work.

**Q: Why is Wumpus hanging?**  
A: He isn’t. In this version, Wumpus is at a birthday party. Depending on guesses, the axe either cuts him a slice of cake or destroys the cake.

**Q: Why the name HangWumpus?**  
A: It’s both the project title and, playfully, a request to the players.

---

## License

MIT License — free to use, modify, and distribute. Attribution appreciated but not required.

```
MIT License
Copyright (c) 2025 Camden Montgomery
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
... (full MIT text)
```

Disclaimer: Not affiliated with Discord Inc.

---

## Contributing

HangWumpus is meant to be a playful, fun project. Feel free to:

* Fork the repo and experiment with your own ideas
* Create new URL-to-image mini-games using the existing structure
* Add artwork, features, or custom visual effects
* Tweak game logic or try entirely new mechanics

No strict rules — if you can think of a fun way to extend the game, go for it. Share your creations, make a Pull Request, or just enjoy learning as you play with the code. This is a space to explore, experiment, and invent your own little URL-based games for Discord or beyond.

---

## Credits

* Camden Montgomery — project creator, designer, and developer

* Discord — for inspiration and mascot art concept
