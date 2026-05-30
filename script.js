document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  function smoothScrollTo(targetElement, duration = 800) {
    const navbar = document.querySelector('.navbar');
    const navHeight = navbar ? navbar.offsetHeight : 80;
    const targetY = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    let startTime = null;

    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      window.scrollTo(0, easeInOutQuad(elapsed, startY, distance, duration));
      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
      }
    }

    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      smoothScrollTo(target);

      const navToggle = document.getElementById('nav-toggle');
      if (navToggle && navToggle.checked) {
        navToggle.checked = false;
      }

      if (history.pushState) {
        history.pushState(null, null, href);
      }
    });
  });

  window.addEventListener('popstate', () => {
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => smoothScrollTo(target), 50);
      }
    }
  });

  const backToTopBtn = document.createElement('button');
  backToTopBtn.innerHTML = '<i data-lucide="arrow-up"></i>';
  backToTopBtn.id = 'backToTop';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.style.cssText = `
    display: none;
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #1543a6, #3b82f6);
    color: white;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(59,130,246,0.4);
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.2s ease;
  `;
  document.body.appendChild(backToTopBtn);

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'flex';
        requestAnimationFrame(() => {
          backToTopBtn.style.opacity = '1';
        });
      } else {
        backToTopBtn.style.opacity = '0';
        setTimeout(() => {
          if (window.pageYOffset <= 300) {
            backToTopBtn.style.display = 'none';
          }
        }, 300);
      }
    }, 50);
  });

  backToTopBtn.addEventListener('mouseenter', () => {
    backToTopBtn.style.transform = 'scale(1.1) translateY(-2px)';
  });

  backToTopBtn.addEventListener('mouseleave', () => {
    backToTopBtn.style.transform = 'scale(1) translateY(0)';
  });

  backToTopBtn.addEventListener('click', () => {
    const duration = 600;
    const startY = window.pageYOffset;
    let startTime = null;

    function stepTop(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      window.scrollTo(0, startY * (1 - ease));
      if (elapsed < duration) {
        requestAnimationFrame(stepTop);
      } else {
        window.scrollTo(0, 0);
      }
    }

    requestAnimationFrame(stepTop);
  });

  document.querySelectorAll('.progress-fill').forEach((bar, i) => {
    setTimeout(() => {
      bar.style.width = (bar.getAttribute('data-progress') || '0') + '%';
    }, 300 + i * 150);
  });

  document.addEventListener('click', (e) => {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('nav-toggle');
    if (navbar && navToggle && !navbar.contains(e.target) && navToggle.checked) {
      navToggle.checked = false;
    }
  });

  const cadModal = document.getElementById('cadModal');
  const cadViewer = document.getElementById('cadViewer');
  const cadModalTitle = document.getElementById('cadModalTitle');
  const cadModalDesc = document.getElementById('cadModalDesc');
  const cadStatus = document.getElementById('cadStatus');
  const cadOpenButtons = document.querySelectorAll('.js-open-cad');
  const cadCloseButtons = document.querySelectorAll('.js-close-cad');

  if (cadModal && cadViewer && cadModalTitle && cadModalDesc) {
    function openCadModal(button) {
      const title = button.dataset.title || 'CAD Model';
      const model = button.dataset.model || '';
      const poster = button.dataset.poster || '';
      const description = button.dataset.description || 'Interactive 3D viewer.';
      const orbit = button.dataset.orbit || '35deg 70deg 2.5m';
      const fov = button.dataset.fov || '30deg';

      cadModalTitle.textContent = title;
      cadModalDesc.textContent = description;

      if (cadStatus) {
        cadStatus.textContent = `Loading: ${model}`;
      }

      cadViewer.removeAttribute('src');
      cadViewer.removeAttribute('poster');

      requestAnimationFrame(() => {
        cadViewer.setAttribute('src', model);
        cadViewer.setAttribute('poster', poster);
        cadViewer.setAttribute('alt', title);
        cadViewer.setAttribute('camera-orbit', orbit);
        cadViewer.setAttribute('field-of-view', fov);
      });

      cadModal.classList.add('active');
      cadModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeCadModal() {
      cadModal.classList.remove('active');
      cadModal.setAttribute('aria-hidden', 'true');
      cadViewer.removeAttribute('src');
      cadViewer.removeAttribute('poster');
      cadViewer.removeAttribute('alt');
      document.body.style.overflow = '';

      if (cadStatus) {
        cadStatus.textContent = 'Ready.';
      }
    }

    cadOpenButtons.forEach(button => {
      button.addEventListener('click', () => openCadModal(button));
    });

    cadCloseButtons.forEach(button => {
      button.addEventListener('click', closeCadModal);
    });

    cadModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('cad-modal-backdrop')) {
        closeCadModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cadModal.classList.contains('active')) {
        closeCadModal();
      }
    });

    cadViewer.addEventListener('load', () => {
      const currentSrc = cadViewer.getAttribute('src') || '';
      console.log('CAD model loaded:', currentSrc);
      if (cadStatus) {
        cadStatus.textContent = `Loaded: ${currentSrc}`;
      }
    });

    cadViewer.addEventListener('error', (event) => {
      const currentSrc = cadViewer.getAttribute('src') || '';
      console.error('CAD model failed to load:', currentSrc, event);
      if (cadStatus) {
        cadStatus.textContent = `Failed to load: ${currentSrc}`;
      }
    });
  }
});
