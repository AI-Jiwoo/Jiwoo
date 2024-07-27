import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PageLayout from './component/common/PageLayout';
import Home from './pages/Home';
import Login from "./pages/Login";
import Join from "./pages/Join";

function App() {
    return (
        <ChakraProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
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
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;