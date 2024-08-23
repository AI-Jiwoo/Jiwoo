import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    Box,
    Text,
    Flex,
    Image,
    IconButton,
    HStack,
    VStack,
    Button,
    Container,
    useToast,
    Link as ChakraLink,
    Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Input
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon, ChatIcon, WarningIcon } from '@chakra-ui/icons';
import MainHeader from '../component/common/MainHeader';
import MarketResearch from "./MarketResearch";
import BusinessModel from "./BusinessModel";
import SideNavigation from "../component/SideNavigation";
import Footer from "../component/common/Footer";
import Accounting from "./Accounting";
import {motion , AnimatePresence} from "framer-motion";
import {Link, useLocation, useNavigate} from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import api from "../apis/api";
import bannerImage from '../images/banner1.png';
import bannerImage2 from '../images/banner2.png';
import bannerImage3 from '../images/banner3.png';
import bannerImage4 from '../images/banner4.png';
import JiwooChatbot from "../component/Chatbot";
import {Element, scroller} from "react-scroll";
import SuccessStoriesSection from "../component/SuccessStoriesSection";

function MainPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const marketResearchRef = useRef(null);
    const businessModelRef = useRef(null);
    const accountingRef = useRef(null);
    const [activeSection, setActiveSection] = useState('marketSize');
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuth();
    const [allRecommendedPrograms, setAllRecommendedPrograms] = useState([]);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const chatbotButtonRef = useRef(null);
    const toast = useToast();

    const features = [
        { title: "창업 가이드", description: "AI 기반 맞춤형 창업 전략", icon: bannerImage },
        { title: "비즈니스 모델", description: "혁신적인 비즈니스 모델 설계", icon: bannerImage2 },
        { title: "세무 처리", description: "간편한 세무 관리 솔루션", icon: bannerImage3 },
        { title: "시장 조사", description: "AI 기반 시장 트렌드 분석", icon: bannerImage4 },
    ];

    const alternativeContent = [
        { title: "창업 성공의 비결", description: "성공한 스타트업 CEO들의 조언과 팁을 만나보세요.", icon: bannerImage, action: "자세히 보기", link: "/success-stories" },
        { title: "네트워킹 이벤트", description: "다가오는 스타트업 네트워킹 이벤트에 참여하세요.", icon: bannerImage2, action: "이벤트 보기", link: "/upcoming-events" },
        { title: "리소스 라이브러리", description: "창업에 필요한 모든 자료를 한 곳에서 찾아보세요.", icon: bannerImage3, action: "라이브러리 가기", link: "/resource-library" },
        { title: "AI 기능 둘러보기", description: "JIWOO AI HELPER의 다양한 기능을 살펴보세요.", icon: bannerImage4, action: "기능 알아보기", link: "/ai-features" },
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (user) {
            fetchAllRecommendedPrograms();
        }
    }, [user]);

    useEffect(() => {
        const section = location.pathname.split('/')[2];
        if (section) {
            scrollToSection(section);
        }
    }, [location]);

    const fetchAllRecommendedPrograms = async () => {
        try {
            const response = await api.get('/support_program/recommend', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setAllRecommendedPrograms(response.data);
            if (response.data.length === 0) {
                toast({
                    title: "추천 프로그램 없음",
                    description: "지금은 추천할 지원사업이 없습니다.",
                    status: "info",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                });
            }
        } catch (error) {
            console.error('Error fetching recommended programs:', error);
            toast({
                title: "추천 프로그램 로딩 실패",
                description: "프로그램을 불러오는 중 오류가 발생했습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        }
    };

    const contentToDisplay = useMemo(() => {
        if (user && allRecommendedPrograms.length > 0) {
            return allRecommendedPrograms;
        } else if (user) {
            return alternativeContent;
        } else {
            return features;
        }
    }, [user, allRecommendedPrograms, features]);

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
        navigate(isChatbotOpen ? '/main' : '/chatbot');
    };

    const scrollToSection = (section) => {
        scroller.scrollTo(section, {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart'
        });
    };

    const handleNavigation = (section) => {
        navigate(`/main/${section}`);
        scrollToSection(section);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % contentToDisplay.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + contentToDisplay.length) % contentToDisplay.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [contentToDisplay]);

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <Box>
            <MainHeader
                scrollToMarketResearch={() => handleNavigation('market-research')}
                scrollToBusinessModel={() => handleNavigation('business-model')}
                scrollToAccounting={() => handleNavigation('accounting')}
            />
            <Element name="home">
                <Box bg="#010B1A" color="white" minHeight="100vh">
                    <Flex direction="column" height="100%">
                        <Flex height="70%" pl="10%" pr="5%" pt="10%" position="relative">
                            <VStack align="flex-start" width="40%" mr="10%">
                                <Text fontSize="6xl" fontWeight="bold" mb={4}>
                                    JIWOO AI HELPER
                                </Text>
                                <Text fontSize="xl" mb={8}>
                                    1인 IT 창업을 위한 최고의 AI 파트너<br />
                                    혁신적인 기술로 당신의 창업 여정을 가속화합니다
                                </Text>
                                {user && (
                                    <Box bg="rgba(255,255,255,0.1)" p={4} borderRadius="md" border="1px solid white">
                                        <Text fontSize="lg" fontWeight="bold">
                                            맞춤형 지원 프로그램
                                        </Text>
                                        <Text fontSize="md" mt={2}>
                                            당신의 사업에 맞는 맞춤형 지원 프로그램을 확인하세요.
                                            AI가 분석한 최적의 프로그램을 제안해드립니다.
                                        </Text>
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
                                        p={4}
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
                                        <VStack align="flex-start" height="100%" justify="space-between" spacing={2}>
                                            <Box
                                                bg="rgba(0,0,0,0.8)"
                                                p={4}
                                                borderRadius="md"
                                                width="100%"
                                                height="100%"
                                                overflow="auto"
                                            >
                                                <Text fontWeight="bold" fontSize="3xl" mb={3} color="white">
                                                    {item.name || item.title}
                                                </Text>
                                                <Text fontSize="xl" color="white" mb={2}>
                                                    {item.description}
                                                </Text>
                                                {item.target && (
                                                    <Text fontSize="xl" color="white" mb={2}>
                                                        <Text as="span" fontWeight="bold" color="blue.300">지원 대상: </Text>
                                                        {item.target}
                                                    </Text>
                                                )}
                                                {item.scareOfSupport && (
                                                    <Text fontSize="xl" color="white" mb={2}>
                                                        <Text as="span" fontWeight="bold" color="green.300">지원 규모: </Text>
                                                        {item.scareOfSupport}
                                                    </Text>
                                                )}
                                                {item.supportContent && (
                                                    <Text fontSize="xl" color="white" mb={2}>
                                                        <Text as="span" fontWeight="bold" color="yellow.300">지원 내용: </Text>
                                                        {item.supportContent}
                                                    </Text>
                                                )}
                                                {item.supportCharacteristics && (
                                                    <Text fontSize="xl" color="white" mb={2}>
                                                        <Text as="span" fontWeight="bold" color="purple.300">지원 특징: </Text>
                                                        {item.supportCharacteristics}
                                                    </Text>
                                                )}
                                                {item.originUrl && (
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="xl" color="white">
                                                            <Text as="span" fontWeight="bold" color="orange.300">링크: </Text>
                                                            <ChakraLink
                                                                href={item.originUrl}
                                                                isExternal
                                                                color="blue.300"
                                                                textDecoration="underline"
                                                                maxWidth="100%"
                                                                isTruncated
                                                                _hover={{ color: "blue.100" }}
                                                            >
                                                                {item.originUrl}
                                                            </ChakraLink>
                                                        </Text>
                                                        {!isValidUrl(item.originUrl) && (
                                                            <Text fontSize="xl" color="red.300">
                                                                <WarningIcon mr={1} />
                                                                URL이 유효하지 않을 수 있습니다.
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                )}
                                            </Box>
                                        </VStack>
                                    </Box>
                                ))}
                            </Flex>
                        </Flex>

                        {/* 성공 사례 섹션 추가 */}
                        <Box height="30%" bg="rgba(255,255,255,0.1)" overflowY="auto">
                            <SuccessStoriesSection />
                        </Box>
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
            </Element>

            <SideNavigation activeSection={activeSection} scrollToSection={handleNavigation} />

            <Element name="market-research">
                <Box>
                    <MarketResearch />
                </Box>
            </Element>

            <Element name="business-model">
                <Box>
                    <BusinessModel />
                </Box>
            </Element>

            <Element name="accounting">
                <Box>
                    <Accounting />
                </Box>
            </Element>

            <Footer/>

            <AnimatePresence>
                {isChatbotOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                            hidden: { opacity: 0, scale: 0 },
                            visible: {
                                opacity: 1,
                                scale: 1,
                                transition: { type: 'spring', stiffness: 260, damping: 20 }
                            },
                            exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } }
                        }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'white',
                            zIndex: 2000,
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