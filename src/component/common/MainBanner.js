import React from 'react';
import { Box, Text, Flex, VStack, HStack, Image, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@chakra-ui/icons';

function MainBanner() {
    const features = [
        { title: "창업 가이드", description: "AI 기반 맞춤형 창업 전략", icon: "path/to/icon1.png" },
        { title: "비즈니스 모델", description: "혁신적인 비즈니스 모델 설계", icon: "path/to/icon2.png" },
        { title: "세무 처리", description: "간편한 세무 관리 솔루션", icon: "path/to/icon3.png" },
        { title: "시장 조사", description: "AI 기반 시장 트렌드 분석", icon: "path/to/icon4.png" },
    ];

    return (
        <Box
            bg="linear-gradient(to right, #000428, #004e92)"
            color="white"
            py={20}
            position="relative"
            overflow="hidden"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Flex maxWidth="1200px" margin="auto" flexDirection="column">
                    <VStack align="flex-start" spacing={6} mb={12}>
                        <Text fontSize="6xl" fontWeight="bold" lineHeight="1.2">
                            JIWOO AI HELPER
                        </Text>
                        <Text fontSize="2xl" maxWidth="600px">
                            1인 IT 창업을 위한 최고의 AI 파트너
                            혁신적인 기술로 당신의 창업 여정을 가속화합니다
                        </Text>
                    </VStack>

                    <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                        {features.map((feature, index) => (
                            <Box
                                key={index}
                                bg="rgba(255,255,255,0.1)"
                                borderRadius="md"
                                p={4}
                                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                                cursor="pointer"
                            >
                                <HStack>
                                    <Image src={feature.icon} boxSize="40px" mr={3} />
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold">{feature.title}</Text>
                                        <Text fontSize="sm">{feature.description}</Text>
                                    </VStack>
                                    <ChevronRightIcon ml="auto" />
                                </HStack>
                            </Box>
                        ))}
                    </Grid>
                </Flex>
            </motion.div>
            <Box
                position="absolute"
                bottom="-10%"
                right="-5%"
                width="50%"
                height="120%"
                bg="url('path/to/your/wave-image.png')"
                backgroundSize="cover"
                backgroundPosition="center"
                opacity="0.2"
            />
        </Box>
    );
}

export default MainBanner;