const products = document.querySelectorAll('.product');
const lightbox = document.getElementById('imageLightbox');
const lightboxMediaHost = document.querySelector('.lightbox-media');
const legacyLightboxImage = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-nav.prev');
const lightboxNext = document.querySelector('.lightbox-nav.next');
const isShopPage = document.body.classList.contains('shop-page');

let activeImages = [];
let activeIndex = 0;

const guessMediaType = (src) => (/\.(mp4|mov|webm|m4v)$/i.test(src) ? 'video' : 'image');

const normalizeMediaItems = (rawValue) => {
  let items = [];
  try {
    items = JSON.parse(rawValue || '[]');
  } catch {
    items = [];
  }

  return items
    .map((item) => {
      if (typeof item === 'string') {
        return { type: guessMediaType(item), src: item };
      }

      if (!item || !item.src) return null;
      return {
        type: item.type || guessMediaType(item.src),
        src: item.src,
        poster: item.poster || '',
      };
    })
    .filter(Boolean);
};

const createMediaElement = (media, className, isLightbox = false) => {
  if (media.type === 'video') {
    const video = document.createElement('video');
    video.className = className;
    video.src = media.src;
    if (media.poster) video.poster = media.poster;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (isLightbox) video.controls = true;
    return video;
  }

  const image = document.createElement('img');
  image.className = className;
  image.src = media.src;
  image.alt = isLightbox ? 'Expanded preview' : '';
  return image;
};

const stopMediaPlayback = (container) => {
  if (!container) return;
  container.querySelectorAll('video').forEach((video) => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });
};

const renderMedia = (container, media, className, isLightbox = false) => {
  if (!container || !media) return;
  stopMediaPlayback(container);
  container.innerHTML = '';
  container.appendChild(createMediaElement(media, className, isLightbox));
};

const getLightboxRenderHost = () => {
  if (lightboxMediaHost) return lightboxMediaHost;
  if (legacyLightboxImage && legacyLightboxImage.parentElement) return legacyLightboxImage.parentElement;
  return null;
};

const syncLightboxNavState = () => {
  if (lightboxPrev) lightboxPrev.disabled = activeImages.length === 0 || activeIndex <= 0;
  if (lightboxNext) lightboxNext.disabled = activeImages.length === 0 || activeIndex >= activeImages.length - 1;
};

const updateLightboxImage = (index) => {
  const host = getLightboxRenderHost();
  if (!host || activeImages.length === 0) return;
  activeIndex = Math.max(0, Math.min(index, activeImages.length - 1));
  renderMedia(host, activeImages[activeIndex], 'lightbox-image', true);
  
  // Update dots
  const dots = document.querySelectorAll('.lightbox-dots .lightbox-dot');
  dots.forEach((d) => d.classList.toggle('active', +d.dataset.index === activeIndex));
  
  // Update counter
  const counter = document.querySelector('.lightbox-counter');
  if (counter) {
    counter.textContent = `${activeIndex + 1} of ${activeImages.length}`;
  }
  
  syncLightboxNavState();
};

const openLightbox = (images, index = 0) => {
  if (!lightbox || !getLightboxRenderHost()) return;
  activeImages = images;
  updateLightboxImage(index);
  
  // Generate dots
  const dotsContainer = document.querySelector('.lightbox-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    images.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'lightbox-dot' + (i === index ? ' active' : '');
      dot.dataset.index = i;
      dotsContainer.appendChild(dot);
    });
  }
  
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  if (!lightbox) return;
  stopMediaPlayback(getLightboxRenderHost());
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeImages = [];
  activeIndex = 0;
  syncLightboxNavState();
};

/* ── Lightbox dot click handler ──────────────────────── */
const lightboxDotsContainer = document.querySelector('.lightbox-dots');
if (lightboxDotsContainer) {
  lightboxDotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox-dot')) {
      e.stopPropagation();
      updateLightboxImage(+e.target.dataset.index);
    }
  });
}

/* ── Lightbox arrow click handlers ───────────────────── */
const lightboxArrowLeft = document.querySelector('.lightbox-arrow-left');
const lightboxArrowRight = document.querySelector('.lightbox-arrow-right');

if (lightboxArrowLeft) {
  lightboxArrowLeft.addEventListener('click', (e) => {
    e.stopPropagation();
    updateLightboxImage(activeIndex - 1);
  });
}

if (lightboxArrowRight) {
  lightboxArrowRight.addEventListener('click', (e) => {
    e.stopPropagation();
    updateLightboxImage(activeIndex + 1);
  });
}

/* ── Lightbox swipe/drag navigation ──────────────────── */
let lightboxTouchStartX = 0;
let lightboxTouchDist = 0;
let lightboxIsMouseDown = false;

