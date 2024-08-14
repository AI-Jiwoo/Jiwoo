import React, {useEffect, useRef, useState} from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import chatbotIntro from '../images/chatbotInfo.jpg';
import Accerlator from '../images/Accerlator.png'
import Account from '../images/Account.png'

import {
    Box,
    Flex,
    VStack,
    Text,
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
import landingImage from '../images/landing.png';

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);
const MotionButton = motion(Button);

const LandingPage = () => {
    const { user } = useAuth();
    const bg = useColorModeValue('white', 'gray.800');
    const color = useColorModeValue('black', 'white');
    const textBg = useColorModeValue('gray.100', 'gray.700');
    const [currentSection, setCurrentSection] = useState(0);
    const firstSectionRef = useRef(null);
    const secondSectionRef = useRef(null);
    const thirdSectionRef = useRef(null);
    const fourthSectionRef = useRef(null);

    const scrollToSection = (sectionNumber) => {
        setCurrentSection(sectionNumber);
        const sectionRefs = [firstSectionRef, secondSectionRef, thirdSectionRef, fourthSectionRef];
        setTimeout(() => {
            sectionRefs[sectionNumber].current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const nextSection = () => {
        setCurrentSection((prev) => (prev + 1) % 4);
    };

    const prevSection = () => {
        setCurrentSection((prev) => (prev - 1 + 4) % 4);
    };

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         nextSection();
    //     }, 20000);
    //
    //     return () => clearInterval(timer);
    // }, []);

    const sentences = [
        { color: "red.500", text: "Journey to success starts here," },
        { color: "blue.500", text: "Innovative ideas brought to life," },
        { color: "green.500", text: "With wisdom and technology," },
        { color: "yellow.500", text: "On your side, every step of the way," },
        { color: "purple.500", text: "Offering support, it's JIWOO!" }
    ];

    return (
        <Box bg={bg} color={color} overflowX="hidden">
            {/* 첫 번째 섹션 */}
            <MotionBox
                ref={firstSectionRef}
                initial={{ y : 0 }}
                animate={{ y : currentSection === 0 ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: currentSection === 0 ? 'flex' : 'none' }}
            >
            <Flex
                ref={firstSectionRef}
                direction="column"
                minH="100vh"
                px={[4, 6, 8, 12, 16]}
                style={{display: currentSection === 0 ? 'flex' : 'none'}}
            >
                <Flex justify="space-between" align="center" py={6}>
                    <Heading as="h1" size="lg">JIWOO</Heading>
                    <Flex>
                        {user ? (
                            <>
                                <Link as={RouterLink} to="/mypage" mx={3}>
                                    <Button variant="ghost">마이페이지</Button>
                                </Link>
                                <Link as={RouterLink} to="/main" mx={3}>
                                    <Button colorScheme="blue">메인페이지</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link as={RouterLink} to="/login" mx={3}>
                                    <Button variant="ghost">로그인</Button>
                                </Link>
                                <Link as={RouterLink} to="/join" mx={3}>
                                    <Button colorScheme="blue">회원가입</Button>
                                </Link>
                            </>
                        )}
                    </Flex>
                </Flex>

                <Flex flex={1} position="relative">
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
                    <VStack
                        align="flex-start"
                        w={["100%", "100%", "55%", "60%"]}
                        spacing={12}
                        p={[4, 6, 8, 12, 16]}
                        zIndex={2}
                    >
                        <Heading as="h2" fontSize={["4xl", "5xl", "6xl", "7xl"]} lineHeight={1.5} fontWeight="extrabold">
                            {sentences.map((sentence, index) => (
                                <MotionText
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.3 }}
                                    mb={6}
                                >
                                    <Text as="span" color={sentence.color}>{sentence.text[0]}</Text>
                                    {sentence.text.slice(1)}
                                </MotionText>
                            ))}
                        </Heading>
                        <Text fontSize={["2xl", "3xl"]} fontWeight="bold">창업의 여정, JIWOO가 함께합니다</Text>
                        <Flex mt={4}>
                            <Button colorScheme="gray" mr={4} size="lg">App Store</Button>
                            <Button colorScheme="gray" size="lg">Google Play</Button>
                            <Button as={RouterLink} to="/main" colorScheme="gray" size="lg">
                                웹으로 체험하기
                            </Button>
                        </Flex>
                    </VStack>
                    <Flex
                        w={["100%", "100%", "40%", "35%"]}
                        justify="center"
                        align="center"
                        zIndex={2}
                    >
                        <Image
                            src={landingImage}
                            alt="AI assistant for IT startups"
                            maxW="90%"
                            maxH="90%"
                            objectFit="contain"
                        />
                    </Flex>
                </Flex>
                <Flex justify="center" py={8}>
                    <IconButton
                        aria-label="Scroll to next section"
                        icon={<FaChevronDown />}
                        onClick={() => scrollToSection(1)}
                        size="lg"
                        rounded="full"
                    />
                </Flex>
            </Flex>
            </MotionBox>

            {/* 두 번째 섹션 */}
            <MotionBox
                ref={secondSectionRef}
                initial={{ y: 0 }}
                animate={{ y: currentSection === 1 ? 1 : "100vh" }}
                exit={{ y: "100vh" }}
                transition={{ duration: 0.5 }}
                style={{ display: currentSection === 1 ? 'block' : 'none' }}
            >
            <Box
                ref={secondSectionRef}
                minH="100vh"
                position="relative"
                overflow="hidden"
                style={{display: currentSection === 1 ? 'block' : 'none'}}
            >
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
                    <Box maxW="600px" ml={[0, 0, 8, 16]} mt="300px" ml="100px">
                        <Heading as="h2" size="2xl" mb={6}>
                            AI 챗봇으로 창업의 <Text as="span" color="blue.500">모든 단계</Text>를 지원합니다
                        </Heading>
                        <Text fontSize="xl" mb={8}>
                            JIWOO의 AI 챗봇이 창업 과정을 안내하며, 필요한 정보를 손쉽게 제공해 드립니다.
                            이제 JIWOO와 함께 창업의 모든 단계를 더욱 효율적으로 진행하세요!
                        </Text>
                        <Button leftIcon={<FaRobot />} colorScheme="blue" size="lg">
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
                <IconButton
                    aria-label="Go to previous section"
                    icon={<FaChevronLeft />}
                    onClick={prevSection}
                    size="lg"
                    rounded="full"
                    colorScheme="blue"
                    boxShadow="lg"
                    position="absolute"
                    top="50%"
                    left={8}
                    transform="translateY(-50%)"
                    zIndex={3}
                />
                <IconButton
                    aria-label="Go to next section"
                    icon={<FaChevronRight />}
                    onClick={nextSection}
                    size="lg"
                    rounded="full"
                    colorScheme="blue"
                    boxShadow="lg"
                    position="absolute"
                    top="50%"
                    right={8}
                    transform="translateY(-50%)"
                    zIndex={3}
                />
            </Box>
            </MotionBox>

            {/* 세 번째 섹션 (엑셀러레이팅) */}
            <AnimatePresence>
                {(currentSection === 2 || currentSection === 3) && (
                    <MotionBox
                        ref={thirdSectionRef}
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '-100%' }}
                        transition={{ duration: 0.5 }}
                        position={currentSection === 2 ? "fixed" : "relative"}
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg={bg}
                        zIndex={currentSection === 2 ? 10 : 1}
                        overflowY="auto"
                    >
                        <Flex direction="column" minH="100vh" px={[4, 6, 8, 12, 16]} py={16}>
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
                            <Flex
                                direction="column"
                                align="flex-start"
                                justify="center"
                                h="100%"
                                w="100%"
                                zIndex={2}
                                position="relative"
                            >
                                <Box maxW="600px" ml={[0, 0, 8, 16]} mt="300px" ml="150px">
                                    <Heading as="h2" size="2xl" mb={6}>
                                        엑셀러레이팅으로 <Text as="span" color="blue.500">비즈니스를 가속화</Text>하세요
                                    </Heading>
                                    <Text fontSize="xl" mb={8}>
                                        JIWOO의 엑셀러레이팅 서비스는 시장 조사와 비즈니스 모델 분석을 통해
                                        여러분의 아이디어를 성공적인 비즈니스로 발전시킵니다.
                                        전문적인 인사이트와 데이터 기반의 분석으로 여러분의 성공을 지원합니다.
                                    </Text>
                                    <Button leftIcon={<FaChartLine />} colorScheme="green" size="lg">
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
                                <Flex h="100%" justify="center" align="center">

                                        <Image
                                            src={Accerlator}
                                            alt="AI Chatbot Introduction"
                                            objectFit="cover"
                                            w="100%"
                                            h="100%"
                                        />
                                </Flex>
                            </Box>
                        </Flex>
                        <IconButton
                            aria-label="Go to previous section"
                            icon={<FaChevronLeft />}
                            onClick={prevSection}
                            size="lg"
                            rounded="full"
                            colorScheme="blue"
                            boxShadow="lg"
                            position="absolute"
                            top="50%"
                            left={8}
                            transform="translateY(-50%)"
                            zIndex={3}
                        />
                        <IconButton
                            aria-label="Go to next section"
                            icon={<FaChevronRight />}
                            onClick={nextSection}
                            size="lg"
                            rounded="full"
                            colorScheme="blue"
                            boxShadow="lg"
                            position="absolute"
                            top="50%"
                            right={8}
                            transform="translateY(-50%)"
                            zIndex={3}
                        />
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* 네 번째 섹션 (세무처리) */}
            <AnimatePresence>
                {currentSection === 3 && (
                    <MotionBox
                        ref={fourthSectionRef}
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '-100%' }}
                        transition={{ duration: 0.5 }}
                        position="fixed"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg={bg}
                        zIndex={10}
                        overflowY="auto"
                    >
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
                                <Box maxW="600px" ml={[0, 0, 8, 16]} mt="200px" ml="100px">
                                    <Heading as="h2" size="2xl" mb={6}>
                                        스마트한 <Text as="span" color="green.500">세무처리</Text>로 비즈니스에 집중하세요
                                    </Heading>
                                    <Text fontSize="xl" mb={8}>
                                        JIWOO의 첨단 AI 기술을 활용한 세무처리 서비스로 복잡한 세금 문제를 간편하게 해결하세요.
                                        정확하고 효율적인 세무 관리로 시간과 비용을 절약하고, 법적 리스크를 최소화할 수 있습니다.
                                    </Text>
                                    <SimpleGrid columns={2} spacing={4} mb={8}>
                                        <Box>
                                            <Heading as="h3" size="md" mb={2}>자동 세금 계산</Heading>
                                            <Text>AI가 모든 거래를 분석하여 정확한 세금을 자동으로 계산합니다.</Text>
                                        </Box>
                                        <Box>
                                            <Heading as="h3" size="md" mb={2}>실시간 세무 조언</Heading>
                                            <Text>필요할 때 언제든 전문가 수준의 세무 조언을 받을 수 있습니다.</Text>
                                        </Box>
                                        <Box>
                                            <Heading as="h3" size="md" mb={2}>간편한 신고 절차</Heading>
                                            <Text>복잡한 세금 신고 절차를 간소화하여 쉽고 빠르게 처리합니다.</Text>
                                        </Box>
                                        <Box>
                                            <Heading as="h3" size="md" mb={2}>맞춤형 보고서</Heading>
                                            <Text>사업 특성에 맞는 세무 보고서를 자동으로 생성합니다.</Text>
                                        </Box>
                                    </SimpleGrid>
                                    <Button leftIcon={<FaCalculator />} colorScheme="green" size="lg">
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
                                <Flex h="100%" justify="center" align="center">
                                    <Image
                                        src={Account}
                                        alt="AI Chatbot Introduction"
                                        objectFit="cover"
                                        w="100%"
                                        h="100%"
                                    />                                </Flex>
                            </Box>
                            <IconButton
                                aria-label="Go to previous section"
                                icon={<FaChevronLeft />}
                                onClick={prevSection}
                                size="lg"
                                rounded="full"
                                colorScheme="blue"
                                boxShadow="lg"
                                position="absolute"
                                top="50%"
                                left={8}
                                transform="translateY(-50%)"
                                zIndex={3}
                            />
                            <IconButton
                                aria-label="Go to next section"
                                icon={<FaChevronRight />}
                                onClick={nextSection}
                                size="lg"
                                rounded="full"
                                colorScheme="blue"
                                boxShadow="lg"
                                position="absolute"
                                top="50%"
                                right={8}
                                transform="translateY(-50%)"
                                zIndex={3}
                            />
                        </Box>
                    </MotionBox>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default LandingPage;