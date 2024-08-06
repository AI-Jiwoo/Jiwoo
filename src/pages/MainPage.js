import React, { useState, useRef, useEffect } from 'react';
import { Box, SimpleGrid, VStack, Image, Text, Flex, Button, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MainHeader from '../component/common/MainHeader';
import "../style/main.css"
import { motion } from "framer-motion";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import Chatbot from "../component/Chatbot";
import MarketResearch from "./MarketResearch";

// 카테고리 이미지 import
import businessImage from '../images/Bmodel.png';
import changupGuideImage from '../images/changupG.png';
import taxImage from '../images/mainSemu.png';
import marketResearchImage from '../images/market.png';

// 배너 이미지 import
import banner1 from '../images/banner1.png';
import banner2 from '../images/banner2.png';
import banner3 from '../images/banner3.png';
import banner4 from '../images/banner4.png';
import banner5 from '../images/banner5.png';

function MainPage() {
    const { user } = useAuth();
    const [isPlaying, setIsPlaying] = useState(true);
    const sliderRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const marketResearchRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    navigate('/market-research', { replace: true });
                } else {
                    navigate('/main', { replace: true });
                }
            },
            { threshold: 0.5 }
        );

        if (marketResearchRef.current) {
            observer.observe(marketResearchRef.current);
        }

        return () => {
            if (marketResearchRef.current) {
                observer.unobserve(marketResearchRef.current);
            }
        };
    }, [navigate]);

    useEffect(() => {
        if (location.pathname === '/market-research') {
            marketResearchRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

    const handleCategoryClick = (category) => {
        if (category === '시장조사') {
            marketResearchRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const categories = [
        { name: '창업가이드', image: changupGuideImage },
        { name: '비즈니스 모델', image: businessImage },
        { name: '세무처리', image: taxImage },
        { name: '시장조사', image: marketResearchImage },
    ];

    const bannerSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: isPlaying,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: false,
        centerMode: true,
        focusOnSelect: true,
    };

    const bannerItems = [
        { image: banner1, title: "배너 제목 1", description: "배너 설명 1" },
        { image: banner2, title: "배너 제목 2", description: "배너 설명 2" },
        { image: banner3, title: "배너 제목 3", description: "배너 설명 3" },
        { image: banner4, title: "배너 제목 4", description: "배너 설명 4" },
        { image: banner5, title: "배너 제목 5", description: "배너 설명 5" },
    ];

    const Banner = () => (
        <Box width="100%" maxWidth="1000px" margin="auto" position="relative">
            <Slider ref={sliderRef} {...bannerSettings}>
                {bannerItems.map((item, index) => (
                    <Box key={index} px={2}>
                        <Box
                            position="relative"
                            height="400px"
                            overflow="hidden"
                            borderRadius="lg"
                            boxShadow="md"
                        >
                            <Image
                                src={item.image}
                                alt={`Banner ${index + 1}`}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                            />
                            <Box
                                position="absolute"
                                top="0"
                                left="0"
                                right="0"
                                bottom="0"
                                bg="rgba(0,0,0,0.4)"
                                p={6}
                                display="flex"
                                flexDirection="column"
                                justifyContent="center"
                            >
                                <Text fontSize="2xl" fontWeight="bold" color="white">{item.title}</Text>
                                <Text mt={2} color="white">{item.description}</Text>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Slider>
            <IconButton
                icon={<ChevronLeftIcon />}
                onClick={() => sliderRef.current.slickPrev()}
                aria-label="Previous slide"
                position="absolute"
                left="0"
                top="50%"
                transform="translateY(-50%)"
                zIndex="1"
            />
            <IconButton
                icon={<ChevronRightIcon />}
                onClick={() => sliderRef.current.slickNext()}
                aria-label="Next slide"
                position="absolute"
                right="0"
                top="50%"
                transform="translateY(-50%)"
                zIndex="1"
            />
        </Box>
    );

    return (
        <Box>
            <MainHeader />
            <Chatbot/>

            <Box bg="blue.500" py={20} minHeight="800px" display="flex" alignItems="center" justifyContent="center">
                {user ? (
                    <Banner />
                ) : (
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        color="white"
                    >
                        <Text fontSize="4xl" fontWeight="bold" mb={4}>영상넣을곳</Text>
                        <Button colorScheme="white" variant="outline" onClick={() => navigate('/login')}>
                            로그인하기
                        </Button>
                    </Flex>
                )}
            </Box>

            <SimpleGrid columns={5} spacing={10} px={20} my={100} ml={400}>
                {categories.map((category, index) => (
                    <VStack
                        key={index}
                        spacing={4}
                        align="center"
                        as={motion.div}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCategoryClick(category.name)}
                        cursor="pointer"
                    >
                        <Image src={category.image} alt={category.name} boxSize="150px" />
                        <Text fontWeight="bold">{category.name}</Text>
                    </VStack>
                ))}
            </SimpleGrid>

            <Box ref={marketResearchRef}>
                <MarketResearch />
            </Box>
        </Box>
    );
}

export default MainPage;