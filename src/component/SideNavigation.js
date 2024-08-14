import React from 'react';
import { VStack, Button, Icon, Tooltip } from '@chakra-ui/react';
import { FaHome, FaChartLine, FaUsers, FaFileInvoiceDollar } from 'react-icons/fa';

const SideNavigation = ({ activeSection, scrollToSection }) => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <VStack
            position="fixed"
            right="30px"
            top="50%"
            transform="translateY(-50%)"
            spacing={6}
            zIndex={10}
        >
            <Tooltip label="메인으로" placement="left">
                <Button
                    onClick={scrollToTop}
                    colorScheme={activeSection === 'home' ? 'blue' : 'gray'}
                    size="lg"
                    borderRadius="full"
                >
                    <Icon as={FaHome} boxSize={6} />
                </Button>
            </Tooltip>
            <Tooltip label="시장 조사" placement="left">
                <Button
                    onClick={() => scrollToSection('marketSize')}
                    colorScheme={activeSection === 'marketSize' ? 'blue' : 'gray'}
                    size="lg"
                    borderRadius="full"
                >
                    <Icon as={FaChartLine} boxSize={6} />
                </Button>
            </Tooltip>
            <Tooltip label="비즈니스 모델" placement="left">
                <Button
                    onClick={() => scrollToSection('similarServices')}
                    colorScheme={activeSection === 'similarServices' ? 'blue' : 'gray'}
                    size="lg"
                    borderRadius="full"
                >
                    <Icon as={FaUsers} boxSize={6} />
                </Button>
            </Tooltip>
            <Tooltip label="세무 처리" placement="left">
                <Button
                    onClick={() => scrollToSection('accounting')}
                    colorScheme={activeSection === 'accounting' ? 'blue' : 'gray'}
                    size="lg"
                    borderRadius="full"
                >
                    <Icon as={FaFileInvoiceDollar} boxSize={6} />
                </Button>
            </Tooltip>
        </VStack>
    );
};

export default SideNavigation;