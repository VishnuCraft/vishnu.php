/*==================================================================
   VISHNU KUMAWAT — PORTFOLIO 2026 JAVASCRIPT
   High Performance (60-120 FPS), Background Music, 3D Tilt & Modals
==================================================================*/

document.addEventListener("DOMContentLoaded", () => {
  initAmbientCanvas();
  initSpotlightAndTilt();
  initBackgroundMusic();
  initTypewriter();
  initHeaderScroll();
  initNavScrollSpy();
  initSkillFilters();
  initProjectFilters();
  initProjectModal();
  initToastNotification();
  initThemeToggle();
  initSkillMeters();
});

/*=============== 1. FAST AMBIENT CANVAS (ZERO LAG) ===============*/
function initAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = { x: -1000, y: -1000, radius: 100 };

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    }, 150);
  }, { passive: true });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
  }, { passive: true });

  let particles = [];
  // Keep particle count low for 120 FPS performance
  const particleCount = Math.min(Math.floor((width * height) / 32000), 40);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.8;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.color = Math.random() > 0.4 ? "rgba(99, 102, 241," : "rgba(6, 182, 212,";
      this.alpha = Math.random() * 0.4 + 0.2;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color} ${this.alpha})`;
      ctx.fill();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 1.2;
        this.y -= (dy / dist) * force * 1.2;
      }
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  createParticles();

  function connectParticles() {
    ctx.lineWidth = 0.6;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 95) {
          let opacity = (1 - dist / 95) * 0.12;
          ctx.strokeStyle = `rgba(129, 140, 248, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectParticles();

    requestAnimationFrame(animate);
  }

  animate();
}

/*=============== 2. ULTRA-FAST SPOTLIGHT & 3D TILT (ZERO LAYOUT THRASHING) ===============*/
function initSpotlightAndTilt() {
  const spotlightCards = document.querySelectorAll(".spotlight-card");
  const mouseSpotlight = document.querySelector(".mouse-spotlight");
  const cursorDot = document.querySelector(".cursor-dot");
  const tiltCard = document.querySelector(".hero__card-3d");

  // A. GPU-accelerated cursor & spotlight tracking via requestAnimationFrame
  let mouseX = -1000, mouseY = -1000;
  let rafPending = false;

  function updateCursor() {
    if (mouseSpotlight) {
      mouseSpotlight.style.transform = `translate3d(${mouseX - 250}px, ${mouseY - 250}px, 0)`;
    }
    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
    }
    rafPending = false;
  }

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateCursor);
    }
  }, { passive: true });

  // B. Card-specific spotlight: Attached ONLY to hovered card! (Eliminates lag completely)
  spotlightCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }, { passive: true });
  });

  // C. 3D Tilt on Hero Visual (Lightweight & smooth)
  if (tiltCard) {
    tiltCard.addEventListener("mousemove", (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;

      const rotateX = (-y / (rect.height / 2)) * 8;
      const rotateY = (x / (rect.width / 2)) * 8;
      tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }, { passive: true });

    tiltCard.addEventListener("mouseleave", () => {
      tiltCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
  }
}

/*=============== 3. AUTOMATIC BACKGROUND MUSIC (INSTANT AUTOPLAY) ===============*/
function initBackgroundMusic() {
  const audio = document.getElementById("bg-audio");
  if (!audio) return;

  const targetVolume = 0.15; // Soft 15% slow ambient sound
  let hasStarted = false;

  function playMusic() {
    if (hasStarted) return;

    audio.muted = false;
    audio.volume = targetVolume;

    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          hasStarted = true;
          // SUCCESS: Music is now playing, clean up interaction listeners
          cleanup();
        })
        .catch(() => {
          // Blocked by browser until user gesture: keep listeners active!
        });
    }
  }

  const triggers = ["click", "pointerdown", "pointerup", "touchstart", "touchend", "keydown", "wheel", "scroll"];

  function handleInteraction() {
    if (!hasStarted) {
      playMusic();
    }
  }

  function cleanup() {
    triggers.forEach((evt) => {
      window.removeEventListener(evt, handleInteraction);
      document.removeEventListener(evt, handleInteraction);
    });
  }

  // 1. Immediate play attempt right on script execution
  playMusic();

  // 2. Play attempt on window load
  window.addEventListener("load", playMusic, { once: true });

  // 3. Attach to all interactions and NEVER remove until playMusic() actually succeeds!
  triggers.forEach((evt) => {
    window.addEventListener(evt, handleInteraction, { passive: true });
    document.addEventListener(evt, handleInteraction, { passive: true });
  });
}

