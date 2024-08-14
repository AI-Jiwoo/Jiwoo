import axios from 'axios';
import {getAccessTokenHeader, isTokenExpired, refreshToken, removeToken} from '../utils/TokenUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // 토큰이 만료되었거나 유효하지 않은 경우
            removeToken();
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 요청 인터셉터
api.interceptors.request.use(
    async (config) => {
        let accessToken = getAccessTokenHeader();
        if (accessToken && isTokenExpired(accessToken)) {
            // 액세스 토큰이 만료된 경우 리프레시 토큰으로 갱신
            const newToken = await refreshToken();
            if (newToken) {
                accessToken = `Bearer ${newToken}`;
            }
        }

        if (accessToken) {
            config.headers['Authorization'] = accessToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (필요한 경우)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 에러 처리 로직
        return Promise.reject(error);
    }
);

export default api;

export const getCurrentApiUrl = () => API_BASE_URL;