import React from 'react';

const MovieCard = ({ movie, onOpenDetails, isFavorite, onToggleFavorite, isDarkMode }) => {
  const cardClasses = isDarkMode 
    ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50" 
    : "bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-sm";
  
  const textClasses = isDarkMode ? "text-white" : "text-gray-900";
  const descriptionClasses = isDarkMode ? "text-gray-300" : "text-gray-600";
  const hoverClasses = isDarkMode 
    ? "hover:shadow-2xl hover:bg-gray-700/50" 
    : "hover:shadow-lg hover:bg-gray-50/50";

  return (
    <div 
      key={movie.id} 
      className={`${cardClasses} rounded-xl overflow-hidden shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${hoverClasses}`}
      onClick={() => onOpenDetails(movie.id)}
    >
      <div className="relative">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="w-full h-48 sm:h-64 object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300x450/1f2937/ffffff?text=No+Poster';
          }}
        />
        <div className="absolute top-2 right-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(movie.id);
            }}
            className={`text-xl transition-all duration-200 ${
              isFavorite 
                ? 'text-yellow-400 drop-shadow-lg' 
                : isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <h3 className={`text-lg sm:text-xl font-bold ${textClasses} line-clamp-2`}>{movie.title}</h3>
        </div>
        <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 sm:mb-2`}>
          ({movie.year})
        </p>
        <div className="flex items-center mb-1 sm:mb-2">
          <span className="text-yellow-400 mr-1">★</span>
          <span className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {movie.rating.toFixed(1)}
          </span>
        </div>
        <p className={`text-xs sm:text-sm ${descriptionClasses} line-clamp-3`}>{movie.description}</p>
      </div>
    </div>
  );
};

export default MovieCard;