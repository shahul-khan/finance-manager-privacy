const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('.site-header');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Reading progress and glass navigation state.
const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.innerHTML = '<i></i>';
document.body.appendChild(progress);
const progressBar = progress.querySelector('i');

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = `${percentage}%`;
  if (header) header.classList.toggle('scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

// Scroll-driven real app screen changes.
const steps = [...document.querySelectorAll('.story-step')];
const screens = [...document.querySelectorAll('.app-screen')];
const screenName = document.getElementById('screen-name');
const screenNumber = document.getElementById('screen-number');
const screenCaption = document.querySelector('.screen-caption');
let activeKey = 'dashboard';

function activate(step) {
  const key = step.dataset.screen;
  if (!key || key === activeKey) return;
  activeKey = key;
  steps.forEach(item => item.classList.toggle('active', item === step));
  screens.forEach(screen => screen.classList.toggle('active', screen.dataset.screen === key));
  if (screenCaption) screenCaption.classList.add('switching');
  window.setTimeout(() => {
    if (screenName) screenName.textContent = step.dataset.label || '';
    if (screenNumber) screenNumber.textContent = step.dataset.number || '';
    if (screenCaption) screenCaption.classList.remove('switching');
  }, 150);
}

if (steps.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const candidate = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (candidate) activate(candidate.target);
  }, { threshold: [.25, .45, .65], rootMargin: '-18% 0px -18% 0px' });
  steps.forEach(step => observer.observe(step));
}

// Reveal secondary content as it enters the viewport.
const revealTargets = document.querySelectorAll('.section-heading, .feature-grid article, .security-layout > *, .download-card');
revealTargets.forEach(target => target.classList.add('reveal'));
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  revealTargets.forEach(target => revealObserver.observe(target));
} else {
  revealTargets.forEach(target => target.classList.add('visible'));
}

// Subtle desktop parallax/tilt on the sticky iPhone.
const storyPhone = document.querySelector('.story-phone');
const phoneStage = document.querySelector('.phone-sticky');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (storyPhone && phoneStage && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  phoneStage.addEventListener('mousemove', event => {
    const rect = phoneStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    storyPhone.style.transform = `perspective(1100px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translate3d(0,0,0)`;
  });
  phoneStage.addEventListener('mouseleave', () => {
    storyPhone.style.transform = 'perspective(1100px) rotateY(0) rotateX(0)';
  });
}

// Active navigation link by section.
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const navSections = navAnchors
  .map(anchor => document.querySelector(anchor.getAttribute('href')))
  .filter(Boolean);
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(anchor => {
        anchor.classList.toggle('active', anchor.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  navSections.forEach(section => navObserver.observe(section));
}

// Tactile button ripple.
document.querySelectorAll('.button').forEach(button => {
  button.addEventListener('pointerdown', event => {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 700);
  });
});
