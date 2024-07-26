import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import Layout from '../src/component/common/PageLayout';
import './App.css';

function App() {
    return (
        <ChakraProvider>
            <Box minHeight="100vh" display="flex" flexDirection="column">
                <Layout>
                    <Box flex="1" p={4}>
                        <h1>Welcome to JIWOO</h1>
                        {/* 여기에 메인 콘텐츠를 추가하세요 */}
                    </Box>
                </Layout>
            </Box>
        </ChakraProvider>
    );
}

export default App;