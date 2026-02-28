import axios from 'axios';

// Use relative URLs so Vite proxy can handle them
const BACKEND_URL = '';
const TMDB_PROXY_URL = '/api/tmdb/';

const api = axios.create({
    baseURL: BACKEND_URL,
});

// Interceptor to add auth token and ngrok bypass
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Always add bypass header for ngrok free tier browser warning
    config.headers['ngrok-skip-browser-warning'] = 'any';
    return config;
});

export const movieService = {
    // Auth
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await api.post('/token', formData);
        localStorage.setItem('token', response.data.access_token);
        return response.data;
    },
    register: async (username, email, password) => {
        const response = await api.post('/register', { username, email, password });
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    // Trending
    getTrending: async (type = 'movie', time = 'day', page = 1) => {
        const response = await api.get(`/api/tmdb/trending/${type}/${time}`, { params: { page } });
        return response.data;
    },

    // Search
    searchMovies: async (query, page = 1) => {
        const response = await api.get('/api/tmdb/search/movie', { params: { query, page } });
        return response.data;
    },
    searchTV: async (query, page = 1) => {
        const response = await api.get('/api/tmdb/search/tv', { params: { query, page } });
        return response.data;
    },

    // Details
    getMovieDetails: async (movieId) => {
        const response = await api.get(`/api/tmdb/movie/${movieId}`, {
            params: { append_to_response: 'videos,credits,watch/providers,similar,images' }
        });
        return response.data;
    },
    getTVDetails: async (tvId) => {
        const response = await api.get(`/api/tmdb/tv/${tvId}`, {
            params: { append_to_response: 'videos,credits,watch/providers,similar,images,content_ratings' }
        });
        return response.data;
    },
    getPersonDetails: async (personId) => {
        const response = await api.get(`/api/tmdb/person/${personId}`, {
            params: { append_to_response: 'movie_credits,tv_credits,images' }
        });
        return response.data;
    },

    // Genres
    getGenres: async (type = 'movie') => {
        const response = await api.get(`/api/tmdb/genre/${type}/list`);
        return response.data.genres;
    },
    getMoviesByGenre: async (genreId, page = 1) => {
        const response = await api.get('/api/tmdb/discover/movie', {
            params: { with_genres: genreId, page, sort_by: 'popularity.desc' }
        });
        return response.data;
    },
    getTVByGenre: async (genreId, page = 1) => {
        const response = await api.get('/api/tmdb/discover/tv', {
            params: { with_genres: genreId, page, sort_by: 'popularity.desc' }
        });
        return response.data;
    },

    // Upcoming & Top Rated
    getUpcoming: async (page = 1, region = 'IN') => {
        const response = await api.get('/api/tmdb/movie/upcoming', {
            params: { page, region }
        });
        return response.data;
    },
    getUpcomingByLanguage: async (language, page = 1) => {
        const today = new Date().toISOString().split('T')[0];
        const response = await api.get('/api/tmdb/discover/movie', {
            params: {
                page,
                'primary_release_date.gte': today,
                with_original_language: language,
                sort_by: 'primary_release_date.asc',
                region: 'IN'
            }
        });
        return response.data;
    },
    getTopRated: async (type = 'movie', page = 1) => {
        const response = await api.get(`/api/tmdb/${type}/top_rated`, { params: { page } });
        return response.data;
    },

    // Discovery & General TMDB
    discover: async (type, params) => {
        const response = await api.get(`/api/tmdb/discover/${type}`, { params });
        return response.data;
    },

    // Favorites
    getFavorites: async () => {
        const response = await api.get('/api/favorites');
        return response.data;
    },
    addFavorite: async (item, type = 'movie') => {
        // Handle both movie and tv titles
        const response = await api.post('/api/favorites', {
            tmdb_id: item.id || item.tmdb_id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            media_type: type // We might need to update backend to support media_type
        });
        return response.data;
    },
    removeFavorite: async (tmdbId) => {
        const response = await api.delete(`/api/favorites/${tmdbId}`);
        return response.data;
    },

    // Internet Archive - Full Movies
    findFullMovie: async (title, year) => {
        try {
            // Encode query for IA Advanced Search
            const query = `title:("${title}") AND mediatype:(movies)${year ? ` AND year:(${year})` : ''}`;
            const response = await axios.get(`https://archive.org/advancedsearch.php`, {
                params: {
                    q: query,
                    fl: 'identifier,title,year',
                    output: 'json',
                    rows: 1
                }
            });
            const docs = response.data.response.docs;
            if (docs && docs.length > 0) {
                return {
                    identifier: docs[0].identifier,
                    title: docs[0].title,
                    embedUrl: `https://archive.org/embed/${docs[0].identifier}`
                };
            }
            return null;
        } catch (err) {
            console.error('Internet Archive search failed:', err);
            return null;
        }
    },

    // Helpers
    getImageUrl: (path, size = 'w500') => {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return `https://image.tmdb.org/t/p/${size}${path}`;
    },
    getTrailerUrl: (videos) => {
        if (!videos || videos.length === 0) return null;
        const trailer = videos.find(v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube');
        if (trailer) return `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=0`;
        const anyVideo = videos.find(v => v.site === 'YouTube');
        if (anyVideo) return `https://www.youtube.com/embed/${anyVideo.key}`;
        return null;
    }

};

export default movieService;
