import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { Star, Calendar, MapPin, User, ArrowLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import './PersonPage.css';

const PersonPage = () => {
    const { id } = useParams();
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerson = async () => {
            setLoading(true);
            try {
                const data = await movieService.getPersonDetails(id);
                setPerson(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPerson();
    }, [id]);

    if (loading) return <div className="loading"><Loader className="spin" /></div>;
    if (!person) return <div className="error">Person not found</div>;

    const allCredits = [...(person.movie_credits?.cast || []), ...(person.tv_credits?.cast || [])]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 20);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="person-page container"
        >
            <Link to="/" className="back-btn"><ArrowLeft size={20} /> Back</Link>

            <div className="person-header">
                <div className="person-image-container">
                    <motion.img
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        src={movieService.getImageUrl(person.profile_path, 'h632')}
                        alt={person.name}
                        className="person-image shadow-lg"
                    />
                </div>

                <div className="person-info">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="person-name"
                    >
                        {person.name}
                    </motion.h1>

                    <div className="person-meta">
                        {person.birthday && (
                            <span><Calendar size={18} /> {new Date(person.birthday).toLocaleDateString()}</span>
                        )}
                        {person.place_of_birth && (
                            <span><MapPin size={18} /> {person.place_of_birth}</span>
                        )}
                        <span><User size={18} /> {person.known_for_department}</span>
                    </div>

                    <div className="biography-section">
                        <h3>Biography</h3>
                        <p className="biography-text">
                            {person.biography || "No biography available for this person."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="credits-section">
                <h2 className="section-title">Known For</h2>
                <div className="movie-grid">
                    {allCredits.map((item, index) => (
                        <motion.div
                            key={`${item.id}-${index}`}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <MovieCard movie={item} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default PersonPage;
