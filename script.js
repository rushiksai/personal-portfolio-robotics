function initApp() {
  // =========================================================
  // HELPERS
  // =========================================================
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        once: true,
        offset: 100
      });
    }
  }

  function refreshLucide(root = document) {
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
      lucide.createIcons({ root });
    }
  }

  function smoothScrollTo(targetElement, duration = 800) {
    const navbar = document.querySelector('.navbar');
    const navHeight = navbar ? navbar.offsetHeight : 80;
    const targetY =
      targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
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

  // =========================================================
  // LIBRARIES
  // =========================================================
  initAOS();
  refreshLucide();

  // =========================================================
  // SMOOTH SCROLL
  // =========================================================
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
        history.pushState(null, '', href);
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

  // =========================================================
  // BACK TO TOP BUTTON
  // =========================================================
  let backToTopBtn = document.getElementById('backToTop');

  if (!backToTopBtn) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i data-lucide="arrow-up"></i>';
    backToTopBtn.id = 'backToTop';
    backToTopBtn.type = 'button';
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
    refreshLucide(backToTopBtn);
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

  // =========================================================
  // PROGRESS BARS
  // =========================================================
  document.querySelectorAll('.progress-fill').forEach((bar, i) => {
    setTimeout(() => {
      bar.style.width = (bar.getAttribute('data-progress') || '0') + '%';
    }, 300 + i * 150);
  });

  // =========================================================
  // CLOSE MOBILE NAV ON OUTSIDE CLICK
  // =========================================================
  document.addEventListener('click', e => {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('nav-toggle');

    if (navbar && navToggle && !navbar.contains(e.target) && navToggle.checked) {
      navToggle.checked = false;
    }
  });

  // =========================================================
  // CAD MODAL
  // =========================================================
  const cadModal = document.getElementById('cadModal');
  const cadViewer = document.getElementById('cadViewer');
  const cadModalTitle = document.getElementById('cadModalTitle');
  const cadModalDesc = document.getElementById('cadModalDesc');
  const cadStatus = document.getElementById('cadStatus');
  const cadOpenButtons = document.querySelectorAll('.js-open-cad');
  const cadCloseButtons = document.querySelectorAll('.js-close-cad');

  if (cadModal && cadViewer && cadModalTitle && cadModalDesc) {
    function openCadModal(button) {
      const lang = document.documentElement.lang || 'en';
      const titleKey = lang === 'de' ? 'data-title-de' : 'data-title';
      const descKey = lang === 'de' ? 'data-description-de' : 'data-description';

      const title =
        button.getAttribute(titleKey) ||
        button.dataset.title ||
        'CAD Model';

      const model = button.dataset.model || '';
      const poster = button.dataset.poster || '';
      const description =
        button.getAttribute(descKey) ||
        button.dataset.description ||
        'Interactive 3D viewer.';
      const orbit = button.dataset.orbit || '35deg 70deg 2.5m';
      const fov = button.dataset.fov || '30deg';

      cadModalTitle.textContent = title;
      cadModalDesc.textContent = description;

      if (cadStatus) {
        cadStatus.textContent =
          lang === 'de' ? `Lade: ${model}` : `Loading: ${model}`;
      }

      cadViewer.removeAttribute('src');
      cadViewer.removeAttribute('poster');

      requestAnimationFrame(() => {
        cadViewer.setAttribute('src', model);
        if (poster) cadViewer.setAttribute('poster', poster);
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
        cadStatus.textContent =
          document.documentElement.lang === 'de' ? 'Bereit.' : 'Ready.';
      }
    }

    cadOpenButtons.forEach(button => {
      button.addEventListener('click', () => openCadModal(button));
    });

    cadCloseButtons.forEach(button => {
      button.addEventListener('click', closeCadModal);
    });

    cadModal.addEventListener('click', e => {
      if (e.target.classList.contains('cad-modal-backdrop')) {
        closeCadModal();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && cadModal.classList.contains('active')) {
        closeCadModal();
      }
    });

    cadViewer.addEventListener('load', () => {
      const currentSrc = cadViewer.getAttribute('src') || '';
      console.log('CAD model loaded:', currentSrc);

      if (cadStatus) {
        cadStatus.textContent =
          document.documentElement.lang === 'de'
            ? `Geladen: ${currentSrc}`
            : `Loaded: ${currentSrc}`;
      }
    });

    cadViewer.addEventListener('error', event => {
      const currentSrc = cadViewer.getAttribute('src') || '';
      console.error('CAD model failed to load:', currentSrc, event);

      if (cadStatus) {
        cadStatus.textContent =
          document.documentElement.lang === 'de'
            ? `Fehler beim Laden: ${currentSrc}`
            : `Failed to load: ${currentSrc}`;
      }
    });
  }

  // =========================================================
  // LANGUAGE SWITCHER
  // =========================================================
  const translations = {
    en: {
      'nav-about': 'About Me',
      'nav-education': 'Education',
      'nav-experience': 'Experience',
      'nav-projects': 'Projects',
      'nav-skills': 'Skills',
      'nav-certifications': 'Certifications',
      'nav-languages': 'Languages',
      'nav-contact': 'Connect',

      'hero-greeting': 'Hello, I am',
      'hero-subtitle': 'Sensors | Robotics | Microsystems',
      'hero-resume': 'View Resume',
      'hero-contact': 'Contact Information',

      'about-title': 'About me: Building Intelligent Robotic Systems',
      'about-p1': "I am currently pursuing my Master's in Control, Microelectronics and Microsystems at the University of Bremen, with a focus on robotics, embedded systems, and computer vision.",
      'about-p2': 'My work combines ROS 2, computer vision, sensor integration, and robotic control systems. I enjoy building systems that bridge hardware and intelligent software for real-world automation.',
      'about-p3': 'Currently, I am working on robotic perception and gaze estimation systems involving ROS 2, Intel RealSense cameras, and Dynamixel actuators.',
      'stat-text-1': 'Robotics Projects',
      'stat-text-2': 'Jazzy & Humble',
      'stat-text-3': 'OpenCV & Vision',
      'stat-text-4': 'Based in Germany',

      'edu-title': 'Education',
      'edu-degree-1': 'M.Sc. – Control, Microelectronics & Microsystems',
      'edu-focus-1': 'Focus: Robotics, Embedded Systems, Computer Vision, Deep Learning Accelerators, Cognitive Robotics',
      'edu-degree-2': 'B.Tech – Electronics & Instrumentation Engineering',
      'edu-focus-2': 'Focus: Sensors, Control Systems, Automation, Instrumentation Engineering, Embedded Electronics',

      'exp-title': 'Experience',
      'exp-label-coursework': 'Current Coursework',
      'exp-label-professional': 'Professional & Research',
      'exp-label-volunteer': 'Volunteer & Leadership',
      'chip-masterprojekt': 'Master Project',
      'chip-volunteer': 'Volunteer',

      'exp-role-coursework': 'M.Sc. – Control, Microelectronics & Microsystems',
      'exp-bullets-coursework': '<li><strong>Intelligent Systems for Marine Robotics</strong> — Autonomy, sensor fusion, and decision-making for underwater robotic platforms.</li><li><strong>Software Engineering for Cognitive Robotics</strong> — Architecture patterns, ROS-based design, and cognitive system integration.</li><li><strong>Architecture &amp; Design Methodologies for Deep Learning</strong> — Hardware-aware DL model design, accelerator architectures, and deployment pipelines.</li>',

      'exp-role-hiwi': 'Student Assistant – Computer Vision Engineer',
      'exp-bullets-hiwi': '<li><strong>Sensor Test Campaigns:</strong> Support preparation and execution of optical sensor measurement tasks; perform structured documentation and verification of findings.</li><li><strong>Data Acquisition &amp; Calibration:</strong> Design and validate camera calibration workflows for accurate spatial mapping and reproducible data logging.</li><li><strong>Algorithm Implementation:</strong> Implement subpixel-level edge detection to improve precision in vision-based measurement systems.</li><li><strong>Technical Troubleshooting:</strong> Evaluate robustness of vision algorithms through controlled lab experiments and systematic debugging of sensor setups.</li>',

      'exp-role-pantilt': 'Pan-Tilt Robotic Head for Gaze Estimation',
      'exp-bullets-pantilt': '<li><strong>Robot Programming:</strong> Programming a 2-DOF pan-tilt robotic sensor head using ROS 2 nodes for real-time sensor processing, coordinate transformations, and actuation control.</li><li><strong>Mechanical Design:</strong> Designing and modelling platform components in Fusion 360 for iterative prototyping and part fabrication.</li><li><strong>Hardware Assembly:</strong> Assembling and configuring the 2-DOF platform with Dynamixel XM430-W350-R servo actuators and integrating all electrical connections.</li><li><strong>Sensor Integration:</strong> Integrating the Intel RealSense D455f depth camera for real-time RGB-D data acquisition within the ROS 2 ecosystem.</li><li><strong>Simulation &amp; Visualisation:</strong> Simulated and validated platform behaviour in Gazebo; monitored real-time joint states and TF transforms in RViz prior to physical deployment.</li>',

      'exp-role-ieee': 'Student Branch Chair – IEEE',
      'exp-bullets-ieee': "<li><strong>Interdisciplinary Leadership:</strong> Led technical symposiums and international conferences (ICMACC'22); coordinated between engineering departments.</li><li><strong>Strategic Initiative:</strong> Founded the IEEE Robotics &amp; Automation Society (RAS) chapter, managing recruitment and technical roadmaps.</li>",

      'proj-title': 'Projects',
      'proj-label-software': 'Software Robotics',
      'proj-label-hardware': 'Hardware Robotics',
      'proj-label-cad': 'CAD Models',
      'proj-title-delivery': 'Autonomous Delivery Robot',
      'proj-desc-delivery': 'ROS 2 autonomous delivery robot using LiDAR, Gazebo, and obstacle-aware navigation for simulated indoor delivery tasks.',
      'proj-title-turtlebot': 'Turtle Bot – Multi-Agent Tracking Simulation',
      'proj-desc-turtlebot': 'ROS 2 turtlesim project for multi-agent tracking using broadcaster and follower nodes with tf-based coordination.',
      'proj-title-opencv': 'OpenCV Image Processing',
      'proj-desc-opencv': 'OpenCV and Python image-processing workflows for feature detection, segmentation, and engineering measurement tasks.',
      'proj-title-wheelchair': 'Modular Wheelchair (Hardware & Mechanics)',
      'proj-desc-wheelchair': 'Adaptive wheelchair prototype with joystick and voice-control modes designed for progressive patient assistance.',
      'proj-title-pantilt': 'Pan-Tilt Robotic Head for Gaze Estimation',
      'proj-desc-pantilt': 'Developed a 2-DOF pan-tilt robotic sensor head for gaze estimation using ROS 2, Fusion 360, Dynamixel actuators, Intel RealSense D455f, and validation in Gazebo and RViz.',

      'cad-title-tplate': 'T Plate Mount',
      'cad-desc-tplate': 'Compact actuator support plate for robotic mounting.',
      'cad-title-xm430': 'XM430 Bracket',
      'cad-desc-xm430': 'Bracket concept for Dynamixel actuator integration.',
      'cad-title-motorplate': 'Motor Plate Final',
      'cad-desc-motorplate': 'Finalized motor support plate for actuator-side mounting and alignment.',
      'cad-title-lext': 'L Extension',
      'cad-desc-lext': 'L-shaped extension bracket for robotic frame connection and modular mounting.',
      'cad-btn-view': 'View CAD',

      'skills-title': 'Skills',
      'skill-cat-1': 'Robotics & ROS',
      'skill-cat-2': 'Computer Vision & AI',
      'skill-cat-3': 'Programming',

      'lang-label': 'LANGUAGES',
      'lang-en': 'English',
      'lang-en-level': 'B2 — Professional',
      'lang-de': 'German',
      'lang-de-level': 'B1 — Intermediate',
      'lang-te': 'Telugu',
      'lang-te-level': 'Native',
      'lang-hi': 'Hindi',
      'lang-hi-level': 'A1 — Basic',

      'connect-title': 'Connect'
    },

    de: {
      'nav-about': 'Über mich',
      'nav-education': 'Ausbildung',
      'nav-experience': 'Erfahrung',
      'nav-projects': 'Projekte',
      'nav-skills': 'Fähigkeiten',
      'nav-certifications': 'Zertifikate',
      'nav-languages': 'Sprachen',
      'nav-contact': 'Kontakt',

      'hero-greeting': 'Hallo, ich bin',
      'hero-subtitle': 'Sensoren | Robotik | Mikrosysteme',
      'hero-resume': 'Lebenslauf ansehen',
      'hero-contact': 'Kontaktinformationen',

      'about-title': 'Über mich: Intelligente Robotersysteme entwickeln',
      'about-p1': 'Ich studiere derzeit meinen Master in Regelungstechnik, Mikroelektronik und Mikrosysteme an der Universität Bremen mit Schwerpunkt Robotik, eingebettete Systeme und Computer Vision.',
      'about-p2': 'Meine Arbeit verbindet ROS 2, Computer Vision, Sensorintegration und robotische Steuerungssysteme. Ich entwickle gerne Systeme, die Hardware und intelligente Software für die reale Automatisierung verbinden.',
      'about-p3': 'Derzeit arbeite ich an Systemen zur robotischen Wahrnehmung und Blickschätzung mit ROS 2, Intel RealSense-Kameras und Dynamixel-Aktuatoren.',
      'stat-text-1': 'Robotik-Projekte',
      'stat-text-2': 'Jazzy & Humble',
      'stat-text-3': 'OpenCV & Vision',
      'stat-text-4': 'In Deutschland',

      'edu-title': 'Ausbildung',
      'edu-degree-1': 'M.Sc. – Regelungstechnik, Mikroelektronik & Mikrosysteme',
      'edu-focus-1': 'Schwerpunkt: Robotik, Eingebettete Systeme, Computer Vision, Deep-Learning-Beschleuniger, Kognitive Robotik',
      'edu-degree-2': 'B.Tech – Elektronik & Messtechnik',
      'edu-focus-2': 'Schwerpunkt: Sensoren, Steuerungssysteme, Automatisierung, Messtechnik, Eingebettete Elektronik',

      'exp-title': 'Erfahrung',
      'exp-label-coursework': 'Aktuelles Studium',
      'exp-label-professional': 'Beruflich & Forschung',
      'exp-label-volunteer': 'Ehrenamt & Führung',
      'chip-masterprojekt': 'Masterprojekt',
      'chip-volunteer': 'Ehrenamt',

      'exp-role-coursework': 'M.Sc. – Regelungstechnik, Mikroelektronik & Mikrosysteme',
      'exp-bullets-coursework': '<li><strong>Intelligente Systeme für die Marine-Robotik</strong> — Autonomie, Sensorfusion und Entscheidungsfindung für Unterwasser-Robotikplattformen.</li><li><strong>Software Engineering für Kognitive Robotik</strong> — Architekturmuster, ROS-basiertes Design und Integration kognitiver Systeme.</li><li><strong>Architektur &amp; Designmethoden für Deep Learning</strong> — Hardware-orientiertes DL-Modelldesign, Beschleunigerarchitekturen und Deployment-Pipelines.</li>',

      'exp-role-hiwi': 'Studentische Hilfskraft – Computer Vision Ingenieur',
      'exp-bullets-hiwi': '<li><strong>Sensortestkampagnen:</strong> Unterstützung bei Vorbereitung und Durchführung optischer Sensormessaufgaben; strukturierte Dokumentation und Verifizierung der Ergebnisse.</li><li><strong>Datenerfassung &amp; Kalibrierung:</strong> Entwurf und Validierung von Kamerakalibrierungs-Workflows für präzise räumliche Kartierung und reproduzierbare Datenprotokollierung.</li><li><strong>Algorithmusimplementierung:</strong> Implementierung von Subpixel-Kantendetektion zur Verbesserung der Präzision in sichtbasierten Messsystemen.</li><li><strong>Technische Fehlerbehebung:</strong> Bewertung der Robustheit von Vision-Algorithmen durch kontrollierte Laborexperimente und systematisches Debugging von Sensor-Setups.</li>',

      'exp-role-pantilt': 'Pan-Tilt-Roboterkopf für Blickschätzung',
      'exp-bullets-pantilt': '<li><strong>Roboterprogrammierung:</strong> Programmierung eines 2-DOF Pan-Tilt-Robotersensorkopfs mit ROS 2-Knoten für Echtzeitsensorverarbeitung, Koordinatentransformationen und Aktuierungssteuerung.</li><li><strong>Mechanisches Design:</strong> Entwurf und Modellierung von Plattformkomponenten in Fusion 360 für iteratives Prototyping und Teilefertigung.</li><li><strong>Hardware-Montage:</strong> Montage und Konfiguration der 2-DOF-Plattform mit Dynamixel XM430-W350-R-Servoaktuatoren und Integration aller elektrischen Verbindungen.</li><li><strong>Sensorintegration:</strong> Integration der Intel RealSense D455f-Tiefenkamera für die Echtzeit-RGB-D-Datenerfassung im ROS 2-Ökosystem.</li><li><strong>Simulation &amp; Visualisierung:</strong> Simulation und Validierung des Plattformverhaltens in Gazebo; Überwachung von Gelenkzuständen und TF-Transformationen in RViz vor dem physischen Einsatz.</li>',

      'exp-role-ieee': 'Studentischer Zweigvorsitzender – IEEE',
      'exp-bullets-ieee': "<li><strong>Interdisziplinäre Führung:</strong> Leitung technischer Symposien und internationaler Konferenzen (ICMACC'22); Koordination zwischen Ingenieurabteilungen.</li><li><strong>Strategische Initiative:</strong> Gründung des IEEE Robotics &amp; Automation Society (RAS)-Kapitels, Verwaltung von Rekrutierung und technischen Roadmaps.</li>",

      'proj-title': 'Projekte',
      'proj-label-software': 'Software-Robotik',
      'proj-label-hardware': 'Hardware-Robotik',
      'proj-label-cad': 'CAD-Modelle',
      'proj-title-delivery': 'Autonomer Lieferroboter',
      'proj-desc-delivery': 'Autonomer ROS 2-Lieferroboter mit LiDAR, Gazebo und hindernisorientierter Navigation für simulierte Innenlieferaufgaben.',
      'proj-title-turtlebot': 'Turtle Bot – Mehrfach-Agenten-Tracking-Simulation',
      'proj-desc-turtlebot': 'ROS 2 Turtlesim-Projekt für Multi-Agenten-Tracking mit Broadcaster- und Follower-Knoten und tf-basierter Koordination.',
      'proj-title-opencv': 'OpenCV Bildverarbeitung',
      'proj-desc-opencv': 'OpenCV- und Python-Bildverarbeitungs-Workflows für Merkmalsdetektion, Segmentierung und messtechnische Aufgaben.',
      'proj-title-wheelchair': 'Modularer Rollstuhl (Hardware & Mechanik)',
      'proj-desc-wheelchair': 'Adaptiver Rollstuhl-Prototyp mit Joystick- und Sprachsteuerungsmodi für progressive Patientenunterstützung.',
      'proj-title-pantilt': 'Pan-Tilt-Roboterkopf für Blickschätzung',
      'proj-desc-pantilt': 'Entwicklung eines 2-DOF Pan-Tilt-Robotersensorkopfs für die Blickschätzung mit ROS 2, Fusion 360, Dynamixel-Aktuatoren, Intel RealSense D455f und Validierung in Gazebo und RViz.',

      'cad-title-tplate': 'T-Platte Halterung',
      'cad-desc-tplate': 'Kompakte Aktuator-Trägerplatte für Robotermontage.',
      'cad-title-xm430': 'XM430 Halterung',
      'cad-desc-xm430': 'Halterungskonzept für Dynamixel-Aktuatorintegration.',
      'cad-title-motorplate': 'Motorplatte Final',
      'cad-desc-motorplate': 'Fertiggestellte Motorträgerplatte für aktuatorseitige Montage und Ausrichtung.',
      'cad-title-lext': 'L-Verlängerung',
      'cad-desc-lext': 'L-förmige Verlängerungshalterung für Roboterrahmenverbindung und modulare Montage.',
      'cad-btn-view': 'CAD ansehen',

      'skills-title': 'Fähigkeiten',
      'skill-cat-1': 'Robotik & ROS',
      'skill-cat-2': 'Computer Vision & KI',
      'skill-cat-3': 'Programmierung',

      'lang-label': 'SPRACHEN',
      'lang-en': 'Englisch',
      'lang-en-level': 'B2 — Fachkundig',
      'lang-de': 'Deutsch',
      'lang-de-level': 'B1 — Mittelstufe',
      'lang-te': 'Telugu',
      'lang-te-level': 'Muttersprache',
      'lang-hi': 'Hindi',
      'lang-hi-level': 'A1 — Grundstufe',

      'connect-title': 'Kontakt'
    }
  };

  let currentLang = 'en';

  window.setLang = function (lang) {
    if (!translations[lang]) return;

    currentLang = lang;
    document.documentElement.lang = lang;

    const t = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });

    const btnEn = document.getElementById('btn-en');
    const btnDe = document.getElementById('btn-de');

    if (btnEn && btnDe) {
      btnEn.classList.toggle('active', lang === 'en');
      btnDe.classList.toggle('active', lang === 'de');
    }

    refreshLucide();
  };

  // Optional: auto-apply current HTML lang if already set
  const initialLang =
    document.documentElement.lang && translations[document.documentElement.lang]
      ? document.documentElement.lang
      : 'en';

  window.setLang(initialLang);
}

// Reliable init pattern
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
