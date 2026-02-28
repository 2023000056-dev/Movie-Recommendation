import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { Star, Clock, Calendar, Heart, Share2, Play, Users, Tv, Loader, Languages, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './MoviePage.css';

const TVPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(null);

    useEffect(() => {
        const fetchTV = async () => {
            setLoading(true);
            try {
                const data = await movieService.getTVDetails(id);
                setSeries(data);
                if (data.seasons?.length > 0) setSelectedSeason(data.seasons[0]);

                const favorites = await movieService.getFavorites();
                setIsFavorite(favorites.some(f => f.tmdb_id === parseInt(id)));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTV();
    }, [id]);

    const handleShare = () => {
        const text = `Hey, check out '${series.name}' on CineScope! 🍿 ${window.location.href}`;
        navigator.clipboard.writeText(text);
        alert('Link copied to clipboard! Share it with your friends.');
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            alert('Please login to add shows to your watchlist.');
            return;
        }

        const originalState = isFavorite;
        setIsFavorite(!originalState);

        try {
            if (originalState) {
                await movieService.removeFavorite(series.id);
                alert('Removed from watchlist!');
            } else {
                await movieService.addFavorite(series, 'tv');
                alert('Added to watchlist!');
            }
        } catch (err) {
            console.error('Favorite action failed:', err);
            setIsFavorite(originalState);
            alert('Something went wrong. Please try again.');
        }
    };

    if (loading) return <div className="loading"><Loader className="spin" /></div>;
    if (!series) return <div className="error">Show not found</div>;

    const trailerUrl = movieService.getTrailerUrl(series.videos?.results);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="movie-page fade-in">
            <div className="movie-hero" style={{
                backgroundImage: `url(${movieService.getImageUrl(series.backdrop_path, 'original')})`
            }}>
                <div className="container hero-content">
                    <div className="movie-poster-container">
                        <img src={movieService.getImageUrl(series.poster_path)} alt={series.name} className="main-poster shadow-lg" />
                    </div>

                    <div className="movie-info-main">
                        <h1 className="movie-title">{series.name}</h1>
                        <p className="tagline">{series.tagline}</p>

                        <div className="movie-meta">
                            <span className="rating gold"><Star fill="#facc15" size={18} /> {series.vote_average.toFixed(1)}</span>
                            <span><Tv size={16} /> {series.number_of_seasons} Seasons</span>
                            <span><Calendar size={16} /> {new Date(series.first_air_date).getFullYear()}</span>
                        </div>

                        <div className="genres">
                            {series.genres.map(g => <span key={g.id} className="genre-tag">{g.name}</span>)}
                        </div>

                        <p className="overview">{series.overview}</p>

                        <div className="cta-group">
                            {trailerUrl && (
                                <button className="btn-primary" onClick={() => document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth' })}>
                                    <Play size={18} fill="white" /> Watch Trailer
                                </button>
                            )}
                            {series['watch/providers']?.results?.IN?.link && (
                                <a href={series['watch/providers']?.results?.IN?.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#22c55e', color: 'white' }}>
                                    <Tv size={18} /> Stream Now
                                </a>
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
                        {/* Seasons Selection */}
                        <section className="section">
                            <h2 className="section-title"><Info size={24} /> Seasons</h2>
                            <div className="genres" style={{ flexWrap: 'wrap', gap: '0.8rem', marginBottom: '2rem' }}>
                                {series.seasons.map(s => (
                                    <button
                                        key={s.id}
                                        className={`genre-tag ${selectedSeason?.id === s.id ? 'active' : ''}`}
                                        onClick={() => setSelectedSeason(s)}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {selectedSeason && (
                                    <motion.div
                                        key={selectedSeason.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="season-detail glass"
                                    >
                                        <img src={movieService.getImageUrl(selectedSeason.poster_path)} alt={selectedSeason.name} className="season-poster" />
                                        <div className="season-info">
                                            <h3>{selectedSeason.name}</h3>
                                            <span className="season-meta">Air Date: {selectedSeason.air_date ? new Date(selectedSeason.air_date).toLocaleDateString() : 'N/A'}</span>
                                            <p className="season-overview">{selectedSeason.overview || "No overview available for this season."}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>

                        {/* Cast Section */}
                        <section className="section">
                            <h2 className="section-title"><Users size={24} /> Top Cast</h2>
                            <div className="cast-grid">
                                {series.credits.cast.slice(0, 6).map(person => (
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
                            {series['watch/providers']?.results?.IN?.flatrate?.length > 0 || series['watch/providers']?.results?.US?.flatrate?.length > 0 ? (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Stream</p>
                                    <div className="provider-grid">
                                        {(series['watch/providers']?.results?.IN?.flatrate || series['watch/providers']?.results?.US?.flatrate).map(p => (
                                            <img key={p.provider_id} src={movieService.getImageUrl(p.logo_path, 'w92')} title={p.provider_name} alt={p.provider_name} className="provider-logo" />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Check local streaming lists.</p>
                            )}

                            {series['watch/providers']?.results?.IN?.link && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1rem', fontStyle: 'italic' }}>
                                    Data provided by JustWatch. Link opens TMDB for full platforms.
                                </p>
                            )}
                        </section>

                        <section className="section glass sidebar-section">
                            <h3 className="section-subtitle"><Languages size={20} /> Languages</h3>
                            <div className="genres" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                {series.spoken_languages?.map(lang => (
                                    <span key={lang.iso_639_1} className="genre-tag" style={{ fontSize: '0.8rem' }}>{lang.english_name}</span>
                                ))}
                            </div>
                        </section>

                        <section className="section glass sidebar-section">
                            <h3 className="section-subtitle"><Info size={20} /> Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Status</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{series.status}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Type</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{series.type}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Network</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{series.networks?.[0]?.name}</span>
                                </div>
                            </div>
                        </section>

                        {/* Similar Shows */}
                        <section className="section glass sidebar-section">
                            <h3 className="section-subtitle">More Like This</h3>
                            <div className="similar-mini-grid">
                                {series.similar?.results?.slice(0, 5).map(m => (
                                    <div key={m.id} className="similar-mini-card" onClick={() => window.location.href = `/tv/${m.id}`}>
                                        <div className="mini-poster-wrapper">
                                            <img src={movieService.getImageUrl(m.poster_path, 'w185')} alt={m.name} />
                                        </div>
                                        <div className="mini-meta">
                                            <p className="mini-title" title={m.name}>{m.name}</p>
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

export default TVPage;
