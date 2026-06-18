// ── CRE8 STUDIO — main.js ──
// Runs on every page. Initialises all libraries and shared behaviours.

document.addEventListener('DOMContentLoaded', () => {

  // ── GSAP PLUGIN REGISTRATION ──
  gsap.registerPlugin(ScrollTrigger);

  // ── LENIS SMOOTH SCROLL (desktop only) ──
  // Lenis intercepts touch events with passive:false on mobile which
  // causes iOS Safari to block video autoplay. Native scroll is fine on mobile.
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!isMobile) {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // ── HERO VIDEO AUTOPLAY ──
  // iOS Safari requires muted + playsinline + a ready video before play() works.
  // Calling play() before canplay fires (i.e. on DOMContentLoaded on a slow
  // mobile connection) silently fails. We call load() to force the browser to
  // start fetching, then play once the video is ready. A touch fallback covers
  // browsers that still need a gesture.
  const heroVideo = document.querySelector('.hero-bg-video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.playsInline = true;

    const tryPlay = () => {
      const p = heroVideo.play();
      if (p) p.catch(() => {});
    };

    if (heroVideo.readyState >= 3) {
      tryPlay();
    } else {
      heroVideo.addEventListener('canplay', tryPlay, { once: true });
    }

    heroVideo.load();

    // Fallback for browsers that require a user gesture
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  }

  // ── NAV SCROLL STATE ──
  const nav = document.querySelector('.nav');
  if (nav) {
    ScrollTrigger.create({
      start: 'top -100',
      onUpdate: (self) => {
        nav.classList.toggle('scrolled', self.scroll() > 100);
      }
    });
  }

  // ── MOBILE NAV ──
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay   = document.querySelector('.nav-overlay');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = overlay.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── ACTIVE NAV LINK ──
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── UNIVERSAL SCROLL REVEALS ──
  // Individual elements with data-reveal attribute
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    const delay = parseFloat(el.dataset.revealDelay) || 0;
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
      },
      y: 50,
      opacity: 0,
      duration: 0.7,
      delay,
      ease: 'power2.out'
    });
  });

  // Staggered groups — parent has data-reveal-group, children have data-reveal-item
  gsap.utils.toArray('[data-reveal-group]').forEach(group => {
    const items = group.querySelectorAll('[data-reveal-item]');
    gsap.from(items, {
      scrollTrigger: {
        trigger: group,
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: 'power2.out'
    });
  });

  // ── PAGE HERO ANIMATION (inner pages only) ──
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    const heroTitle = pageHero.querySelector('.page-hero-title');
    const heroSub   = pageHero.querySelector('.page-hero-sub');

    if (heroTitle) {
      Splitting({ target: heroTitle, by: 'chars' });
      gsap.from('.page-hero-title .char', {
        y: 80,
        opacity: 0,
        duration: 0.65,
        stagger: 0.025,
        ease: 'power3.out',
        delay: 0.15
      });
    }

    if (heroSub) {
      gsap.from(heroSub, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.55
      });
    }
  }

});
