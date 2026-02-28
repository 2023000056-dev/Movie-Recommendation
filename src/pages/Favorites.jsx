import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import { Heart, Loader } from 'lucide-react';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await movieService.getFavorites();
                setFavorites(data);
            } catch (err) {
                console.error('Error fetching favorites:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (tmdbId) => {
        try {
            await movieService.removeFavorite(tmdbId);
            setFavorites(favorites.filter(f => f.tmdb_id !== tmdbId));
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader className="spin" size={48} />
            </div>
        );
    }

    return (
        <div className="container fade-in" style={{ paddingTop: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <Heart size={32} color="var(--accent-color)" fill="var(--accent-color)" />
                <h1 style={{ fontSize: '2.5rem' }}>My Favorites</h1>
            </div>

            {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: '20px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>You haven't added any movies to your favorites yet.</p>
                </div>
            ) : (
                <div className="movie-grid">
                    {favorites.map(movie => (
                        <MovieCard
                            key={movie.tmdb_id}
                            movie={{
                                id: movie.tmdb_id,
                                title: movie.title,
                                poster_path: movie.poster_path,
                                media_type: movie.media_type
                            }}
                            isFavorite={true}
                            onToggleFavorite={() => handleRemoveFavorite(movie.tmdb_id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
