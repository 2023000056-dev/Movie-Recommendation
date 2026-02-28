import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import { Globe, Loader, TrendingUp, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './WorldDramas.css';

const WorldDramas = () => {
    const [dramas, setDramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('KR'); // Default to South Korea (K-Drama)
    const [page, setPage] = useState(1);
    const { user } = useAuth();

    const countries = [
        { code: 'KR', name: 'South Korea', label: 'K-Drama' },
        { code: 'TR', name: 'Turkey', label: 'Turkish' },
        { code: 'JP', name: 'Japan', label: 'J-Drama' },
        { code: 'CN', name: 'China', label: 'C-Drama' },
        { code: 'TH', name: 'Thailand', label: 'Thai' },
        { code: 'IN', name: 'India', label: 'Indian' },
        { code: 'PK', name: 'Pakistan', label: 'Pakistani' },
        { code: 'PH', name: 'Philippines', label: 'Pinoy' },
        { code: 'ES', name: 'Spain', label: 'Spanish' },
        { code: 'GB', name: 'UK', label: 'British' },
        { code: 'FR', name: 'France', label: 'French' },
        { code: 'US', name: 'USA', label: 'American' },
        { code: 'BR', name: 'Brazil', label: 'Brazilian' },
        { code: 'EG', name: 'Egypt', label: 'Arabic' },
    ];

    useEffect(() => {
        fetchDramas();
    }, [selectedCountry, page]);

    const fetchDramas = async () => {
        setLoading(true);
        try {
            const data = await movieService.discover('tv', {
                with_genres: 18, // Drama
                with_origin_country: selectedCountry,
                sort_by: 'popularity.desc',
                page: page
            });
            setDramas(data.results);

            if (user) {
                const favs = await movieService.getFavorites();
                setFavorites(favs);
            }
        } catch (err) {
            console.error('Error fetching world dramas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCountryChange = (code) => {
        setSelectedCountry(code);
        setPage(1);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="world-dramas-page"
            style={{ paddingTop: '100px', minHeight: '100vh' }}
        >
            {/* Hero Section */}
            <div className="hero-section" style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), var(--bg-primary)), url("https://images.unsplash.com/photo-1524712245354-2c4e5e7121ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '6rem 0',
                textAlign: 'center',
                marginBottom: '3rem'
            }}>
                <div className="container">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Globe size={48} color="var(--accent-color)" style={{ marginBottom: '1.5rem', marginInline: 'auto' }} />
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                            World <span style={{ color: 'var(--accent-color)' }}>Dramas</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', maxWidth: '700px', marginInline: 'auto' }}>
                            Explore captivating stories from every corner of the globe. From heart-wrenching K-Dramas to epic Turkish series and beyond.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container">
                {/* Country Filter */}
                <div style={{
                    marginBottom: '3rem',
                    overflowX: 'auto',
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.5rem',
                    paddingBottom: '1.5rem'
                }} className="no-scrollbar">
                    {countries.map(country => (
                        <button
                            key={country.code}
                            className={`genre-tag ${selectedCountry === country.code ? 'active' : ''}`}
                            onClick={() => handleCountryChange(country.code)}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <span>{selectedCountry === country.code ? '🌍' : ''}</span>
                            {country.label}
                        </button>
                    ))}
                </div>

                {/* Section Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <TrendingUp color="var(--accent-color)" />
                        <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>
                            In Demand {countries.find(c => c.code === selectedCountry)?.label}
                        </h2>
                    </div>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}
                        >
                            <Loader className="spin" size={48} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="movie-grid"
                            style={{ marginBottom: '5rem' }}
                        >
                            {dramas.map((drama, index) => (
                                <motion.div
                                    key={drama.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <MovieCard
                                        movie={drama}
                                        isFavorite={favorites.some(f => f.tmdb_id === drama.id)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!loading && dramas.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No dramas found for this region. Try another one!</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default WorldDramas;
