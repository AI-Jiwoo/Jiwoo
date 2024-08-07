import React from 'react';
import { VStack, Button, Icon } from '@chakra-ui/react';
import { FaChartLine, FaUsers, FaLightbulb } from 'react-icons/fa';

const SideNavigation = ({ activeSection, scrollToSection }) => {
    return (
        <VStack
            position="fixed"
            right="20px"
            top="50%"
            transform="translateY(-50%)"
            spacing={4}
            zIndex={10}
        >
            <Button
                onClick={() => scrollToSection('marketSize')}
                colorScheme={activeSection === 'marketSize' ? 'blue' : 'gray'}
                size="sm"
            >
                <Icon as={FaChartLine} />
            </Button>
            <Button
                onClick={() => scrollToSection('similarServices')}
                colorScheme={activeSection === 'similarServices' ? 'blue' : 'gray'}
                size="sm"
            >
                <Icon as={FaUsers} />
            </Button>
            <Button
                onClick={() => scrollToSection('trendCustomerTechnology')}
                colorScheme={activeSection === 'trendCustomerTechnology' ? 'blue' : 'gray'}
                size="sm"
            >
                <Icon as={FaLightbulb} />
            </Button>
        </VStack>
    );
};

export default SideNavigation;