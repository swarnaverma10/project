/**
 * 2ND ANNIVERSARY INTERACTIVE SCRIPT
 * Pure Vanilla JavaScript - No Frameworks
 * Handles:
 * 1. Background Music (continuous loop, autoplay unlock, bottom-right toggle, video coordination)
 * 2. 10 Reasons (floating bubble pop effects, Web Audio chime, modal slider, progress tracking)
 * 3. 3D Love Letter Envelope (interactive wax seal, unfolding letter)
 * 4. Ambient Floating Hearts & Sparkles Canvas with burst particles
 * 5. Smooth Section Navigation & Intersection Observer
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. CONSTANTS & DATA
     ============================================================ */
  const REASONS = [
    "Because you make even ordinary days special.",
    "Because I can be completely myself with you.",
    "Because you always make me feel loved.",
    "Because your little efforts mean everything to me.",
    "Because you understand me even when I cannot explain myself.",
    "Because I love our silly fights and endless conversations.",
    "Because you make me smile without even trying.",
    "Because we face difficult situations together.",
    "Because I can imagine my future with you.",
    "Because no matter what happens, I will always choose US."
  ];

  /* ============================================================
     2. BACKGROUND MUSIC & VIDEO COORDINATION
     ============================================================ */
  const bgMusic = document.getElementById('bg-music');
  const musicController = document.getElementById('music-controller');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicTooltip = document.getElementById('music-tooltip');
  const anniversaryVideo = document.getElementById('anniversary-video');
  const enterBtn = document.getElementById('enter-btn');

  let isMusicPlaying = false;
  let userHasInteracted = false;
  let wasPlayingBeforeVideo = false;
  let userManuallyDisabledMusic = false;

  // Update UI state for music player
  function updateMusicUI(playing) {
    isMusicPlaying = playing;
    if (playing) {
      musicController.classList.add('playing');
      musicTooltip.textContent = 'Music: ON';
    } else {
      musicController.classList.remove('playing');
      musicTooltip.textContent = 'Music: OFF';
    }
  }

  // Attempt to play audio safely handling browser autoplay restrictions
  function startMusic() {
    if (userManuallyDisabledMusic) return;
    
    bgMusic.play()
      .then(() => {
        updateMusicUI(true);
      })
      .catch((err) => {
        // Autoplay policy prevented playback until explicit gesture
        console.warn('Autoplay restricted. Awaiting user click to start music:', err);
        updateMusicUI(false);
      });
  }

  function pauseMusic() {
    bgMusic.pause();
    updateMusicUI(false);
  }

  // Toggle button handler
  musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userHasInteracted = true;

    if (isMusicPlaying) {
      userManuallyDisabledMusic = true;
      pauseMusic();
    } else {
      userManuallyDisabledMusic = false;
      startMusic();
    }
  });

  // Global one-time interaction to start music smoothly if user clicks anywhere
  function handleFirstUserInteraction() {
    if (!userHasInteracted && !userManuallyDisabledMusic) {
      userHasInteracted = true;
      startMusic();
    }
  }
  document.addEventListener('click', handleFirstUserInteraction, { once: true });
  document.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

  // Hero "Enter Our Little World" button
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      userHasInteracted = true;
      userManuallyDisabledMusic = false;
      startMusic();

      const reasonsSection = document.getElementById('reasons');
      if (reasonsSection) {
        reasonsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Coordination between Background Music and Video Player
  if (anniversaryVideo) {
    // When video starts playing, pause background music
    anniversaryVideo.addEventListener('play', () => {
      if (isMusicPlaying) {
        wasPlayingBeforeVideo = true;
        pauseMusic();
      }
    });

    // When video pauses or ends, resume background music only if it was playing before
    anniversaryVideo.addEventListener('pause', () => {
      if (wasPlayingBeforeVideo && !userManuallyDisabledMusic) {
        startMusic();
        wasPlayingBeforeVideo = false;
      }
    });

    anniversaryVideo.addEventListener('ended', () => {
      if (wasPlayingBeforeVideo && !userManuallyDisabledMusic) {
        startMusic();
        wasPlayingBeforeVideo = false;
      }
    });
  }


  /* ============================================================
     3. REASON BUBBLE POPPING & MODAL LOGIC
     ============================================================ */
  const bubbleBtns = document.querySelectorAll('.bubble-btn');
  const reasonsProgressBadge = document.getElementById('reasons-count-badge');
  const modalOverlay = document.getElementById('reason-modal-overlay');
  const modalBadge = document.getElementById('modal-badge');
  const modalReasonText = document.getElementById('modal-reason-text');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCloseIcon = document.getElementById('modal-close-icon');
  const modalPrevBtn = document.getElementById('modal-prev-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');

  let currentReasonIndex = 0;
  const poppedReasons = new Set();

  // Gentle synthesizer pop chime using Web Audio API for rewarding interaction
  let audioCtx = null;
  function playPopChime() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      // Harmonic chime note (E5 to B5 sweep)
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      // Audio context might fail on restricted environments silently
    }
  }

  // Update Progress Count Badge
  function updateProgress() {
    const total = REASONS.length;
    const count = poppedReasons.size;
    if (count === total) {
      reasonsProgressBadge.innerHTML = `All 10 Reasons Unlocked! ✨ 💖 ✨`;
      reasonsProgressBadge.style.borderColor = 'var(--gold-bright)';
      reasonsProgressBadge.style.boxShadow = '0 0 16px var(--gold-glow)';
    } else {
      reasonsProgressBadge.textContent = `Popped: ${count} / ${total} Reasons`;
    }
  }

  // Open modal for a specific reason
  function showReason(index) {
    if (index < 0 || index >= REASONS.length) return;
    currentReasonIndex = index;

    // Pop the bubble visual
    const targetBubble = bubbleBtns[index];
    if (targetBubble) {
      targetBubble.classList.add('animating-pop');
      targetBubble.classList.add('popped');
      setTimeout(() => targetBubble.classList.remove('animating-pop'), 500);

      // Create sparkle burst at bubble position
      const rect = targetBubble.getBoundingClientRect();
      createParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    poppedReasons.add(index);
    updateProgress();
    playPopChime();

    // Populate modal
    modalBadge.textContent = `Reason #${index + 1}`;
    modalReasonText.textContent = REASONS[index];

    // Button states
    modalPrevBtn.disabled = (index === 0);
    if (index === REASONS.length - 1) {
      modalNextBtn.textContent = 'Finish ❤️';
    } else {
      modalNextBtn.textContent = 'Next Reason ➜';
    }

    // Show modal
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
  }

  // Attach click listeners to all bubbles
  bubbleBtns.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showReason(index);
    });
  });

  // Modal navigation controls
  modalCloseBtn.addEventListener('click', closeModal);
  modalCloseIcon.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  modalPrevBtn.addEventListener('click', () => {
    if (currentReasonIndex > 0) {
      showReason(currentReasonIndex - 1);
    }
  });

  modalNextBtn.addEventListener('click', () => {
    if (currentReasonIndex < REASONS.length - 1) {
      showReason(currentReasonIndex + 1);
    } else {
      closeModal();
      // Scroll to letter section if finished all reasons
      const letterSection = document.getElementById('letter');
      if (letterSection) {
        letterSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Keyboard navigation for modal
  document.addEventListener('keydown', (e) => {
    if (!modalOverlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight' && currentReasonIndex < REASONS.length - 1) {
      showReason(currentReasonIndex + 1);
    } else if (e.key === 'ArrowLeft' && currentReasonIndex > 0) {
      showReason(currentReasonIndex - 1);
    }
  });


  /* ============================================================
     4. 3D LOVE LETTER ENVELOPE INTERACTION
     ============================================================ */
  const envelope = document.getElementById('envelope');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const openEnvelopeBtn = document.getElementById('open-envelope-btn');
  const envelopeFlapTop = document.getElementById('envelope-flap-top');
  const waxSeal = document.getElementById('wax-seal');

  let isEnvelopeOpen = false;

  function toggleEnvelope() {
    isEnvelopeOpen = !isEnvelopeOpen;

    if (isEnvelopeOpen) {
      envelope.classList.add('open');
      envelopeWrapper.classList.add('expanded');
      openEnvelopeBtn.querySelector('.btn-text').textContent = 'Fold Letter ✉️';
      playPopChime();

      // Trigger celebratory heart bursts around envelope
      const rect = envelopeWrapper.getBoundingClientRect();
      createParticleBurst(rect.left + rect.width / 2, rect.top + 80);

      // Smoothly bring the top of the letter comfortably into focus
      setTimeout(() => {
        const yOffset = -40;
        const y = envelopeWrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }, 350);
    } else {
      envelope.classList.remove('open');
      envelopeWrapper.classList.remove('expanded');
      openEnvelopeBtn.querySelector('.btn-text').textContent = 'Open My Heart ❤️';
    }
  }

  if (openEnvelopeBtn) {
    openEnvelopeBtn.addEventListener('click', toggleEnvelope);
  }

  if (envelopeFlapTop) {
    envelopeFlapTop.addEventListener('click', toggleEnvelope);
  }

  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEnvelope();
    });
  }


  /* ============================================================
     5. NAVIGATION & SCROLL CUE
     ============================================================ */
  const scrollCue = document.getElementById('scroll-cue');
  if (scrollCue) {
    scrollCue.addEventListener('click', () => {
      const reasonsSection = document.getElementById('reasons');
      if (reasonsSection) {
        reasonsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Active section indicator using IntersectionObserver
  const sections = document.querySelectorAll('.section');
  const navDots = document.querySelectorAll('.nav-dot');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: 0.3
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navDots.forEach(dot => {
          if (dot.getAttribute('data-section') === id) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));


  /* ============================================================
     6. AMBIENT FLOATING HEARTS & SPARKLES CANVAS
     ============================================================ */
  const canvas = document.getElementById('hearts-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const ambientHearts = [];
  const burstParticles = [];
  const MAX_AMBIENT_HEARTS = 28;

  // Romantic palette for canvas elements
  const heartColors = [
    'rgba(232, 178, 183, ', // rose gold
    'rgba(247, 216, 220, ', // pale rose
    'rgba(220, 179, 108, ', // warm gold
    'rgba(204, 41, 100, ',  // vibrant wine
    'rgba(255, 248, 240, '  // cream
  ];

  class FloatingHeart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 30;
      this.size = Math.random() * 14 + 10;
      this.speedY = Math.random() * 0.7 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      this.wobbleDistance = Math.random() * 20 + 10;
      this.angle = Math.random() * Math.PI * 2;
      this.rotation = (Math.random() - 0.5) * 0.4;
      this.colorBase = heartColors[Math.floor(Math.random() * heartColors.length)];
      this.maxAlpha = Math.random() * 0.45 + 0.2;
      this.alpha = 0;
      this.fadeState = 'in';
    }

    update() {
      this.y -= this.speedY;
      this.angle += this.wobbleSpeed;
      this.x += Math.sin(this.angle) * 0.6 + this.speedX;

      if (this.fadeState === 'in') {
        this.alpha += 0.008;
        if (this.alpha >= this.maxAlpha) {
          this.alpha = this.maxAlpha;
          this.fadeState = 'hold';
        }
      }

      if (this.y < height * 0.15 && this.fadeState === 'hold') {
        this.fadeState = 'out';
      }

      if (this.fadeState === 'out') {
        this.alpha -= 0.008;
      }

      if (this.y < -40 || this.alpha <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation + Math.sin(this.angle) * 0.1);
      ctx.fillStyle = this.colorBase + Math.max(0, this.alpha) + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.colorBase + '0.5)';

      // Draw custom Bézier Heart
      drawHeartShape(ctx, 0, 0, this.size);

      ctx.restore();
    }
  }

  // Draw heart shape centered at (x, y) with specified size
  function drawHeartShape(context, x, y, size) {
    const s = size / 20;
    context.beginPath();
    context.moveTo(x, y + 4 * s);
    context.bezierCurveTo(x, y - 4 * s, x - 10 * s, y - 10 * s, x - 10 * s, y - 2 * s);
    context.bezierCurveTo(x - 10 * s, y + 5 * s, x - 2 * s, y + 10 * s, x, y + 16 * s);
    context.bezierCurveTo(x + 2 * s, y + 10 * s, x + 10 * s, y + 5 * s, x + 10 * s, y - 2 * s);
    context.bezierCurveTo(x + 10 * s, y - 10 * s, x, y - 4 * s, x, y + 4 * s);
    context.closePath();
    context.fill();
  }

  // Interactive Particle Burst (e.g. for popping bubbles or opening letter)
  class BurstParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = Math.random() * 12 + 6;
      this.colorBase = heartColors[Math.floor(Math.random() * heartColors.length)];
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.gravity = 0.08;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= 0.98;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = this.colorBase + Math.max(0, this.alpha) + ')';
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.colorBase + '0.8)';
      drawHeartShape(ctx, 0, 0, this.size);
      ctx.restore();
    }
  }

  function createParticleBurst(x, y) {
    for (let i = 0; i < 22; i++) {
      burstParticles.push(new BurstParticle(x, y));
    }
  }

  // Initialize ambient hearts
  for (let i = 0; i < MAX_AMBIENT_HEARTS; i++) {
    ambientHearts.push(new FloatingHeart());
  }

  // Animation loop
  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw ambient hearts
    for (let i = 0; i < ambientHearts.length; i++) {
      ambientHearts[i].update();
      ambientHearts[i].draw();
    }

    // Update & draw burst particles
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      burstParticles[i].update();
      burstParticles[i].draw();
      if (burstParticles[i].alpha <= 0) {
        burstParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(animateCanvas);
  }

  animateCanvas();

});
