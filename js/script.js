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
