import { jwtDecode } from "jwt-decode";
import api from "../apis/api";

const BEARER = 'Bearer ';

export const saveToken = (headers) => {
    localStorage.setItem("access-token", headers['access-token']);
    localStorage.setItem("refresh-token", headers['refresh-token']);
}

export const removeToken = () => {
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
}

const getAccessToken = () => localStorage.getItem('access-token');
const getRefreshToken = () => localStorage.getItem('refresh-token');

export const getAccessTokenHeader = () => BEARER + getAccessToken();
export const getRefreshTokenHeader = () => BEARER + getRefreshToken();

const getDecodeAccessToken = () => jwtDecode(getAccessToken());
const getDecodeRefreshToken = () => jwtDecode(getRefreshToken());

export const isLogin = () => {
    const token = localStorage.getItem('access-token');
    if (!token) return false;
    try {
        const decodedToken = jwtDecode(token);
        return Date.now() < decodedToken.exp * 1000;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};

// 새로 추가된 함수들
export const isTokenExpired = (token) => {
    if (!token) return true;
    const decodedToken = jwtDecode(token.replace(BEARER, ''));
    return decodedToken.exp * 1000 < Date.now();
}

export const refreshToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await api.post('/auth/refresh', { refreshToken });
        const newAccessToken = response.data.accessToken;
        saveToken({ 'access-token': newAccessToken, 'refresh-token': refreshToken });
        return newAccessToken;
    } catch (error) {
        console.error('토큰 리프레시 실패:', error);
        removeToken();
        return null;
    }
};

