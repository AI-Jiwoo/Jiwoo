import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Flex, Text, Input, Button, IconButton, Avatar, VStack, HStack,
    Spinner, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
    DrawerCloseButton, useDisclosure, Tooltip, Menu, MenuButton, MenuList, MenuItem, useToast,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, ListItem, UnorderedList
} from '@chakra-ui/react';
import { ChevronDownIcon, DownloadIcon, CopyIcon, LinkIcon, SearchIcon } from '@chakra-ui/icons';
import * as FaIcons from 'react-icons/fa';
import { FaBusinessTime, FaChartLine, FaHome, FaLightbulb, FaRobot, FaShareAlt, FaCalculator } from "react-icons/fa";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { aiApi } from "../apis/api";
import jsPDF from "jspdf";
import ViewModeToggle from "../component/ViewModeToggle";
import ReactTypingEffect from 'react-typing-effect';
import koreanFontUrl from '../font/NanumMyeongjo-Regular.ttf'

const JiwooChatbot = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const messagesEndRef = useRef(null);
    const [researchHistory, setResearchHistory] = useState([]);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // 한국어 폰트 로드 함수
    const loadKoreanFont = async () => {
        const fontResponse = await fetch(koreanFontUrl);
        const fontArrayBuffer = await fontResponse.arrayBuffer();
        const fontBase64 = btoa(
            new Uint8Array(fontArrayBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return fontBase64;
    };

    useEffect(() => {
        fetchResearchHistory();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        if (query && messages.length === 0) {
            sendMessage(query);
        }
    }, [location, messages.length]);

    const fetchResearchHistory = async () => {
        try {
            const response = await api.get('/market-research/history');
            if (Array.isArray(response.data)) {
                setResearchHistory(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setResearchHistory([]);
            }
        } catch (error) {
            console.error('Failed to fetch research history:', error);
            toast({
                title: "조회 이력을 불러오는데 실패했습니다.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setResearchHistory([]);
        }
    };

    const sendMessage = useCallback(async (message = inputMessage) => {
        if (!message.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: message };
        setMessages(prev => [...prev, userMessage]);

        setIsLoading(true);
        setInputMessage('');

        try {
            const response = await aiApi.post('/chat', { message });
            const botMessage = { sender: 'bot', text: response.data.message };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            const errorMessage = { sender: 'bot', text: '죄송합니다. 오류가 발생했습니다.' };
            setMessages(prev => [...prev, errorMessage]);
            toast({
                title: "메시지 전송 실패",
                description: "죄송합니다. 오류가 발생했습니다.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }

        navigate(`?q=${encodeURIComponent(message)}`, { replace: true });
    }, [inputMessage, isLoading, navigate, toast]);

    const selectResearch = (research) => {
        setSelectedResearch(research);
        toast({
            title: "시장조사 선택됨",
            description: `"${research.title}" 컨텍스트로 설정되었습니다.`,
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    const quickAsk = (question) => {
        setInputMessage(question);
        sendMessage(question);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "복사 완료",
                description: "메시지가 클립보드에 복사되었습니다.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        }, (err) => {
            console.error('복사 실패: ', err);
            toast({
                title: "복사 실패",
                description: "메시지 복사에 실패했습니다.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        });
    };

    const shareMessage = (text) => {
        toast({
            title: "공유 기능",
            description: "공유 기능은 아직 구현되지 않았습니다.",
            status: "info",
            duration: 2000,
            isClosable: true,
        });
    };


    const downloadAsPDF = async (question, answer) => {
        const koreanFont = await loadKoreanFont();

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        // Add font to the VFS
        doc.addFileToVFS('NanumMyeongjo-Regular.ttf', koreanFont);
        doc.addFont('NanumMyeongjo-Regular.ttf', 'NanumMyeongjo', 'normal');
        doc.setFont('NanumMyeongjo');

        // Define template layout
        const title = 'Jiwoo AI 답변';
        const questionLabel = '질문:';
        const answerLabel = '답변:';
        const date = new Date().toLocaleDateString();

        // Title
        doc.setFontSize(18);
        doc.text(title, 10, 10);

        // Date
        doc.setFontSize(10);
        doc.text(`작성일: ${date}`, 10, doc.internal.pageSize.height - 10);

        // Question
        doc.setFontSize(14);
        doc.text(questionLabel, 10, 20);
        doc.setFontSize(12);
        const questionSplitText = doc.splitTextToSize(question, 180);
        doc.text(questionSplitText, 10, 30);

        // Answer
        doc.setFontSize(14);
        doc.text(answerLabel, 10, 50);
        doc.setFontSize(12);
        const answerSplitText = doc.splitTextToSize(answer, 180);
        doc.text(answerSplitText, 10, 60);

        // Save the PDF
        doc.save('jiwoo_ai_chat.pdf');
    };



    const renderAnswer = () => {
        return messages.map((message, index) => {
            const isUserMessage = message.sender === 'user';
            const isBotMessage = message.sender === 'bot';
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const question = isUserMessage ? message.text : (prevMessage && prevMessage.sender === 'user' ? prevMessage.text : '');
            const answer = isBotMessage ? message.text : '';

            return (
                <Box key={index} mb={8}>
                    <Text fontSize="2xl" fontWeight="bold" mb={4}>
                        {isUserMessage ? `질문: ${message.text}` : '답변'}
                    </Text>
                    {isBotMessage && (
                        <>
                            <HStack mb={4}>
                                <Avatar size="sm" icon={<FaRobot />} bg="blue.500" />
                                <Text fontWeight="bold" fontSize="xl">Jiwoo</Text>
                            </HStack>
                            <Text fontSize="lg" mb={4}>
                                <ReactTypingEffect
                                    text={message.text}
                                    typingDelay={50}
                                    speed={50}
                                    eraseDelay={1000000}
                                />
                            </Text>

                            <HStack spacing={2} mb={4}>
                                <Button size="sm" leftIcon={<LinkIcon />} onClick={() => shareMessage(message.text)}>공유</Button>
                                <Button size="sm" leftIcon={<CopyIcon />} onClick={() => copyToClipboard(message.text)}>복사</Button>
                                <Button size="sm" leftIcon={<DownloadIcon />} onClick={() => downloadAsPDF(question, message.text)}>PDF 저장</Button>
                            </HStack>
                            <Accordion allowToggle>
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton>
                                            <Box flex="1" textAlign="left">출처</Box>
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        <Text>출처 1: 예시 URL</Text>
                                        <Text>출처 2: 예시 URL</Text>
                                    </AccordionPanel>
                                </AccordionItem>
                            </Accordion>
                        </>
                    )}
                </Box>
            );
        });
    };
    return (
        <Flex h="100vh">
            {/* 사이드바 */}
            <VStack w="200px" bg="blue.600" p={4} spacing={8} align="stretch">
                <VStack align="center" spacing={4}>
                    <Avatar size="xl" icon={<FaRobot />} bg="white" color="blue.600" />
                    <Text fontSize="2xl" fontWeight="bold" color="white">Jiwoo AI</Text>
                </VStack>
                <VStack spacing={4} align="stretch">
                    <Button leftIcon={<FaHome />} justifyContent="flex-start" variant="ghost" color="white" fontSize="lg" onClick={() => navigate('/')}>
                        홈
                    </Button>
                    <Button leftIcon={<FaChartLine />} justifyContent="flex-start" variant="ghost" color="white" fontSize="lg" onClick={() => navigate('/market-research')}>
                        시장조사
                    </Button>
                    <Button leftIcon={<FaBusinessTime />} justifyContent="flex-start" variant="ghost" color="white" fontSize="lg" onClick={() => navigate('/business-model')}>
                        비즈니스모델
                    </Button>
                    <Button leftIcon={<FaCalculator />} justifyContent="flex-start" variant="ghost" color="white" fontSize="lg" onClick={() => navigate('/accounting')}>
                        세무처리
                    </Button>
                </VStack>
            </VStack>

            {/* 메인 컨텐츠 영역 */}
            <Flex flex={1} direction="column">
                {/* 헤더 */}
                <Flex align="center" justify="space-between" p={6} bg="white" borderBottomWidth={1} boxShadow="sm">
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">Jiwoo AI 창업지원센터</Text>
                    <ViewModeToggle/>
                    <HStack>
                        <Menu>
                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" size="lg">
                                {selectedResearch ? selectedResearch.title : "시장조사 선택"}
                            </MenuButton>
                            <MenuList>
                                {Array.isArray(researchHistory) && researchHistory.length > 0 ? (
                                    researchHistory.map(research => (
                                        <MenuItem key={research.id} onClick={() => selectResearch(research)}>
                                            <HStack>
                                                {React.createElement(FaIcons[research.icon] || FaIcons.FaFile)}
                                                <Text>{research.title}</Text>
                                            </HStack>
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem isDisabled>시장조사 이력이 없습니다</MenuItem>
                                )}
                            </MenuList>
                        </Menu>
                        <Tooltip label="선택한 시장조사의 핵심 인사이트 물어보기">
                            <IconButton
                                icon={<FaLightbulb />}
                                onClick={() => quickAsk("이 시장조사의 핵심 인사이트는 무엇인가요?")}
                                isDisabled={!selectedResearch}
                                colorScheme="blue"
                                size="lg"
                            />
                        </Tooltip>
                    </HStack>
                </Flex>

                {/* 챗봇 인터페이스 */}
                <Flex flex={1} direction="column" bg="white" p={8} overflowY="auto">
                    {messages.length === 0 ? (
                        <VStack spacing={6} align="center" justify="center" flex={1}>
                            <Text fontSize="3xl" fontWeight="bold" color="blue.600">Jiwoo AI 챗봇에 오신 것을 환영합니다!</Text>
                            <Text fontSize="xl" color="gray.500" textAlign="center" maxW="600px">
                                시장조사, 비즈니스 모델, 세무처리에 관한 질문을 해보세요.<br />
                                AI가 최선을 다해 답변해 드리겠습니다.
                            </Text>
                        </VStack>
                    ) : (
                        renderAnswer()
                    )}
                </Flex>

                {/* 입력 영역 */}
                <Box p={4} bg="white" borderTopWidth={1} boxShadow="sm">
                    <HStack>
                        <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="질문을 입력하세요..."
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            size="lg"
                            borderRadius="full"
                        />
                        <IconButton
                            icon={<SearchIcon />}
                            onClick={() => sendMessage()}
                            isLoading={isLoading}
                            colorScheme="blue"
                            aria-label="Send message"
                            size="lg"
                            borderRadius="full"
                        />
                    </HStack>
                </Box>
            </Flex>

            {/* 히스토리 드로어 */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader fontSize="2xl" color="blue.600">대화 히스토리</DrawerHeader>
                    <DrawerBody>
                        {/* 히스토리 내용 */}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    );
};
export default JiwooChatbot;