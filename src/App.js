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

function App() {
    return (
        <ChakraProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/main" element={<MainPage />} />
                    <Route path="/home" element={
                        <PageLayout>
                            <Home />
                        </PageLayout>
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
                        <PageLayout>
                            <MyPage/>
                        </PageLayout>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;