import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Flex, Text, Input, Button, IconButton, Avatar, VStack, HStack,
    Spinner, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
    DrawerCloseButton, useDisclosure, Tooltip, Menu, MenuButton, MenuList, MenuItem, useToast
} from '@chakra-ui/react';
import { ChevronDownIcon, DownloadIcon, CopyIcon } from '@chakra-ui/icons';
import * as FaIcons from 'react-icons/fa';
import { FaBusinessTime, FaChartLine, FaHome, FaLightbulb, FaPaperPlane, FaRobot, FaShareAlt, FaCalculator } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import api, {aiApi} from "../apis/api";
import jsPDF from "jspdf";
import ViewModeToggle from "../component/ViewModeToggle";

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
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        fetchResearchHistory();
    }, []);

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

    const handleViewPDF = () => {
        // 여기에 PDF 파일 URL을 설정합니다.
        setPdfUrl('/path/to/your/pdf/file.pdf');
        onOpen();
    };

    const downloadAsPDF = (text) => {
        const doc = new jsPDF();
        doc.text(text, 10, 10);
        doc.save('message.pdf');
    };


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

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = { sender: 'user', text: inputMessage };
        setMessages(prev => [...prev, userMessage]);

        let context = selectedResearch
            ? `Based on the market research "${selectedResearch.title}": ${selectedResearch.summary}. `
            : '';

        setIsLoading(true);
        setInputMessage('');

        try {
            const response = await aiApi.post('/chat', {
                message: context + inputMessage
            });
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
        sendMessage();
    };

    const renderMessages = () => {
        return messages.map((msg, index) => (
            <Box key={index} alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'} maxW="70%">
                <Flex direction={msg.sender === 'user' ? 'row-reverse' : 'row'} alignItems="flex-start">
                    {msg.sender === 'bot' && <Avatar size="md" icon={<FaRobot />} mr={2} bg="blue.500" color="white" />}
                    <Box
                        bg={msg.sender === 'user' ? 'blue.500' : 'gray.100'}
                        color={msg.sender === 'user' ? 'white' : 'black'}
                        borderRadius="lg"
                        p={4}
                        fontSize="lg"
                    >
                        <Text>{msg.text}</Text>
                        {msg.sender === 'bot' && (
                            <HStack mt={2} justify="flex-end">
                                <Tooltip label="메시지 복사">
                                    <IconButton
                                        icon={<CopyIcon />}
                                        aria-label="Copy message"
                                        size="sm"
                                        onClick={() => copyToClipboard(msg.text)}
                                    />
                                </Tooltip>
                                <Tooltip label="메시지 공유">
                                    <IconButton
                                        icon={<FaShareAlt />}
                                        aria-label="Share message"
                                        size="sm"
                                        onClick={() => shareMessage(msg.text)}
                                    />
                                </Tooltip>
                                <Tooltip label="PDF로 다운로드">
                                    <IconButton
                                        icon={<DownloadIcon />}
                                        aria-label="Download as PDF"
                                        size="sm"
                                        onClick={() => downloadAsPDF(msg.text)} // 수정: 메시지를 인자로 전달
                                    />
                                </Tooltip>
                            </HStack>
                        )}
                    </Box>
                </Flex>
            </Box>
        ));
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
                <Flex align="center" justify="space-between" p={6} bg="white" borderBottomWidth={1}>
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
                <Flex flex={1} direction="column" bg="gray.50" p={8}>
                    {messages.length === 0 && (
                        <VStack spacing={6} align="center" justify="center" flex={1}>
                            <Text fontSize="3xl" fontWeight="bold" color="blue.600">Jiwoo AI 챗봇에 오신 것을 환영합니다!</Text>
                            <Text fontSize="xl" color="gray.500" textAlign="center" maxW="600px">
                                시장조사, 비즈니스 모델, 세무처리에 관한 질문을 해보세요.<br />
                                AI가 최선을 다해 답변해 드리겠습니다.
                            </Text>
                        </VStack>
                    )}
                    {/* 메시지 영역 */}
                    <VStack flex={1} overflowY="auto" spacing={6} align="stretch" mb={6}>
                        {renderMessages()}
                        <div ref={messagesEndRef} />
                    </VStack>

                    {/* 입력 영역 */}
                    <HStack>
                        <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            size="lg"
                            fontSize="xl"
                        />
                        <Button
                            onClick={sendMessage}
                            colorScheme="blue"
                            isLoading={isLoading}
                            leftIcon={<FaPaperPlane />}
                            size="lg"
                            fontSize="xl"
                        >
                            전송
                        </Button>
                    </HStack>
                </Flex>

                {/* 하단 툴바 */}
                <HStack justify="flex-end" p={4} bg="white" borderTopWidth={1}>
                    <Tooltip label="답변 공유">
                        <IconButton icon={<FaShareAlt />} aria-label="Share" size="lg" colorScheme="blue" variant="outline" />
                    </Tooltip>
                    <Tooltip label="답변 복사">
                        <IconButton icon={<CopyIcon />} aria-label="Copy" size="lg" colorScheme="blue" variant="outline" />
                    </Tooltip>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="lg" colorScheme="blue" variant="outline">
                            다운로드
                        </MenuButton>
                        <MenuList>
                            <MenuItem icon={<DownloadIcon />} onClick={downloadAsPDF}>
                                PDF로 다운로드
                            </MenuItem>
                            <MenuItem icon={<DownloadIcon />} onClick={() => toast({
                                title: "준비 중",
                                description: "엑셀 다운로드 기능은 아직 구현되지 않았습니다.",
                                status: "info",
                                duration: 2000,
                                isClosable: true,
                            })}>
                                엑셀로 다운로드
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
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