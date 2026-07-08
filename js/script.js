const products = document.querySelectorAll('.product');
const lightbox = document.getElementById('imageLightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-nav.prev');
const lightboxNext = document.querySelector('.lightbox-nav.next');

let activeImages = [];
let activeIndex = 0;

const syncLightboxNavState = () => {
  const hasImages = activeImages.length > 0;
  if (lightboxPrev) {
    lightboxPrev.disabled = !hasImages || activeIndex <= 0;
  }
  if (lightboxNext) {
    lightboxNext.disabled = !hasImages || activeIndex >= activeImages.length - 1;
  }
};

const updateLightboxImage = (index) => {
  if (!lightboxImage || activeImages.length === 0) return;
  activeIndex = Math.max(0, Math.min(index, activeImages.length - 1));
  lightboxImage.src = activeImages[activeIndex];
  syncLightboxNavState();
};

const openLightbox = (images, index = 0) => {
  if (!lightbox || !lightboxImage) return;
  activeImages = images;
  updateLightboxImage(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeImages = [];
  activeIndex = 0;
  syncLightboxNavState();
};

products.forEach((product) => {
  const mainWrapper = product.querySelector('.product-main-wrapper');
  const mainImage = product.querySelector('.product-main');
  let images = [];

  try {
    images = JSON.parse(product.dataset.images || '[]');
  } catch {
    images = [];
  }

  if (images.length === 0 && mainImage) {
    images = [mainImage.getAttribute('src') || mainImage.src];
  }

  if (!mainImage || images.length === 0) return;

  const indexFromSrc = (src) => {
    const byRaw = images.indexOf(src);
    if (byRaw >= 0) return byRaw;
    const bySuffix = images.findIndex((item) => src.endsWith(item));
    return bySuffix >= 0 ? bySuffix : 0;
  };

  mainImage.addEventListener('click', () => {
    openLightbox(images, indexFromSrc(mainImage.getAttribute('src') || mainImage.src));
  });

  if (mainWrapper && images.length > 1) {
    const cueButton = document.createElement('button');
    cueButton.type = 'button';
    cueButton.className = 'main-gallery-cue';
    cueButton.setAttribute('aria-label', 'View more gallery images');
    cueButton.textContent = '›';

    cueButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const currentIndex = indexFromSrc(mainImage.getAttribute('src') || mainImage.src);
      openLightbox(images, Math.min(currentIndex + 1, images.length - 1));
    });

    mainWrapper.appendChild(cueButton);
  }
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => updateLightboxImage(activeIndex - 1));
lightboxNext?.addEventListener('click', () => updateLightboxImage(activeIndex + 1));
lightbox?.addEventListener('click', (event) => {
  if (event.target.classList.contains('image-lightbox') || event.target.dataset.close === 'true') {
    closeLightbox();
  }
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft' && lightbox?.classList.contains('open')) updateLightboxImage(activeIndex - 1);
  if (event.key === 'ArrowRight' && lightbox?.classList.contains('open')) updateLightboxImage(activeIndex + 1);
});

