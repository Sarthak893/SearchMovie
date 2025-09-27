// TheMovieDB API Service


const BASE_URL = 'https://api.themoviedb.org/3'
// Remove dotenv import — not needed in browser
// dotenv.config() — remove this line

const API_KEY = import.meta.env.VITE_MOVIE_API_KEY;

console.log(API_KEY)

export const tmdbService = {
  // Fetch genres
  async getGenres() {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
      const data = await response.json();
      return data.genres;
    } catch (err) {
      console.error('Error fetching genres:', err);
      return [];
    }
  },

  // Search movies
  async searchMovies(query, page = 1) {
    if (!query.trim()) return { results: [], total_pages: 1, page: 1 };
    
    try {
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`);
      const data = await response.json();
      
      // Transform movie data
      const transformedMovies = data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/300x450/1f2937/ffffff?text=No+Poster',
        description: movie.overview || 'No description available.',
        rating: movie.vote_average,
        genre_ids: movie.genre_ids || [],
        original_language: movie.original_language,
        runtime: movie.runtime || 'N/A',
        director: 'Director info not available via search API'
      }));
      
      return {
        results: transformedMovies,
        total_pages: Math.min(data.total_pages, 500),
        page: data.page
      };
    } catch (err) {
      console.error('Error searching movies:', err);
      throw new Error('Failed to fetch movies');
    }
  },

  // Get movie details
  async getMovieDetails(movieId) {
    try {
      const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`);
      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.status_message || 'Movie not found');
      }
      
      return {
        id: data.id,
        title: data.title,
        year: data.release_date ? new Date(data.release_date).getFullYear() : 'N/A',
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://placehold.co/300x450/1f2937/ffffff?text=No+Poster',
        description: data.overview || 'No description available.',
        rating: data.vote_average,
        genre_ids: data.genres.map(g => g.id),
        original_language: data.original_language,
        runtime: data.runtime || 'N/A',
        director: data.credits?.crew.find(c => c.job === 'Director')?.name || 'Unknown',
        cast: data.credits?.cast.slice(0, 5).map(actor => actor.name) || [],
        budget: data.budget > 0 ? `$${data.budget.toLocaleString()}` : 'Not available',
        revenue: data.revenue > 0 ? `$${data.revenue.toLocaleString()}` : 'Not available',
        popularity: data.popularity ? data.popularity.toFixed(1) : 'N/A',
        status: data.status || 'N/A',
        tagline: data.tagline || ''
      };
    } catch (err) {
      console.error('Error fetching movie details:', err);
      throw new Error('Failed to load movie details');
    }
  },

  // Get popular movies (for featured section)
  async getPopularMovies() {
    try {
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
      const data = await response.json();
      
      return data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/300x450/1f2937/ffffff?text=No+Poster',
        description: movie.overview || 'No description available.',
        rating: movie.vote_average,
        genre_ids: movie.genre_ids || [],
        original_language: movie.original_language,
        runtime: movie.runtime || 'N/A',
        director: 'Director info not available via search API'
      }));
    } catch (err) {
      console.error('Error fetching popular movies:', err);
      return [];
    }
  }
};