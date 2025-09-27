import React, { useState, useEffect } from 'react';
import { tmdbService } from './services/tmdbService';
import MovieCard from './components/MovieCard';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply theme to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900', 'text-white');
      document.body.classList.remove('bg-gray-50', 'text-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-gray-50', 'text-gray-900');
      document.body.classList.remove('bg-gray-900', 'text-white');
    }
  }, [isDarkMode]);

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const fetchedGenres = await tmdbService.getGenres();
        setGenres(fetchedGenres);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    
    fetchGenres();
  }, []);

  // Fetch featured movies on component mount
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        const movies = await tmdbService.getPopularMovies();
        setFeaturedMovies(movies.slice(0, 8)); // Show 8 featured movies
      } catch (err) {
        console.error('Error fetching featured movies:', err);
      }
    };
    
    fetchFeaturedMovies();
  }, []);

  // Search movies based on query
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      setError(null);
      
      try {
        const { results, total_pages, page } = await tmdbService.searchMovies(searchQuery, 1);
        
        setMovies(results);
        setTotalPages(total_pages);
        setCurrentPage(page);
        setFilteredMovies(results);
      } catch (err) {
        setError(err.message || 'Failed to fetch movies');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get movie details (for modal)
  const openMovieDetails = async (movieId) => {
    setIsLoading(true);
    try {
      const movieDetails = await tmdbService.getMovieDetails(movieId);
      if (movieDetails) {
        setSelectedMovie(movieDetails);
      }
    } catch (err) {
      setError('Failed to load movie details.');
      console.error('Error opening movie details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Close movie details modal
  const closeMovieDetails = () => {
    setSelectedMovie(null);
    setError(null);
  };

  // Filter movies based on search query and filters
  useEffect(() => {
    let filtered = movies;
    
    // Apply genre filter
    if (genreFilter) {
      filtered = filtered.filter(movie => 
        movie.genre_ids.includes(parseInt(genreFilter))
      );
    }
    
    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(movie => 
        movie.year.toString() === yearFilter
      );
    }
    
    // Apply rating filter
    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(movie => 
        movie.rating >= minRating
      );
    }
    
    setFilteredMovies(filtered);
  }, [movies, genreFilter, yearFilter, ratingFilter]);

  // Toggle favorite status
  const toggleFavorite = (movieId) => {
    const isFavorite = favorites.includes(movieId);
    if (isFavorite) {
      setFavorites(favorites.filter(id => id !== movieId));
    } else {
      setFavorites([...favorites, movieId]);
    }
  };

  // Check if movie is favorited
  const isFavorite = (movieId) => {
    return favorites.includes(movieId);
  };

  // Get unique years for filter dropdown
  const getYears = () => {
    const years = [...new Set(movies.map(movie => movie.year))];
    return years.filter(year => year !== 'N/A').sort((a, b) => b - a);
  };

  // Pagination functions
  const goToPage = async (page) => {
    if (page < 1 || page > totalPages) return;
    setIsLoading(true);
    try {
      const { results, total_pages, page: currentPage } = await tmdbService.searchMovies(searchQuery, page);
      setMovies(results);
      setTotalPages(total_pages);
      setCurrentPage(currentPage);
      setFilteredMovies(results);
    } catch (err) {
      setError(err.message || 'Failed to fetch movies');
    } finally {
      setIsLoading(false);
    }
  };

  // Bonus Tip: Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedMovie) {
        closeMovieDetails();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMovie]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`${
        isDarkMode 
          ? 'bg-black/50 backdrop-blur-sm border-b border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
      } py-4 px-4`}>
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-blue-600 to-purple-700'
            }`}>
              <span className="text-lg sm:text-xl">🎬</span>
            </div>
            <h1 className={`text-xl sm:text-3xl font-bold bg-clip-text ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-transparent' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-transparent'
            }`}>
              CineVerse
            </h1>
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-500 hover:to-orange-500'
                : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800'
            }`}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-6 px-4">
        {/* Search Bar */}
        <div className="mb-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search movies by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                  isDarkMode
                    ? 'bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400 border border-gray-600 focus:ring-blue-500'
                    : 'bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 border border-gray-300 focus:ring-blue-600'
                }`}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 transition-colors text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-spin ${
                    isDarkMode ? 'border-2 border-white/30 border-t-white' : 'border-2 border-gray-300 border-t-gray-900'
                  }`}></div>
                  <span className="text-xs sm:text-sm">Searching...</span>
                </div>
              ) : 'Search'}
            </button>
          </form>
        </div>

        {/* Filters - Now placed directly below search bar */}
        <div className={`${
          isDarkMode 
            ? 'bg-black/30 backdrop-blur-sm border border-gray-700' 
            : 'bg-white/50 backdrop-blur-sm border border-gray-300'
        } py-3 px-4 rounded-lg mb-6`}>
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center">
            <label className={`font-medium text-sm sm:text-base whitespace-nowrap ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Filter by:
            </label>
            
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg focus:outline-none focus:ring-2 border text-sm sm:text-base min-w-[120px] ${
                isDarkMode
                  ? 'bg-gray-800/80 backdrop-blur-sm text-white border-gray-600 focus:ring-blue-500'
                  : 'bg-white/80 backdrop-blur-sm text-gray-900 border-gray-300 focus:ring-blue-600'
              }`}
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg focus:outline-none focus:ring-2 border text-sm sm:text-base min-w-[100px] ${
                isDarkMode
                  ? 'bg-gray-800/80 backdrop-blur-sm text-white border-gray-600 focus:ring-blue-500'
                  : 'bg-white/80 backdrop-blur-sm text-gray-900 border-gray-300 focus:ring-blue-600'
              }`}
            >
              <option value="">Any Year</option>
              {getYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg focus:outline-none focus:ring-2 border text-sm sm:text-base min-w-[100px] ${
                isDarkMode
                  ? 'bg-gray-800/80 backdrop-blur-sm text-white border-gray-600 focus:ring-blue-500'
                  : 'bg-white/80 backdrop-blur-sm text-gray-900 border-gray-300 focus:ring-blue-600'
              }`}
            >
              <option value="">Any Rating</option>
              <option value="7.0">≥ 7.0</option>
              <option value="8.0">≥ 8.0</option>
              <option value="8.5">≥ 8.5</option>
              <option value="9.0">≥ 9.0</option>
            </select>
          </div>
        </div>

        {/* Featured Movies Section (shown before search) */}
        {!searchQuery.trim() && (
          <div className="mb-8">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              🔥 Featured Movies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onOpenDetails={openMovieDetails}
                  isFavorite={isFavorite(movie.id)}
                  onToggleFavorite={toggleFavorite}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {error && (
          <div className={`${
            isDarkMode ? 'bg-red-900/50 border border-red-700' : 'bg-red-100 border border-red-300'
          } rounded-lg p-3 sm:p-4 mb-6`}>
            <p className={`${isDarkMode ? 'text-red-200' : 'text-red-800'} text-sm sm:text-base`}>{error}</p>
          </div>
        )}
        
        {isLoading && !selectedMovie && !searchQuery.trim() ? (
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full animate-spin mx-auto mb-3 sm:mb-4 ${
                isDarkMode ? 'border-4 border-blue-500/30 border-t-blue-500' : 'border-4 border-blue-600/30 border-t-blue-600'
              }`}></div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base`}>
                Loading featured movies...
              </p>
            </div>
          </div>
        ) : isLoading && !selectedMovie ? (
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full animate-spin mx-auto mb-3 sm:mb-4 ${
                isDarkMode ? 'border-4 border-blue-500/30 border-t-blue-500' : 'border-4 border-blue-600/30 border-t-blue-600'
              }`}></div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base`}>
                Searching for movies...
              </p>
            </div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className={`text-center py-8 sm:py-12 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {searchQuery || genreFilter || yearFilter || ratingFilter 
              ? "No movies found matching your criteria. Try different filters!" 
              : "Start searching for movies to discover amazing films!"}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onOpenDetails={openMovieDetails}
                  isFavorite={isFavorite(movie.id)}
                  onToggleFavorite={toggleFavorite}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <nav className={`inline-flex rounded-lg shadow-lg ${
                  isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/80 border border-gray-300'
                }`}>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`px-3 sm:px-4 py-1 sm:py-2 rounded-l-lg border-r ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-300'
                    } ${
                      currentPage <= 1 
                        ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') + ' cursor-not-allowed' 
                        : (isDarkMode ? 'text-white hover:bg-gray-700/80' : 'text-gray-900 hover:bg-gray-200/80') + ' transition-colors'
                    } text-sm sm:text-base`}
                  >
                    Previous
                  </button>
                  
                  <div className={`px-3 sm:px-4 py-1 sm:py-2 font-medium text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`px-3 sm:px-4 py-1 sm:py-2 rounded-r-lg ${
                      currentPage >= totalPages 
                        ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') + ' cursor-not-allowed' 
                        : (isDarkMode ? 'text-white hover:bg-gray-700/80' : 'text-gray-900 hover:bg-gray-200/80') + ' transition-colors'
                    } text-sm sm:text-base`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${
          isDarkMode ? 'bg-black/90' : 'bg-gray-900/90'
        }`}>
          <div className={`${
            isDarkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'
          } backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="relative">
              <img 
                src={selectedMovie.poster} 
                alt={selectedMovie.title} 
                className="w-full h-48 sm:h-64 object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/600x800/1f2937/ffffff?text=No+Poster';
                }}
              />
              <button 
                onClick={closeMovieDetails}
                className={`absolute top-2 sm:top-4 right-2 sm:right-4 rounded-full p-2 sm:p-3 hover:bg-black/20 transition-colors backdrop-blur-sm ${
                  isDarkMode ? 'bg-black/50 text-white' : 'bg-white/50 text-gray-900'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Favorite button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(selectedMovie.id);
                }}
                className={`absolute top-2 sm:top-4 left-2 sm:left-4 rounded-full p-2 sm:p-3 hover:bg-black/20 transition-colors backdrop-blur-sm ${
                  isFavorite(selectedMovie.id) 
                    ? 'text-yellow-400' 
                    : isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                {isFavorite(selectedMovie.id) ? '★' : '☆'}
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2 sm:mb-4">
                    <h2 className={`text-xl sm:text-3xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedMovie.title} ({selectedMovie.year})
                    </h2>
                    <div className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full ${
                      isDarkMode ? 'bg-blue-600/20' : 'bg-blue-200'
                    }`}>
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedMovie.rating.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                  
                  {selectedMovie.tagline && (
                    <p className={`text-sm sm:text-lg italic mb-3 sm:mb-6 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>
                      "{selectedMovie.tagline}"
                    </p>
                  )}
                  
                  <div className="mb-3 sm:mb-6">
                    <h3 className={`font-semibold text-base sm:text-lg mb-2 sm:mb-3 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Plot:
                    </h3>
                    <p className={`leading-relaxed text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {selectedMovie.description}
                    </p>
                  </div>
                  
                  <div className="mb-3 sm:mb-6">
                    <h3 className={`font-semibold text-base sm:text-lg mb-2 sm:mb-3 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Genres:
                    </h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {selectedMovie.genre_ids.map(genreId => {
                        const genre = genres.find(g => g.id === genreId);
                        return genre ? (
                          <span key={genre.id} className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          }`}>
                            {genre.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
                
                <div className={`w-full sm:w-72 space-y-3 sm:space-y-4 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <div className={`rounded-lg p-3 sm:p-4 ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}>
                    <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Director
                    </h4>
                    <p className="text-sm sm:text-base">{selectedMovie.director}</p>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}>
                    <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Cast
                    </h4>
                    <p className="text-sm sm:text-base">{selectedMovie.cast.join(', ')}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className={`rounded-lg p-3 sm:p-4 ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Runtime
                      </h4>
                      <p className="text-sm sm:text-base">{selectedMovie.runtime} min</p>
                    </div>
                    
                    <div className={`rounded-lg p-3 sm:p-4 ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Language
                      </h4>
                      <p className="text-sm sm:text-base">{selectedMovie.original_language?.toUpperCase()}</p>
                    </div>
                    
                    <div className={`rounded-lg p-3 sm:p-4 ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Status
                      </h4>
                      <p className="text-sm sm:text-base">{selectedMovie.status}</p>
                    </div>
                    
                    <div className={`rounded-lg p-3 sm:p-4 ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Popularity
                      </h4>
                      <p className="text-sm sm:text-base">{selectedMovie.popularity}</p>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}>
                    <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Budget
                    </h4>
                    <p className="text-sm sm:text-base">{selectedMovie.budget}</p>
                  </div>
                  
                  <div className={`rounded-lg p-3 sm:p-4 ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}>
                    <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Revenue
                    </h4>
                    <p className="text-sm sm:text-base">{selectedMovie.revenue}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4 sm:mt-6">
                <button 
                  onClick={closeMovieDetails}
                  className={`px-4 sm:px-6 py-1 sm:py-2 rounded-lg transition-all duration-200 font-medium shadow-lg text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white'
                  }`}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`${
        isDarkMode 
          ? 'bg-black/50 border-t border-gray-700' 
          : 'bg-white/80 border-t border-gray-200'
      } py-4 sm:py-6 mt-auto backdrop-blur-sm`}>
        <div className="container mx-auto text-center">
          <p className={`text-lg font-semibold mb-1 sm:mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            🎬 CineVerse
          </p>
          <p className={`mb-1 sm:mb-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Powered by TheMovieDB API
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm mt-3">
            <span className={`px-2 sm:px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-200 text-blue-800'
            }`}>
              Favorites System
            </span>
            <span className={`px-2 sm:px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-purple-600/20 text-purple-300' : 'bg-purple-200 text-purple-800'
            }`}>
              ESC to Close
            </span>
            <span className={`px-2 sm:px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-green-600/20 text-green-300' : 'bg-green-200 text-green-800'
            }`}>
              Real-time Search
            </span>
            <span className={`px-2 sm:px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-yellow-600/20 text-yellow-300' : 'bg-yellow-200 text-yellow-800'
            }`}>
              Detailed Info
            </span>
          </div>
          <p className={`mt-3 text-xs sm:text-sm ${
            isDarkMode ? 'text-gray-500' : 'text-gray-600'
          }`}>
            © {new Date().getFullYear()} - All movie data provided by TheMovieDB
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;