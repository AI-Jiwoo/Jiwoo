import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Flex, VStack, useToast, Box } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, {aiApi} from "../apis/api";
import Sidebar from '../component/chatbot/ChSideBar';
import Header from '../component/chatbot/Chheader';
import ChatMessage from '../component/chatbot/ChatMessage';
import ImageGallery from '../component/chatbot/ImageGallery';
import InputArea from '../component/chatbot/InputArea';
import TaxationChatbot from '../component/TaxationProcess';
import jsPDF from 'jspdf';
import koreanFontUrl from '../font/NanumMyeongjo-Regular.ttf';
import axios from "axios";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [researchHistory, setResearchHistory] = useState([]);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [imageResults, setImageResults] = useState([]);
    const [isTaxationMode, setIsTaxationMode] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

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
        }
    };

    const parseResponse = (text) => {
        const lines = text.split('\n');
        const categories = [];
        let currentCategory = null;

        lines.forEach(line => {
            if (line.match(/^\d+\./)) {
                if (currentCategory) {
                    categories.push(currentCategory);
                }
                currentCategory = {
                    title: line.replace(/^\d+\.\s*/, '').split(':')[0].trim(),
                    examples: [],
                    source: '',
                    date: ''
                };
            } else if (currentCategory) {
                if (line.startsWith('- 예시:')) {
                    currentCategory.examples = line.replace('- 예시:', '').split(',').map(item => item.trim());
                } else if (line.startsWith('- 출처:')) {
                    currentCategory.source = line.replace('- 출처:', '').trim();
                } else if (line.startsWith('- 날짜:')) {
                    currentCategory.date = line.replace('- 날짜:', '').trim();
                }
            }
        });

        if (currentCategory) {
            categories.push(currentCategory);
        }

        return categories;
    };

    const sendMessage = useCallback(async () => {
        if (!inputMessage.trim() || isLoading) return;

        setIsLoading(true);
        const message = inputMessage;
        setInputMessage('');
        setMessages(prev => [...prev, { sender: 'user', text: message }]);

        try {
            const response = await axios.post('http://localhost:8000/chat', { message });
            const parsedResponse = parseResponse(response.data.text_response);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: response.data.text_response,
                parsedResponse: parsedResponse,
                web_results: response.data.web_results,
                imageUrl: response.data.image_url
            }]);

            if (response.data.image_url) {
                setImageResults(prev => [...prev, response.data.image_url]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { sender: 'bot', text: '죄송합니다. 오류가 발생했습니다.' }]);
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

    const handleInputChange = useCallback((e) => {
        setInputMessage(e.target.value);
    }, []);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const handleTaxationStart = () => {
        setIsTaxationMode(true);
    };

    const handleTaxationComplete = () => {
        setIsTaxationMode(false);
    };

    const handleTaxationMessage = (sender, text) => {
        setMessages(prev => [...prev, { sender, text }]);
    };

    const navigateAndRefresh = (path) => {
        navigate(path);
        window.location.href = path;
    };

    const navigateHome = () => navigateAndRefresh('/main/home');
    const navigateMarketResearch = () => navigateAndRefresh('/main/market-research');
    const navigateBusinessModel = () => navigateAndRefresh('/main/business-model');
    const accounting = () => navigateAndRefresh('/main/accounting');

    const handleShare = (text) => {
        toast({
            title: "공유 기능",
            description: "공유 기능은 아직 구현되지 않았습니다.",
            status: "info",
            duration: 2000,
            isClosable: true,
        });
    };

    const handleCopy = (text) => {
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

    const loadKoreanFont = async () => {
        const fontResponse = await fetch(koreanFontUrl);
        const fontArrayBuffer = await fontResponse.arrayBuffer();
        const fontBase64 = btoa(
            new Uint8Array(fontArrayBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return fontBase64;
    };

    const handleDownload = async (question, answer) => {
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

    const handleQuestionSelect = (question) => {
        setInputMessage(question);
        sendMessage(question);
    };

    return (
        <Flex h="100vh">
            <Sidebar
                navigateHome={navigateHome}
                navigateMarketResearch={navigateMarketResearch}
                navigateBusinessModel={navigateBusinessModel}
                accounting={accounting}
            />
            <Flex flex={1} direction="column">
                <Header
                    selectedResearch={selectedResearch}
                    researchHistory={researchHistory}
                    selectResearch={setSelectedResearch}
                    quickAsk={handleQuestionSelect}
                    handleTaxationStart={handleTaxationStart}
                />
                <Flex flex={1} overflow="hidden">
                    <Flex flex={3} direction="column" bg="gray.50" overflowY="auto" p={8}>
                        <VStack spacing={4} align="stretch">
                            {messages.map((message, index) => (
                                <ChatMessage
                                    key={index}
                                    message={message}
                                    handleShare={handleShare}
                                    handleCopy={handleCopy}
                                    handleDownload={handleDownload}
                                    handleQuestionSelect={handleQuestionSelect}
                                />
                            ))}
                        </VStack>
                    </Flex>
                    <ImageGallery imageResults={imageResults} />
                </Flex>
                {isTaxationMode ? (
                    <TaxationChatbot
                        onComplete={handleTaxationComplete}
                        onMessage={handleTaxationMessage}
                    />
                ) : (
                    <InputArea
                        inputMessage={inputMessage}
                        handleInputChange={handleInputChange}
                        handleKeyPress={handleKeyPress}
                        sendMessage={sendMessage}
                        isLoading={isLoading}
                        handleTaxationStart={handleTaxationStart}
                    />
                )}
            </Flex>
        </Flex>
    );
};

export default Chatbot;