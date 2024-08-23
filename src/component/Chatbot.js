import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Flex, Text, Input, Button, IconButton, Avatar, VStack, HStack,
    Spinner, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
    DrawerCloseButton, useDisclosure, Tooltip, Menu, MenuButton, MenuList, MenuItem, useToast,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, Badge, Textarea,
    Image, SimpleGrid
} from '@chakra-ui/react';
import {
    ChevronDownIcon,
    DownloadIcon,
    CopyIcon,
    LinkIcon,
    SearchIcon,
    ChevronRightIcon,
    AttachmentIcon, AddIcon
} from '@chakra-ui/icons';
import * as FaIcons from 'react-icons/fa';
import {
    FaBusinessTime,
    FaChartLine,
    FaHome,
    FaLightbulb,
    FaRobot,
    FaShareAlt,
    FaCalculator,
    FaImage
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { aiApi } from "../apis/api";
import jsPDF from "jspdf";
import ReactTypingEffect from 'react-typing-effect';
import koreanFontUrl from '../font/NanumMyeongjo-Regular.ttf'
import ChatLoading from "./ChatLoading";

const Chatbot = () => {
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
    const [imageResults, setImageResults] = useState([]);

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


    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };


    const navigateAndRefresh = (path) => {
        navigate(path);
        window.location.href = path;
    }

    const navigateHome = () => {
        navigateAndRefresh('/main/home');
    };

    const navigateMarketResearch = () => {
        navigateAndRefresh('/main/market-research');
    };

    const navigateBusinessModel = () => {
        navigateAndRefresh('/main/business-model');
    };

    const accounting = () => {
        navigateAndRefresh('/main/accounting');
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
        const botMessage = { sender: 'bot', text: '' };
        setMessages(prev => [...prev, userMessage, botMessage]);

        setIsLoading(true);
        setInputMessage('');

        try {
            const response = await aiApi.post('/chat', { message });
            setMessages(prev => prev.map((msg, index) =>
                index === prev.length - 1 ? { ...msg, text: response.data.message } : msg
            ));

            // 메시지 전송 후 관련 이미지 검색 (실제 API 호출로 대체 필요)
            const imageSearchResults = await mockImageSearch(message);
            setImageResults(imageSearchResults);
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            setMessages(prev => prev.map((msg, index) =>
                index === prev.length - 1 ? { ...msg, text: '죄송합니다. 오류가 발생했습니다.' } : msg
            ));
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

    // 임시 이미지 검색 함수 (실제 API로 대체 필요)
    const mockImageSearch = async (query) => {
        // 실제 구현에서는 이 부분을 API 호출로 대체해야 합니다.
        return [
            "https://via.placeholder.com/150",
            "https://via.placeholder.com/150",
            "https://via.placeholder.com/150",
            "https://via.placeholder.com/150",
        ];
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                setInputMessage(prev => prev + "\n\n[첨부 파일 내용]\n" + content);
            };
            reader.readAsText(file);
        }
    };

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

        doc.addFileToVFS('NanumMyeongjo-Regular.ttf', koreanFont);
        doc.addFont('NanumMyeongjo-Regular.ttf', 'NanumMyeongjo', 'normal');
        doc.setFont('NanumMyeongjo');

        const title = 'Jiwoo AI 답변';
        const questionLabel = '질문:';
        const answerLabel = '답변:';
        const date = new Date().toLocaleDateString();

        doc.setFontSize(18);
        doc.text(title, 10, 10);

        doc.setFontSize(10);
        doc.text(`작성일: ${date}`, 10, doc.internal.pageSize.height - 10);

        doc.setFontSize(14);
        doc.text(questionLabel, 10, 20);
        doc.setFontSize(12);
        const questionSplitText = doc.splitTextToSize(question, 180);
        doc.text(questionSplitText, 10, 30);

        doc.setFontSize(14);
        doc.text(answerLabel, 10, 50);
        doc.setFontSize(12);
        const answerSplitText = doc.splitTextToSize(answer, 180);
        doc.text(answerSplitText, 10, 60);

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
                <Box key={index} mb={8} p={4} borderRadius="lg" bg={isUserMessage ? "blue.50" : "white"} boxShadow="sm">
                    {isUserMessage ? (
                        <HStack alignItems="flex-start" mb={4}>
                            <Avatar size="sm" name="User" bg="blue.500" />
                            <Text fontWeight="bold" fontSize="lg">{message.text}</Text>
                        </HStack>
                    ) : (
                        <>
                            <HStack mb={4} alignItems="flex-start">
                                <Avatar size="sm" icon={<FaRobot />} bg="blue.500" />
                                <VStack align="start" flex={1} spacing={4}>
                                    <Text fontWeight="bold" fontSize="lg" color="blue.600">Jiwoo</Text>
                                    {message.text ? (
                                        <Text fontSize="md" color="gray.700">
                                            <ReactTypingEffect
                                                text={message.text}
                                                typingDelay={50}
                                                speed={50}
                                                eraseDelay={1000000}
                                            />
                                        </Text>
                                    ) : (
                                        <HStack>
                                            <Text fontSize="md" color="gray.700">답변 생성 중...</Text>
                                            <ChatLoading />
                                        </HStack>
                                    )}
                                </VStack>
                            </HStack>

                            {message.text && (
                                <>
                                    <HStack spacing={2} mb={4}>
                                        <Button size="sm" leftIcon={<LinkIcon />} onClick={() => shareMessage(message.text)} colorScheme="blue" variant="outline">공유</Button>
                                        <Button size="sm" leftIcon={<CopyIcon />} onClick={() => copyToClipboard(message.text)} colorScheme="blue" variant="outline">복사</Button>
                                        <Button size="sm" leftIcon={<DownloadIcon />} onClick={() => downloadAsPDF(question, message.text)} colorScheme="blue" variant="outline">PDF 저장</Button>
                                    </HStack>
                                    <Accordion allowToggle>
                                        <AccordionItem>
                                            <h2>
                                                <AccordionButton>
                                                    <Box flex="1" textAlign="left" color="blue.600">출처</Box>
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel pb={4}>
                                                <Text color="gray.600">출처 1: 예시 URL</Text>
                                                <Text color="gray.600">출처 2: 예시 URL</Text>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    </Accordion>
                                </>
                            )}
                        </>
                    )}
                </Box>
            );
        });
    };

    const relatedQuestions = [
        "하이로 시작하는 인사말은 어떤 게 좋을까",
        "하이로 시작하는 메일은 어떻게 작성해야 할까",
        "하이로 시작하는 인사말의 효과는 무엇일까",
        "하이로 시작하는 인사말의 예시를 알려줘",
        "하이로 시작하는 인사말이 중요한 이유는 무엇일까"
    ];

    return (
        <Flex h="100vh">
            {/* 사이드바 */}
            <VStack w="200px" bg="blue.100" p={4} spacing={8} align="stretch">
                <VStack align="center" spacing={4}>
                    <Avatar size="xl" icon={<FaRobot />} bg="blue.500" color="white" />
                    <Text fontSize="2xl" fontWeight="bold" color="blue.700">Jiwoo AI</Text>
                </VStack>
                <VStack spacing={4} align="stretch">
                    <Button leftIcon={<FaHome />} justifyContent="flex-start" variant="ghost" color="blue.700" fontSize="lg" onClick={navigateHome}>
                        홈
                    </Button>
                    <Button leftIcon={<FaChartLine />} justifyContent="flex-start" variant="ghost" color="blue.700" fontSize="lg" onClick={navigateMarketResearch}>
                        시장조사
                    </Button>
                    <Button leftIcon={<FaBusinessTime />} justifyContent="flex-start" variant="ghost" color="blue.700" fontSize="lg" onClick={navigateBusinessModel}>
                        비즈니스모델
                    </Button>
                    <Button leftIcon={<FaCalculator />} justifyContent="flex-start" variant="ghost" color="blue.700" fontSize="lg" onClick={accounting}>
                        세무처리
                    </Button>
                </VStack>
            </VStack>

            {/* 메인 컨텐츠 영역 */}
            <Flex flex={1} direction="column">
                {/* 헤더 */}
                <Flex align="center" justify="space-between" p={4} bg="white" borderBottomWidth={1} boxShadow="sm">
                    <HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">Jiwoo AI</Text>
                        <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="full">창업지원센터</Badge>
                    </HStack>
                    <HStack>
                        <Menu>
                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" variant="outline">
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
                                variant="outline"
                            />
                        </Tooltip>
                    </HStack>
                </Flex>

                {/* 채팅 및 이미지 영역 */}
                <Flex flex={1} overflow="hidden">
                    {/* 채팅 영역 */}
                    <Flex flex={3} direction="column" bg="gray.50" overflowY="auto" p={8}>
                        {messages.length === 0 ? (
                            <VStack spacing={6} align="center" justify="center" flex={1}>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.600">Jiwoo AI 챗봇에 오신 것을 환영합니다!</Text>
                                <Text fontSize="xl" color="gray.600" textAlign="center" maxW="600px">
                                    시장조사, 비즈니스 모델, 세무처리에 관한 질문을 해보세요.<br />
                                    AI가 최선을 다해 답변해 드리겠습니다.
                                </Text>
                            </VStack>
                        ) : (
                            renderAnswer()
                        )}
                    </Flex>

                    {/* 이미지 표시 영역 */}
                    <Flex flex={1} direction="column" p={4} borderLeft="1px" borderColor="gray.200" overflowY="auto">
                        <Text fontSize="xl" fontWeight="bold" mb={4}>관련 이미지</Text>
                        <SimpleGrid columns={2} spacing={4}>
                            {imageResults.map((imageUrl, index) => (
                                <Image key={index} src={imageUrl} alt={`Related image ${index + 1}`} borderRadius="md" />
                            ))}
                        </SimpleGrid>
                    </Flex>
                </Flex>

                {/* 입력 영역 */}
                <Box p={6} bg="white" borderTopWidth={1} borderColor="gray.200">
                    <Flex
                        maxWidth="1300px"
                        position="relative"
                        alignItems="center"
                        boxShadow="0 0 10px rgba(0,0,0,0.1)"
                        borderRadius="full"
                        overflow="hidden"
                        mr="400px"
                    >
                        <IconButton
                            icon={<AddIcon />}
                            size="md"
                            colorScheme="blue"
                            variant="ghost"
                            aria-label="Attach file"
                            onClick={() => document.getElementById('file-upload').click()}
                            ml={2}
                        />
                        <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="질문을 입력하세요..."
                            size="lg"
                            height="60px"
                            fontSize="xl"
                            border="none"
                            _focus={{ boxShadow: "none" }}
                            pl="60px"
                            pr="60px"
                        />
                        <IconButton
                            icon={<ChevronRightIcon />}
                            size="md"
                            colorScheme="blue"
                            aria-label="Send message"
                            onClick={sendMessage}
                            isLoading={isLoading}
                            position="absolute"
                            right={2}
                        />
                        <input
                            id="file-upload"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default Chatbot;