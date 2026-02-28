import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { TrendingUp, Tv, Filter, Mic, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const TVBrowse = () => {
    const [series, setSeries] = useState([]);
    const [trending, setTrending] = useState([]);
    const [genres, setGenres] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const initTV = async () => {
            try {
                const [trendingData, genreData] = await Promise.all([
                    movieService.getTrending('tv'),
                    movieService.getGenres('tv')
                ]);
                setTrending(trendingData.results);
                setSeries(trendingData.results);
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
        initTV();
    }, []);

    const handleSearch = async (query) => {
        if (!query) return;
        setSearching(true);
        try {
            const data = await movieService.searchTV(query);
            setSeries(data.results);
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
            const data = await movieService.getTVByGenre(genreId);
            setSeries(data.results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && series.length === 0) return <div className="loading"><Loader className="spin" /></div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="home-page container"
            style={{ paddingTop: '100px' }}
        >
            <div className="hero-section" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                    The Best <span style={{ color: 'var(--accent-color)' }}>TV Series</span> Collection
                </h1>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            <div className="container">
                <div style={{ marginBottom: '3rem', overflowX: 'auto', display: 'flex', gap: '1rem', paddingBottom: '1rem' }} className="no-scrollbar">
                    <button
                        className={`genre-tag ${selectedGenre === null ? 'active' : ''}`}
                        onClick={() => { setSelectedGenre(null); setSeries(trending); }}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Tv color="var(--accent-color)" />
                    <h2 style={{ fontSize: '1.8rem' }}>{selectedGenre ? genres.find(g => g.id === selectedGenre)?.name : 'Popular Shows'}</h2>
                </div>

                <AnimatePresence mode="wait">
                    {searching ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem' }}><Loader className="spin" /></motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '2.5rem'
                            }}
                        >
                            {series.map(item => (
                                <MovieCard
                                    key={item.id}
                                    movie={item}
                                    isFavorite={favorites.some(f => f.tmdb_id === item.id)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default TVBrowse;
