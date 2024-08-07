import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';
import MainHeader from "./MainHeader";

function PageLayout({ children }) {
    return (
        <Flex flexDirection="column" minHeight="100vh">
            <MainHeader />
            <Box flex="1">
                {children}
            </Box>
            <Footer />
        </Flex>
    );
}

export default PageLayout;