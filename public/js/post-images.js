(function () {
  var lightboxSelector = '.post-image-lightbox';
  var imagePattern = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?.*)?(#.*)?$/i;

  function toAbsoluteUrl(value) {
    if (!value) return '';

    try {
      return new URL(value, window.location.href).href;
    } catch (error) {
      return value;
    }
  }

  function isImageUrl(value) {
    return /^data:image\//i.test(value) || imagePattern.test(value);
  }

  function getImageUrl(image) {
    return toAbsoluteUrl(
      image.currentSrc ||
      image.getAttribute('data-src') ||
      image.getAttribute('src')
    );
  }

  function prepareLink(link) {
    link.classList.add('post-image-lightbox');
    link.setAttribute('data-gallery', 'post-images');
  }

  function wrapImage(image) {
    if (image.closest(lightboxSelector)) return;

    var link = image.closest('a');
    if (link) {
      if (isImageUrl(link.getAttribute('href'))) {
        prepareLink(link);
      }

      return;
    }

    var imageUrl = getImageUrl(image);
    if (!imageUrl) return;

    link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('aria-label', image.alt ? 'Open image: ' + image.alt : 'Open image');
    prepareLink(link);

    image.parentNode.insertBefore(link, image);
    link.appendChild(image);
  }

  function initPostImages() {
    var images = document.querySelectorAll('.post-main > .post img');
    if (images.length === 0) return;

    Array.prototype.forEach.call(images, wrapImage);

    if (window.GLightbox) {
      GLightbox({
        selector: lightboxSelector,
        touchNavigation: true,
        keyboardNavigation: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostImages);
  } else {
    initPostImages();
  }
})();
