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
numbers are all derived from it at runtime. Changing the words means
re-deriving the coordinates so they still interlock — editing `word`/`clue`
alone will break the grid unless lengths and shared letters match.

Words and clues come from `data/BirthdayCrosswordCluesAndWords.csv` (that file
is the source of truth; note several clues contain commas, so parse on the last
comma). Answers go into the squares with spaces stripped; `display` keeps the
real spacing purely so the clue can show the enumeration, e.g. San Diego (3,5).

The grid is 16 columns because the longest answer is 16 letters, which is what
sets the square size on a phone (~19px on a 360px screen). `--cell` is derived
from `--cols` and the card's real width, so a different word set resizes itself
rather than overflowing.