const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');

menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu?.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}));

const toast = document.querySelector('.toast');
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async event => {
  const text = event.currentTarget.dataset.copy;
  try {
    await navigator.clipboard.writeText(text);
    event.currentTarget.textContent = 'Copied';
    toast.classList.add('show');
    setTimeout(() => {
      event.currentTarget.textContent = 'Copy';
      toast.classList.remove('show');
    }, 1600);
  } catch {
    event.currentTarget.textContent = 'Copy manually';
  }
}));


// Keep the motion useful: it demonstrates the one command Reflex is built around.
const liveCommand = document.querySelector('#live-command');
const liveResult = document.querySelector('#live-result');
const commandText = '$ reflex run hello.rflx';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function playTerminal() {
  if (!liveCommand || !liveResult) return;
  liveCommand.textContent = '';
  liveResult.textContent = '';
  liveResult.classList.remove('visible');
  if (reduceMotion) {
    liveCommand.textContent = commandText;
    liveResult.textContent = 'Hello, World!';
    liveResult.classList.add('visible');
    return;
  }
  let i = 0;
  const type = () => {
    liveCommand.textContent = commandText.slice(0, i++);
    if (i <= commandText.length) window.setTimeout(type, 35);
    else window.setTimeout(() => {
      liveResult.textContent = 'Hello, World!';
      liveResult.classList.add('visible');
    }, 300);
  };
  type();
}
playTerminal();

// Sections arrive quietly as the reader reaches them. This intentionally adds
// no motion to users who ask for reduced motion in their operating system.
const revealTargets = document.querySelectorAll(
  '.quiet-grid p, .section-title, .language-body, .status-layout > div, .status-list article, .install-section > div, .notes > div, .notes > p, .footer > *'
);
if (reduceMotion) {
  revealTargets.forEach(element => element.classList.add('in-view'));
} else if ('IntersectionObserver' in window) {
  const scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  revealTargets.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 75}ms`);
    scrollObserver.observe(element);
  });
} else {
  revealTargets.forEach(element => element.classList.add('in-view'));
}


// Theme choice follows the system on first visit, then remembers a manual pick.
const themeButton = document.querySelector('.theme-toggle');
function setTheme(theme) {
  const dark = theme === 'dark';
  document.body.classList.toggle('dark', dark);
  if (!themeButton) return;
  themeButton.querySelector('.theme-symbol').textContent = dark ? '☀' : '◐';
  themeButton.querySelector('.theme-label').textContent = dark ? 'Light' : 'Dark';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
}
let savedTheme;
try { savedTheme = localStorage.getItem('reflex-theme'); } catch (_) {}
setTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeButton?.addEventListener('click', () => {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  setTheme(next);
  try { localStorage.setItem('reflex-theme', next); } catch (_) {}
});


// The platform picker only offers actions that are truthful today: a real
// Linux download, an Apple Silicon package guide, and Windows build status.
const platformOptions = {
  windows: { state: 'WINDOWS BUILD PENDING', title: 'Windows installer', description: 'The Reflex Setup wizard is prepared. The download appears here after the Windows build has completed and been tested.', primary: 'View Windows status', primaryHref: 'downloads.html', secondary: 'See installer plan', secondaryHref: 'downloads.html', available: false },
  macos: { state: 'APPLE SILICON', title: 'Build the ARM64 .pkg', description: 'Use an Apple Silicon Mac to create a graphical .pkg installer now. The official download will appear after the package is tested and uploaded.', primary: 'Build Apple Silicon .pkg', primaryHref: 'macos-installer.html', secondary: 'View downloads', secondaryHref: 'downloads.html', available: false },
  linux: { state: 'AVAILABLE NOW', title: 'Debian / Ubuntu package', description: 'Install this tested native package once. Afterwards, use the Reflex command from any terminal to run your own .rflx files.', primary: 'Download .deb', primaryHref: 'downloads/reflex_0.1.0-alpha.1_amd64.deb', secondary: 'Make from source', secondaryHref: 'linux-source.html', available: true }
};
const platformTabs = document.querySelectorAll('[data-install-platform]');
const installState = document.querySelector('#install-state');
const installTitle = document.querySelector('#install-title');
const installDescription = document.querySelector('#install-description');
const installPrimary = document.querySelector('#install-primary');
const installSecondary = document.querySelector('#install-secondary');
platformTabs.forEach(tab => tab.addEventListener('click', () => {
  const option = platformOptions[tab.dataset.installPlatform];
  platformTabs.forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); });
  installState.textContent = option.state;
  installState.classList.toggle('planned', !option.available);
  installTitle.textContent = option.title;
  installDescription.textContent = option.description;
  installPrimary.textContent = option.primary + (option.available ? ' ↓' : ' →');
  installPrimary.href = option.primaryHref;
  if (option.available) installPrimary.setAttribute('download', ''); else installPrimary.removeAttribute('download');
  installSecondary.innerHTML = `${option.secondary} <span>→</span>`;
  installSecondary.href = option.secondaryHref;
}));
