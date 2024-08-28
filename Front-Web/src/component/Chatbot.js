import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {Flex, VStack, useToast, Box, Button} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { aiApi } from "../apis/api";
import Sidebar from '../component/chatbot/ChSideBar';
import Header from '../component/chatbot/Chheader';
import ChatMessage from '../component/chatbot/ChatMessage';
import ImageGallery from '../component/chatbot/ImageGallery';
import InputArea from '../component/chatbot/InputArea';
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
    const [taxationStep, setTaxationStep] = useState(0);
    const [taxationAnswers, setTaxationAnswers] = useState({});
    const [selectedBusinessId, setSelectedBusinessId] = useState('');
    const [selectedBusinessContent, setSelectedBusinessContent] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [transactionFile, setTransactionFile] = useState(null);
    const [incomeTaxProofFile, setIncomeTaxProofFile] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [isTaxationChatMode, setIsTaxationChatMode] = useState(false);
    const [isTaxationDataSubmitted, setIsTaxationDataSubmitted] = useState(false);


    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const taxationQuestions = useMemo(() => [
        "사업을 선택해주세요.",
        "사업자 유형을 입력해주세요. (예: 부가가치세 간이과세자)",
        "현재 부양하고 있는 가족(배우자, 자녀, 부모 등)은 총 몇 명입니까?",
        "그 중 연간 소득이 100만 원을 초과하지 않는 가족은 몇 명입니까?",
        "부양하는 각 자녀의 나이는 어떻게 되나요? (예: 6세 이하, 초등학생, 중고등학생, 대학생. 없다면 없음이라고 적어주세요.)",
        "배우자의 연간소득이 100만원을 초과합니까? (없다면 없음이라고 적어주세요)",
        "부양가족 중 장애인으로 등록된 분이 몇 명 있습니까? (없다면 없음이라고 적어주세요)",
        "거래내역서 파일을 첨부해주세요.",
        "소득금액증명원 파일을 첨부해주세요."
    ], []);

    useEffect(() => {
        fetchResearchHistory();
        fetchBusinesses();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        if (query && messages.length === 0) {
            sendMessage(query);
        }
    }, [location, messages.length]);

    const handleBusinessSelect = (businessId, businessName, businessContent) => {
        setSelectedBusinessId(businessId);
        setSelectedBusinessContent(businessContent);
        setTaxationAnswers(prev => ({ ...prev, 0: businessName }));
        setMessages(prev => [...prev,
            { sender: 'user', text: businessName },
            { sender: 'bot', text: `${businessName}이(가) 선택되었습니다. ${taxationQuestions[1]}` }
        ]);
        setTaxationStep(1);
    };

    const addMessage = (sender, text, additionalProps = {}) => {
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.sender === sender && lastMessage.text === text) {
                return prev; // 중복된 메시지는 추가하지 않음
            }
            return [...prev, { sender, text, ...additionalProps }];
        });
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
        }
    };

    const fetchBusinesses = async () => {
        try {
            const response = await api.get('/business/user');
            setBusinesses(response.data.business || []);
        } catch (error) {
            console.error('Failed to fetch businesses:', error);
            toast({
                title: "사업 정보 로딩 실패",
                description: "사업 정보를 불러오는데 실패했습니다.",
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

    const handleTaxationStart = () => {
        setIsTaxationMode(true);
        setTaxationStep(0);
        setMessages(prev => [...prev, {
            sender: 'bot',
            text: "세무 처리를 시작합니다. 사업을 선택해주세요.",
            businessCards: businesses
        }]);
    };



    const handleTaxationAnswer = async (answer) => {
        setTaxationAnswers(prev => ({ ...prev, [taxationStep]: answer }));

        addMessage('user', answer);

        if (taxationStep === 1) {
            setBusinessType(answer);
        }

        if (taxationStep < taxationQuestions.length - 1) {
            setTaxationStep(prev => prev + 1);
            addMessage('bot', taxationQuestions[taxationStep + 1]);
        } else {
            await handleDataSubmit();
        }
    };


    const handleFileUpload = (file, type) => {
        if (type === 'transaction') {
            setTransactionFile(file);
        } else if (type === 'incomeTaxProof') {
            setIncomeTaxProofFile(file);
        }

        setMessages(prev => [...prev, { sender: 'user', text: `${type === 'transaction' ? '거래내역서' : '소득금액증명원'} 파일이 첨부되었습니다.` }]);

        // 다른 파일이 이미 첨부되어 있는지 확인
        if ((type === 'transaction' && incomeTaxProofFile) || (type === 'incomeTaxProof' && transactionFile)) {
            handleDataSubmit(type === 'transaction' ? file : transactionFile, type === 'incomeTaxProof' ? file : incomeTaxProofFile);
        }
    };


    const sendMessage = useCallback(async () => {
        if (!inputMessage.trim() || isLoading) return;

        setIsLoading(true);
        const message = inputMessage;
        setInputMessage('');

        if (isTaxationMode && !isTaxationDataSubmitted) {
            addMessage('user', message);
            await handleTaxationAnswer(message);
            setIsLoading(false);
            return;
        }

        addMessage('user', message);

        try {
            let response;
            if (isTaxationChatMode) {
                console.log("Calling /taxation/chat");
                const formData = new FormData();
                formData.append('businessId', selectedBusinessId);
                formData.append('user_input', message);
                response = await aiApi.post('/taxation/chat', formData);
            } else {
                console.log("Calling /chat");
                response = await aiApi.post('/chat', { message });
            }

            const parsedResponse = parseResponse(response.data.text_response);
            addMessage('bot', response.data.text_response, {
                parsedResponse,
                web_results: response.data.web_results,
                imageUrl: response.data.image_url
            });

            if (response.data.image_url) {
                setImageResults(prev => [...prev, response.data.image_url]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('bot', '죄송합니다. 오류가 발생했습니다.');
            toast({
                title: "메시지 전송 실패",
                description: "죄송합니다. 오류가 발생했습니다.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }

        setIsLoading(false);
        navigate(`?q=${encodeURIComponent(message)}`, { replace: true });
    }, [inputMessage, isLoading, isTaxationMode, isTaxationChatMode, isTaxationDataSubmitted, selectedBusinessId, navigate, toast, parseResponse, handleTaxationAnswer]);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };



    const handleEndTaxation = () => {
        setIsTaxationMode(false);
        setIsTaxationChatMode(false);
        setIsTaxationDataSubmitted(false);
        setMessages(prev => [...prev, { sender: 'bot', text: "세무처리가 종료되었습니다. 일반 채팅 모드로 돌아갑니다." }]);
        console.log("Taxation mode ended"); // 디버깅용 로그
    };

    const handleInputChange = useCallback((e) => {
        setInputMessage(e.target.value);
    }, []);

    const inputAreaProps = {
        inputMessage,
        handleInputChange,
        handleKeyPress,
        sendMessage,
        isLoading,
        handleTaxationStart,
        handleFileUpload: (e, type) => {
            const file = e.target.files[0];
            if (file) {
                handleFileUpload(file, type);
            }
        },
    };

    const handleDataSubmit = async (transactionFile, incomeTaxProofFile) => {
        if (!selectedBusinessId || !transactionFile || !incomeTaxProofFile || !businessType) {
            setMessages(prev => [...prev, { sender: 'bot', text: "모든 정보와 파일을 입력/첨부해 주세요." }]);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('transaction_files', transactionFile);
            formData.append('income_tax_proof_file', incomeTaxProofFile);

            const answersJson = JSON.stringify(taxationAnswers);
            formData.append('answers', answersJson);

            formData.append('businessId', selectedBusinessId);
            formData.append('businessContent', selectedBusinessContent);
            formData.append('businessType', businessType);

            const response = await axios.post('http://localhost:8000/taxation', formData);

            console.log('Server response:', response.data);

            let successMessage = "데이터가 성공적으로 저장되었습니다. 이제 세무 처리 관련 질문을 해주세요.";

            if (response.data && typeof response.data === 'object' && response.data.message) {
                successMessage = response.data.message + " " + successMessage;
            }

            setMessages(prev => [...prev, { sender: 'bot', text: successMessage }]);
            setIsTaxationDataSubmitted(true);
            setIsTaxationChatMode(true);
            console.log("Taxation chat mode activated"); // 디버깅용 로그
        } catch (error) {
            console.error('Error in saving taxation data:', error);
            if (error.response && error.response.data) {
                console.error('Response data:', error.response.data);
            }
            setMessages(prev => [...prev, { sender: 'bot', text: "데이터 저장 중 오류가 발생했습니다: " + (error.message || '알 수 없는 오류') }]);
        }
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
                                    handleBusinessSelect={handleBusinessSelect}
                                />
                            ))}
                        </VStack>
                    </Flex>
                    <ImageGallery imageResults={imageResults} />
                </Flex>
                <Flex direction="column">
                    <InputArea {...inputAreaProps} />
                    {isTaxationChatMode && (
                        <Button onClick={handleEndTaxation} colorScheme="red" mt={2}>
                            세무처리 끝내기
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};
export default Chatbot;