import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    const clearSearch = () => {
        setQuery('');
    };

    return (
        <form className="search-form glass" onSubmit={handleSubmit}>
            <Search className="search-icon" size={20} />
            <input
                type="text"
                placeholder="Search movies, TV shows, actors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />
            {query && (
                <button type="button" onClick={clearSearch} className="clear-btn">
                    <X size={18} />
                </button>
            )}
            <button type="submit" className="search-btn">
                <Search size={18} className="mobile-search-icon" />
                <span>Search</span>
            </button>
        </form>
    );
};

export default SearchBar;
