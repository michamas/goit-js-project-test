import Notiflix from 'notiflix';
import { _ } from 'lodash';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

//const
const searchForm = document.querySelector('.search-form');
const searchInput = document.getElementById('search-input');
const pictureGallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
loadBtn.style.visibility = 'hidden';

// const footerElement = document.querySelector('.footer');

let previousQuery = null;
let page = 1;
let totalPages = 0;

// initialize simplelightbox
const lightbox = new SimpleLightbox('.photo-card .photo-link');
searchInput.focus();

// function to fetch pictures from Pixabay API
async function fetchImage(query, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '33302175-33178da1359f032779e0154a7',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    // total number of pages of search results
    totalPages = Math.ceil(response.data.totalHits / 40);
    // Display notification acording to the state of reposne
    console.log(response.data);
    if (response.data.totalHits === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    } else if (page === 1) {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }

    return response.data.hits;
  } catch (error) {
    console.log(error);
  }
}

// function to update gallery with fetched pictures
function updateGallery(imageData) {
  let imageHTML = '';
  imageData.forEach(image => {
    imageHTML += `

  
  <div class="photo-card">
  <a href='${image.largeImageURL}' class='photo-link'><img src="${image.previewURL}" alt="${image.tags}" loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes:</b>
      <span>${image.likes}</span>
    </p>
    <p class="info-item">
      <b>Views:</b>
      <span>${image.views}</span>
    </p>
    <p class="info-item">
      <b>Comments:</b>
      <span>${image.comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads:</b>
      <span> ${image.downloads}</span>
    </p>
  </div>
</div>
  `;
  });

  pictureGallery.innerHTML += imageHTML;

  //refhresh simpleligthbox
  lightbox.refresh();

  if (page === 1 && totalPages !== 0 && totalPages > 1) {
    loadBtn.style.visibility = 'visible';
  } else if (totalPages <= 1) {
    loadBtn.style.visibility = 'hidden';
  }
}

// Debounced search function
const debouncedSearch = _.debounce(async function () {
  const query = searchInput.value;

  if (query === previousQuery) {
    return;
  } else {
    pictureGallery.innerHTML = '';
  }

  previousQuery = query;
  page = 1;

  const imageData = await fetchImage(query, page);
  updateGallery(imageData);
}, 200);

// submit form event listener
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  debouncedSearch();
});
// load more button event listener
loadBtn.addEventListener('click', async function () {
  page += 1;
  const imageData = await fetchImage(previousQuery, page);
  updateGallery(imageData);
});
