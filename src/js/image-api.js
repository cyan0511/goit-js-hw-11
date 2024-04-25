import axios from 'axios';
const API_KEY = '43554291-045e76b825ecd08fdbf56f121';
const API_ENDPOINT = 'https://pixabay.com/api/';

export function searchImage(searchQuery, page, per_page) {
  return axios.get(
    `${API_ENDPOINT}?key=${API_KEY}&q=${searchQuery}&image_type=photo
    &orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`
  );
}

export function fetchCatByBreed(id) {
  const url = `${API_ENDPOINT}images/search?breed_ids=${id}`;
  return axios.get(url);
}
