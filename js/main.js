/* ================================================================
   AMV ASSOCIATES — Main JavaScript
   Preloader · Cursor · Navigation · Smooth Scroll · Animations
   ================================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let lenis = null;

  /* ── Preloader ───────────────────────────────────────────────── */
  function initPreloader(onComplete) {
    const preloader = document.querySelector('.preloader');
    const bar = document.querySelector('.preloader__bar');

    if (!preloader || !bar) { onComplete(); return; }

    if (prefersReducedMotion) {
      preloader.remove();
      onComplete();
      return;
    }

    gsap.to(bar, {
      width: '100%',
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
          onComplete: () => {
            preloader.remove();
            onComplete();
          }
        });
      }
    });
  }

  /* ── Custom Cursor ───────────────────────────────────────────── */
  function initCursor() {
    if (isTouchDevice || prefersReducedMotion) return;

    const dot = document.querySelector('.cursor__dot');
    const ring = document.querySelector('.cursor__ring');
    if (!dot || !ring) return;

    const moveDot = gsap.quickTo(dot, 'left', { duration: 0.15, ease: 'power3' });
    const moveDotY = gsap.quickTo(dot, 'top', { duration: 0.15, ease: 'power3' });
    const moveRing = gsap.quickTo(ring, 'left', { duration: 0.3, ease: 'power3' });
    const moveRingY = gsap.quickTo(ring, 'top', { duration: 0.3, ease: 'power3' });

    document.addEventListener('mousemove', (e) => {
      moveDot(e.clientX);
      moveDotY(e.clientY);
      moveRing(e.clientX);
      moveRingY(e.clientY);
    });

    const hoverTargets = document.querySelectorAll('a, button, [data-hover]');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor--hover'));
    });

    document.addEventListener('mouseleave', () => document.body.classList.add('cursor--hidden'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor--hidden'));
  }

  /* ── Navigation ──────────────────────────────────────────────── */
  function initNavigation() {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.nav__hamburger');
    const overlayLinks = document.querySelectorAll('.nav__overlay-link');
    const navLinks = document.querySelectorAll('.nav__link');

    if (!nav) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 100) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
      lastScroll = y;
    }, { passive: true });

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav--open');
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        if (lenis) isOpen ? lenis.stop() : lenis.start();
      });
    }

    const closeNav = () => {
      nav.classList.remove('nav--open');
      hamburger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    };

    overlayLinks.forEach(link => link.addEventListener('click', closeNav));

    [...navLinks, ...overlayLinks, ...document.querySelectorAll('.hero__scroll, .footer__link[href^="#"]')].forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const sections = document.querySelectorAll('section[id]');
    if (sections.length && navLinks.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(l => l.classList.toggle('nav__link--active', l.getAttribute('href') === `#${id}`));
          }
        });
      }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });

      sections.forEach(s => observer.observe(s));
    }
  }

  /* ── Smooth Scroll (Lenis) ───────────────────────────────────── */
  function initSmoothScroll() {
    if (prefersReducedMotion || typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true
    });

    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Hero Entrance ───────────────────────────────────────────── */
  function initHeroEntrance() {
    if (prefersReducedMotion) {
      gsap.set('.hero__line-inner', { y: 0, clipPath: 'inset(0 0 0% 0)' });
      gsap.set('.hero__badge, .hero__subtitle, .hero__scroll, .nav', { opacity: 1 });
      return;
    }

    const tl = gsap.timeline();

    gsap.set('.hero__badge', { opacity: 0, y: -15, scale: 0.9 });
    gsap.set('.hero__line-inner', { y: 40, clipPath: 'inset(0 0 100% 0)' });
    gsap.set('.hero__subtitle', { opacity: 0, y: 20 });
    gsap.set('.hero__scroll', { opacity: 0 });
    gsap.set('.nav', { opacity: 0 });

    tl.to('.hero__badge', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.7)'
    })
    .to('.hero__line-inner', {
      y: 0,
      clipPath: 'inset(0 0 0% 0)',
      duration: 0.9,
      ease: 'power4.out',
      stagger: 0.15
    }, '-=0.3')
    .to('.hero__subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.3')
    .to('.hero__scroll', {
      opacity: 0.4,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.nav', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.4');
  }

  /* ── Scroll Animations ───────────────────────────────────────── */
  function initScrollAnimations() {
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // Manifesto
    const manifesto = document.querySelector('.manifesto__text');
    if (manifesto) {
      gsap.from(manifesto, {
        scrollTrigger: {
          trigger: '.manifesto',
          start: 'top 80%',
          end: 'center center',
          toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      gsap.from('.manifesto .gold-rule', {
        scrollTrigger: {
          trigger: '.manifesto',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        scaleX: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2
      });
    }

    // Project cards — staggered with 3D tilt entrance
    gsap.utils.toArray('.project-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        },
        scale: 0.92,
        opacity: 0,
        rotationY: i % 2 === 0 ? -5 : 5,
        transformOrigin: i % 2 === 0 ? 'left center' : 'right center',
        duration: 0.9,
        delay: (i % 4) * 0.12,
        ease: 'power3.out'
      });
    });

    // Expertise cards — staggered slide-up with rotation
    gsap.utils.toArray('.expertise-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        rotationX: 8,
        transformOrigin: 'bottom center',
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // Philosophy — character-by-character reveal
    const philosophyQuote = document.querySelector('.philosophy__quote');
    if (philosophyQuote) {
      const text = philosophyQuote.textContent.trim();
      philosophyQuote.innerHTML = '';
      [...text].forEach(char => {
        const span = document.createElement('span');
        span.className = 'philosophy__char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        philosophyQuote.appendChild(span);
      });

      gsap.to('.philosophy__char', {
        scrollTrigger: {
          trigger: '.philosophy',
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1
        },
        opacity: 1,
        stagger: 0.02,
        ease: 'none'
      });
    }

    // Process timeline
    const processLine = document.querySelector('.process__line-fill');
    const processSteps = gsap.utils.toArray('.process__step');

    if (processLine && processSteps.length) {
      gsap.to(processLine, {
        scrollTrigger: {
          trigger: '.process__timeline',
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 1
        },
        width: '100%',
        ease: 'none'
      });

      processSteps.forEach((step, i) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.12,
          ease: 'power3.out'
        });

        ScrollTrigger.create({
          trigger: step,
          start: 'top 65%',
          onEnter: () => step.classList.add('process__step--active'),
          onLeaveBack: () => step.classList.remove('process__step--active')
        });
      });
    }

    // Testimonials — staggered with slide-up and scale
    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'power3.out'
      });
    });

    // Team cards — staggered reveal with clip-path wipe
    gsap.utils.toArray('.team-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        clipPath: 'inset(100% 0 0 0)',
        opacity: 0,
        duration: 0.9,
        delay: i * 0.15,
        ease: 'power4.out'
      });

      // Animate the image separately for a layered effect
      const img = card.querySelector('.team-card__image');
      if (img) {
        gsap.from(img, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          scale: 1.15,
          duration: 1.2,
          delay: i * 0.15 + 0.2,
          ease: 'power2.out'
        });
      }
    });

    // Client logos — cascading fade-in
    gsap.utils.toArray('.recognition__clients-logos img').forEach((logo, i) => {
      gsap.from(logo, {
        scrollTrigger: {
          trigger: '.recognition__clients-logos',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        scale: 0.8,
        y: 20,
        duration: 0.5,
        delay: i * 0.04,
        ease: 'power2.out'
      });
    });

    // Recognition label
    const clientsLabel = document.querySelector('.recognition__clients-label');
    if (clientsLabel) {
      gsap.from(clientsLabel, {
        scrollTrigger: {
          trigger: clientsLabel,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out'
      });
    }

    // CTA heading — line reveal
    const ctaLines = document.querySelectorAll('.cta .hero__line-inner');
    if (ctaLines.length) {
      gsap.from(ctaLines, {
        scrollTrigger: {
          trigger: '.cta',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.15
      });
    }

    // CTA text + button
    gsap.from('.cta__text, .cta__button, .cta__contact', {
      scrollTrigger: {
        trigger: '.cta',
        start: 'top 60%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out'
    });

    // Section labels + headings
    gsap.utils.toArray('.section__label, .section__heading').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      });
    });

    // Footer fade
    gsap.from('.footer__grid', {
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
  }

  /* ── Marquee ─────────────────────────────────────────────────── */
  function initMarquee() {
    const marquee = document.querySelector('.marquee');
    const content = document.querySelector('.marquee__content');
    if (!marquee || !content) return;

    const clone = content.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    marquee.appendChild(clone);
  }

  /* ── Parallax ────────────────────────────────────────────────── */
  function initParallax() {
    if (prefersReducedMotion) return;

    const philosophy = document.querySelector('.philosophy');
    if (!philosophy) return;

    gsap.to(philosophy, {
      scrollTrigger: {
        trigger: philosophy,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      backgroundPosition: '50% 30%',
      ease: 'none'
    });
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  function init() {
    initCursor();
    initNavigation();
    initSmoothScroll();
    initMarquee();

    initPreloader(() => {
      initHeroEntrance();
      requestAnimationFrame(() => {
        initScrollAnimations();
        initParallax();
        ScrollTrigger.refresh();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
