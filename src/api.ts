// https://developer.themoviedb.org/reference/movie-now-playing-list
// 이미지 API 참고: https://developer.themoviedb.org/docs/image-basics
// https://api.themoviedb.org/3/movie/now_playing?api_key=c33cd4416575a2635f2ceaa5dec83b09

const API_KEY = "c33cd4416575a2635f2ceaa5dec83b09";
const BASE_PATH = "https://api.themoviedb.org/3/movie";

interface IMovie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
}

export interface IGetMoviesResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  results: Array<IMovie>;
  page: number;
  total_pages: number;
  total_results: number;
}

export function getMovies() {
  return fetch(`${BASE_PATH}/now_playing?api_key=${API_KEY}`).then((response) =>
    response.json()
  );
}
