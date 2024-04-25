import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';
import { searchImage } from './image-api';

const frm = document.getElementById('search-form');
const searchQuery = document.querySelector('[name=searchQuery]');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader-container');

const per_page = 40;
let page = 1;
let isLoading = false;
let totalHits = 0;
let throttleWait = false;

const lightbox = new SimpleLightbox('.photo-card a', {
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

frm.addEventListener('submit', e => {
  e.preventDefault();
  handleSubmit();
});

function reset() {
  page = 1;
  endResultShown = false;
  clearGallery();
}

function handleSubmit() {
  reset();
  fetchImages().then(count => {
    totalHits = count;
    if (totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        undefined,
        { position: 'right-bottom' }
      );
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }
  });
}

async function fetchImages() {
  return await new Promise((resolve, reject) => {
    searchImage(searchQuery.value, page, per_page)
      .then(res => {
        const { data } = res;
        isLoading = false;
        loader.style.display = 'none';
        data.hits.map(createMarkup);
        page++;
        lightbox.refresh();
        resolve(data.totalHits);
      })
      .catch(e => {
        isLoading = false;
        loader.style.display = 'none';
        reject(e);
      });
  });
}

function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  const div = `<div class="photo-card">
  <a class="photo-link" href="${largeImageURL}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <div class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </div>
    <div class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </div>
    <div class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </div>
    <div class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
    </div>
  </div>
</div>`;
  gallery.innerHTML += div;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function handleScroll() {
  const scrollTop = document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 100 && !isLoading) {
    const endOfResult = (page - 1) * per_page >= totalHits;
    if (endOfResult) {
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }

    isLoading = true;
    loader.style.display = 'flex';

    fetchImages().then(() => {
      scroll();
      new SimpleLightbox('.photo-card a', {
        captionSelector: 'img',
        captionType: 'attr',
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
      });
    });
  }
}

const throttle = (callback, time) => {
  if (throttleWait) return;
  throttleWait = true;

  setTimeout(() => {
    callback();
    throttleWait = false;
  }, time);
};

window.addEventListener('scroll', () => {
  throttle(handleScroll, 500);
});

fetchImages().then(count => {
  totalHits = count;
});
