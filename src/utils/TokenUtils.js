import {jwtDecode} from "jwt-decode";

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
    return getAccessToken() && getRefreshToken() && (Date.now() < getDecodeRefreshToken().exp * 1000);
}
