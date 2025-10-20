
# HangWumpus — Legacy Version

[![Legacy](https://img.shields.io/badge/version-legacy-lightgrey?style=for-the-badge)](../../tree/legacy)

> The original 2023 release of *HangWumpus* — preserved for posterity and reflection.

---

## Introduction

This is the original version of **HangWumpus**, created in 2023 and left largely untouched since its completion. It represents an early stage in my development journey — a time when code was written quickly, with enthusiasm, and with little concern for structure or maintainability.
Despite its rough edges, this version still functions: it accepts an answer and a set of guesses via the URL and returns a generated hangman-style image featuring Wumpus.

The legacy branch exists as a **preserved artifact**, not as a recommended implementation. It serves as a snapshot of where the project began and how much the main branch (Version 2) has evolved in clarity, efficiency, and design.

---

## What Makes It “Legacy” 

This branch is intentionally unrefined — a direct reflection of my early coding habits.
Here’s what defines it:

- **Single-File Design:** The entire app exists in one large `server.js` file.
- **Pure JavaScript:** No TypeScript, no modules — everything is written in raw JS.
- **Messy Structure:** Code for routing, drawing, and logic all coexist without clear separation.
- **Temporary File Output:** The generated image was written to a temporary file before being served, leaving stray files in the project directory.
- **Routing-Based Input:** Instead of query parameters, the app used routes like `/answer/guesses`, which made it awkward and error-prone to use.
- **Development Comments:** Scattered notes such as “this seems useful” or “might fix later” remain throughout the code — authentic artifacts of the learning process.
- **Impact Font:** The original art used the classic meme font *Impact*, replaced with more polished typography in Version 2.
- **No Error Handling:** Invalid routes or missing parameters simply returned errors or blank responses.

This version was later minimally modified only to run on **Vercel** (using `napi-canvas` for compatibility), but the logic and structure remain identical to the 2023 Glitch release.

---

## How to Use

The legacy version accepts parameters via URL routing rather than query strings.

Example:

```
https://hang-wumpus.vercel.app/discord/dil
```

- The first path segment (`discord`) represents the **answer**.
- The second path segment (`dil`) represents the **guesses**.
- The endpoint returns a generated image representing the current game state.

If parameters are missing or malformed, the app will simply fail to load or return an empty image — there is no fallback screen or guidance as in Version 2.

---

## Installation & Running Locally

While this branch is mainly preserved for reference, it can still be run locally using the same setup as Version 2.

### Requirements

- Node.js v22.x or newer
- npm (bundled with Node)
- Vercel CLI (optional)

### Setup

```bash
git clone -b legacy https://github.com/CamdenMontgomery/hangwumpus.git
cd hangwumpus
npm install
npx vercel dev
```

---

## Reflection

The legacy HangWumpus is a reminder of what early projects often look like — unstructured, spontaneous, but full of genuine curiosity. It’s clunky and cluttered, yet it *worked*, and it laid the foundation for something better.

Version 2 represents a full professional rewrite: modular TypeScript, structured file hierarchy, improved artwork, and clean deployment on Vercel.
This branch remains as-is: imperfect, instructive, and authentic.

---

## License

This project retains the same [MIT License](../../blob/main/LICENSE) as the main branch, with the same disclaimer noting that it is **not affiliated with Discord Inc.**

