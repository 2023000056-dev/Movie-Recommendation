import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/movieService';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        try {
            await movieService.register(formData.username, formData.email, formData.password);
            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '400px', margin: '80px auto', padding: '2rem' }}>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <UserPlus size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '2rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Join CineScope community</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '10px' }}>
                            <User size={18} color="var(--text-secondary)" />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                style={{ background: 'none', color: 'var(--text-primary)', padding: '1rem', width: '100%' }}
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '10px' }}>
                            <Mail size={18} color="var(--text-secondary)" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ background: 'none', color: 'var(--text-primary)', padding: '1rem', width: '100%' }}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '10px' }}>
                            <Lock size={18} color="var(--text-secondary)" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={{ background: 'none', color: 'var(--text-primary)', padding: '1rem', width: '100%' }}
                                placeholder="Create password"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm Password</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '10px' }}>
                            <Lock size={18} color="var(--text-secondary)" />
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                style={{ background: 'none', color: 'var(--text-primary)', padding: '1rem', width: '100%' }}
                                placeholder="Confirm password"
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--accent-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                        Join Now
                    </button>

                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
