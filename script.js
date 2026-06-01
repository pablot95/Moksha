/* ========================================
   MOKSHA – JavaScript
======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ─── NAV SCROLL ───
  const nav = document.getElementById('nav');
  if (nav && !nav.classList.contains('scrolled')) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── MOBILE MENU ───
  const toggle  = document.getElementById('nav-toggle');
  const mobile  = document.getElementById('nav-mobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      mobile.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Cerrar al hacer click en un link
    mobile.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        mobile.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        mobile.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── HERO SLIDER ───
  const slider = document.getElementById('hero-slider');
  if (slider) {
    const slides = slider.querySelectorAll('.hero__slide');
    const dots   = document.querySelectorAll('.hero__dot');
    let current  = 0;
    let timer    = null;

    const goTo = (idx) => {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      dots[current]?.setAttribute('aria-selected', 'false');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
      dots[current]?.setAttribute('aria-selected', 'true');
    };

    const autoplay = () => {
      timer = setInterval(() => goTo(current + 1), 5000);
    };

    const resetTimer = () => {
      clearInterval(timer);
      autoplay();
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    });

    autoplay();

    // Pausar en hover
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', autoplay);
  }

  // ─── ANIMATE ON SCROLL (sistema mejorado) ───
  const aosEls = document.querySelectorAll('[data-aos]');
  if (aosEls.length) {

    // Asigna automáticamente el tipo de animación según el elemento
    aosEls.forEach(el => {
      if (el.dataset.anim) return; // ya tiene asignado

      if (el.matches('.card, .card--map')) {
        el.dataset.anim = 'zoom';

      } else if (el.matches('.menu-card')) {
        el.dataset.anim = 'flip';

      } else if (el.matches('.form-wrap')) {
        el.dataset.anim = 'fade';

      } else if (el.matches('.section-header')) {
        el.dataset.anim = 'up';

      } else {
        // Columnas alternas: izquierda entra desde la izquierda, derecha desde la derecha
        const siblings = [...el.parentElement.querySelectorAll(':scope > [data-aos]')];
        const idx = siblings.indexOf(el);
        if (siblings.length >= 2) {
          el.dataset.anim = idx % 2 === 0 ? 'right' : 'left';
        } else {
          el.dataset.anim = 'up';
        }
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    aosEls.forEach(el => observer.observe(el));
  }

  // ─── HERO VIDEO — TOGGLE VOLUMEN ───
  const heroVideo  = document.getElementById('hero-video');
  const heroVolBtn = document.getElementById('hero-vol-btn');
  if (heroVideo && heroVolBtn) {
    function toggleVolumen() {
      heroVideo.muted = !heroVideo.muted;
      heroVolBtn.classList.toggle('is-on', !heroVideo.muted);
      heroVolBtn.setAttribute('aria-label', heroVideo.muted ? 'Activar sonido' : 'Silenciar');
    }
    heroVolBtn.addEventListener('click', toggleVolumen);
    // Click directo sobre el video también activa/silencia (solo desktop)
    heroVideo.addEventListener('click', toggleVolumen);
  }

  // ─── LIGHTBOX ───
  const lightbox   = document.getElementById('gallery-lightbox');
  const lbMedia    = document.getElementById('lightbox-media');
  const lbCaption  = document.getElementById('lightbox-caption');
  const lbClose    = document.getElementById('lightbox-close');
  const lbBackdrop = document.getElementById('lightbox-backdrop');

  function openLightbox(card) {
    if (!lightbox) return;
    lbMedia.innerHTML = '';

    const img = card.querySelector('img');
    const ph  = card.querySelector('.gallery-placeholder');

    if (img) {
      const clone = img.cloneNode(true);
      lbMedia.appendChild(clone);
    } else if (ph) {
      lbMedia.appendChild(ph.cloneNode(true));
    }

    if (lbCaption) lbCaption.textContent = card.dataset.label || '';
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lbMedia) lbMedia.innerHTML = '';
  }

  if (lbClose)    lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

  // ─── GALERÍA — DRAG CAROUSEL ───
  const galleryWrap = document.getElementById('gallery-wrap');
  if (galleryWrap) {
    let isDown      = false;
    let startX      = 0;
    let scrollStart = 0;
    let moved       = false;

    galleryWrap.addEventListener('pointerdown', (e) => {
      isDown      = true;
      moved       = false;
      startX      = e.clientX;
      scrollStart = galleryWrap.scrollLeft;
      galleryWrap.setPointerCapture(e.pointerId);
      galleryWrap.classList.add('is-dragging');
    });

    galleryWrap.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      galleryWrap.scrollLeft = scrollStart - dx;
    });

    galleryWrap.addEventListener('pointerup', (e) => {
      const wasMoved = moved;
      isDown = false;
      galleryWrap.classList.remove('is-dragging');
      if (!wasMoved) {
        const card = e.target.closest('.gallery-card');
        if (card) openLightbox(card);
      }
    });

    galleryWrap.addEventListener('pointercancel', () => {
      isDown = false;
      galleryWrap.classList.remove('is-dragging');
    });
  }

  // Escape key cierra lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  // ─── CAPTCHA DINÁMICO (presupuesto.html) ───
  const captchaQ = document.getElementById('captcha-question');
  const captchaA = document.getElementById('captcha-answer');
  if (captchaQ && captchaA) {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    captchaQ.textContent = `¿Cuánto es ${a} + ${b}?`;
    captchaA.dataset.answer = a + b;
  }

  // ─── FORMULARIO (presupuesto.html) ───
  const form = document.getElementById('presupuesto-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot check
      const honeypot = form.querySelector('[name="_honeypot"]');
      if (honeypot && honeypot.value) return;

      // Captcha check
      if (captchaA) {
        const expected = parseInt(captchaA.dataset.answer, 10);
        const given    = parseInt(captchaA.value, 10);
        if (isNaN(given) || given !== expected) {
          captchaA.style.borderColor = '#c0392b';
          captchaA.focus();
          captchaA.placeholder = 'Respuesta incorrecta';
          return;
        }
        captchaA.style.borderColor = '';
      }

      // Validación básica HTML5
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Aquí iría el fetch al backend / emailJS / formspree
      // Por ahora muestra el mensaje de éxito
      const success = document.getElementById('form-success');
      form.style.opacity = '0.4';
      form.style.pointerEvents = 'none';
      if (success) {
        success.style.display = 'block';
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

});

// ─── MODALES MAPA (funciones globales) ───
function abrirMapa(id) {
  const modal = document.getElementById(`map-modal-${id}`);
  if (!modal) return;
  // Cierra cualquier otro modal de mapa abierto
  document.querySelectorAll('.map-modal:not([hidden])').forEach(m => m.setAttribute('hidden', ''));
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarMapa(id) {
  const modal = document.getElementById(`map-modal-${id}`);
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Escape cierra modal de mapa
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.map-modal:not([hidden])').forEach((m) => {
        const id = m.id.replace('map-modal-', '');
        cerrarMapa(id);
      });
    }
  });
});

// ─── MODAL PDF (funciones globales) ───
function abrirMenu(src, titulo) {
  const modal   = document.getElementById('pdf-modal');
  const iframe  = document.getElementById('pdf-iframe');
  const titleEl = document.getElementById('pdf-modal-title');
  if (!modal) return;
  iframe.src          = src + '#toolbar=0&navpanes=0&scrollbar=0';
  titleEl.textContent = titulo;
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarMenu() {
  const modal  = document.getElementById('pdf-modal');
  const iframe = document.getElementById('pdf-iframe');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  iframe.src = '';
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pdf-close')   ?.addEventListener('click', cerrarMenu);
  document.getElementById('pdf-backdrop')?.addEventListener('click', cerrarMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });
});
