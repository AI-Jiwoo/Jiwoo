import React from 'react';
import { Box, Container, Heading, SimpleGrid, Text, VStack, Image, Badge, HStack, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaTrophy, FaRocket, FaChartLine } from 'react-icons/fa';

const MotionBox = motion(Box);

const SuccessStoriesSection = () => {
    const successStories = [
        {
            name: "테크스타트 주식회사",
            description: "AI 기반 교육 플랫폼으로 Series B 투자 유치 성공",
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            category: "에듀테크",
            icon: FaRocket
        },
        {
            name: "그린에너지 솔루션즈",
            description: "친환경 에너지 관리 시스템으로 글로벌 시장 진출",
            image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            category: "클린테크",
            icon: FaChartLine
        },
        {
            name: "헬스케어 이노베이션",
            description: "원격 의료 서비스로 연 매출 100억 달성",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            category: "헬스테크",
            icon: FaTrophy
        }
    ];

    return (
        <Box py={8} bg="gray.900">
            <Container maxW="container.xl">
                <VStack spacing={8}>
                    <Heading as="h2" size="xl" color="white" textAlign="center" fontWeight="bold">
                        성공 사례
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} width="full">
                        {successStories.map((story, index) => (
                            <SuccessStory key={index} {...story} />
                        ))}
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
};

const SuccessStory = ({ name, description, image, category, icon }) => (
    <MotionBox
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        bg="rgba(255,255,255,0.1)"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="xl"
        transition="all 0.3s"
    >
        <Image src={image} alt={name} objectFit="cover" h="200px" w="100%" />
        <VStack p={6} align="start" spacing={4}>
            <HStack spacing={4}>
                <Icon as={icon} color="blue.400" boxSize={8} />
                <VStack align="start" spacing={1}>
                    <Heading size="md" color="white">{name}</Heading>
                    <Badge colorScheme="blue" fontSize="sm" fontWeight="bold">{category}</Badge>
                </VStack>
            </HStack>
            <Text fontSize="md" color="gray.300" lineHeight="tall">{description}</Text>
        </VStack>
    </MotionBox>
);

export default SuccessStoriesSection;