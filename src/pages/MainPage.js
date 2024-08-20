import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Flex, VStack, Grid, Button, Spinner, useToast } from '@chakra-ui/react';
import MainHeader from '../component/common/MainHeader';
import Chatbot from "../component/Chatbot";
import MarketResearch from "./MarketResearch";
import BusinessModel from "./BusinessModel";
import SideNavigation from "../component/SideNavigation";
import Footer from "../component/common/Footer";
import Accounting from "./Accounting";
import api, {aiApi} from "../apis/api";
import { useAuth } from '../context/AuthContext';
import {getAccessTokenHeader, isLogin, refreshToken} from "../utils/TokenUtils";
import axios from "axios";

function MainPage() {
    const [recommendedPrograms, setRecommendedPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const marketResearchRef = useRef(null);
    const businessModelRef = useRef(null);
    const accountingRef = useRef(null);
    const [activeSection, setActiveSection] = useState('marketSize');
    const toast = useToast();
    const { user, setUser } = useAuth();

    useEffect(() => {
        const checkAuthAndFetchPrograms = async () => {
            if (isLogin()) {
                fetchRecommendedPrograms();
            } else {
                const newToken = await refreshToken();
                if (newToken) {
                    setUser({ email: newToken.email });
                    fetchRecommendedPrograms();
                }
            }
        };

        checkAuthAndFetchPrograms();
        window.scrollTo(0, 0);
    }, [setUser]);

    const fetchRecommendedPrograms = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/support_program/recommend', {
                headers: {
                    'Authorization': getAccessTokenHeader()
                }
            });
            console.log('Recommended programs response:', response.data); // 디버깅 로그
            setRecommendedPrograms(response.data);
        } catch (error) {
            console.error('Error fetching recommended programs:', error);
            if (error.response?.status === 401) {
                const newToken = await refreshToken();
                if (newToken) {
                    fetchRecommendedPrograms();
                } else {
                    toast({
                        title: "로그인 필요",
                        description: "세션이 만료되었습니다. 다시 로그인해 주세요.",
                        status: "warning",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } else {
                toast({
                    title: "추천 프로그램 로딩 실패",
                    description: "프로그램을 불러오는 중 오류가 발생했습니다.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        if (marketResearchRef.current && businessModelRef.current) {
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

    const scrollToMarketResearch = () => {
        marketResearchRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToBusinessModel = () => {
        businessModelRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToAccounting = () => {
        accountingRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Box>
            <MainHeader
                scrollToMarketResearch={scrollToMarketResearch}
                scrollToBusinessModel={scrollToBusinessModel}
                scrollToAccounting={scrollToAccounting}
            />
            <Chatbot />

            <Box
                bg="#010B1A"
                color="white"
                minHeight="100vh"
                py={20}
                position="relative"
                overflow="hidden"
            >
                <Flex maxWidth="1200px" margin="auto" direction="column">
                    <VStack align="flex-start" spacing={6} mb={12}>
                        <Text fontSize="6xl" fontWeight="bold" lineHeight="1.2">
                            JIWOO AI HELPER
                        </Text>
                        <Text fontSize="2xl" maxWidth="600px">
                            1인 IT 창업을 위한 최고의 AI 파트너<br />
                            혁신적인 기술로 당신의 창업 여정을 가속화합니다
                        </Text>
                    </VStack>

                    {user ? (
                        isLoading ? (
                            <Flex justify="center" align="center" mt={12}>
                                <Spinner size="xl" />
                            </Flex>
                        ) : (
                            <Box mt={12}>
                                <Text fontSize="3xl" fontWeight="bold" mb={6}>맞춤 추천 지원 프로그램</Text>
                                {recommendedPrograms.length > 0 ? (
                                    <Grid templateColumns={["1fr", "1fr", "repeat(2, 1fr)"]} gap={6}>
                                        {recommendedPrograms.map((program, index) => (
                                            <Box key={index} bg="rgba(255,255,255,0.1)" borderRadius="md" p={6}>
                                                <Text fontSize="xl" fontWeight="bold" mb={3}>{program.name}</Text>
                                                <Text mb={2}>대상: {program.target}</Text>
                                                <Text mb={2}>지원 규모: {program.scareOfSupport}</Text>
                                                <Text mb={2}>지원 내용: {program.supportContent}</Text>
                                                <Text mb={2}>지원 특징: {program.supportCharacteristics}</Text>
                                                <Text mb={2}>사업 소개: {program.supportInfo}</Text>
                                                <Text mb={2}>지원 연도: {program.supportYear}</Text>
                                                <Button as="a" href={program.originUrl} target="_blank" colorScheme="blue" size="md">
                                                    자세히 보기
                                                </Button>
                                            </Box>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Text textAlign="center" fontSize="xl">현재 추천할 수 있는 프로그램이 없습니다.</Text>
                                )}
                            </Box>
                        )
                    ) : (
                        <Text mt={12} textAlign="center" fontSize="xl">추천 프로그램을 보려면 로그인이 필요합니다.</Text>
                    )}
                </Flex>
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
        </Box>
    );
}

export default MainPage;