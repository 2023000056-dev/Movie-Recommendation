import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import { Calendar, Bell, Loader, Info, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Upcoming = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const { user } = useAuth();

    const languages = [
        { code: 'all', name: 'All' },
        { code: 'hi', name: 'Hindi' },
        { code: 'mr', name: 'Marathi' },
        { code: 'en', name: 'English' },
        { code: 'te', name: 'Telugu' },
        { code: 'ta', name: 'Tamil' },
        { code: 'ml', name: 'Malayalam' },
        { code: 'kn', name: 'Kannada' },
        { code: 'pa', name: 'Punjabi' }
    ];

    useEffect(() => {
        const fetchUpcoming = async () => {
            setLoading(true);
            try {
                let data;
                if (selectedLanguage === 'all') {
                    data = await movieService.getUpcoming(1, 'IN');
                } else {
                    data = await movieService.getUpcomingByLanguage(selectedLanguage);
                }

                // Sort by release date
                const sortedMovies = data.results.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
                setMovies(sortedMovies);

                if (user) {
                    const favs = await movieService.getFavorites();
                    setFavorites(favs);
                }

                const savedReminders = JSON.parse(localStorage.getItem('reminders') || '[]');
                setReminders(savedReminders);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUpcoming();
    }, [selectedLanguage]);

    const toggleReminder = (movieId) => {
        let newReminders;
        if (reminders.includes(movieId)) {
            newReminders = reminders.filter(id => id !== movieId);
        } else {
            newReminders = [...reminders, movieId];
            alert("Reminder set! We'll notify you when this movie releases.");
        }
        setReminders(newReminders);
        localStorage.setItem('reminders', JSON.stringify(newReminders));
    };

    const handleToggleFavorite = async (movie) => {
        if (!user) {
            alert('Please login to add favorites');
            return;
        }

        const isFav = favorites.some(f => f.tmdb_id === movie.id);
        try {
            if (isFav) {
                await movieService.removeFavorite(movie.id);
                setFavorites(favorites.filter(f => f.tmdb_id !== movie.id));
            } else {
                await movieService.addFavorite(movie);
                setFavorites([...favorites, { tmdb_id: movie.id, title: movie.title, poster_path: movie.poster_path }]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading && movies.length === 0) return <div className="loading"><Loader className="spin" /></div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="home-page container"
            style={{ paddingTop: '100px' }}
        >
            <div className="hero-section">
                <h1 className="hero-title">
                    Coming <span style={{ color: 'var(--accent-color)' }}>Soon</span>
                </h1>
                <p className="hero-subtitle">
                    Don't miss out on the biggest releases. Set reminders and stay ahead of the curve.
                </p>

                {/* Language Filter */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    padding: '1rem',
                    marginBottom: '2rem'
                }}>
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLanguage(lang.code)}
                            className={`genre-tag ${selectedLanguage === lang.code ? 'active' : ''}`}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '50px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}><Loader className="spin" /></div>
            ) : movies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <Info size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No upcoming movies found for this language.</h3>
                </div>
            ) : (
                <div className="upcoming-grid">
                    {movies.map((movie, index) => (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass"
                            style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative' }}
                        >
                            <div className="upcoming-backdrop">
                                <img src={movieService.getImageUrl(movie.backdrop_path || movie.poster_path, 'w780')} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                                <div className="upcoming-date">
                                    <Calendar size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Returning Soon'}
                                </div>
                                <div className="upcoming-lang">
                                    {movie.original_language.toUpperCase()}
                                </div>
                            </div>
                            <div className="upcoming-info">
                                <h3 className="upcoming-title">{movie.title}</h3>
                                <p className="upcoming-overview">
                                    {movie.overview || 'No description available for this upcoming release.'}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => toggleReminder(movie.id)}
                                        className={`btn-primary ${reminders.includes(movie.id) ? 'active' : ''}`}
                                        style={{ flex: 1, padding: '0.8rem', background: reminders.includes(movie.id) ? '#22c55e' : 'var(--accent-color)' }}
                                    >
                                        <Bell size={18} fill={reminders.includes(movie.id) ? "white" : "none"} />
                                        {reminders.includes(movie.id) ? 'Set Reminder' : 'Remind Me'}
                                    </button>
                                    <button
                                        onClick={() => handleToggleFavorite(movie)}
                                        className={`btn-favorite ${favorites.some(f => f.tmdb_id === movie.id) ? 'active' : ''}`}
                                        style={{ padding: '0.8rem' }}
                                    >
                                        <Heart size={18} fill={favorites.some(f => f.tmdb_id === movie.id) ? "currentColor" : "none"} />
                                    </button>
                                    <Link
                                        to={`/movie/${movie.id}`}
                                        className="btn-favorite"
                                        style={{ padding: '0.8rem' }}
                                    >
                                        <Info size={18} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default Upcoming;
