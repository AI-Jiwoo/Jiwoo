import { jwtDecode } from "jwt-decode";
import api from "../apis/api";

const BEARER = 'Bearer ';

export const saveToken = (tokens) => {
    if (tokens['access-token']) {
        localStorage.setItem("access-token", tokens['access-token']);
    }
    if (tokens['refresh-token']) {
        localStorage.setItem("refresh-token", tokens['refresh-token']);
    }
}

export const removeToken = () => {
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
}

const getAccessToken = () => localStorage.getItem('access-token');
const getRefreshToken = () => localStorage.getItem('refresh-token');

export const getAccessTokenHeader = () => {
    const token = getAccessToken();
    return token ? `${BEARER}${token}` : null;
}

export const getRefreshTokenHeader = () => {
    const token = getRefreshToken();
    return token ? `${BEARER}${token}` : null;
}

const decodeToken = (token) => {
    if (!token) return null;
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Token decoding error:', error);
        return null;
    }
}

export const isLogin = () => {
    const token = getAccessToken();
    if (!token) return false;
    const decodedToken = decodeToken(token);
    return decodedToken && Date.now() < decodedToken.exp * 1000;
};

export const isTokenExpired = (token) => {
    if (!token) return true;
    const decodedToken = decodeToken(token.replace(BEARER, ''));
    return !decodedToken || decodedToken.exp * 1000 < Date.now();
}

export const refreshToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await api.post('/auth/refresh', { refreshToken });
        const newAccessToken = response.data.accessToken;
        if (newAccessToken) {
            saveToken({ 'access-token': newAccessToken });
            return newAccessToken;
        }
        throw new Error('New access token not received');
    } catch (error) {
        console.error('토큰 리프레시 실패:', error);
        removeToken();
        return null;
    }
};