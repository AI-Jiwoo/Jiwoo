import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Flex, Image, IconButton, HStack, VStack } from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import MainHeader from '../component/common/MainHeader';
import Chatbot from "../component/Chatbot";
import MarketResearch from "./MarketResearch";
import BusinessModel from "./BusinessModel";
import SideNavigation from "../component/SideNavigation";
import Footer from "../component/common/Footer";

function MainPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const marketResearchRef = useRef(null);
    const businessModelRef = useRef(null);
    const [activeSection, setActiveSection] = useState('marketSize');



    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    useEffect(() => {
        if (marketResearchRef.current && businessModelRef.current) {
            const handleScroll = () => {
                const scrollPosition = window.scrollY;
                if (scrollPosition < businessModelRef.current.offsetTop) {
                    setActiveSection('marketResearchRef');
                } else {
                    setActiveSection('businessModelRef');
                }
            };

            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [marketResearchRef, businessModelRef]);

    const scrollToSection = (sectionName) => {
        const refMap = {
            marketSize: marketResearchRef,
            similarServices: businessModelRef,
        };
        if (refMap[sectionName]?.current) {
            refMap[sectionName].current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const features = [
        { title: "창업 가이드", description: "AI 기반 맞춤형 창업 전략", icon: "/path/to/icon1.png" },
        { title: "비즈니스 모델", description: "혁신적인 비즈니스 모델 설계", icon: "/path/to/icon2.png" },
        { title: "세무 처리", description: "간편한 세무 관리 솔루션", icon: "/path/to/icon3.png" },
        { title: "시장 조사", description: "AI 기반 시장 트렌드 분석", icon: "/path/to/icon4.png" },
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % features.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000); // 5초마다 자동 슬라이드

        return () => clearInterval(timer);
    }, []);

    const scrollToMarketResearch = () => {
        marketResearchRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToBusinessModel = () => {
        businessModelRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Box>
            <MainHeader
                scrollToMarketResearch={scrollToMarketResearch}
                scrollToBusinessModel={scrollToBusinessModel}
   />
            <Chatbot />

            <Box
                bg="#010B1A"
                color="white"
                height="100vh"
                position="relative"
                overflow="hidden"
            >
                <Flex height="100%" pl="10%" pr="5%" pt="10%" position="relative">
                    <VStack align="flex-start" width="40%" mr="10%">
                        <Text fontSize="6xl" fontWeight="bold" mb={4}>
                            JIWOO AI HELPER
                        </Text>
                        <Text fontSize="xl" mb={16}>
                            1인 IT 창업을 위한 최고의 AI 파트너<br />
                            혁신적인 기술로 당신의 창업 여정을 가속화합니다
                        </Text>
                    </VStack>

                    <Flex position="relative" width="50%" height="400px" alignItems="flex-end">
                        {features.map((feature, index) => (
                            <Box
                                key={index}
                                bg={index === currentSlide ? "white" : "rgba(255,255,255,0.1)"}
                                color={index === currentSlide ? "black" : "white"}
                                p={8}
                                mr={index === currentSlide ? 0 : "-80%"}
                                width={index === currentSlide ? "100%" : "20%"}
                                height={index === currentSlide ? "100%" : "80%"}
                                borderRadius="2xl"
                                cursor="pointer"
                                onClick={() => setCurrentSlide(index)}
                                transition="all 0.5s"
                                zIndex={features.length - index}
                                position="absolute"
                                right="0"
                                bottom="0"
                            >
                                <VStack align="flex-start" height="100%" justify="space-between">
                                    <Box>
                                        <Text fontWeight="bold" fontSize="2xl" mb={4}>{feature.title}</Text>
                                        <Text fontSize="md">{feature.description}</Text>
                                    </Box>
                                    <Flex justify="space-between" align="center" width="100%">
                                        <Image src={feature.icon} boxSize="40px" />
                                        <ChevronRightIcon boxSize={8} />
                                    </Flex>
                                </VStack>
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
                        _hover={{ bg: "transparent" }}
                        aria-label="Previous slide"
                    />
                    <Text>{`${String(currentSlide + 1).padStart(2, '0')} / ${String(features.length).padStart(2, '0')}`}</Text>
                    <IconButton
                        icon={<ChevronRightIcon />}
                        onClick={nextSlide}
                        variant="ghost"
                        color="white"
                        _hover={{ bg: "transparent" }}
                        aria-label="Next slide"
                    />
                </HStack>
            </Box>

            <SideNavigation activeSection={activeSection} scrollToSection={scrollToSection} />


            <Box ref={marketResearchRef}>
                <MarketResearch />
            </Box>

            <Box ref={businessModelRef}>
                <BusinessModel />
            </Box>
            <Footer/>
        </Box>
    );
}

export default MainPage;
