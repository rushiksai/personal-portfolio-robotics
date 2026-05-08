document.addEventListener('DOMContentLoaded', () => {

    // --- Initialize Third-Party Libraries ---
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 100 });
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }

    // --- Smooth Scroll Helper ---
    // Uses getBoundingClientRect for accuracy with any nesting level
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
            if (elapsed < duration) requestAnimationFrame(step);
            else window.scrollTo(0, targetY); // snap to exact position at end
        }

        requestAnimationFrame(step);
    }

    // --- Anchor Link Clicks ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return; // skip bare # links
            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            smoothScrollTo(target);

            // Close mobile menu
            const navToggle = document.getElementById('nav-toggle');
            if (navToggle && navToggle.checked) navToggle.checked = false;

            // Update URL hash without jumping
            if (history.pushState) history.pushState(null, null, href);
        });
    });

    // --- Browser back/forward ---
    window.addEventListener('popstate', () => {
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) setTimeout(() => smoothScrollTo(target), 50);
        }
    });

    // --- Back to Top Button ---
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

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

    let scrollTimer = null;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'flex';
                requestAnimationFrame(() => { backToTopBtn.style.opacity = '1'; });
            } else {
                backToTopBtn.style.opacity = '0';
                setTimeout(() => {
                    if (window.pageYOffset <= 300) backToTopBtn.style.display = 'none';
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
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
            window.scrollTo(0, startY * (1 - ease));
            if (elapsed < duration) requestAnimationFrame(stepTop);
            else window.scrollTo(0, 0);
        }
        requestAnimationFrame(stepTop);
    });

    // --- Animate Progress Bars ---
    document.querySelectorAll('.progress-fill').forEach((bar, i) => {
        setTimeout(() => {
            bar.style.width = (bar.getAttribute('data-progress') || '0') + '%';
        }, 300 + i * 150);
    });

    // --- Close mobile menu on outside click ---
    document.addEventListener('click', (e) => {
        const navbar = document.querySelector('.navbar');
        const navToggle = document.getElementById('nav-toggle');
        if (navbar && navToggle && !navbar.contains(e.target) && navToggle.checked) {
            navToggle.checked = false;
        }
    });

});