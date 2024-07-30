import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const memoizedSetUser = useCallback((newUser) => {
        setUser(newUser);
    }, []);

    useEffect(() => {
        const checkLoggedIn = () => {
            const accessToken = localStorage.getItem('access-token');
            const refreshToken = localStorage.getItem('refresh-token');
            if (accessToken && refreshToken) {
                try {
                    const decodedToken = jwtDecode(accessToken);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp > currentTime) {
                        memoizedSetUser({ email: decodedToken.email });
                    } else {
                        // 토큰이 만료된 경우
                        localStorage.removeItem('access-token');
                        localStorage.removeItem('refresh-token');
                        memoizedSetUser(null);
                    }
                } catch (error) {
                    console.error('Invalid token:', error);
                    localStorage.removeItem('access-token');
                    localStorage.removeItem('refresh-token');
                    memoizedSetUser(null);
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, [memoizedSetUser]);

    return (
        <AuthContext.Provider value={{ user, setUser: memoizedSetUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);