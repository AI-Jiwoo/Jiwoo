import React, {useEffect, useRef, useState} from 'react';
import { Box, Text, Flex, Image, IconButton, HStack } from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import MainHeader from '../component/common/MainHeader';
import Chatbot from "../component/Chatbot";
import MarketResearch from "./MarketResearch";
import {useLocation} from "react-router-dom";

function MainPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const marketResearchRef = useRef(null);
    const location = useLocation();

    const features = [
        { title: "창업 가이드", description: "AI 기반 맞춤형 창업 전략", icon: "/path/to/icon1.png" },
        { title: "비즈니스 모델", description: "혁신적인 비즈니스 모델 설계", icon: "/path/to/icon2.png" },
        { title: "세무 처리", description: "간편한 세무 관리 솔루션", icon: "/path/to/icon3.png" },
        { title: "시장 조사", description: "AI 기반 시장 트렌드 분석", icon: "/path/to/icon4.png" },
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % features.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);


    useEffect(() => {
        if (location.state?.scrollToMarketResearch) {
            scrollToMarketResearch();
        }
    }, [location]);

    const scrollToMarketResearch = () => {
        marketResearchRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Box>
            <MainHeader scrollToMarketResearch={scrollToMarketResearch} />
            <Chatbot />

            <Box
                bg="#000428"
                color="white"
                height="100vh"
                position="relative"
                overflow="hidden"
            >
                <Flex direction="column" height="100%" pl="10%" pr="5%" pt="5%">
                    <Text fontSize="6xl" fontWeight="bold" mb={4}>
                        JIWOO AI HELPER
                    </Text>
                    <Text fontSize="xl" maxWidth="600px" mb={16}>
                        1인 IT 창업을 위한 최고의 AI 파트너<br />
                        혁신적인 기술로 당신의 창업 여정을 가속화합니다
                    </Text>

                    <Flex position="absolute" bottom="10%" left="10%" right="5%" height="120px">
                        {features.map((feature, index) => (
                            <Box
                                key={index}
                                bg={index === currentSlide ? "white" : "rgba(0,0,0,0.5)"}
                                color={index === currentSlide ? "black" : "white"}
                                p={4}
                                mr={4}
                                width="24%"
                                borderRadius="md"
                                cursor="pointer"
                                onClick={() => setCurrentSlide(index)}
                            >
                                <Text fontWeight="bold" fontSize="lg" mb={2}>{feature.title}</Text>
                                <Text fontSize="sm">{feature.description}</Text>
                                <Flex justify="space-between" align="center" mt={4}>
                                    <Image src={feature.icon} boxSize="30px" />
                                    <ChevronRightIcon />
                                </Flex>
                            </Box>
                        ))}
                    </Flex>
                </Flex>

                <HStack position="absolute" right="5%" top="5%" color="white">
                    <IconButton
                        icon={<ChevronLeftIcon />}
                        onClick={prevSlide}
                        variant="ghost"
                        color="white"
                    />
                    <Text>{`${String(currentSlide + 1).padStart(2, '0')} / ${String(features.length).padStart(2, '0')}`}</Text>
                    <IconButton
                        icon={<ChevronRightIcon />}
                        onClick={nextSlide}
                        variant="ghost"
                        color="white"
                    />
                </HStack>

                <Box
                    position="absolute"
                    top="0"
                    right="0"
                    width="100%"
                    height="100%"
                    bg="url('/path/to/your/wave-image.png')"
                    backgroundSize="cover"
                    backgroundPosition="center"
                    opacity="0.2"
                    pointerEvents="none"
                />
            </Box>

            <Box ref={marketResearchRef}>
                <MarketResearch />
            </Box>
        </Box>
    );
}

export default MainPage;