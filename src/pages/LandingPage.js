import React, { useEffect, useRef, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import ReactTypingEffect from 'react-typing-effect';
import {Button, ChakraProvider, Flex, Box, Text, Image, SimpleGrid, VStack} from '@chakra-ui/react';
import logo from '../logo/jiwooLanding.png';
import backgroundVideo from '../video/1118545_4k_Form_1280x720.mp4';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import '../style/LandingPage.css';
import { EditIcon, LockIcon } from "@chakra-ui/icons";
import FallingLogo from "../component/FallingLogo";

// 이미지 import
import guideIcon from '../images/changupGuide.png';
import businessIcon from '../images/business.png';
import marketResearchIcon from '../images/marketResearch.png';
import taxIcon from '../images/semu.png';
import infoIcon from '../images/information.png';
import {useAuth} from "../context/AuthContext";

const AnimatedSection = ({ children, delay = 0, backgroundColor = 'transparent' }) => {
    const ref = useRef(null);
    const entry = useIntersectionObserver(ref, {
        threshold: 0.5,
        rootMargin: '0px'
    });
    const isVisible = !!entry?.isIntersecting;


    return (
        <Box
            ref={ref}
            className={`animated-section ${isVisible ? 'visible' : ''}`}
            style={{
                transitionDelay: `${delay}ms`,
            }}
            backgroundColor={isVisible ? backgroundColor : 'transparent'}
            transition="opacity 0.6s ease-out, transform 0.6s ease-out, background-color 0.6s ease-out"
            width="100%"
            minHeight="100vh"
        >
            {children}
        </Box>
    );
};

const LandingPage = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const [fallingLogos, setFallingLogos] = useState([]);
    const location = useLocation();


    const handleLogout = () => {
         logout();
         navigate('/');
     }

    const handleRemoveLogo = (id) => {
        setFallingLogos(prevLogos => prevLogos.filter(logo => logo.id !== id));
    };

    const handleGetStartedClick = () => {
        navigate('/main');
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogoClick = () => {
        const newLogos = Array.from({ length: 10 }, () => ({
            id: Date.now() + Math.random(),
            x: Math.random() * window.innerWidth,
            y: -100 - Math.random() * 500,
        }));
        setFallingLogos(prevLogos => [...prevLogos, ...newLogos]);
    };

    useEffect(() => {
        console.log('fallingLogos updated:', fallingLogos);
    }, [fallingLogos]);

    const handlePageNavigation = (page) => {
        navigate(`/${page}`);
    };

    return (
        <ChakraProvider>
            <Box position="relative" className="landing-container">
                <Flex
                    className="user"
                    position="absolute"
                    top="4"
                    right="4"
                    zIndex="2"
                >
                    {user ? (
                        <>
                            <Flex mr="4" align="center" cursor="pointer" onClick={() => navigate('/mypage')} _hover={{ color: 'teal.200' }}>
                                <EditIcon mr="1" />
                                <Text color="white">마이페이지</Text>
                            </Flex>
                            <Flex align="center" cursor="pointer" onClick={handleLogout} _hover={{ color: 'teal.200' }}>
                                <LockIcon mr="1" />
                                <Text color="white">로그아웃</Text>
                            </Flex>

                        </>
                    ) : (

                        <>

                            <Flex mr="4" align="center" cursor="pointer" _hover={{ color: 'teal.200' }}>
                                <LockIcon mr="1" />
                                <Text color="white">로그인</Text>
                            </Flex>
                            <Flex align="center" cursor="pointer" _hover={{ color: 'teal.200' }}>
                                <EditIcon mr="1" />
                                <Text color="white">회원가입</Text>
                            </Flex>


                        </>

                        )}
                </Flex>

                <AnimatedSection backgroundColor="rgba(22, 34, 56, 0.5)">
                    <Box position="relative" width="100%" height="100vh">
                        <Box
                            as="video"
                            autoPlay
                            loop
                            muted
                            position="absolute"
                            top="0"
                            left="0"
                            width="100%"
                            height="100%"
                            objectFit="cover"
                            zIndex="0"
                        >
                            <source src={backgroundVideo} type="video/mp4" />
                            Your browser does not support the video tag.
                        </Box>
                        <Flex direction="column" align="center" justify="center" height="100%" position="relative" zIndex="1">
                            <Image
                                src={logo}
                                alt="JIWOO logo"
                                className="landing-logo"
                                width="90vw"
                                maxWidth="900px"
                                onClick={() => {
                                    console.log('Logo clicked');
                                    handleLogoClick();
                                }}
                                style={{cursor:'pointer'}}
                            />
                            <Box mt="-20px">
                                <ReactTypingEffect
                                    text={['지혜로운 도우미 JIWOO를 경험해보세요!']}
                                    speed={100}
                                    eraseDelay={1000000}
                                    className="landing-typing-effect"
                                />
                            </Box>
                            <Button
                                colorScheme="teal"
                                size="lg"
                                mt={4}
                                onClick={handleGetStartedClick}
                            >
                                Get Started
                            </Button>
                        </Flex>
                    </Box>
                </AnimatedSection>

                <AnimatedSection delay={200} backgroundColor="#F0F8FF">
                    <Flex direction="column" align="center" justify="center" maxWidth="1200px" mx="auto" px={4} mt="300px">
                        <Text fontSize={["3xl", "4xl", "5xl"]} fontWeight="bold" mb={4} color="gray.800" textAlign="center">
                            창업을 원한다면
                        </Text>
                        <Text fontSize={["3xl", "4xl", "5xl"]} fontWeight="bold" mb={10} color="gray.800" textAlign="center">
                            관련 키워드를 검색해보세요!
                        </Text>
                        <Text fontSize={["md", "lg", "xl"]} color="gray.600" textAlign="center" maxWidth="800px" mb={12}>
                            5가지 데이터 분석을 통해<br />
                            원하는 분야의 창업에 대한 정보를 모으세요
                        </Text>
                        <VStack spacing={30} width="100%" maxWidth="2000px">
                            <SimpleGrid columns={[1, null, 3]} spacing="40px" width="100%">
                                <Button
                                    variant="outline"
                                    height="140px"
                                    width="100%"
                                    maxWidth="500px"
                                    onClick={() => handlePageNavigation('Guide')}
                                    borderColor="gray.300"
                                    borderWidth={2}
                                    bg="white"
                                    _hover={{ bg: "gray.50" }}
                                >
                                    <Flex align="center" justify="center" width="100%" pl={4}>
                                        <Image src={guideIcon} alt="Guide" boxSize="70px" mr={6} />
                                        <Text fontSize={["lg", "xl", "2xl"]} fontWeight="bold" whiteSpace="nowrap">창업가이드</Text>
                                    </Flex>
                                </Button>
                                <Button
                                    variant="outline"
                                    height="140px"
                                    width="100%"
                                    maxWidth="500px"
                                    onClick={() => handlePageNavigation('BusinessModel')}
                                    borderColor="gray.300"
                                    borderWidth={2}
                                    bg="white"
                                    _hover={{ bg: "gray.50" }}
                                >
                                    <Flex align="center" justify="center" width="100%" pl={4}>
                                        <Image src={businessIcon} alt="Business Model" boxSize="70px" mr={6} />
                                        <Text fontSize={["lg", "xl", "2xl"]} fontWeight="bold" whiteSpace="nowrap">비즈니스 모델</Text>
                                    </Flex>
                                </Button>
                                <Button
                                    variant="outline"
                                    height="140px"
                                    width="100%"
                                    maxWidth="500px"
                                    onClick={() => handlePageNavigation('MarketResearch')}
                                    borderColor="gray.300"
                                    borderWidth={2}
                                    bg="white"
                                    _hover={{ bg: "gray.50" }}
                                >
                                    <Flex align="center" justify="center" width="100%" pl={4} >
                                        <Image src={marketResearchIcon} alt="Market Research" boxSize="70px" mr={6} />
                                        <Text fontSize={["lg", "xl", "2xl"]} fontWeight="bold" whiteSpace="nowrap">시장조사</Text>
                                    </Flex>
                                </Button>
                            </SimpleGrid>
                            <SimpleGrid columns={[1, null, 2]} spacing="40px" width="100%">
                                <Button
                                    ml="200px"
                                    variant="outline"
                                    height="140px"
                                    width="100%"
                                    maxWidth="350px"
                                    onClick={() => handlePageNavigation('Tax')}
                                    borderColor="gray.300"
                                    borderWidth={2}
                                    bg="white"
                                    _hover={{ bg: "gray.50" }}
                                >
                                    <Flex align="center" justify="center" width="100%" pl={4} >
                                        <Image src={taxIcon} alt="Tax" boxSize="70px" mr={6} />
                                        <Text fontSize={["lg", "xl", "2xl"]} fontWeight="bold" whiteSpace="nowrap">세무처리</Text>
                                    </Flex>
                                </Button>
                                <Button
                                    mr="300px"
                                    variant="outline"
                                    height="140px"
                                    width="100%"
                                    maxWidth="350px"
                                    onClick={() => handlePageNavigation('Info')}
                                    borderColor="gray.300"
                                    borderWidth={2}
                                    bg="white"
                                    _hover={{ bg: "gray.50" }}
                                >
                                    <Flex align="center" justify="center" width="100%" pl={4}>
                                        <Image src={infoIcon} alt="Info" boxSize="70px" mr={6} />
                                        <Text fontSize={["lg", "xl", "2xl"]} fontWeight="bold" whiteSpace="nowrap">정보제공</Text>
                                    </Flex>
                                </Button>
                            </SimpleGrid>
                        </VStack>
                    </Flex>
                </AnimatedSection>
                {fallingLogos.map(logo => (
                    <FallingLogo
                        key={logo.id}
                        x={logo.x}
                        y={logo.y}
                        onRemove={() => handleRemoveLogo(logo.id)}
                    />
                ))}
            </Box>
        </ChakraProvider>
    );
};

export default LandingPage;