import React from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { Star, Heart, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import './MovieCard.css';

const MovieCard = ({ movie, isFavorite: initialIsFavorite, onToggleFavorite }) => {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = React.useState(initialIsFavorite);

    // Sync with prop changes
    React.useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    // Determine if it's a TV show or Movie based on available fields
    const isTV = !!movie.first_air_date || !!movie.name || movie.media_type === 'tv';
    const itemTitle = movie.title || movie.name;
    const itemDate = movie.release_date || movie.first_air_date;
    const tmdbId = movie.id || movie.tmdb_id;
    const itemPath = isTV ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('Please login to add favorites');
            return;
        }

        const originalState = isFavorite;
        setIsFavorite(!originalState); // Optimistic update

        try {
            if (onToggleFavorite) {
                await onToggleFavorite(tmdbId);
            } else {
                if (originalState) {
                    await movieService.removeFavorite(tmdbId);
                    alert(`'${itemTitle}' removed from watchlist!`);
                } else {
                    await movieService.addFavorite(movie, isTV ? 'tv' : 'movie');
                    alert(`'${itemTitle}' added to watchlist!`);
                }
            }
        } catch (err) {
            console.error('Favorite action failed:', err);
            setIsFavorite(originalState); // Revert on failure
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Link to={itemPath} className="movie-card">
                <div className="card-image">
                    <img src={movieService.getImageUrl(movie.poster_path)} alt={itemTitle} loading="lazy" />
                    <div className="card-overlay">
                        <div className="overlay-content">
                            <Play size={40} fill="white" />
                        </div>
                    </div>
                    <button
                        className={`favorite-badge ${isFavorite ? 'active' : ''}`}
                        onClick={handleFavoriteClick}
                        title={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    {isTV && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--accent-color)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', zIndex: 10 }}>TV</span>}
                </div>

                <div className="card-info">
                    <div className="card-meta">
                        <span className="card-rating">
                            <Star size={14} fill="#facc15" color="#facc15" />
                            {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                        </span>
                        <span className="card-year">
                            {itemDate ? new Date(itemDate).getFullYear() : 'N/A'}
                        </span>
                    </div>
                    <h3 className="card-title text-truncate">{itemTitle}</h3>
                </div>
            </Link>
        </motion.div>
    );
};

export default MovieCard;

