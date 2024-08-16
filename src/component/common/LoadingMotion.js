import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Progress } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const messages = [
    "AI가 시장 데이터를 분석 중입니다...",
    "JIWOO가 당신의 비즈니스를 위한 인사이트를 찾고 있어요!",
    "최신 시장 트렌드를 파악하고 있습니다...",
    "경쟁사 분석 중... 당신의 경쟁 우위를 찾고 있어요!",
    "고객 니즈를 분석하고 있습니다. 잠시만 기다려주세요.",
    "JIWOO AI가 당신의 비즈니스 성공을 위해 열심히 일하고 있어요!",
    "시장 규모와 성장률을 계산하고 있습니다...",
    "혁신적인 비즈니스 전략을 구상 중입니다.",
    "JIWOO와 함께 당신의 사업이 날개를 달 거예요!",
];



const RunningPersonAnimation = () => (
    <svg width="100" height="100" viewBox="0 0 100 100">
        <motion.path
            d="M50 30 Q60 20 70 30 T90 30"
            fill="none"
            stroke="white"
            strokeWidth="4"
            animate={{
                d: ["M50 30 Q60 20 70 30 T90 30", "M50 30 Q60 40 70 30 T90 30"]
            }}
            transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.5
            }}
        />
        <motion.circle
            cx="50"
            cy="30"
            r="10"
            fill="white"
            animate={{
                cy: [30, 25, 30]
            }}
            transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.5
            }}
        />
    </svg>
);

const LoadingScreen = ({ isLoading }) => {
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setMessage(messages[Math.floor(Math.random() * messages.length)]);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.7)"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <VStack spacing={6}>
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <RunningPersonAnimation />
                </motion.div>
                <Text color="white" fontSize="xl" fontWeight="bold" textAlign="center">
                    {message}
                </Text>
                <Box w="300px">
                    <Progress size="xs" isIndeterminate colorScheme="blue" />
                </Box>
            </VStack>
        </Box>
    );
};

export default LoadingScreen;