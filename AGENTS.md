# Project: Birthday Message WebPage
This project is a Single Page Application to display a personalised birthday message, which will be composed of multiple 'message pages' which the user can scroll through. This is a mobile/tablet first SPA.

## Features
Scroll-fade messages
Light/pastel background colours
Floating balloons in background
Candle or handwritten name
Confetti burst on the Name/Candle screen (page 3)
Final screen contains a crossword game (8 interlocking clue/word pairs)

# Technical Details
Tech: Plain HTML + CSS + minimal JS
Scrolling: CSS Scroll Snap
Animations: CSS animations over JSS where possible
Hosting: GitHub Pages. HTTPS

## Project Structure
docs/
├── index.html
├── style.css
├── script.js
├── games/
│   ├── crossword.html   (live — 8-word crossword, placeholder words/clues)
│   └── hangman.html     (parked — previous game, not referenced)
└── assets/
    └── images/

## Games
Each game is a standalone page under `docs/games/` with its own inline CSS and
JS, embedded in the final section of `index.html` via an `<iframe>`. Swapping
games is a one-line change to that iframe's `src`. A game page also works when
opened directly; it detects being framed and drops its own background so the
parent gradient shows through.

The only contract with the parent page is a `postMessage` of
`{ type: 'birthday-game:solved' }` on a win, which triggers the confetti burst.
`script.js` only acts on messages whose `event.source` is its own iframe.

The crossword's grid is hard-coded: `ENTRIES` in `crossword.html` lists each
word with its `row`/`col`/`dir`, and the grid size, blocked squares and clue
numbers are all derived from it at runtime. Replacing the placeholder words
means re-deriving the coordinates so the words still interlock — changing only
`word`/`clue` will break the grid unless lengths and shared letters match.