const lightboxImageWrapper = document.querySelector('.lightbox-image-wrapper');
if (lightboxImageWrapper) {
  // Touch events
  lightboxImageWrapper.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('lightbox-dot')) return;
    lightboxTouchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightboxImageWrapper.addEventListener('touchmove', (e) => {
    if (e.target.classList.contains('lightbox-dot')) return;
    lightboxTouchDist = e.touches[0].clientX - lightboxTouchStartX;
  }, { passive: true });

  lightboxImageWrapper.addEventListener('touchend', () => {
    if (Math.abs(lightboxTouchDist) > 30) {
      if (lightboxTouchDist < 0) updateLightboxImage(activeIndex + 1);
      else updateLightboxImage(activeIndex - 1);
    }
    lightboxTouchDist = 0;
  });

  // Mouse drag events
  lightboxImageWrapper.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('lightbox-dot')) return;
    lightboxIsMouseDown = true;
    lightboxTouchStartX = e.clientX;
  });

  lightboxImageWrapper.addEventListener('mousemove', (e) => {
    if (!lightboxIsMouseDown || e.target.classList.contains('lightbox-dot')) return;
    lightboxTouchDist = e.clientX - lightboxTouchStartX;
  });

  lightboxImageWrapper.addEventListener('mouseup', () => {
    if (Math.abs(lightboxTouchDist) > 30) {
      if (lightboxTouchDist < 0) updateLightboxImage(activeIndex + 1);
      else updateLightboxImage(activeIndex - 1);
    }
    lightboxIsMouseDown = false;
    lightboxTouchDist = 0;
  });

  lightboxImageWrapper.addEventListener('mouseleave', () => {
    lightboxIsMouseDown = false;
    lightboxTouchDist = 0;
  });
}

/* ── Shop page: swipeable dot-carousel cards ─────────── */
if (isShopPage) {
  document.querySelectorAll('.shop-card').forEach((card) => {
    const mediaItems = normalizeMediaItems(card.dataset.media || card.dataset.images || '[]');
    if (mediaItems.length === 0) return;

    const mainMediaHost = card.querySelector('.shop-card-media');
    const dots = card.querySelectorAll('.shop-dot');
    let currentIdx = 0;
    let touchStartX = 0;
    let touchDist = 0;
    let didSwipe = false;

    const showMedia = (idx) => {
      currentIdx = Math.max(0, Math.min(idx, mediaItems.length - 1));
      renderMedia(mainMediaHost, mediaItems[currentIdx], 'shop-card-main', false);
      dots.forEach((d) => d.classList.toggle('active', +d.dataset.index === currentIdx));
    };

    showMedia(0);

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        showMedia(+dot.dataset.index);
      });
    });

    const wrapper = card.querySelector('.shop-card-image-wrapper');
    if (wrapper) {
      wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        didSwipe = false;
      }, { passive: true });

      wrapper.addEventListener('touchmove', (e) => {
        touchDist = e.touches[0].clientX - touchStartX;
        if (Math.abs(touchDist) > 8) didSwipe = true;
      }, { passive: true });

      wrapper.addEventListener('touchend', () => {
        if (didSwipe && Math.abs(touchDist) > 30) {
          showMedia(touchDist < 0 ? currentIdx + 1 : currentIdx - 1);
        }
        touchDist = 0;
      });

      wrapper.addEventListener('click', () => {
        if (!didSwipe) openLightbox(mediaItems, currentIdx);
      });
    }
  });
}

/* ── Homepage: standard product cards ────────────────── */
products.forEach((product) => {
  const mainWrapper = product.querySelector('.product-main-wrapper');
  const mainImage = product.querySelector('.product-main');
  let mediaItems = normalizeMediaItems(product.dataset.media || product.dataset.images || '[]');
  if (mediaItems.length === 0 && mainImage) {
    const fallbackSrc = mainImage.getAttribute('src') || mainImage.src;
    mediaItems = [{ type: guessMediaType(fallbackSrc), src: fallbackSrc }];
  }
  if (!mainImage || mediaItems.length === 0) return;

  const indexFromSrc = (src) => {
    const byRaw = mediaItems.findIndex((item) => item.src === src);
    if (byRaw >= 0) return byRaw;
    const bySuffix = mediaItems.findIndex((item) => src.endsWith(item.src));
    return bySuffix >= 0 ? bySuffix : 0;
  };

  mainImage.addEventListener('click', () => {
    openLightbox(mediaItems, indexFromSrc(mainImage.getAttribute('src') || mainImage.src));
  });

  if (mainWrapper && mediaItems.length > 1 && !isShopPage) {
    const cueButton = document.createElement('button');
    cueButton.type = 'button';
    cueButton.className = 'main-gallery-cue';
    cueButton.setAttribute('aria-label', 'View more gallery images');
    cueButton.textContent = '›';
    cueButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const currentIndex = indexFromSrc(mainImage.getAttribute('src') || mainImage.src);
      openLightbox(mediaItems, Math.min(currentIndex + 1, mediaItems.length - 1));
    });
    mainWrapper.appendChild(cueButton);
  }
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => updateLightboxImage(activeIndex - 1));
lightboxNext?.addEventListener('click', () => updateLightboxImage(activeIndex + 1));
lightbox?.addEventListener('click', (event) => {
  if (event.target.classList.contains('image-lightbox') || event.target.dataset.close === 'true') closeLightbox();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft' && lightbox?.classList.contains('open')) updateLightboxImage(activeIndex - 1);
  if (event.key === 'ArrowRight' && lightbox?.classList.contains('open')) updateLightboxImage(activeIndex + 1);
});

/* ── Mobile nav toggle ──────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

const closeMobileMenu = () => {
  if (!siteNav || !navToggle) return;
  siteNav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.textContent = '☰';
};

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navToggle.textContent = isOpen ? '✕' : '☰';
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMobileMenu();
  });
}

/* ── Subtle scroll reveal ───────────────────────────── */
const revealTargets = document.querySelectorAll(
  'section, .card, .product, .shop-card, .step-card, .testimonial-card, .faq-item, .why-grid > div'
);

if (revealTargets.length > 0) {
  revealTargets.forEach((el) => el.classList.add('reveal-on-scroll'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }
}