/*=============== 4. TYPEWRITER EFFECT ===============*/
function initTypewriter() {
  const dynamicTextEl = document.getElementById("hero-dynamic-text");
  if (!dynamicTextEl) return;

  const roles = [
    "Full-Stack Laravel & PHP Engineer",
    "React Native Apps (iOS & Android)",
    "WordPress Themes & Custom Plugins",
    "MERN Stack & Scalable Web Systems",
    "Third-Party APIs & Payment Gateways"
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      dynamicTextEl.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35;
    } else {
      dynamicTextEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typingSpeed = 2200;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 350;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/*=============== 5. HEADER BACKGROUND ON SCROLL ===============*/
function initHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY >= 40) {
          header.classList.add("scroll-header");
        } else {
          header.classList.remove("scroll-header");
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/*=============== 6. NAV SCROLL SPY ===============*/
function initNavScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link");

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        sections.forEach((section) => {
          const sectionHeight = section.offsetHeight;
          const sectionTop = section.offsetTop - 120;
          const sectionId = section.getAttribute("id");

          if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach((link) => {
              link.classList.remove("active-link");
              if (link.getAttribute("href") === `#${sectionId}`) {
                link.classList.add("active-link");
              }
            });
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/*=============== 7. SKILL FILTERS & TABS ===============*/
function initSkillFilters() {
  const tabButtons = document.querySelectorAll(".skill-tab-btn");
  const skillCards = document.querySelectorAll(".skill-card");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      skillCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || (category && category.includes(filter))) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/*=============== 8. PROJECT FILTERS ===============*/
function initProjectFilters() {
  const filterBtns = document.querySelectorAll(".work__filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        if (category === "all" || (cardCategory && cardCategory.includes(category))) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/*=============== 9. PROJECT DETAILS MODAL ===============*/
const projectData = {
  cowork: {
    title: "CoworkLibrary — SaaS Platform",
    category: "Full-Stack Web Application • Laravel 11 & Livewire 3",
    banner: "assets/img/cowork-library.jpg",
    description:
      "A comprehensive, production-grade seat reservation and coworking management platform designed to streamline seat allotment, study desks, dynamic pricing, and real-time occupancy tracking for modern shared workspaces.",
    features: [
      "Real-time visual desk & seat selection map with availability statuses",
      "Livewire 3 dynamic search, instant filters, and pagination without full-page reloads",
      "Comprehensive Admin Portal with revenue metrics, member history, and check-in logs",
      "Secure authentication, subscription tiers, and automated billing workflows",
      "Fully responsive mobile-friendly UI crafted with Tailwind CSS & Alpine.js"
    ],
    demoLink: "https://vishnuphp.vercel.app/",
    githubLink: "https://github.com/VishnuCraft"
  },
  apex: {
    title: "Apex CRM — Enterprise Operations",
    category: "SaaS Business Suite • Laravel & MySQL",
    banner: "assets/img/apex-crm.jpg",
    description:
      "A high-throughput enterprise CRM engineered to manage organizational pipelines, customer lifecycle events, automated invoicing, and role-based access control (RBAC) across departments.",
    features: [
      "Multi-tenant data isolation and fine-grained permissions matrix",
      "Interactive analytics graphs showing monthly revenue and lead conversion trends",
      "RESTful API endpoints for seamless third-party CRM and webhook integrations",
      "Automated PDF invoice generation and transaction status tracking",
      "Optimized MySQL schema with indexing for sub-100ms query latency"
    ],
    demoLink: "https://vishnuphp.vercel.app/",
    githubLink: "https://github.com/VishnuCraft"
  },
  nexus: {
    title: "Nexus Gear — High-Speed E-Commerce",
    category: "Full-Stack Commerce • PHP & Stripe API",
    banner: "assets/img/nexus-ecommerce.jpg",
    description:
      "A blazing-fast modern shopping experience featuring real-time product filtering, seamless slide-out cart drawer, inventory management, and one-click checkout.",
    features: [
      "Persistent cart state with responsive slide-out drawer",
      "Stripe payment gateway integration with webhooks and fraud detection",
      "Dynamic catalog filters for price, category, and real-time inventory count",
      "Customer account dashboard with past orders, tracking, and downloadable receipts",
      "SEO-optimized semantic structure and sub-second load times"
    ],
    demoLink: "https://vishnuphp.vercel.app/",
    githubLink: "https://github.com/VishnuCraft"
  },
  portfolio: {
    title: "VishnuCraft — Interactive 3D Portfolio",
    category: "Frontend Experience • Neo-Glassmorphism & Canvas",
    banner: "assets/img/work3.png",
    description:
      "An ultra-premium personal showcase engineered with custom HTML5 particle canvas physics, 3D card tilt dynamics, CSS spotlight borders, and micro-interactions.",
    features: [
      "Custom 60fps HTML5 Canvas constellation mesh reacting to cursor proximity",
      "Spotlight glow following mouse movement across all glassmorphic components",
      "Zero-dependency vanilla architecture for maximum performance and lightning speed",
      "Flawlessly responsive across mobile, tablet, and ultra-wide displays",
      "Ambient background soundtrack with equalizer visualization"
    ],
    demoLink: "https://vishnuphp.vercel.app/",
    githubLink: "https://github.com/VishnuCraft"
  }
};

function initProjectModal() {
  const modalOverlay = document.getElementById("project-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalBanner = document.getElementById("modal-banner");
  const modalTitle = document.getElementById("modal-title");
  const modalCategory = document.getElementById("modal-category");
  const modalDesc = document.getElementById("modal-desc");
  const modalFeatures = document.getElementById("modal-features");
  const modalDemoBtn = document.getElementById("modal-demo-btn");
  const modalGithubBtn = document.getElementById("modal-github-btn");

  const openModalBtns = document.querySelectorAll(".btn-open-modal");

  if (!modalOverlay) return;

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const projectId = btn.getAttribute("data-project");
      const data = projectData[projectId];

      if (data) {
        modalBanner.src = data.banner;
        modalTitle.textContent = data.title;
        modalCategory.textContent = data.category;
        modalDesc.textContent = data.description;

        modalFeatures.innerHTML = data.features
          .map((f) => `<li><i class='bx bx-check-circle'></i> <span>${f}</span></li>`)
          .join("");

        modalDemoBtn.href = data.demoLink;
        modalGithubBtn.href = data.githubLink;

        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  });

  function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      closeModal();
    }
  });
}

/*=============== 10. TOAST NOTIFICATION & COPY EMAIL ===============*/
function initToastNotification() {
  const copyBtn = document.getElementById("copy-email-btn");
  const toast = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");

  if (!copyBtn || !toast) return;

  copyBtn.addEventListener("click", () => {
    const email = "ecmascript.php@gmail.com";

    navigator.clipboard
      .writeText(email)
      .then(() => {
        showToast("Email copied to clipboard! 🚀");
      })
      .catch(() => {
        showToast("Email: ecmascript.php@gmail.com");
      });
  });

  window.showToast = function (message) {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  };
}

/*=============== 11. THEME TOGGLE (LIGHT/DARK) ===============*/
function initThemeToggle() {
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (!themeBtn) return;

  const savedTheme = localStorage.getItem("selected-theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeBtn.innerHTML = "<i class='bx bx-sun'></i>";
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");

    themeBtn.innerHTML = isLight
      ? "<i class='bx bx-sun'></i>"
      : "<i class='bx bx-moon'></i>";

    localStorage.setItem("selected-theme", isLight ? "light" : "dark");
  });
}

/*=============== 12. ANIMATE SKILL METERS ON SCROLL ===============*/
function initSkillMeters() {
  const skillMeters = document.querySelectorAll(".skill-meter-fill");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const targetWidth = entry.target.getAttribute("data-width");
          entry.target.style.width = targetWidth || "85%";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  skillMeters.forEach((meter) => {
    meter.style.width = "0%";
    observer.observe(meter);
  });
}

/* Swiper Testimonials */
if (typeof Swiper !== "undefined") {
  new Swiper(".testimonials__slider", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    grabCursor: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 28,
      },
    },
  });
}

/* Contact form submit feedback */
const contactForm = document.getElementById("portfolio-contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (window.showToast) {
      showToast("Message sent successfully! Thanks for reaching out. ✨");
    }
    contactForm.reset();
  });
}
