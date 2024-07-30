import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const signUp = (userData) => {
    return api.post('/auth/signup', userData);
};

// 다른 API 호출 함수들...

export default api;