import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import chatbotIntro from '../images/chatbotInfo.jpg';
import Accerlator from '../images/Accerlator.png';
import Account from '../images/Account.png';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import {
    Box,
    Flex,
    VStack,
    Text as ChakraText,
    Button,
    Heading,
    Image,
    useColorModeValue,
    IconButton,
    Link,
    SimpleGrid
} from '@chakra-ui/react';
import { FaChevronDown, FaChevronRight, FaChevronLeft, FaRobot, FaChartLine, FaCalculator } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { navigate } from "@storybook/addon-links";

const MotionBox = motion(Box);
const MotionText = motion(ChakraText);
const MotionHeading = motion(Heading);
const MotionButton = motion(Button);

const sentences = [
    { color: "#F56565", text: "Journey to success starts here," },
    { color: "#4299E1", text: "Innovative ideas brought to life," },
    { color: "#48BB78", text: "With wisdom and technology," },
    { color: "#ECC94B", text: "On your side, every step of the way," },
    { color: "#9F7AEA", text: "Offering support, it's JIWOO!" }
];

function CameraController() {
    const { camera } = useThree();
    useEffect(() => {
        camera.position.set(0, 0, 20);
    }, [camera]);
    return null;
}

function Scene() {
    const groupRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        groupRef.current.rotation.y = Math.sin(time / 10) / 4;
        groupRef.current.position.y = Math.sin(time / 4) / 2;
    });

    return (
        <group ref={groupRef}>
            <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} />
            {sentences.map((sentence, index) => (
                <Text
                    key={index}
                    color={sentence.color}
                    fontSize={1.5}
                    maxWidth={200}
                    lineHeight={1.5}
                    letterSpacing={0.02}
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    position={[0, 8 - index * 4, 0]}
                >
                    {sentence.text}
                </Text>
            ))}
        </group>
    );
}
const LandingPage = () => {
    const { user, logout } = useAuth();
    const bg = useColorModeValue('white', 'gray.800');
    const color = useColorModeValue('black', 'white');
    const textBg = useColorModeValue('gray.100', 'gray.700');
    const [currentSection, setCurrentSection] = useState(0);
    const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    const scrollToSection = (sectionNumber) => {
        setCurrentSection(sectionNumber);
        sectionRefs[sectionNumber].current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const handleScroll = (event) => {
            event.preventDefault();
            const direction = event.deltaY > 0 ? 1 : -1;
            const newSection = Math.max(0, Math.min(3, currentSection + direction));
            scrollToSection(newSection);
        };

        window.addEventListener('wheel', handleScroll, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleScroll);
        };
    }, [currentSection]);


    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
        }
    };


    const nextSection = () => setCurrentSection((prev) => (prev + 1) % 4);
    const prevSection = () => setCurrentSection((prev) => (prev - 1 + 4) % 4);

    const renderSection = (index, content) => (
        <MotionBox
            ref={sectionRefs[index]}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSection === index ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: currentSection === index ? 'block' : 'none' }}
        >
            {content}
        </MotionBox>
    );
    return (
        <Box bg={bg} color={color} overflowX="hidden" position="relative" height="100vh">
            {/* 헤더 */}
            <Flex
                as="header"
                position="fixed"
                top={0}
                left={0}
                right={0}
                zIndex={10}
                justify="space-between"
                align="center"
                p={4}
                bg={useColorModeValue('whiteAlpha.800', 'blackAlpha.800')}
            >
                <Heading as="h1" size="lg">JIWOO</Heading>
                <Flex>
                    {user ? (
                        <>
                            <Button as={RouterLink} to="/mypage" variant="ghost" mr={2}>마이페이지</Button>
                            <Button as={RouterLink} to="/main" variant="ghost" mr={2}>메인페이지</Button>
                            <Button onClick={handleLogout} variant="ghost">로그아웃</Button>
                        </>
                    ) : (
                        <>
                            <Button as={RouterLink} to="/login" variant="ghost" mr={2}>로그인</Button>
                            <Button as={RouterLink} to="/join" colorScheme="blue">회원가입</Button>
                        </>
                    )}
                </Flex>
            </Flex>

            {/* 섹션 */}
            {[0, 1, 2, 3].map((index) => (
                <Box
                    key={index}
                    ref={sectionRefs[index]}
                    height="100vh"
                    position="relative"
                    style={{
                        scrollSnapAlign: 'start',
                        scrollSnapStop: 'always',
                    }}
                >
                    {index === 0 ? (
                        <Box height="100vh" position="relative">
                            <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                <Suspense fallback={null}>
                                    <Scene />
                                    <CameraController />
                                    <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
                                </Suspense>
                            </Canvas>
                            <Flex
                                direction="column"
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                                textAlign="center"
                                position="relative"
                                zIndex={2}
                            >

                            </Flex>
                        </Box>
                    ) : index === 1 ? (
                        <Box minH="100vh" position="relative" overflow="hidden">
                            <Box
                                position="absolute"
                                right={0}
                                top={0}
                                bottom={0}
                                w={["100%", "100%", "60%", "65%"]}
                                bg={textBg}
                                clipPath="polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)"
                                zIndex={1}
                            />
                            <Flex
                                direction="column"
                                align="flex-start"
                                justify="center"
                                h="100%"
                                w="100%"
                                p={[4, 6, 8, 12, 16]}
                                zIndex={2}
                                position="relative"
                            >
                                <Box maxW="600px" ml={[0, 0, 8, 16]} mt="300px">
                                    <Heading as="h2" size="2xl" mb={6}>
                                        AI 챗봇으로 창업의 <ChakraText as="span" color="blue.500">모든 단계</ChakraText>를 지원합니다
                                    </Heading>
                                    <ChakraText fontSize="xl" mb={8}>
                                        JIWOO의 AI 챗봇이 창업 과정을 안내하며, 필요한 정보를 손쉽게 제공해 드립니다.
                                        이제 JIWOO와 함께 창업의 모든 단계를 더욱 효율적으로 진행하세요!
                                    </ChakraText>
                                    <Button as={RouterLink} to="/login" leftIcon={<FaRobot />} colorScheme="blue" size="lg">
                                        AI 챗봇 시작하기
                                    </Button>
                                </Box>
                            </Flex>
                            <Box
                                position="absolute"
                                right={[4, 6, 8, 12, 16]}
                                top="50%"
                                transform="translateY(-50%)"
                                w={["80%", "80%", "40%", "35%"]}
                                h="60%"
                                borderRadius="lg"
                                boxShadow="xl"
                                zIndex={2}
                                overflow="hidden"
                            >
                                <Image
                                    src={chatbotIntro}
                                    alt="AI Chatbot Introduction"
                                    objectFit="cover"
                                    w="100%"
                                    h="100%"
                                />
                            </Box>
                        </Box>
                    ) : index === 2 ? (
                        <Box minH="100vh" position="relative" overflow="hidden" bg={bg}>
                            <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                w={["100%", "100%", "60%", "65%"]}
                                bg={textBg}
                                clipPath="polygon(0 0, 100% 0, 80% 100%, 0 100%)"
                                zIndex={1}
                            />
                            <Flex direction="column" minH="100vh" px={[4, 6, 8, 12, 16]} py={16}>
                                <Flex
                                    direction="column"
                                    align="flex-start"
                                    justify="center"
                                    h="100%"
                                    w="100%"
                                    zIndex={2}
                                    position="relative"
                                >
                                    <Box maxW="600px" ml={[0, 0, 8, 16]} mt="300px">
                                        <Heading as="h2" size="2xl" mb={6}>
                                            엑셀러레이팅으로 <ChakraText as="span" color="blue.500">비즈니스를 가속화</ChakraText>하세요
                                        </Heading>
                                        <ChakraText fontSize="xl" mb={8}>
                                            JIWOO의 엑셀러레이팅 서비스는 시장 조사와 비즈니스 모델 분석을 통해
                                            여러분의 아이디어를 성공적인 비즈니스로 발전시킵니다.
                                            전문적인 인사이트와 데이터 기반의 분석으로 여러분의 성공을 지원합니다.
                                        </ChakraText>
                                        <Button as={RouterLink} to="/login" leftIcon={<FaChartLine />} colorScheme="green" size="lg">
                                            엑셀러레이팅 시작하기
                                        </Button>
                                    </Box>
                                </Flex>
                                <Box
                                    position="absolute"
                                    right={[4, 6, 8, 12, 16]}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    w={["80%", "80%", "40%", "35%"]}
                                    h="60%"
                                    bg="gray.200"
                                    borderRadius="lg"
                                    boxShadow="xl"
                                    zIndex={2}
                                >
                                    <Image
                                        src={Accerlator}
                                        alt="Accelerator Introduction"
                                        objectFit="cover"
                                        w="100%"
                                        h="100%"
                                    />
                                </Box>
                            </Flex>
                        </Box>
                    ) : (
                        <Box minH="100vh" position="relative" overflow="hidden" bg={bg}>
                            <Box
                                position="absolute"
                                right={0}
                                top={0}
                                bottom={0}
                                w={["100%", "100%", "60%", "65%"]}
                                bg={textBg}
                                clipPath="polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)"
                                zIndex={1}
                            />
                            <Flex
                                direction="column"
                                align="flex-start"
                                justify="center"
                                h="100%"
                                w="100%"
                                p={[4, 6, 8, 12, 16]}
                                zIndex={2}
                                position="relative"
                            >
                                <Box maxW="600px" ml={[0, 0, 8, 16]} mt="200px">
                                    <Heading as="h2" size="2xl" mb={6}>
                                        스마트한 <ChakraText as="span" color="green.500">세무처리</ChakraText>로 비즈니스에 집중하세요
                                    </Heading>
                                    <ChakraText fontSize="xl" mb={8}>
                                        JIWOO의 첨단 AI 기술을 활용한 세무처리 서비스로 복잡한 세금 문제를 간편하게 해결하세요.
                                        정확하고 효율적인 세무 관리로 시간과 비용을 절약하고, 법적 리스크를 최소화할 수 있습니다.
                                    </ChakraText>
                                    <SimpleGrid columns={2} spacing={4} mb={8}>
                                        <Box>
                                            <Heading as="h3" size="md" mb={2}>자동 세금 계산</Heading>
                                            <ChakraText>AI가 모든 거래를 분석하여 정확한 세금을 자동으로 계산합니다.</ChakraText>
                                        </Box>
                                        <Box>
                                            <Heading as="h3" size="md" mb={2}>실시간 세무 조언</Heading>
                                            <ChakraText>필요할 때 언제든 전문가 수준의 세무 조언을 받을 수 있습니다.</ChakraText>
                                        </Box>
                                        <Box>
                                            <Heading as="h3" size="md" mb={2}>간편한 신고 절차</Heading>
                                            <ChakraText>복잡한 세금 신고 절차를 간소화하여 쉽고 빠르게 처리합니다.</ChakraText>
                                        </Box>
                                        <Box>
                                            <Heading as="h3" size="md" mb={2}>맞춤형 보고서</Heading>
                                            <ChakraText>사업 특성에 맞는 세무 보고서를 자동으로 생성합니다.</ChakraText>
                                        </Box>
                                    </SimpleGrid>
                                    <Button as={RouterLink} to="/login" leftIcon={<FaCalculator />} colorScheme="green" size="lg">
                                        세무처리 시작하기
                                    </Button>
                                </Box>
                            </Flex>
                            <Box
                                position="absolute"
                                right={[4, 6, 8, 12, 16]}
                                top="50%"
                                transform="translateY(-50%)"
                                w={["80%", "80%", "40%", "35%"]}
                                h="60%"
                                bg="gray.200"
                                borderRadius="lg"
                                boxShadow="xl"
                                zIndex={2}
                            >
                                <Image
                                    src={Account}
                                    alt="Smart Accounting"
                                    objectFit="cover"
                                    w="100%"
                                    h="100%"
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            ))}

            {/* 네비게이션 버튼 */}
            <Flex position="fixed" right={4} top="50%" transform="translateY(-50%)" flexDirection="column" zIndex={10}>
                {[0, 1, 2, 3].map((index) => (
                    <IconButton
                        key={index}
                        aria-label={`Go to section ${index + 1}`}
                        icon={<Box w={2} h={2} borderRadius="full" bg={currentSection === index ? "blue.500" : "gray.300"} />}
                        onClick={() => scrollToSection(index)}
                        variant="ghost"
                        size="sm"
                        mb={2}
                    />
                ))}
            </Flex>
        </Box>
    );
};

export default LandingPage;