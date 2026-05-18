const PageTransitions = {
  isTransitioning: false,
  currentPath: window.location.pathname,

  init() {
    this.bindNavLinks();
    this.animatePageIn();
    this.handlePopState();
  },

  bindNavLinks() {
    document.querySelectorAll('.nav-item[href], .dash-card[href]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#' && !link.classList.contains('active')) {
          this.navigate(href);
        }
      });
    });

    const logoutBtn = document.querySelector('.sidebar-footer .btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate('index.html');
      });
    }
  },

  handlePopState() {
    window.addEventListener('popstate', () => {
      const newHash = window.location.hash.slice(1) || 'dashboard.html';
      if (newHash !== this.currentPath && !this.isTransitioning) {
        this.loadPage(newHash, false);
      }
    });
  },

  navigate(href) {
    if (this.isTransitioning || href === this.currentPath) return;
    this.isTransitioning = true;

    window.history.pushState({ path: href }, '', '#' + href);
    this.currentPath = href;

    this.playExitAnimation(() => {
      this.loadPage(href, true);
    });
  },

  loadPage(href, animateIn) {
    const pageName = href.replace('.html', '');

    fetch(href)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const newContent = doc.querySelector('.app-container');
        const newScripts = doc.querySelectorAll('script[src]');
        const newInlineScripts = doc.querySelectorAll('script:not([src])');

        if (newContent) {
          const oldContent = document.querySelector('.app-container');
          if (oldContent) {
            oldContent.replaceWith(newContent);
          }
        }

        this.bindNavLinks();

        if (animateIn) {
          requestAnimationFrame(() => {
            this.animatePageIn();
            this.isTransitioning = false;
          });
        }
      })
      .catch(err => {
        console.error('Page load error:', err);
        window.location.href = href;
      });
  },

  playExitAnimation(callback) {
    const app = document.querySelector('.app-container');
    if (!app) {
      callback();
      return;
    }

    app.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    app.style.opacity = '0';
    app.style.transform = 'scale(0.98)';

    setTimeout(() => {
      callback();
    }, 200);
  },

  animatePageIn() {
    const app = document.querySelector('.app-container');
    if (app) {
      app.style.opacity = '0';
      app.style.transform = 'scale(0.99) translateY(8px)';
      app.style.transition = 'none';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          app.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          app.style.opacity = '1';
          app.style.transform = 'scale(1) translateY(0)';
        });
      });
    }

    const topbar = document.querySelector('.topbar');
    if (topbar) {
      topbar.style.opacity = '0';
      topbar.style.transform = 'translateY(-8px)';
      topbar.style.transition = 'none';
      setTimeout(() => {
        topbar.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        topbar.style.opacity = '1';
        topbar.style.transform = 'translateY(0)';
      }, 80);
    }

    const userBadge = document.querySelector('.user-badge');
    if (userBadge) {
      userBadge.style.opacity = '0';
      userBadge.style.transform = 'scale(0.95)';
      userBadge.style.transition = 'none';
      setTimeout(() => {
        userBadge.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        userBadge.style.opacity = '1';
        userBadge.style.transform = 'scale(1)';
      }, 150);
    }

    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-8px)';
      item.style.transition = 'none';
      setTimeout(() => {
        item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, 120 + i * 50);
    });

    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
      pageContent.style.opacity = '0';
      pageContent.style.transform = 'translateY(12px)';
      pageContent.style.transition = 'none';
      setTimeout(() => {
        pageContent.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        pageContent.style.opacity = '1';
        pageContent.style.transform = 'translateY(0)';
      }, 150);
    }

    this.animateCards();
  },

  animateCards() {
    const cards = document.querySelectorAll('.stat-card, .dash-card, .book-card, .quick-add-book');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = 'none';

      setTimeout(() => {
        card.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 200 + i * 50);
    });
  },

  animateList(container, selector = '.txn-item, .snapshot-item, .best-seller-item, .low-stock-item') {
    const items = container.querySelectorAll(selector);
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(8px)';
      item.style.transition = 'none';

      setTimeout(() => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 250 + i * 60);
    });
  },

  bumpCounter(element) {
    if (!element) return;
    element.classList.remove('bump');
    void element.offsetWidth;
    element.classList.add('bump');
  }
};

const AnimatedCounter = {
  animate(element, target, duration = 600, prefix = '', suffix = '') {
    if (!element) return;
    const start = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;

      if (target % 1 !== 0) {
        element.textContent = prefix + current.toFixed(2) + suffix;
      } else {
        element.textContent = prefix + Math.round(current).toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }
};

const SmoothTheme = {
  toggle() {
    document.documentElement.classList.add('theme-transitioning');
    Theme.toggle();

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 350);
  }
};
