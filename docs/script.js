/* =============================================
   Birthday Message — script.js
   - Intersection Observer for scroll-fade
   - Canvas confetti burst on page 3 (Name / Candle)
   - Confetti again when the embedded game is solved

   The game itself lives in games/*.html and is fully
   self-contained; the only contract with it is the
   'birthday-game:solved' postMessage handled below.
   ============================================= */

(function () {
  'use strict';

  const scrollContainer = document.querySelector('.scroll-container');
  const pages = Array.from(document.querySelectorAll('.page'));
  const scrollIndicatorEl = document.getElementById('scroll-indicator');
  const gameFrameEl = document.getElementById('game-frame');

  // ── Scroll-fade via Intersection Observer ──────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Trigger confetti when the Name / Candle section becomes visible
          if (entry.target.closest('#page-name') && !nameConfettiFired) {
            nameConfettiFired = true;
            launchConfetti();
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  fadeEls.forEach((el) => observer.observe(el));

  if (scrollContainer && scrollIndicatorEl) {
    scrollContainer.addEventListener('scroll', updateScrollIndicator, { passive: true });
    updateScrollIndicator();
  }

  // ── Embedded game ──────────────────────────────────────────────────────────
  // Celebrate when the game in the iframe reports a win. We only trust messages
  // that came from our own frame, so the origin doesn't need checking.
  window.addEventListener('message', (event) => {
    if (!gameFrameEl || event.source !== gameFrameEl.contentWindow) {
      return;
    }

    if (event.data && event.data.type === 'birthday-game:solved') {
      launchConfetti();
    }
  });

  function updateScrollIndicator() {
    if (!scrollContainer || !scrollIndicatorEl || pages.length === 0) {
      return;
    }

    const pageIndex = Math.round(scrollContainer.scrollTop / Math.max(scrollContainer.clientHeight, 1));
    const lastIndex = pages.length - 1;
    const isLastPage = pageIndex >= lastIndex;

    scrollIndicatorEl.classList.toggle('scroll-indicator--hidden', isLastPage);
  }

  // ── Confetti ───────────────────────────────────────────────────────────────
  let confettiRunning = false;   // an animation is currently in flight
  let nameConfettiFired = false; // page 3 only ever bursts once

  function launchConfetti() {
    if (confettiRunning) return;
    confettiRunning = true;

    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    // Size canvas to viewport
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Blues and greens, a little more saturated than the page pastels so the
    // pieces still read against them.
    const COLORS = ['#4fc3f7', '#26a69a', '#81c784', '#00bcd4', '#7cb9e8', '#5ddbb0'];
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
        confettiRunning = false;   // allow a later burst (e.g. solving the game)
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
