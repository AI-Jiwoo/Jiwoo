import React from 'react';
import { VStack, Avatar, Text, Button } from '@chakra-ui/react';
import { FaHome, FaChartLine, FaBusinessTime, FaCalculator, FaRobot } from "react-icons/fa";

const ChSidebar = ({ navigateHome, navigateMarketResearch, navigateBusinessModel, accounting }) => (
    <VStack w="200px" bg="blue.100" p={4} spacing={8} align="stretch">
        <VStack align="center" spacing={4}>
            <Avatar size="xl" icon={<FaRobot />} bg="blue.500" color="white" />
            <Text fontSize="2xl" fontWeight="bold" color="blue.700">Jiwoo AI</Text>
        </VStack>
        <VStack spacing={4} align="stretch">
            <Button leftIcon={<FaHome />} justifyContent="flex-start" variant="ghost" color="blue.700" fontSize="lg" onClick={navigateHome}>
                홈
            </Button>
            <Button leftIcon={<FaChartLine />} justifyContent="flex-start" variant="ghost" color="blue.700" fontSize="lg" onClick={navigateMarketResearch}>
                시장조사
            </Button>
            <Button leftIcon={<FaBusinessTime />} justifyContent="flex-start" variant="ghost" color="blue.700" fontSize="lg" onClick={navigateBusinessModel}>
                비즈니스모델
            </Button>
            <Button leftIcon={<FaCalculator />} justifyContent="flex-start" variant="ghost" color="blue.700" fontSize="lg" onClick={accounting}>
                세무처리
            </Button>
        </VStack>
    </VStack>
);

export default ChSidebar;