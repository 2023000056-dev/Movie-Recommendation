import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { TrendingUp, Film, Filter, Mic, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [trending, setTrending] = useState([]);
    const [genres, setGenres] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const initHome = async () => {
            try {
                const [trendingData, genreData] = await Promise.all([
                    movieService.getTrending(),
                    movieService.getGenres()
                ]);
                setTrending(trendingData.results.slice(0, 10));
                setMovies(trendingData.results);
                setGenres(genreData);

                if (user) {
                    const favs = await movieService.getFavorites();
                    setFavorites(favs);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        initHome();
    }, []);

    const handleSearch = async (query) => {
        if (!query) return;
        setSearching(true);
        try {
            const data = await movieService.searchMovies(query);
            setMovies(data.results);
            setSelectedGenre(null);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const handleGenreClick = async (genreId) => {
        setLoading(true);
        setSelectedGenre(genreId);
        try {
            const data = await movieService.getMoviesByGenre(genreId);
            setMovies(data.results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceSearch = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSearch(transcript);
        };
    };

    if (loading && movies.length === 0) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader className="spin" /></div>;
    }

    return (
        <div className="home-page fade-in" style={{ paddingTop: '80px' }}>
            {/* Hero Search Section */}
            <div className="hero-section">
                <div className="container">
                    <h1 className="hero-title">
                        Discover Your Next <span style={{ color: 'var(--accent-color)' }}>Favorite</span> Movie
                    </h1>
                    <p className="hero-subtitle">
                        Search millions of movies, trailers, and cast members. Powered by AI recommendations tailored just for you.
                    </p>

                    <div className="search-container">
                        <SearchBar onSearch={handleSearch} />
                        <button onClick={handleVoiceSearch} title="Voice Search" className="voice-search-btn glass">
                            <Mic size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Genre Filter */}
                <div style={{ marginBottom: '3rem', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '1rem' }} className="no-scrollbar">
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className={`genre-tag ${selectedGenre === null ? 'active' : ''}`}
                            onClick={() => { setSelectedGenre(null); setMovies(trending); }}
                        >
                            <TrendingUp size={16} /> Trending
                        </button>
                        {genres.map(genre => (
                            <button
                                key={genre.id}
                                className={`genre-tag ${selectedGenre === genre.id ? 'active' : ''}`}
                                onClick={() => handleGenreClick(genre.id)}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Movie Grid */}
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Film color="var(--accent-color)" />
                    <h2 style={{ fontSize: '1.8rem' }}>{selectedGenre ? genres.find(g => g.id === selectedGenre)?.name : 'Popular Movies'}</h2>
                </div>

                {searching ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><Loader className="spin" /></div>
                ) : (
                    <div className="movie-grid">
                        {movies.map(movie => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                isFavorite={favorites.some(f => f.tmdb_id === movie.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
