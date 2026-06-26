/* =============================================
   Birthday Message — script.js
   - Intersection Observer for scroll-fade
   - Canvas confetti burst on finale
   ============================================= */

(function () {
  'use strict';

  const HANGMAN_WORD = 'mummeltoe';
  const MAX_MISTAKES = 7;

  // ── Scroll-fade via Intersection Observer ──────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Trigger confetti when the finale section becomes visible
          if (entry.target.closest('#page-finale')) {
            launchConfetti();
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  fadeEls.forEach((el) => observer.observe(el));

  // ── Hangman game ───────────────────────────────────────────────────────────
  const hangmanWordEl = document.getElementById('hangman-word');
  const hangmanStatusEl = document.getElementById('hangman-status');
  const hangmanMistakesEl = document.getElementById('hangman-mistakes');
  const hangmanGuessesEl = document.getElementById('hangman-guesses');
  const hangmanKeyboardEl = document.getElementById('hangman-keyboard');
  const hangmanResetEl = document.getElementById('hangman-reset');

  let guessedLetters = new Set();
  let mistakes = 0;
  let gameOver = false;

  if (
    hangmanWordEl &&
    hangmanStatusEl &&
    hangmanMistakesEl &&
    hangmanGuessesEl &&
    hangmanKeyboardEl &&
    hangmanResetEl
  ) {
    buildKeyboard();
    resetGame();
    hangmanResetEl.addEventListener('click', resetGame);
  }

  function buildKeyboard() {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

    letters.forEach((letter) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hangman__key';
      button.textContent = letter.toUpperCase();
      button.dataset.letter = letter;
      button.addEventListener('click', () => handleGuess(letter));
      hangmanKeyboardEl.appendChild(button);
    });
  }

  function handleGuess(letter) {
    if (gameOver || guessedLetters.has(letter)) {
      return;
    }

    guessedLetters.add(letter);

    if (!HANGMAN_WORD.includes(letter)) {
      mistakes += 1;
    }

    updateGame();
  }

  function resetGame() {
    guessedLetters = new Set();
    mistakes = 0;
    gameOver = false;
    updateGame();
  }

  function updateGame() {
    const solved = HANGMAN_WORD.split('').every((letter) => guessedLetters.has(letter));
    const guessedList = Array.from(guessedLetters).sort();

    hangmanWordEl.innerHTML = HANGMAN_WORD
      .split('')
      .map((letter) => {
        const revealed = guessedLetters.has(letter) || gameOver;
        return '<span class="hangman__letter">' + (revealed ? letter.toUpperCase() : '&nbsp;') + '</span>';
      })
      .join('');

    hangmanMistakesEl.textContent = String(mistakes);
    hangmanGuessesEl.textContent = guessedList.length
      ? 'Guessed letters: ' + guessedList.map((letter) => letter.toUpperCase()).join(', ')
      : 'Guessed letters: none yet';

    if (solved) {
      gameOver = true;
      hangmanStatusEl.textContent = 'You got it. MUMMELTOE unlocked the finale.';
    } else if (mistakes >= MAX_MISTAKES) {
      gameOver = true;
      hangmanStatusEl.textContent = 'Out of guesses. The word was MUMMELTOE.';
    } else {
      hangmanStatusEl.textContent = 'Guess the birthday word.';
    }

    updateKeyboardState();
  }

  function updateKeyboardState() {
    const keys = hangmanKeyboardEl.querySelectorAll('.hangman__key');

    keys.forEach((button) => {
      const { letter } = button.dataset;
      button.disabled = gameOver || guessedLetters.has(letter);
    });
  }

  // ── Confetti ───────────────────────────────────────────────────────────────
  let confettiRunning = false;

  function launchConfetti() {
    if (confettiRunning) return;
    confettiRunning = true;

    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    // Size canvas to viewport
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#f7c948', '#ff6b9d', '#4fc3f7', '#a5d6a7', '#ce93d8', '#ff8a65'];
    const PIECES = 120;
    const pieces = [];

    for (let i = 0; i < PIECES; i++) {
      pieces.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height * -1,  // start above viewport
        w:     Math.random() * 8 + 4,
        h:     Math.random() * 4 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx:    (Math.random() - 0.5) * 2,
        vy:    Math.random() * 3 + 1.5,
        angle: Math.random() * Math.PI * 2,
        spin:  (Math.random() - 0.5) * 0.15,
      });
    }

    let frame;
    let elapsed = 0;
    const DURATION = 4000; // ms
    let last = performance.now();

    function draw(now) {
      elapsed += now - last;
      last = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const alpha = elapsed < 3000 ? 1 : 1 - (elapsed - 3000) / 1000;
      ctx.globalAlpha = Math.max(0, alpha);

      pieces.forEach((p) => {
        p.x     += p.vx;
        p.y     += p.vy;
        p.angle += p.spin;

        if (p.y > canvas.height) {
          p.y  = -p.h;
          p.x  = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < DURATION) {
        frame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        cancelAnimationFrame(frame);
      }
    }

    frame = requestAnimationFrame(draw);
  }

  // Resize canvas if window resizes during confetti
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

})();
