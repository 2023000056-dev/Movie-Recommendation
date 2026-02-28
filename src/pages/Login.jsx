import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem' }}>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <LogIn size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '2rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Login to your CineScope account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '10px' }}>
                            <Mail size={18} color="var(--text-secondary)" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ background: 'none', color: 'var(--text-primary)', padding: '1rem', width: '100%' }}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '10px' }}>
                            <Lock size={18} color="var(--text-secondary)" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ background: 'none', color: 'var(--text-primary)', padding: '1rem', width: '100%' }}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--accent-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                        Login
                    </button>

                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-color)' }}>Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
