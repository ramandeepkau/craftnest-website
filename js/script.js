const carousel = document.getElementById('hamperCarousel');
const prevButton = document.querySelector('.carousel-nav.prev');
const nextButton = document.querySelector('.carousel-nav.next');

function getCarouselStep() {
  const firstItem = carousel?.querySelector('.carousel-item');
  if (!firstItem) return 300;
  return firstItem.getBoundingClientRect().width + 18;
}

if (carousel && prevButton && nextButton) {
  prevButton.addEventListener('click', () => {
    carousel.scrollBy({ left: -getCarouselStep(), behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    const carousel = document.getElementById('hamperCarousel');
    const prevButton = document.querySelector('.carousel-nav.prev');
    const nextButton = document.querySelector('.carousel-nav.next');

    function getCarouselStep() {
      const firstItem = carousel?.querySelector('.carousel-item');
      if (!firstItem) return 300;
      return firstItem.getBoundingClientRect().width + 18;
    }

    if (carousel && prevButton && nextButton) {
      prevButton.addEventListener('click', () => {
        carousel.scrollBy({ left: -getCarouselStep(), behavior: 'smooth' });
      });

      nextButton.addEventListener('click', () => {
        carousel.scrollBy({ left: getCarouselStep(), behavior: 'smooth' });
      });
    }

    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = lightbox?.querySelector('.lightbox-image');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    const previewThumbs = document.querySelectorAll('.preview-thumb');
    const galleryRows = document.querySelectorAll('.gallery-row');

    function getGalleryStep(gallery) {
      const firstItem = gallery?.querySelector('figure');
      if (!firstItem) return 160;
      return firstItem.getBoundingClientRect().width + 12;
    }

    galleryRows.forEach((row) => {
      const gallery = row.querySelector('.product-gallery');
      const galleryPrev = row.querySelector('.gallery-nav.prev');
      const galleryNext = row.querySelector('.gallery-nav.next');

      if (!gallery || !galleryPrev || !galleryNext) return;

      galleryPrev.addEventListener('click', () => {
        gallery.scrollBy({ left: -getGalleryStep(gallery), behavior: 'smooth' });
      });

      galleryNext.addEventListener('click', () => {
        gallery.scrollBy({ left: getGalleryStep(gallery), behavior: 'smooth' });
      });
    });

    function openLightbox(src, alt) {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = src;
      lightboxImage.alt = alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      if (lightboxImage) {
        lightboxImage.src = '';
        lightboxImage.alt = '';
      }
      document.body.style.overflow = '';
    }

    const lightboxPrev = document.querySelector('.lightbox-nav.prev');
    const lightboxNext = document.querySelector('.lightbox-nav.next');
    const lightboxContent = document.getElementById('lightboxContent');

    previewThumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const fullSrc = thumb.getAttribute('data-full');
        const alt = thumb.getAttribute('alt') || 'Hamper preview';
        if (fullSrc) openLightbox(fullSrc, alt);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev && lightboxNext && lightboxContent) {
      lightboxPrev.addEventListener('click', () => {
        lightboxContent.scrollBy({ left: -240, behavior: 'smooth' });
      });

      lightboxNext.addEventListener('click', () => {
        lightboxContent.scrollBy({ left: 240, behavior: 'smooth' });
      });
    }

    lightbox?.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.dataset.close === 'true') {
        closeLightbox();
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    });
      currentIndex = (currentIndex + 1) % currentGallery.length;
      if (lightboxImage) lightboxImage.src = currentGallery[currentIndex];
    }
  }
});
