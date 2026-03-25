const html = document.documentElement;

const setTheme = (theme) => {
  html.setAttribute('data-theme', theme);
};

const getActiveTheme = () => html.getAttribute('data-theme') || 'light';

const getThemeIcon = (theme) => (theme === 'dark' ? '☀️' : '🌙');

const getThemeLabel = (theme) =>
  theme === 'dark' ? 'Перемкнути на світлу тему' : 'Перемкнути на темну тему';

const updateThemeButton = (button) => {
  const theme = getActiveTheme();
  button.textContent = getThemeIcon(theme);
  button.setAttribute('aria-label', getThemeLabel(theme));
  button.title = getThemeLabel(theme);
};

const createThemeToggle = () => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';

  button.addEventListener('click', () => {
    const nextTheme = getActiveTheme() === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateThemeButton(button);
  });

  updateThemeButton(button);
  return button;
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
    return;
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }
};

const mountThemeToggle = () => {
  const headers = document.querySelectorAll('header');
  if (headers.length === 0) {
    return;
  }

  headers.forEach((header) => {
    if (header.querySelector('.theme-toggle')) {
      return;
    }

    const actionSlot = header.querySelector('.header-actions') || document.createElement('div');
    if (!actionSlot.classList.contains('header-actions')) {
      actionSlot.className = 'header-actions';
      header.appendChild(actionSlot);
    }

    actionSlot.appendChild(createThemeToggle());
  });
};

const injectSkipLink = () => {
  if (!document.getElementById('main-content')) {
    return;
  }

  if (document.querySelector('.skip-link')) {
    return;
  }

  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Перейти до вмісту';
  skipLink.className = 'skip-link';
  document.body.prepend(skipLink);
};

const initCardAnimations = () => {
  const cards = document.querySelectorAll('.card');
  if (cards.length === 0) {
    return;
  }

  const observerCards = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = `${index * 0.08}s`;
          entry.target.classList.add('animate-in');
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 0.08}s`;
    observerCards.observe(card);
  });
};

const initRipple = () => {
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('button, .btn');
    if (!btn) {
      return;
    }

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 550);
  });
};

const initPaginationGuard = () => {
  document.querySelectorAll('.page-link.disabled').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
};

const initFocusStateHints = () => {
  document.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('focus', () => field.parentNode?.classList.add('focused'));
    field.addEventListener('blur', () => field.parentNode?.classList.remove('focused'));
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  injectSkipLink();
  mountThemeToggle();
  initCardAnimations();
  initRipple();
  initPaginationGuard();
  initFocusStateHints();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
