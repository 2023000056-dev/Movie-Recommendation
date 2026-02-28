import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Film, Heart, LogOut, User, Sun, Moon, Sparkles, Tv, Calendar, Globe } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    window.onscroll = () => {
        setScrolled(window.pageYOffset > 50);
    };

    return (
        <nav className={`navbar glass ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                <Link to="/" className="logo">
                    <Film color="var(--accent-color)" size={32} />
                    <span>CineScope</span>
                </Link>

                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    {user && (
                        <>
                            <Link to="/tv" className="nav-link">
                                <Tv size={18} />
                                TV Shows
                            </Link>
                            <Link to="/upcoming" className="nav-link">
                                <Calendar size={18} />
                                Coming Soon
                            </Link>
                            <Link to="/world-dramas" className="nav-link">
                                <Globe size={18} />
                                World Dramas
                            </Link>
                            <Link to="/favorites" className="nav-link">
                                <Heart size={18} />
                                Favorites
                            </Link>
                        </>
                    )}
                </div>

                <div className="nav-actions">
                    {deferredPrompt && (
                        <button onClick={handleInstall} className="install-btn glass" style={{ padding: '0.5rem 1rem', borderRadius: '10px', color: 'var(--accent-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} /> Install App
                        </button>
                    )}
                    <button onClick={toggleDarkMode} className="theme-toggle">
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="user-menu">
                            <span className="welcome-text">Hi, {user.username}</span>
                            <button onClick={() => { logout(); navigate('/login'); }} className="logout-btn">
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="auth-btns">
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/signup" className="signup-btn btn-primary">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
