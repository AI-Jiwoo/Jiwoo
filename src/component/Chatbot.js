import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Box, Flex, Text, Input, Button, IconButton, Avatar, VStack, HStack,
    Spinner, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
    DrawerCloseButton, useDisclosure, Tooltip, Menu, MenuButton, MenuList, MenuItem, useToast,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, Badge, Textarea,
    Image, SimpleGrid, ListItem, UnorderedList, Card, CardHeader, Heading
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
import koreanFontUrl from '../font/NanumMyeongjo-Regular.ttf';
import ChatLoading from "./ChatLoading";

// TypingText 컴포넌트를 별도의 함수 컴포넌트로 분리
const TypingText = ({ text }) => {
    const [displayText, setDisplayText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timer = setTimeout(() => {
                setDisplayText(prev => prev + text[index]);
                setIndex(index + 1);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [text, index]);

    return <Text fontSize="xl" color="gray.700">{displayText}</Text>;
};

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

    const [transactionFiles, setTransactionFiles] = useState([]);
    const [incomeTaxProofFile, setIncomeTaxProofFile] = useState(null);
    const [businessContent, setBusinessContent] = useState('');
    const [businessType, setBusinessType] = useState('');

    const [taxationStep, setTaxationStep] = useState(0);
    const [taxationAnswers, setTaxationAnswers] = useState({});
    const [taxationFile, setTaxationFile] = useState(null);

    const taxationQuestions = useMemo(() => [
        "현재 부양하고 있는 가족(배우자, 자녀, 부모 등)은 총 몇 명입니까?",
        "그 중 연간 소득이 100만 원을 초과하지 않는 가족은 몇 명입니까?",
        "부양하는 각 자녀의 나이는 어떻게 되나요? (예: 6세 이하, 초등학생, 중고등학생, 대학생. 없다면 없음이라고 적어주세요.)",
        "배우자의 연간소득이 100만원을 초과합니까? (없다면 없음이라고 적어주세요)",
        "부양가족 중 장애인으로 등록된 분이 몇 명 있습니까?(없다면 없음이라고 적어주세요)"
    ], []);

    const handleTaxationStart = useCallback(() => {
        setTaxationStep(1);
        setMessages(prev => [...prev, { sender: 'bot', text: "세무처리를 시작합니다. " + taxationQuestions[0] }]);
    }, [taxationQuestions]);

    const handleShare = (text) => {
        shareMessage(text);
    };

    const handleCopy = (text) => {
        copyToClipboard(text);
    };

    const handleDownload = (question, answer) => {
        downloadAsPDF(question, answer);
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

    const handleQuestionSelect = (question) => {
        setInputMessage(question);
        sendMessage(question);
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

    const handleTaxationAnswer = useCallback(async (answer) => {
        setTaxationAnswers(prev => ({...prev, [taxationStep]: answer}));

        if (taxationStep < taxationQuestions.length) {
            setTaxationStep(prev => prev + 1);
            setMessages(prev => [...prev,
                { sender: 'user', text: answer },
                { sender: 'bot', text: taxationQuestions[taxationStep] }
            ]);
        } else if (taxationStep === taxationQuestions.length) {
            setMessages(prev => [...prev,
                { sender: 'user', text: answer },
                { sender: 'bot', text: "모든 질문에 답변해 주셔서 감사합니다. 이제 거래내역서 파일을 첨부해 주세요." }
            ]);
            setTaxationStep(prev => prev + 1);
        }
    }, [taxationStep, taxationQuestions]);

    const handleTaxationSubmit = useCallback(async () => {
        try {
            const formData = new FormData();
            transactionFiles.forEach((file, index) => {
                formData.append(`transaction_files`, file);
            });
            formData.append('income_tax_proof_file', incomeTaxProofFile);
            Object.keys(taxationAnswers).forEach(key => {
                formData.append(`answers`, taxationAnswers[key]);
            });
            formData.append('businessId', '12345'); // 예시 businessId
            formData.append('businessContent', businessContent);
            formData.append('businessType', businessType);

            const taxationResponse = await api.post('/taxation', formData);

            setMessages(prev => [...prev, {
                sender: 'bot',
                text: "데이터가 성공적으로 저장되었습니다. 이제 거래내역서 파일을 첨부해 주세요."
            }]);

            // 세무 처리 완료 후 상태 초기화
            setTaxationStep(0);
            setTaxationAnswers({});
            setTransactionFiles([]);
            setIncomeTaxProofFile(null);

        } catch (error) {
            console.error('Error in taxation process:', error);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: "세무 처리 중 오류가 발생했습니다. 다시 시도해 주세요."
            }]);
        }
    }, [taxationAnswers, transactionFiles, incomeTaxProofFile, businessContent, businessType]);

    const handleIncomeTaxProofUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setIncomeTaxProofFile(file);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: `소득금액증명원 파일이 첨부되었습니다.`
            }]);
        }
    };

    const sendMessage = useCallback(async (message = inputMessage) => {
        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        setInputMessage('');

        // 사용자 메시지를 한 번만 추가
        setMessages(prev => [...prev, { sender: 'user', text: message }]);

        try {
            if (taxationStep > 0 && taxationStep <= taxationQuestions.length) {
                await handleTaxationAnswer(message);
            } else if (taxationStep === taxationQuestions.length + 1 && message.toLowerCase() === "세무 처리 시작") {
                if (transactionFiles.length === 0 || !incomeTaxProofFile) {
                    setMessages(prev => [...prev, { sender: 'bot', text: "모든 필요한 파일을 먼저 첨부해 주세요." }]);
                } else {
                    await handleTaxationSubmit();
                }
            } else {
                const response = await aiApi.post('/chat', { message });
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
    }, [inputMessage, isLoading, taxationStep, taxationQuestions, transactionFiles, incomeTaxProofFile, handleTaxationAnswer, handleTaxationSubmit, navigate, toast]);

    const handleInputChange = useCallback((e) => {
        setInputMessage(e.target.value);
    }, []);


    const handleFileUpload = (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            setTransactionFiles(prevFiles => [...prevFiles, ...files]);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: `${files.length}개의 파일이 첨부되었습니다. 추가 파일이 있다면 계속 첨부하시고, 모든 파일 첨부가 완료되면 "세무 처리 시작"이라고 입력해 주세요.`
            }]);
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

    const QuestionCard = ({ question, onSelect }) => (
        <Card onClick={() => onSelect(question)} cursor="pointer" _hover={{ boxShadow: 'md' }}>
            <CardHeader>
                <Heading size="md">{question}</Heading>
            </CardHeader>
        </Card>
    );

    const CategoryInfo = ({ category }) => (
        <Box mb={6}>
            <Heading size="md" mb={2}>{category.title}</Heading>
            <Text fontWeight="bold">- 예시:</Text>
            <UnorderedList mb={2}>
                {category.examples.map((example, index) => (
                    <ListItem key={index}>{example}</ListItem>
                ))}
            </UnorderedList>
            <Text><strong>- 출처:</strong> {category.source}</Text>
            <Text><strong>- 날짜:</strong> {category.date}</Text>
        </Box>
    );

    const ParsedInfo = ({ category, examples, source, date }) => (
        <Box mb={6} fontSize="lg">
            <Heading size="md" mb={2}>{category}</Heading>
            {examples && examples.length > 0 && (
                <Box mb={2}>
                    <Text fontWeight="bold">예시:</Text>
                    <UnorderedList>
                        {examples.map((example, index) => (
                            <ListItem key={index}>{example}</ListItem>
                        ))}
                    </UnorderedList>
                </Box>
            )}
            {source && <Text><strong>출처:</strong> {source}</Text>}
            {date && <Text><strong>날짜:</strong> {date}</Text>}
        </Box>
    );

    const renderAnswer = (messages, handleQuestionSelect, handleShare, handleCopy, handleDownload) => {
        return messages.map((message, index) => {
            const isUserMessage = message.sender === 'user';
            const isBotMessage = message.sender === 'bot';
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const question = isUserMessage ? message.text : (prevMessage && prevMessage.sender === 'user' ? prevMessage.text : '');

            if (isUserMessage) {
                return (
                    <HStack key={index} alignItems="flex-start" mb={4}>
                        <Avatar size="sm" name="User" bg="blue.500" />
                        <Text fontWeight="bold" fontSize="lg">{message.text}</Text>
                    </HStack>
                );
            }

            if (isBotMessage) {
                const parsedResponse = parseResponse(message.text);
                const categories = parsedResponse || [];

                return (
                    <Box key={index} mb={8} p={4} borderRadius="lg" bg="white" boxShadow="sm">
                        <HStack mb={4} alignItems="flex-start">
                            <Avatar size="sm" icon={<FaRobot />} bg="blue.500" />
                            <VStack align="start" flex={1} spacing={4}>
                                <Text fontWeight="bold" fontSize="lg" color="blue.600">Jiwoo</Text>
                                {message.text ? (
                                    <TypingText text={message.text} />
                                ) : (
                                    <Text fontSize="md" color="gray.700">답변 생성 중...</Text>
                                )}
                            </VStack>
                        </HStack>

                        {message.text && (
                            <>
                                {categories.map((category, idx) => (
                                    <CategoryInfo key={idx} category={category} />
                                ))}

                                <HStack spacing={2} mb={4}>
                                    <Button leftIcon={<FaShareAlt />} onClick={() => handleShare(message.text)} colorScheme="blue" variant="outline">공유</Button>
                                    <Button leftIcon={<CopyIcon />} onClick={() => handleCopy(message.text)} colorScheme="blue" variant="outline">복사</Button>
                                    <Button leftIcon={<DownloadIcon />} onClick={() => handleDownload(question, message.text)} colorScheme="blue" variant="outline">PDF 저장</Button>
                                </HStack>

                                <VStack spacing={4} align="stretch" mt={6}>
                                    <Heading size="md" mb={2}>다음 질문 예시:</Heading>
                                    {categories.map((category, idx) => (
                                        <QuestionCard
                                            key={idx}
                                            question={`${category.title}에 대해 자세히 알려주세요.`}
                                            onSelect={handleQuestionSelect}
                                        />
                                    ))}
                                </VStack>

                                <Accordion defaultIndex={[0]} allowMultiple mt={6}>
                                    <AccordionItem>
                                        <h2>
                                            <AccordionButton>
                                                <Box flex="1" textAlign="left" fontSize="xl" fontWeight="bold" color="blue.600">
                                                    관련 정보
                                                </Box>
                                            </AccordionButton>
                                        </h2>
                                        <AccordionPanel pb={4}>
                                            {message.web_results && message.web_results.length > 0 ? (
                                                message.web_results.map((result, idx) => (
                                                    <Box key={idx} mb={4}>
                                                        <Heading size="md" color="blue.600">{result.title}</Heading>
                                                        <Text fontSize="lg" color="gray.600" mt={2}>{result.snippet}</Text>
                                                        <Link href={result.url} color="blue.400" fontSize="lg" isExternal mt={1}>
                                                            더 읽기
                                                        </Link>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Text fontSize="lg" color="gray.500">관련 정보가 없습니다.</Text>
                                            )}
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                            </>
                        )}
                    </Box>
                );
            }

            return null;
        });
    };

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
                    <HStack spacing={4}>
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
                        <Tooltip label="세무 처리를 시작합니다">
                            <Button
                                leftIcon={<FaCalculator />}
                                colorScheme="green"
                                onClick={handleTaxationStart}
                            >
                                세무 처리 시작
                            </Button>
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
                            renderAnswer(messages, handleQuestionSelect, handleShare, handleCopy, handleDownload)
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
                            aria-label="Attach transaction files"
                            onClick={() => document.getElementById('transaction-files-upload').click()}
                            ml={2}
                        />
                        <IconButton
                            icon={<AttachmentIcon />}
                            size="md"
                            colorScheme="green"
                            variant="ghost"
                            aria-label="Attach income tax proof"
                            onClick={() => document.getElementById('income-tax-proof-upload').click()}
                            ml={2}
                        />
                        <Input
                            value={inputMessage}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="질문을 입력하세요..."
                            size="lg"
                            height="60px"
                            fontSize="xl"
                            border="none"
                            _focus={{ boxShadow: "none" }}
                            pl="60px"
                            pr="120px"
                        />
                        <IconButton
                            icon={<ChevronRightIcon />}
                            size="md"
                            colorScheme="blue"
                            aria-label="Send message"
                            onClick={() => sendMessage()}
                            isLoading={isLoading}
                            position="absolute"
                            right="60px"
                        />
                        <Button
                            leftIcon={<FaCalculator />}
                            colorScheme="green"
                            onClick={handleTaxationStart}
                            position="absolute"
                            right="2px"
                            size="sm"
                        >
                            세무처리
                        </Button>
                        <input
                            id="transaction-files-upload"
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                        <input
                            id="income-tax-proof-upload"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleIncomeTaxProofUpload}
                        />
                    </Flex>
                </Box>
            </Flex>

            {/* 플로팅 버튼 */}
            <Box position="fixed" bottom="20px" right="20px" zIndex={10}>
                <Tooltip label="세무 처리를 시작합니다">
                    <IconButton
                        icon={<FaCalculator />}
                        colorScheme="green"
                        size="lg"
                        isRound
                        onClick={handleTaxationStart}
                        boxShadow="lg"
                    />
                </Tooltip>
            </Box>
        </Flex>
    );
};

export default Chatbot;