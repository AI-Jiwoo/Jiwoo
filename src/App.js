import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PageLayout from './component/common/PageLayout';
import Home from './pages/Home';

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
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;