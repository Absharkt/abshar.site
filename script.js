/* ==========================================================================
   Minimal portfolio — script.js
   Theme toggle, current-section highlight, quiet scroll reveal, placeholder
   links, footer year. Vanilla JS, no dependencies. Each feature is isolated,
   so one failing never takes the others down.
   ========================================================================== */
(function () {
  'use strict';

  // Tells the CSS that JS is running (scroll reveals depend on it)
  document.documentElement.classList.add('js');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Toast (used for placeholder links) ---------- */
  const Toast = (() => {
    const el = $('#toast');
    let hideTimer, clearTimer;
    return {
      show(message, duration = 3400) {
        if (!el) return;
        clearTimeout(hideTimer);
        clearTimeout(clearTimer);
        el.textContent = message;
        el.classList.add('is-visible');
        hideTimer = setTimeout(() => {
          el.classList.remove('is-visible');
          clearTimer = setTimeout(() => { el.textContent = ''; }, 300);
        }, duration);
      }
    };
  })();

  /* ---------- Theme ---------- */
  function initTheme() {
    const root = document.documentElement;
    const button = $('#theme-toggle');
    const themeMeta = $('meta[name="theme-color"]');

    const apply = (theme) => {
      root.dataset.theme = theme;
      if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#151515' : '#F5F4F0');
      if (button) button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    };
    apply(root.dataset.theme === 'light' ? 'light' : 'dark');

    if (!button) return;

    const commit = (next) => {
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable: fine */ }
    };

    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';

      // No animation if the visitor prefers reduced motion
      if (reducedMotion()) { commit(next); return; }

      // Browsers without View Transitions: a quick colour fade
      if (typeof document.startViewTransition !== 'function') {
        root.classList.add('theme-anim');
        setTimeout(() => root.classList.remove('theme-anim'), 320);
        commit(next);
        return;
      }

      // The new theme wipes in as a circle growing from the toggle button
      const box = button.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(() => commit(next));
      transition.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(() => { /* transition skipped: the theme is already applied */ });
    });
  }

  /* ---------- Current section in the nav ----------
     The section whose top has passed ~35% of the viewport is "current".
     At the very bottom of the page the last section wins, so a short final
     section (Contact) can still be selected. */
  function initScrollSpy() {
    const links = $$('.side-nav a[href^="#"]');
    if (!links.length) return;
    const entries = links
      .map((link) => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) }))
      .filter((entry) => entry.section);
    const scroller = $('.side-nav ul');
    let current = null;
    let ticking = false;

    const setCurrent = (entry) => {
      if (entry === current) return;
      current = entry;
      links.forEach((link) => link.removeAttribute('aria-current'));
      entry.link.setAttribute('aria-current', 'true');
      // On phones the nav is a horizontal strip: keep the current link in view
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        const target = entry.link.offsetLeft - (scroller.clientWidth - entry.link.offsetWidth) / 2;
        scroller.scrollTo({ left: target, behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    };

    const update = () => {
      ticking = false;
      const line = window.innerHeight * 0.35;
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
      let match = null;
      entries.forEach((entry) => {
        if (entry.section.getBoundingClientRect().top <= line) match = entry;
      });
      if (atBottom) match = entries[entries.length - 1];
      if (match) setCurrent(match);
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Quiet scroll reveal ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Placeholder links ----------
     <a data-placeholder="[LABEL]"> says so instead of jumping to the top.
     To activate one: set its real href, then delete data-placeholder and aria-disabled. */
  function initPlaceholders() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-placeholder]');
      if (!link) return;
      event.preventDefault();
      Toast.show(`Placeholder link. Replace ${link.dataset.placeholder} in index.html.`);
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  [initTheme, initScrollSpy, initReveal, initPlaceholders, initYear].forEach((init) => {
    try { init(); } catch (error) { console.error(`[portfolio] ${init.name} failed`, error); }
  });
})();
