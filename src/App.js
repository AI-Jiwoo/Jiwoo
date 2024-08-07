import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PageLayout from './component/common/PageLayout';
import Home from './pages/Home';
import Login from "./pages/Login";
import Join from "./pages/Join";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";
import { AuthProvider, useAuth } from './context/AuthContext';
import BusinessModel from "./pages/BusinessModel";

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <ChakraProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/main" element={<MainPage />} />
                        <Route path="/market-research" element={<MainPage />} />
                        <Route path="/business-model" element={<BusinessModel/>} />

                            <Route path="/home" element={
                            <PrivateRoute>
                                <PageLayout>
                                    <Home />
                                </PageLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/login" element={
                            <PageLayout>
                                <Login />
                            </PageLayout>
                        } />
                        <Route path="/join" element={
                            <PageLayout>
                                <Join />
                            </PageLayout>
                        } />
                        <Route path="/mypage" element={
                            <PrivateRoute>
                                <PageLayout>
                                    <MyPage/>
                                </PageLayout>
                            </PrivateRoute>
                        } />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ChakraProvider>
    );
}

export default App;