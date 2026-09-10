/* Opt-in product compatibility layer for the unchanged KRDS 1.1.0 examples.
 * Load after Swiper, the original snippet and ui-script.js. No backend actions.
 * PDF 2024.02 p.174–175, 321, 325–327: keyboard boundaries, hidden slides,
 * and automatic motion must remain stopped until an explicit play request.
 */
(function (global) {
  'use strict';
  const bound = new WeakSet();
  function prepare(container) {
    let activated = false;
    container.querySelectorAll('.krds-main-menu.sample').forEach(menu => {
      menu.classList.remove('sample');
      menu.querySelectorAll('.gnb-main-trigger.active').forEach(node => node.classList.remove('active'));
      menu.querySelectorAll('.gnb-toggle-wrap.is-open').forEach(node => node.classList.remove('is-open'));
      activated = true;
    });
    // Normal script loading prepares before the original DOMContentLoaded init.
    // Late host insertion calls the original API once after its initial pass.
    if (activated && global.document.readyState === 'complete' && typeof krds_mainMenuPC !== 'undefined') krds_mainMenuPC.init();
  }
  function mount(container) {
    prepare(container);
    container.querySelectorAll('.vb-swiper, .main-d-ban-swiper').forEach(root => {
      const slider = root.querySelector('.swiper');
      const swiper = slider && slider.swiper;
      if (!swiper || bound.has(root)) return;
      bound.add(root);
      const play = root.querySelector('.swiper-button-play');
      const stop = root.querySelector('.swiper-button-stop');
      let held = false;
      let movingFocus = false;
      function focus(control) { movingFocus = true; control.focus(); movingFocus = false; }
      function hold() {
        if (!play || !stop || movingFocus) return;
        const restore = root.ownerDocument.activeElement === stop;
        held = true;
        swiper.autoplay.stop();
        play.style.display = ''; stop.style.display = 'none';
        if (restore) focus(play);
      }
      function expose() {
        const slides = Array.from(swiper.slides);
        slides.forEach((slide,index) => {
          const visible = index === swiper.activeIndex;
          slide.inert = !visible;
          slide.setAttribute('aria-hidden', String(!visible));
        });
        root.querySelectorAll('.swiper-indicator, .swiper-button-prev, .swiper-button-next').forEach(node => { node.hidden = slides.length <= 1; });
      }
      root.addEventListener('focusin', hold);
      root.addEventListener('pointerenter', hold);
      if (play) play.addEventListener('click', () => { held = false; }, true);
      if (play) play.addEventListener('click', () => { if (root.ownerDocument.activeElement === play) focus(stop); });
      if (stop) stop.addEventListener('click', () => { held = true; }, true);
      swiper.on('autoplayResume', () => { if (held) swiper.autoplay.stop(); });
      swiper.on('slideChange', expose);
      swiper.on('slidesLengthChange', expose);
      expose();
      if (swiper.slides.length <= 1 && swiper.autoplay) swiper.autoplay.stop();
    });
    container.querySelectorAll('.krds-main-menu').forEach(menu => {
      if (bound.has(menu)) return;
      bound.add(menu);
      menu.addEventListener('keydown', event => {
        const trigger = event.target.closest('[data-trigger]');
        if (event.key === 'Escape') {
          const current = menu.querySelector('.gnb-main-trigger[aria-expanded="true"]');
          if (current) current.focus();
          return; // original keyup handler owns closing and backdrop state.
        }
        if (!trigger || !['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key)) return;
        const item = trigger.closest('li');
        const siblings = Array.from(item.parentElement.children).map(node => node.querySelector('[data-trigger]')).filter(Boolean);
        const index = siblings.indexOf(trigger);
        if (index < 0) return;
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? siblings.length - 1 : (index + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + siblings.length) % siblings.length;
        event.preventDefault(); event.stopPropagation(); siblings[target].focus();
      });
    });
  }
  global.AltoolUpstreamCompat = {mount};
  if (global.document) {
    prepare(global.document);
    if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', () => mount(global.document));
    else mount(global.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
