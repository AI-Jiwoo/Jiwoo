import axios from 'axios';
import {getAccessTokenHeader, isTokenExpired, refreshToken, removeToken} from '../utils/TokenUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.124.128.228:5000';
const AI_BASE_URL = process.env.REACT_APP_AI_URL || 'http://13.124.128.228:8001';

const createApiInstance = (baseURL) => {
    const instance = axios.create({ baseURL });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                removeToken();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    instance.interceptors.request.use(
        async (config) => {
            let accessToken = getAccessTokenHeader();
            if (accessToken && isTokenExpired(accessToken)) {
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

    return instance;
};

export const api = createApiInstance(API_BASE_URL);
export const aiApi = createApiInstance(AI_BASE_URL);

export default api;  // 기본 export를 유지하여 기존 import 문을 깨지지 않게 합니다.