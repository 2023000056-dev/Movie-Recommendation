import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { Star, Clock, Calendar, Heart, Share2, Play, Users, Tv, Loader, Languages, DollarSign, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './MoviePage.css';

const MoviePage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [fullMovie, setFullMovie] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoading(true);
            try {
                const data = await movieService.getMovieDetails(id);

                // Get similar movies by language and genre
                const langSimilar = await movieService.discover('movie', {
                    with_original_language: data.original_language,
                    with_genres: data.genres.map(g => g.id).join(','),
                    sort_by: 'popularity.desc'
                });

                setMovie({
                    ...data,
                    similar_by_lang: langSimilar.results.filter(m => m.id !== data.id)
                });

                // Check if favorite
                const favorites = await movieService.getFavorites();
                setIsFavorite(favorites.some(f => f.tmdb_id === parseInt(id)));

                // Search Internet Archive for full movie
                const iaResults = await movieService.findFullMovie(data.title, new Date(data.release_date).getFullYear());
                setFullMovie(iaResults);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovieDetails();
    }, [id]);

    const handleShare = () => {
        const text = `Hey, check out '${movie.title}' on CineScope! 🍿 ${window.location.href}`;
        navigator.clipboard.writeText(text);
        alert('Link copied to clipboard! Share it with your friends.');
    };

    const handleToggleFavorite = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!user) {
            alert('Please login to add movies to your watchlist.');
            return;
        }

        const originalState = isFavorite;
        setIsFavorite(!originalState);

        try {
            if (originalState) {
                await movieService.removeFavorite(movie.id);
                alert('Removed from watchlist!');
            } else {
                await movieService.addFavorite(movie, 'movie');
                alert('Added to watchlist!');
            }
        } catch (err) {
            console.error('Favorite action failed:', err);
            setIsFavorite(originalState);
            alert('Something went wrong. Please try again.');
        }
    };

    if (loading) return <div className="loading"><Loader className="spin" /></div>;
    if (!movie) return <div className="error">Movie not found</div>;

    const trailerUrl = movieService.getTrailerUrl(movie.videos?.results);
    const allProviders = movie['watch/providers']?.results;
    const providers = allProviders?.IN || allProviders?.US || {};
    const flatrate = providers.flatrate || [];
    const rent = providers.rent || [];
    const buy = providers.buy || [];
    const watchLink = providers.link;

    const director = movie.credits.crew.find(c => c.job === 'Director');
    const formatCurrency = (amount) => {
        return amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount) : 'N/A';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="movie-page fade-in"
        >
            {/* Hero Section with Backdrop */}
            <div className="movie-hero" style={{
                backgroundImage: `url(${movieService.getImageUrl(movie.backdrop_path, 'original')})`
            }}>
                <div className="container hero-content">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="movie-poster-container"
                    >
                        <img src={movieService.getImageUrl(movie.poster_path)} alt={movie.title} className="main-poster shadow-lg" />
                    </motion.div>

                    <div className="movie-info-main">
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="movie-title"
                        >
                            {movie.title}
                        </motion.h1>
                        <p className="tagline">{movie.tagline}</p>

                        <div className="movie-meta">
                            <span className="rating gold">
                                <Star fill="#facc15" size={18} /> {movie.vote_average.toFixed(1)}
                            </span>
                            <span><Clock size={16} /> {movie.runtime} min</span>
                            <span><Calendar size={16} /> {new Date(movie.release_date).getFullYear()}</span>
                        </div>

                        <div className="genres">
                            {movie.genres.map(g => <span key={g.id} className="genre-tag">{g.name}</span>)}
                        </div>

                        <p className="overview">{movie.overview}</p>

                        <div className="cta-group">
                            {trailerUrl && (
                                <button className="btn-primary" onClick={() => document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth' })}>
                                    <Play size={18} fill="white" /> Watch Trailer
                                </button>
                            )}
                            {watchLink && (
                                <a href={watchLink} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#22c55e', color: 'white' }}>
                                    <Tv size={18} /> Stream Now
                                </a>
                            )}
                            {fullMovie && (
                                <button className="btn-primary" style={{ background: '#7c3aed', color: 'white' }} onClick={() => document.getElementById('full-movie')?.scrollIntoView({ behavior: 'smooth' })}>
                                    <Play size={18} fill="white" /> Free Full Movie
                                </button>
                            )}
                            <button className={`btn-favorite ${isFavorite ? 'active' : ''}`} onClick={handleToggleFavorite}>
                                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                                {isFavorite ? 'In Watchlist' : 'Add to Watchlist'}
                            </button>
                            <button className="btn-favorite" onClick={handleShare}>
                                <Share2 size={18} /> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="movie-grid-details">
                    <div className="main-col">
                        {/* Trailer Section */}
                        {trailerUrl && (
                            <section id="trailer" className="section">
                                <h2 className="section-title"><Play size={24} /> Official Trailer</h2>
                                <div className="video-container glass">
                                    <iframe
                                        src={trailerUrl}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </section>
                        )}

                        {/* Full Movie Section (Internet Archive) */}
                        {fullMovie && (
                            <section id="full-movie" className="section">
                                <h2 className="section-title"><Play size={24} /> Watch Full Movie</h2>
                                <div className="video-container glass" style={{ backgroundColor: '#000' }}>
                                    <iframe
                                        src={fullMovie.embedUrl}
                                        title="Internet Archive Movie Player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center', fontStyle: 'italic' }}>
                                    Free & Legal Stream provided by Archive.org (Internet Archive)
                                </p>
                            </section>
                        )}

                        {/* Cast Section */}
                        <section className="section">
                            <h2 className="section-title"><Users size={24} /> Top Cast</h2>
                            <div className="cast-grid">
                                {movie.credits.cast.slice(0, 6).map(person => (
                                    <Link key={person.id} to={`/person/${person.id}`} className="cast-card glass">
                                        <img src={movieService.getImageUrl(person.profile_path, 'w185')} alt={person.name} />
                                        <div className="cast-info">
                                            <p className="name">{person.name}</p>
                                            <p className="char">{person.character}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="side-col">
                        {/* Watch Providers Section */}
                        <section className="section glass sidebar-section">
                            <h3 className="section-subtitle"><Tv size={20} /> Where to Watch</h3>

                            {flatrate.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Stream</p>
                                    <div className="provider-grid">
                                        {flatrate.map(p => (
                                            <img key={p.provider_id} src={movieService.getImageUrl(p.logo_path, 'w92')} title={p.provider_name} alt={p.provider_name} className="provider-logo" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(rent.length > 0 || buy.length > 0) && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Rent / Buy</p>
                                    <div className="provider-grid">
                                        {[...rent, ...buy].filter((v, i, a) => a.findIndex(t => t.provider_id === v.provider_id) === i).map(p => (
                                            <img key={p.provider_id} src={movieService.getImageUrl(p.logo_path, 'w185')} title={p.provider_name} alt={p.provider_name} className="provider-logo" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!flatrate.length && !rent.length && !buy.length && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Not available for streaming in your region.</p>
                            )}

                            {watchLink && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1rem', fontStyle: 'italic' }}>
                                    Data provided by JustWatch. Link opens TMDB for full platforms.
                                </p>
                            )}
                        </section>

                        {/* Director & Stats */}
                        <section className="section glass sidebar-section">
                            <h3 className="section-subtitle"><Star size={20} /> Visionary</h3>
                            {director && (
                                <Link to={`/person/${director.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                                    <img src={movieService.getImageUrl(director.profile_path, 'w92')} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <div>
                                        <p style={{ fontWeight: '600' }}>{director.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Director</p>
                                    </div>
                                </Link>
                            )}
                        </section>

                        <section className="section glass sidebar-section">
                            <h3 className="section-subtitle"><DollarSign size={20} /> Box Office</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Budget</p>
                                    <p style={{ fontWeight: '600' }}>{formatCurrency(movie.budget)}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Revenue</p>
                                    <p style={{ fontWeight: '600', color: '#22c55e' }}>{formatCurrency(movie.revenue)}</p>
                                </div>
                            </div>
                        </section>

                        {/* Improved Similar Movies */}
                        <section className="section glass sidebar-section">
                            <h3 className="section-subtitle">Similar You Might Like</h3>
                            <div className="similar-mini-grid">
                                {movie.similar_by_lang?.slice(0, 5).map(m => (
                                    <div key={m.id} className="similar-mini-card" onClick={() => window.location.href = `/movie/${m.id}`}>
                                        <div className="mini-poster-wrapper">
                                            <img src={movieService.getImageUrl(m.poster_path, 'w185')} alt={m.title} />
                                        </div>
                                        <div className="mini-meta">
                                            <p className="mini-title" title={m.title}>{m.title}</p>
                                            <span className="rating"><Star size={12} fill="#facc15" stroke="none" /> {m.vote_average.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MoviePage;

