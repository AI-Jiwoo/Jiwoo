import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, Text, Flex, Image, IconButton, HStack, VStack, Button, Select, useToast } from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon, ChatIcon } from '@chakra-ui/icons';
import MainHeader from '../component/common/MainHeader';
import MarketResearch from "./MarketResearch";
import BusinessModel from "./BusinessModel";
import SideNavigation from "../component/SideNavigation";
import Footer from "../component/common/Footer";
import Accounting from "./Accounting";
import {motion , AnimatePresence} from "framer-motion";


import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import api from "../apis/api";
import bannerImage from '../images/banner1.png';
import bannerImage2 from '../images/banner2.png';
import bannerImage3 from '../images/banner3.png';
import bannerImage4 from '../images/banner4.png';
import JiwooChatbot from "../component/Chatbot";


function MainPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const marketResearchRef = useRef(null);
    const businessModelRef = useRef(null);
    const accountingRef = useRef(null);
    const [activeSection, setActiveSection] = useState('marketSize');
    const navigate = useNavigate();

    const { user } = useAuth();
    const [allRecommendedPrograms, setAllRecommendedPrograms] = useState([]);
    const [businessInfos, setBusinessInfos] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState(null);
    const [isChatbotOpen, setIsChatbotOpen] = useState();
    const chatbotButtonRef = useRef(null);
    const toast = useToast();


    const features = [
        { title: "창업 가이드", description: "AI 기반 맞춤형 창업 전략", icon: bannerImage },
        { title: "비즈니스 모델", description: "혁신적인 비즈니스 모델 설계", icon: bannerImage2 },
        { title: "세무 처리", description: "간편한 세무 관리 솔루션", icon: bannerImage3 },
        { title: "시장 조사", description: "AI 기반 시장 트렌드 분석", icon: bannerImage4 },
    ];


    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
    };

    const chatbotVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
            }
        },
        exit: {
            opacity: 0,
            scale: 0,
            transition: {
                duration: 0.2
            }
        }
    };
    const alternativeContent = [
        {
            title: "창업 성공의 비결",
            description: "성공한 스타트업 CEO들의 조언과 팁을 만나보세요.",
            icon: bannerImage,
            action: "자세히 보기",
            link: "/success-stories"
        },
        {
            title: "네트워킹 이벤트",
            description: "다가오는 스타트업 네트워킹 이벤트에 참여하세요.",
            icon: bannerImage2,
            action: "이벤트 보기",
            link: "/upcoming-events"
        },
        {
            title: "리소스 라이브러리",
            description: "창업에 필요한 모든 자료를 한 곳에서 찾아보세요.",
            icon: bannerImage3,
            action: "라이브러리 가기",
            link: "/resource-library"
        },
        {
            title: "AI 기능 둘러보기",
            description: "JIWOO AI HELPER의 다양한 기능을 살펴보세요.",
            icon: bannerImage4,
            action: "기능 알아보기",
            link: "/ai-features"
        }
    ];


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (user) {
            fetchBusinessInfos();
            fetchAllRecommendedPrograms();
        }
    }, [user]);

    useEffect(() => {
        if (marketResearchRef.current && businessModelRef.current && accountingRef.current) {
            const handleScroll = () => {
                const scrollPosition = window.scrollY;
                if (scrollPosition < businessModelRef.current.offsetTop) {
                    setActiveSection('marketResearchRef');
                } else if (scrollPosition < accountingRef.current.offsetTop) {
                    setActiveSection('businessModelRef');
                } else {
                    setActiveSection('accountingRef');
                }
            };

            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [marketResearchRef, businessModelRef, accountingRef]);

    const fetchBusinessInfos = async () => {
        try {
            const response = await api.get('/business/user', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            const businessData = response.data.business || [];
            setBusinessInfos(businessData);
            if (businessData.length > 0) {
                setSelectedBusinessId(businessData[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch business infos:', error);
            toast({
                title: "사업 정보 로딩 실패",
                description: "사업 정보를 불러오는데 실패했습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const fetchAllRecommendedPrograms = async () => {
        try {
            const response = await api.get('/support_program/recommend', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setAllRecommendedPrograms(response.data);
        } catch (error) {
            console.error('Error fetching recommended programs:', error);
            toast({
                title: "추천 프로그램 로딩 실패",
                description: "프로그램을 불러오는 중 오류가 발생했습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleBusinessChange = (event) => {
        setSelectedBusinessId(parseInt(event.target.value));
    };

    const filteredRecommendedPrograms = useMemo(() => {
        if (!selectedBusinessId) return [];
        // 여기서 실제로 비즈니스 ID에 따라 프로그램을 필터링하는 로직을 구현해야함
        // 현재는 모든 프로그램을 반환하지만, 실제로는 비즈니스 특성에 맞는 프로그램만 반환해야함
        return allRecommendedPrograms;
    }, [selectedBusinessId, allRecommendedPrograms]);

    const contentToDisplay = useMemo(() => {
        if (user && filteredRecommendedPrograms.length > 0) {
            return filteredRecommendedPrograms;
        } else if (user) {
            return alternativeContent;
        } else {
            return features;
        }
    }, [user, filteredRecommendedPrograms, features]);

    useEffect(() => {
        if (user && selectedBusinessId && filteredRecommendedPrograms.length === 0) {
            toast({
                title: "추천 프로그램 없음",
                description: "현재 선택한 사업에 대한 추천 지원 프로그램이 없습니다.",
                status: "info",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [user, selectedBusinessId, filteredRecommendedPrograms, toast]);

    const scrollToSection = (sectionName) => {
        const refMap = {
            marketSize: marketResearchRef,
            similarServices: businessModelRef,
            accounting: accountingRef,
        };
        if (refMap[sectionName]?.current) {
            refMap[sectionName].current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % contentToDisplay.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + contentToDisplay.length) % contentToDisplay.length);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [contentToDisplay]);

    const scrollToMarketResearch = () => {
        marketResearchRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToBusinessModel = () => {
        businessModelRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToAccounting = () => {
        accountingRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const navigateToChatPage = () => {
        navigate('/chatbot');
    };

    return (
        <Box>
            <MainHeader
                scrollToMarketResearch={scrollToMarketResearch}
                scrollToBusinessModel={scrollToBusinessModel}
                scrollToAccounting={scrollToAccounting}
            />
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
                        <Text fontSize="xl" mb={8}>
                            1인 IT 창업을 위한 최고의 AI 파트너<br />
                            혁신적인 기술로 당신의 창업 여정을 가속화합니다
                        </Text>
                        {user && businessInfos.length > 0 && (
                            <Box
                                bg="rgba(255,255,255,0.1)"
                                p={4}
                                borderRadius="md"
                                border="1px solid white"
                            >
                                <Text mb={2} fontWeight="bold">당신의 사업을 선택하세요</Text>
                                <Select
                                    placeholder="사업 선택"
                                    onChange={handleBusinessChange}
                                    bg="white"
                                    color="black"
                                    mb={2}
                                    value={selectedBusinessId}
                                >
                                    {businessInfos.map((business) => (
                                        <option key={business.id} value={business.id}>
                                            {business.businessName}
                                        </option>
                                    ))}
                                </Select>
                                <Text fontSize="sm">선택한 사업에 맞는 맞춤형 지원 프로그램을 확인하세요.</Text>
                            </Box>
                        )}
                    </VStack>

                    <Flex position="relative" width="50%" height="400px" alignItems="flex-end">
                        {contentToDisplay.map((item, index) => (
                            <Box
                                key={index}
                                backgroundImage={`url(${item.icon})`}
                                backgroundSize="cover"
                                backgroundPosition="center"
                                backgroundRepeat="no-repeat"
                                p={8}
                                mr={index === currentSlide ? 0 : "-80%"}
                                width={index === currentSlide ? "100%" : "20%"}
                                height={index === currentSlide ? "100%" : "80%"}
                                borderRadius="2xl"
                                cursor="pointer"
                                onClick={() => setCurrentSlide(index)}
                                transition="all 0.5s"
                                zIndex={contentToDisplay.length - index}
                                position="absolute"
                                right="0"
                                bottom="0"
                            >
                                <VStack align="flex-start" height="100%" justify="space-between">
                                    <Box
                                        bg="rgba(0,0,0,0.6)"
                                        p={4}
                                        borderRadius="md"
                                        width="100%"
                                    >
                                        <Text fontWeight="bold" fontSize="2xl" mb={4} color="white">
                                            {item.name || item.title}
                                        </Text>
                                        <Text fontSize="md" color="white">
                                            {item.description || item.supportContent || item.target}
                                        </Text>
                                        {item.scareOfSupport && (
                                            <Text mb={2} color="white">지원 규모: {item.scareOfSupport}</Text>
                                        )}
                                        {item.supportCharacteristics && (
                                            <Text mb={2} color="white">지원 특징: {item.supportCharacteristics}</Text>
                                        )}
                                    </Box>
                                    <Flex justify="space-between" align="center" width="100%">
                                        <Button
                                            as={Link}
                                            to={item.link || "#"}
                                            colorScheme="blue"
                                            size="sm"
                                        >
                                            {item.action || "자세히 보기"}
                                        </Button>
                                        <ChevronRightIcon boxSize={8} color="white" />
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
                    <Text>{`${String(currentSlide + 1).padStart(2, '0')} / ${String(contentToDisplay.length).padStart(2, '0')}`}</Text>
                    <IconButton
                        icon={<ChevronRightIcon />}
                        onClick={nextSlide}
                        variant="ghost"
                        color="white"
                        _hover={{ bg: "transparent" }}
                        aria-label="Next slide"
                    />
                </HStack>

                <Button
                    ref={chatbotButtonRef}
                    position="fixed"
                    bottom="20px"
                    right="20px"
                    colorScheme="blue"
                    onClick={toggleChatbot}
                    zIndex={1000}
                    borderRadius="full"
                    width="60px"
                    height="60px"
                    boxShadow="lg"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                >
                    <ChatIcon boxSize={6} />
                </Button>
            </Box>

            <SideNavigation activeSection={activeSection} scrollToSection={scrollToSection} />

            <Box ref={marketResearchRef}>
                <MarketResearch />
            </Box>

            <Box ref={businessModelRef}>
                <BusinessModel />
            </Box>

            <Box ref={accountingRef}>
                <Accounting />
            </Box>

            <Footer/>

            <AnimatePresence>
                {isChatbotOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={chatbotVariants}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'white',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        transformOrigin={`${chatbotButtonRef.current?.getBoundingClientRect().right - 30}px ${chatbotButtonRef.current?.getBoundingClientRect().bottom - 30}px`}
                    >
                        <JiwooChatbot onClose={toggleChatbot} />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}

export default MainPage;