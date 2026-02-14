/* ================================================================
   AMV ASSOCIATES — Main JavaScript
   Preloader · Magnetic Cursor · Navigation · Smooth Scroll
   Hero Entrance · Counter · Lightbox · Scroll Animations · Utilities
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

  /* ── Magnetic Cursor ─────────────────────────────────────────── */
  function initCursor() {
    if (isTouchDevice || prefersReducedMotion) return;

    const dot = document.querySelector('.cursor__dot');
    const ring = document.querySelector('.cursor__ring');
    if (!dot || !ring) return;

    const moveDot = gsap.quickTo(dot, 'left', { duration: 0.15, ease: 'power3' });
    const moveDotY = gsap.quickTo(dot, 'top', { duration: 0.15, ease: 'power3' });
    const moveRing = gsap.quickTo(ring, 'left', { duration: 0.3, ease: 'power3' });
    const moveRingY = gsap.quickTo(ring, 'top', { duration: 0.3, ease: 'power3' });

    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      moveDot(mouseX);
      moveDotY(mouseY);
      moveRing(mouseX);
      moveRingY(mouseY);
    });

    // Magnetic pull for interactive elements
    const magnetTargets = document.querySelectorAll('a, button, [data-hover]');
    magnetTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor--hover');
      });
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 80;

        if (dist < maxDist) {
          const pull = 1 - (dist / maxDist);
          const offsetX = dx * pull * 0.3;
          const offsetY = dy * pull * 0.3;
          gsap.to(el, { x: offsetX, y: offsetY, duration: 0.3, ease: 'power2.out' });
        }
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
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

    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
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

    // Smooth anchor scrolling for all internal links
    const anchorLinks = [
      ...navLinks, ...overlayLinks,
      ...document.querySelectorAll('.hero__scroll, .nav__cta, .footer__link[href^="#"], .btn[href^="#"]')
    ];

    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        closeNav();
        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Active link highlighting
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
      gsap.set('.hero__badge, .hero__subtitle, .hero__cta, .hero__trust, .hero__scroll, .nav', { opacity: 1 });
      return;
    }

    const tl = gsap.timeline();

    gsap.set('.hero__badge', { opacity: 0, y: -15, scale: 0.9 });
    gsap.set('.hero__line-inner', { y: 40, clipPath: 'inset(0 0 100% 0)' });
    gsap.set('.hero__subtitle', { opacity: 0, y: 20 });
    gsap.set('.hero__cta', { opacity: 0, y: 25 });
    gsap.set('.hero__trust', { opacity: 0, y: 15 });
    gsap.set('.hero__scroll', { opacity: 0 });
    gsap.set('.nav', { opacity: 0 });

    tl.to('.hero__badge', {
      opacity: 1, y: 0, scale: 1,
      duration: 0.6, ease: 'back.out(1.7)'
    })
    .to('.hero__line-inner', {
      y: 0, clipPath: 'inset(0 0 0% 0)',
      duration: 0.9, ease: 'power4.out', stagger: 0.15
    }, '-=0.3')
    .to('.hero__subtitle', {
      opacity: 1, y: 0,
      duration: 0.7, ease: 'power3.out'
    }, '-=0.3')
    .to('.hero__cta', {
      opacity: 1, y: 0,
      duration: 0.6, ease: 'power3.out'
    }, '-=0.2')
    .to('.hero__trust', {
      opacity: 1, y: 0,
      duration: 0.5, ease: 'power3.out'
    }, '-=0.2')
    .to('.hero__scroll', {
      opacity: 0.4,
      duration: 0.5, ease: 'power2.out'
    }, '-=0.2')
    .to('.nav', {
      opacity: 1,
      duration: 0.5, ease: 'power2.out'
    }, '-=0.4');
  }

  /* ── Counter Animation ──────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    counters.forEach(el => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val);
            }
          });
        }
      });
    });
  }

  /* ── Lightbox Gallery ──────────────────────────────────────── */
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const overlay = lightbox.querySelector('.lightbox__overlay');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    const title = lightbox.querySelector('.lightbox__title');
    const meta = lightbox.querySelector('.lightbox__meta');
    const image = lightbox.querySelector('.lightbox__image');
    const prevBtn = lightbox.querySelector('.lightbox__prev');
    const nextBtn = lightbox.querySelector('.lightbox__next');
    const dotsContainer = lightbox.querySelector('.lightbox__dots');

    let currentImages = [];
    let currentIndex = 0;

    function openLightbox(el) {
      const name = el.getAttribute('data-name') || '';
      const category = el.getAttribute('data-category') || '';
      const location = el.getAttribute('data-location') || '';
      const imagesAttr = el.getAttribute('data-images');
      if (!imagesAttr) return;

      try {
        currentImages = JSON.parse(imagesAttr).map(img => 'assets/images/projects/' + img);
      } catch (e) { return; }

      if (!currentImages.length) return;

      currentIndex = 0;
      title.textContent = name;
      meta.textContent = [category, location].filter(Boolean).join(' — ');

      updateImage();
      updateDots();
      updateArrows();

      lightbox.classList.add('lightbox--active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();

      // GSAP entrance
      gsap.fromTo(lightbox.querySelector('.lightbox__content'),
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }

    function closeLightbox() {
      gsap.to(lightbox.querySelector('.lightbox__content'), {
        scale: 0.9, opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          lightbox.classList.remove('lightbox--active');
          lightbox.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          if (lenis) lenis.start();
        }
      });
    }

    function updateImage() {
      gsap.to(image, {
        opacity: 0, duration: 0.15,
        onComplete: () => {
          image.src = currentImages[currentIndex];
          image.alt = title.textContent + ' — Project photo ' + (currentIndex + 1);
          gsap.to(image, { opacity: 1, duration: 0.25 });
        }
      });
    }

    function updateDots() {
      dotsContainer.innerHTML = '';
      if (currentImages.length <= 1) return;
      currentImages.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'lightbox__dot' + (i === currentIndex ? ' lightbox__dot--active' : '');
        dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateImage();
          updateDots();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateArrows() {
      const show = currentImages.length > 1;
      prevBtn.style.display = show ? '' : 'none';
      nextBtn.style.display = show ? '' : 'none';
    }

    function goNext() {
      if (currentImages.length <= 1) return;
      currentIndex = (currentIndex + 1) % currentImages.length;
      updateImage();
      updateDots();
    }

    function goPrev() {
      if (currentImages.length <= 1) return;
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      updateImage();
      updateDots();
    }

    // Event listeners
    document.querySelectorAll('.clientele__item--has-projects').forEach(el => {
      el.addEventListener('click', () => openLightbox(el));
    });

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('lightbox--active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    });
  }

  /* ── Scroll Animations ───────────────────────────────────────── */
  function initScrollAnimations() {
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // About — two-column reveal
    const aboutText = document.querySelector('.about__text');
    const aboutImage = document.querySelector('.about__image');

    if (aboutText) {
      gsap.from(aboutText, {
        scrollTrigger: { trigger: '.about', start: 'top 80%', toggleActions: 'play none none reverse' },
        x: -50, opacity: 0, duration: 0.9, ease: 'power3.out'
      });
    }

    if (aboutImage) {
      gsap.from(aboutImage, {
        scrollTrigger: { trigger: '.about', start: 'top 80%', toggleActions: 'play none none reverse' },
        x: 50, opacity: 0, duration: 0.9, delay: 0.15, ease: 'power3.out'
      });
    }

    // About badges — stagger fade-up
    gsap.utils.toArray('.about__badge').forEach((badge, i) => {
      gsap.from(badge, {
        scrollTrigger: { trigger: '.about__badges', start: 'top 90%', toggleActions: 'play none none reverse' },
        opacity: 0, y: 15, scale: 0.9,
        duration: 0.4, delay: i * 0.08, ease: 'power2.out'
      });
    });

    // Clientele logos — cascading fade-in
    gsap.utils.toArray('.clientele__item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: '.clientele__grid', start: 'top 85%', toggleActions: 'play none none reverse' },
        opacity: 0, scale: 0.9, y: 20,
        duration: 0.5, delay: i * 0.03, ease: 'power2.out'
      });
    });

    // Expertise cards — slide-up with rotation
    gsap.utils.toArray('.expertise-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 50, opacity: 0, rotationX: 8,
        transformOrigin: 'bottom center',
        duration: 0.8, delay: i * 0.1, ease: 'power3.out'
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
        opacity: 1, stagger: 0.02, ease: 'none'
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
        width: '100%', ease: 'none'
      });

      processSteps.forEach((step, i) => {
        gsap.from(step, {
          scrollTrigger: { trigger: step, start: 'top 80%', toggleActions: 'play none none reverse' },
          y: 30, opacity: 0,
          duration: 0.6, delay: i * 0.12, ease: 'power3.out'
        });

        ScrollTrigger.create({
          trigger: step,
          start: 'top 65%',
          onEnter: () => step.classList.add('process__step--active'),
          onLeaveBack: () => step.classList.remove('process__step--active')
        });
      });
    }

    // Testimonials — slide-up with scale
    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
        y: 60, opacity: 0, scale: 0.95,
        duration: 0.8, delay: i * 0.15, ease: 'power3.out'
      });
    });

    // Team cards — clipPath wipe + image zoom-out
    gsap.utils.toArray('.team-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
        clipPath: 'inset(100% 0 0 0)', opacity: 0,
        duration: 0.9, delay: i * 0.15, ease: 'power4.out'
      });

      const img = card.querySelector('.team-card__image');
      if (img) {
        gsap.from(img, {
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
          scale: 1.15,
          duration: 1.2, delay: i * 0.15 + 0.2, ease: 'power2.out'
        });
      }
    });

    // CTA — line reveal
    const ctaLines = document.querySelectorAll('.cta .hero__line-inner');
    if (ctaLines.length) {
      gsap.from(ctaLines, {
        scrollTrigger: { trigger: '.cta', start: 'top 70%', toggleActions: 'play none none reverse' },
        y: 40, clipPath: 'inset(0 0 100% 0)',
        duration: 0.9, ease: 'power4.out', stagger: 0.15
      });
    }

    // CTA text + buttons + contact
    gsap.from('.cta__text, .cta__buttons, .cta__contact', {
      scrollTrigger: { trigger: '.cta', start: 'top 60%', toggleActions: 'play none none reverse' },
      y: 30, opacity: 0,
      duration: 0.7, stagger: 0.1, ease: 'power3.out'
    });

    // Section labels + headings (universal)
    gsap.utils.toArray('.section__label, .section__heading').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 30, opacity: 0,
        duration: 0.7, ease: 'power3.out'
      });
    });

    // Footer fade
    gsap.from('.footer__grid', {
      scrollTrigger: { trigger: '.footer', start: 'top 90%', toggleActions: 'play none none none' },
      y: 20, opacity: 0,
      duration: 0.6, ease: 'power2.out'
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

  /* ── Back to Top ─────────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('back-to-top--visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ── WhatsApp Entrance ──────────────────────────────────────── */
  function initWhatsApp() {
    const btn = document.querySelector('.whatsapp-float');
    if (!btn || prefersReducedMotion) return;

    gsap.set(btn, { scale: 0, opacity: 0 });
    gsap.to(btn, {
      scale: 1, opacity: 1,
      duration: 0.6, delay: 3.5,
      ease: 'back.out(1.7)'
    });
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  function init() {
    initCursor();
    initNavigation();
    initSmoothScroll();
    initMarquee();
    initBackToTop();
    initWhatsApp();
    initLightbox();

    initPreloader(() => {
      initHeroEntrance();
      requestAnimationFrame(() => {
        initScrollAnimations();
        initParallax();
        initCounters();
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
