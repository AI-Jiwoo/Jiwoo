import React, {useState, useRef, useEffect} from 'react';
import { Box, SimpleGrid, VStack, Image, Text, Flex, Button, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MainHeader from '../component/common/MainHeader';

// 카테고리 이미지 import
import businessImage from '../images/Bmodel.png';
import changupGuideImage from '../images/changupG.png';
import taxImage from '../images/mainSemu.png';
import informationImage from '../images/maininformation.png';
import marketResearchImage from '../images/market.png';

import banner1 from '../images/banner1.png';
import banner2 from '../images/banner2.png';
import banner3 from '../images/banner3.png';
import banner4 from '../images/banner4.png';
import banner5 from '../images/banner5.png';
import {useNavigate} from "react-router-dom";
import {useAuth} from "../AuthContext";

function MainPage() {
    const { user, loading } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    useEffect( () => {
        console.log("User state changed", user);
    }, [user]);


    const categories = [
        { name: '창업가이드', image: changupGuideImage },
        { name: '비즈니스 모델', image: businessImage },
        { name: '세무처리', image: taxImage },
        { name: '정보제공', image: informationImage },
        { name: '시장조사', image: marketResearchImage },
    ];

    const bannerSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: isPlaying,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    const bannerItems = [
        { image: banner1, title: "배너 제목 1", description: "배너 설명 1" },
        { image: banner2, title: "배너 제목 2", description: "배너 설명 2" },
        { image: banner3, title: "배너 제목 3", description: "배너 설명 3" },
        { image: banner4, title: "배너 제목 4", description: "배너 설명 4" },
        { image: banner5, title: "배너 제목 5", description: "배너 설명 5" },
    ];

    const Banner = () => (
        <Box width="100%" maxWidth="1500px" margin="auto" position="relative">
            <Slider ref={sliderRef} {...bannerSettings}>
                {bannerItems.map((item, index) => (
                    <Box key={index} p={2}>
                        <Flex
                            direction="column"
                            borderWidth={1}
                            borderRadius="lg"
                            overflow="hidden"
                            boxShadow="md"
                            height="400px"
                        >
                            <Image src={item.image} alt={`Banner ${index + 1}`} height="250px" objectFit="cover" />
                            <Box p={4} bg="white" flex="1">
                                <Text fontSize="lg" fontWeight="bold">{item.title}</Text>
                                <Text mt={2} fontSize="sm">{item.description}</Text>
                            </Box>
                        </Flex>
                    </Box>
                ))}
            </Slider>
            <Flex justify="center" align="center" mt={4}>
                <IconButton
                    icon={<ChevronLeftIcon />}
                    onClick={() => sliderRef.current.slickPrev()}
                    aria-label="Previous slide"
                    mr={2}
                />
                <IconButton
                    icon={isPlaying ? "⏸" : "▶️"}
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    mx={2}
                />
                <IconButton
                    icon={<ChevronRightIcon />}
                    onClick={() => sliderRef.current.slickNext()}
                    aria-label="Next slide"
                    ml={2}
                />
            </Flex>
        </Box>
    );

    return (
        <Box>
            <MainHeader />

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

            <SimpleGrid columns={5} spacing={10} px={20} my={50}>
                {categories.map((category, index) => (
                    <VStack key={index} spacing={4} align="center">
                        <Image src={category.image} alt={category.name} boxSize="150px" />
                        <Text fontWeight="bold">{category.name}</Text>
                    </VStack>
                ))}
            </SimpleGrid>
        </Box>
    );
}

export default MainPage;