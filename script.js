// Custom cursor
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

function animateCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .poem-card, .feature-card, .purchase-option, .testimonial-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorRing.style.width = '52px';
    cursorRing.style.height = '52px';
    cursorRing.style.borderColor = 'rgba(184,150,110,0.6)';
  });
  el.addEventListener('mouseleave', () => {
    cursorRing.style.width = '32px';
    cursorRing.style.height = '32px';
    cursorRing.style.borderColor = 'rgba(184,150,110,0.4)';
  });
});

// Particles
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let W = window.innerWidth, H = window.innerHeight;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H + H;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedY = -(Math.random() * 0.4 + 0.1);
    this.speedX = (Math.random() - 0.5) * 0.15;
    this.opacity = 0;
    this.maxOpacity = Math.random() * 0.4 + 0.1;
    this.life = 0;
    this.maxLife = Math.random() * 300 + 200;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    const ratio = this.life / this.maxLife;
    if (ratio < 0.2) this.opacity = (ratio / 0.2) * this.maxOpacity;
    else if (ratio > 0.8) this.opacity = ((1 - ratio) / 0.2) * this.maxOpacity;
    else this.opacity = this.maxOpacity;
    if (this.life >= this.maxLife || this.y < -10) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#b8966e';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 60; i++) {
  const p = new Particle();
  p.y = Math.random() * H;
  p.life = Math.floor(Math.random() * p.maxLife);
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Scroll reveal
const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = parseFloat(entry.target.style.transitionDelay) || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay * 1000);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => observer.observe(el));

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const track = document.querySelector('.testimonials-track');
const testimonialCards = track ? Array.from(track.querySelectorAll('.testimonial-card')) : [];
const prevButton = document.querySelector('.testimonial-prev');
const nextButton = document.querySelector('.testimonial-next');
const dotsContainer = document.querySelector('.testimonials-dots');
const currentLabel = document.querySelector('.current-testimonial');

if (track && testimonialCards.length) {
  let activeIndex = 0;

  function scrollToCard(index) {
    const card = testimonialCards[index];
    if (!card) return;

    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left, behavior: 'smooth' });
  }

  function updateDots(index) {
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonial-dot') : [];
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
  }

  function updateActiveCard(index) {
    activeIndex = index;
    testimonialCards.forEach((card, cardIndex) => {
      card.classList.toggle('active', cardIndex === index);
    });

    if (currentLabel) {
      currentLabel.textContent = String(index + 1).padStart(2, '0');
    }

    if (prevButton) prevButton.disabled = index === 0;
    if (nextButton) nextButton.disabled = index === testimonialCards.length - 1;
    updateDots(index);
  }

  function findNearestCard() {
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    testimonialCards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(trackCenter - cardCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    updateActiveCard(nearestIndex);
  }

  if (dotsContainer) {
    testimonialCards.forEach((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonial-dot';
      dot.setAttribute('aria-label', `Go to review ${index + 1}`);
      dot.addEventListener('click', () => {
        updateActiveCard(index);
        scrollToCard(index);
      });
      dotsContainer.appendChild(dot);
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      const nextIndex = Math.max(activeIndex - 1, 0);
      updateActiveCard(nextIndex);
      scrollToCard(nextIndex);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const nextIndex = Math.min(activeIndex + 1, testimonialCards.length - 1);
      updateActiveCard(nextIndex);
      scrollToCard(nextIndex);
    });
  }

  let scrollTimer;
  track.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(findNearestCard, 80);
  });

  window.addEventListener('resize', () => scrollToCard(activeIndex));

  updateActiveCard(0);
  window.requestAnimationFrame(() => scrollToCard(0));
}

