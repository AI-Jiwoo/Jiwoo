import React, {useEffect, useRef, useState} from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
    Box,
    Flex,
    VStack,
    Text,
    Button,
    Heading,
    Image,
    useColorModeValue,
    IconButton, Link
} from '@chakra-ui/react';
import { FaChevronDown, FaRobot } from 'react-icons/fa';
import {AnimatePresence, motion, useAnimation, useInView} from 'framer-motion';
import landingImage from '../images/landing.png';
import {navigate} from "@storybook/addon-links";

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);
const MotionButton = motion(Button);


const LandingPage = () => {
    const bg = useColorModeValue('white', 'gray.800');
    const color = useColorModeValue('black', 'white');
    const textBg = useColorModeValue('gray.100', 'gray.700');
    const chatbotSectionRef = useRef(null);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
    const controls = useAnimation();
    const [isVisible, setIsVisible] = useState(false);

    const scrollToChatbotSection = () => {
        chatbotSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sentences = [
        { color: "red.500", text: "Journey to success starts here," },
        { color: "blue.500", text: "Innovative ideas brought to life," },
        { color: "green.500", text: "With wisdom and technology," },
        { color: "yellow.500", text: "On your side, every step of the way," },
        { color: "purple.500", text: "Offering support, it's JIWOO!" }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    controls.start('visible');
                }
            },
            { threshold: 0.1 }
        );

        if (chatbotSectionRef.current) {
            observer.observe(chatbotSectionRef.current);
        }

        return () => {
            if (chatbotSectionRef.current) {
                observer.unobserve(chatbotSectionRef.current);
            }
        };
    }, [controls]);

    return (
        <Box bg={bg} color={color} overflowX="hidden">
            {/* 첫 번째 섹션 (기존 랜딩 페이지) */}
            <Flex direction="column" minH="100vh" px={[4, 6, 8, 12, 16]}>
                <Flex justify="space-between" align="center" py={6}>
                    <Heading as="h1" size="lg">JIWOO</Heading>
                    <Flex>
                        <Link as={RouterLink} to="/login" mx={3}>
                            <Button variant="ghost">로그인</Button>
                        </Link>
                        <Link as={RouterLink} to="/join" mx={3}>
                            <Button colorScheme="blue">회원가입</Button>
                        </Link>
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
                            maxW="80%"
                            maxH="80%"
                            objectFit="contain"
                        />
                    </Flex>
                </Flex>
                <Flex justify="center" py={8}>
                    <IconButton
                        aria-label="Scroll to chatbot section"
                        icon={<FaChevronDown />}
                        onClick={scrollToChatbotSection}
                        size="lg"
                        rounded="full"
                    />
                </Flex>
            </Flex>


            {/* 챗봇 소개 섹션 */}
            <Box ref={chatbotSectionRef} h="100vh" position="relative" overflow="hidden">
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
                    position="absolute"
                    top="0"
                    left="0"
                >
                    <Box maxW="600px" ml={[0, 0, 8, 16]}>
                        <MotionHeading
                            as="h2"
                            size="2xl"
                            mb={6}
                            initial="hidden"
                            animate={controls}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            AI 챗봇으로 창업의 <Text as="span" color="blue.500">모든 단계</Text>를 지원합니다
                        </MotionHeading>
                        <MotionText
                            fontSize="xl"
                            mb={8}
                            initial="hidden"
                            animate={controls}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            JIWOO의 AI 챗봇이 창업 과정을 안내하며, 필요한 정보를 손쉽게 제공해 드립니다.
                            이제 JIWOO와 함께 창업의 모든 단계를 더욱 효율적으로 진행하세요!
                        </MotionText>
                        <MotionButton
                            leftIcon={<FaRobot />}
                            colorScheme="blue"
                            size="lg"
                            initial="hidden"
                            animate={controls}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            AI 챗봇 시작하기
                        </MotionButton>
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
                    {/* 여기에 나중에 챗봇 이미지나 인터페이스를 추가할 수 있습니다 */}
                    <Flex h="100%" justify="center" align="center">
                        <Text fontSize="xl" fontWeight="bold">챗봇 이미지 영역</Text>
                    </Flex>
                </Box>
            </Box>
        </Box>
    );
};

export default LandingPage;