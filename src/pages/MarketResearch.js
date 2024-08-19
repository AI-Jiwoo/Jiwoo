import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Select,
    Spinner,
    Input,
    SimpleGrid,
    Divider,
    FormControl,
    FormLabel,
    Card,
    CardBody,
    CardHeader,
    Alert,
    AlertIcon,
    Td,
    Tr,
    Tbody,
    Th,
    Thead,
    Table,
    ListItem,
    UnorderedList,
    Flex,
    Icon,
    Tooltip,
    Progress,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    TabPanel, TabList, Tabs, Tab, TabPanels, Heading
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import MarketGrowthChart from "../component/MarketGrowthChart";
import {FaBusinessTime, FaChartLine, FaUsers, FaLightbulb, FaQuestionCircle, FaRedo} from 'react-icons/fa';
import Cookies from 'js-cookie';
import api from "../apis/api";
import LoadingScreen from "../component/common/LoadingMotion";

const MarketResearch = () => {
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [customData, setCustomData] = useState({
        category: '',
        scale: '',
        nation: '',
        customerType: '',
        businessType: '',
        businessContent: '',
        businessPlatform: '',
        businessScale: '',
        investmentStatus: ''
    });
    const [marketSizeGrowth, setMarketSizeGrowth] = useState(null);
    const [similarServices, setSimilarServices] = useState(null);
    const [trendCustomerTechnology, setTrendCustomerTechnology] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [researchHistory, setResearchHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);


    const handleHistoryClick = (history) => {
        setSelectedHistory(history);
        setIsHistoryModalOpen(true);
    };

    const renderHistoryModal = () => {
        if (!selectedHistory) return null;

        return (
            <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} size="6xl">
                <ModalOverlay />
                <ModalContent maxWidth="90vw" maxHeight="90vh">
                    <ModalHeader>분석 결과 상세</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody overflowY="auto" p={6}>
                        <Tabs>
                            <TabList>
                                <Tab>시장 규모</Tab>
                                <Tab>유사 서비스</Tab>
                                <Tab>트렌드/고객/기술</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <VStack align="stretch" spacing={4}>
                                        <Heading size="md">시장 규모 및 성장률</Heading>
                                        {selectedHistory.marketInformation ?
                                            renderMarketSizeGrowth(selectedHistory.marketInformation) :
                                            <Text>시장 규모 정보가 없습니다.</Text>
                                        }
                                    </VStack>
                                </TabPanel>
                                <TabPanel>
                                    <VStack align="stretch" spacing={4}>
                                        <Heading size="md">유사 서비스 분석</Heading>
                                        {selectedHistory.competitorAnalysis ?
                                            renderSimilarServices(selectedHistory.competitorAnalysis) :
                                            <Text>유사 서비스 분석 정보가 없습니다.</Text>
                                        }
                                    </VStack>
                                </TabPanel>
                                <TabPanel>
                                    <VStack align="stretch" spacing={4}>
                                        <Heading size="md">트렌드, 고객 분포, 기술 동향</Heading>
                                        {selectedHistory.marketTrends ?
                                            renderTrendCustomerTechnology(selectedHistory.marketTrends) :
                                            <Text>트렌드/고객/기술 정보가 없습니다.</Text>
                                        }
                                    </VStack>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    };

    useEffect(() => {
        const marketResearchElement = document.getElementById('market-research');
        if (marketResearchElement) {
            marketResearchElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        fetchBusinesses();
        fetchResearchHistory();
        fetchCategories();
        loadResearchHistoryFromCookie();
    }, [currentPage]);

    const loadResearchHistoryFromCookie = () => {
        const cookieHistory = Cookies.get('marketResearchHistory');
        if (cookieHistory) {
            setResearchHistory(JSON.parse(cookieHistory));
        }
    };

    const saveResearchHistoryToCookie = (newHistory) => {
        Cookies.set('marketResearchHistory', JSON.stringify(newHistory), { expires: 7 }); // 7일간 유효
    };

    const fetchBusinesses = async () => {
        try {
            const response = await api.get('/api/business/user', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setBusinesses(response.data.business || []);
        } catch (error) {
            console.error('Failed to fetch businesses:', error.response?.data || error.message);
            setError('사업 정보를 불러오는데 실패했습니다: ' + (error.response?.data?.message || error.message));
        }
    };

    const fetchResearchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/market-research/history?page=${currentPage}&size=10`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            console.log('Research history response:', response.data);  // 디버깅용
            if (response.data.data && Array.isArray(response.data.data)) {
                setResearchHistory(response.data.data);
                setTotalPages(response.data.totalPages || 1);
            } else {
                setResearchHistory([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Failed to fetch research history:', error);
            setError('검색 이력을 불러오는데 실패했습니다: ' + (error.response?.data?.message || error.message));
            setResearchHistory([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/category/names', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setError('카테고리 목록을 불러오는데 실패했습니다: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleBusinessSelect = (e) => {
        const selectedId = parseInt(e.target.value);
        const selected = businesses.find(b => b.id === selectedId);
        setSelectedBusiness(selected ? {...selected} : null);
        if (selected) {
            setCustomData({
                category: selected.category || '',
                scale: selected.businessScale || '',
                nation: selected.businessLocation || '',
                customerType: selected.customerType || '',
                businessType: selected.businessType || '',
                businessContent: selected.businessContent || ''
            });
        } else {
            setCustomData({
                category: '',
                scale: '',
                nation: '',
                customerType: '',
                businessType: '',
                businessContent: ''
            });
        }
    };

    const handleCustomDataChange = (e) => {
        const { name, value } = e.target;
        setCustomData(prev => ({ ...prev, [name]: value }));
    };

    const analyzeMarket = async (type) => {
        if (!selectedBusiness && !customData.category) {
            setError('사업을 선택하거나 카테고리를 입력해주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json'
        };
        const data = selectedBusiness ? {
            id: selectedBusiness.id,
            businessName: selectedBusiness.businessName,
            businessNumber: selectedBusiness.businessNumber,
            businessContent: selectedBusiness.businessContent,
            businessLocation: selectedBusiness.businessLocation,
            businessStartDate: selectedBusiness.businessStartDate,
            businessPlatform: selectedBusiness.businessPlatform || '',
            businessScale: selectedBusiness.businessScale || '',
            investmentStatus: selectedBusiness.investmentStatus || '',
            customerType: selectedBusiness.customerType || '',
            timestamp: new Date().getTime()
        } : {
            ...customData,
            timestamp: new Date().getTime()
        };
        try {
            let marketInformation = '';
            let competitorAnalysis = '';
            let marketTrends = '';
            let regulationInformation = '';
            let marketEntryStrategy = '';
            const timestamp = new Date().getTime();
            switch (type) {
                case 'marketSize':
                    const marketSizeResponse = await api.post(`/api/market-research/market-size-growth?t=${timestamp}`, data, { headers });
                    setMarketSizeGrowth(marketSizeResponse.data.data);
                    marketInformation = JSON.stringify(marketSizeResponse.data.data);
                    break;
                case 'similarServices':
                    const similarServicesResponse = await api.post(`/api/market-research/similar-services-analysis?t=${timestamp}`, data, { headers });
                    setSimilarServices(similarServicesResponse.data.data);
                    competitorAnalysis = JSON.stringify(similarServicesResponse.data.data);
                    break;
                case 'trendCustomerTechnology':
                    const trendResponse = await api.post(`/api/market-research/trend-customer-technology?t=${timestamp}`, data, { headers });
                    setTrendCustomerTechnology(trendResponse.data.data);
                    marketTrends = JSON.stringify(trendResponse.data.data);
                    break;
                case 'all':
                    const [marketSizeGrowthRes, similarServicesRes, trendCustomerTechnologyRes] = await Promise.all([
                        api.post(`/api/market-research/market-size-growth?t=${timestamp}`, data, { headers }),
                        api.post(`/api/market-research/similar-services-analysis?t=${timestamp}`, data, { headers }),
                        api.post(`/api/market-research/trend-customer-technology?t=${timestamp}`, data, { headers })
                    ]);
                    setMarketSizeGrowth(marketSizeGrowthRes.data.data);
                    setSimilarServices(similarServicesRes.data.data);
                    setTrendCustomerTechnology(trendCustomerTechnologyRes.data.data);
                    marketInformation = JSON.stringify(marketSizeGrowthRes.data.data);
                    competitorAnalysis = JSON.stringify(similarServicesRes.data.data);
                    marketTrends = JSON.stringify(trendCustomerTechnologyRes.data.data);
                    break;
            }
            // 조회 이력 저장
            const historyData = {
                createAt: new Date().toISOString(),
                marketInformation,
                competitorAnalysis,
                marketTrends,
                regulationInformation,
                marketEntryStrategy,
                businessId: selectedBusiness?.id || -1
            };
            await api.post('/api/market-research/save-history', historyData, { headers });
            setCurrentStep(3);

            const newHistory = [...researchHistory, historyData];
            setResearchHistory(newHistory);
            saveResearchHistoryToCookie(newHistory);

            setCurrentStep(3);

        } catch (error) {
            console.error('Market analysis failed:', error);
            console.error('Error response:', error.response?.data);
            setError(`시장 분석에 실패했습니다: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <Box mb={8}>
            <Progress value={(currentStep / 3) * 100} size="sm" colorScheme="blue" />
            <HStack justify="space-between" mt={2}>
                <Text fontWeight={currentStep >= 1 ? "bold" : "normal"}>1. 사업 선택</Text>
                <Text fontWeight={currentStep >= 2 ? "bold" : "normal"}>2. 분석 유형 선택</Text>
                <Text fontWeight={currentStep === 3 ? "bold" : "normal"}>3. 결과 확인</Text>
            </HStack>
        </Box>
    );

    const renderBusinessSelection = () => (
        <Card>
            <CardHeader>
                <HStack>
                    <Icon as={FaBusinessTime} />
                    <Text fontWeight="bold">사업 선택 또는 정보 입력</Text>
                </HStack>
            </CardHeader>
            <CardBody>
                <Select placeholder="사업 선택" onChange={handleBusinessSelect} value={selectedBusiness?.id || ''} mb={4}>
                    {Array.isArray(businesses) && businesses.map((business) => (
                        <option key={business.id} value={business.id}>{business.businessName}</option>
                    ))}
                </Select>
                {(!selectedBusiness || (Array.isArray(businesses) && businesses.length === 0)) && (
                    <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                            <FormLabel>사업 분야 (카테고리)</FormLabel>
                            <Select
                                name="category"
                                value={customData?.category || ''}
                                onChange={handleCustomDataChange}
                                placeholder="카테고리 선택"
                            >
                                {Array.isArray(categories) && categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업 규모</FormLabel>
                            <Input
                                name="scale"
                                value={customData?.scale || ''}
                                onChange={handleCustomDataChange}
                                placeholder="예: 중소기업"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>국가</FormLabel>
                            <Input
                                name="nation"
                                value={customData?.nation || ''}
                                onChange={handleCustomDataChange}
                                placeholder="예: 대한민국"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>고객유형</FormLabel>
                            <Input
                                name="customerType"
                                value={customData?.customerType || ''}
                                onChange={handleCustomDataChange}
                                placeholder="예: B2B"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업유형</FormLabel>
                            <Input
                                name="businessType"
                                value={customData?.businessType || ''}
                                onChange={handleCustomDataChange}
                                placeholder="예: 소프트웨어 개발"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업내용</FormLabel>
                            <Input
                                name="businessContent"
                                value={customData?.businessContent || ''}
                                onChange={handleCustomDataChange}
                                placeholder="사업 내용을 간략히 설명해주세요"
                            />
                        </FormControl>
                    </SimpleGrid>
                )}
                <Button mt={4} colorScheme="blue" onClick={() => setCurrentStep(2)}>
                    다음 단계
                </Button>
            </CardBody>
        </Card>
    );


    const renderAnalysisTypeSelection = () => (
        <Card>
            <CardHeader>
                <HStack>
                    <Icon as={FaChartLine} />
                    <Text fontWeight="bold">분석 유형 선택</Text>
                </HStack>
            </CardHeader>
            <CardBody>
                <SimpleGrid columns={2} spacing={4}>
                    <Tooltip label="시장의 현재 규모와 성장 추세를 분석합니다">
                        <Button leftIcon={<Icon as={FaChartLine} />} onClick={() => analyzeMarket('marketSize')}>
                            시장 규모 분석
                        </Button>
                    </Tooltip>
                    <Tooltip label="유사한 서비스와 비교 분석을 수행합니다">
                        <Button leftIcon={<Icon as={FaUsers} />} onClick={() => analyzeMarket('similarServices')}>
                            유사 서비스 분석
                        </Button>
                    </Tooltip>
                    <Tooltip label="시장 트렌드, 고객 유형, 기술 동향을 분석합니다">
                        <Button leftIcon={<Icon as={FaLightbulb} />} onClick={() => analyzeMarket('trendCustomerTechnology')}>
                            트렌드/고객/기술 분석
                        </Button>
                    </Tooltip>
                    <Tooltip label="모든 분석을 한 번에 수행합니다">
                        <Button colorScheme="green" onClick={() => analyzeMarket('all')}>
                            전체 분석
                        </Button>
                    </Tooltip>
                </SimpleGrid>
            </CardBody>
        </Card>
    );

    const renderMarketSizeGrowth = (data) => {
        let parsedData;
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch (error) {
                console.error('Failed to parse market size growth data:', error);
                return <Text>데이터 형식 오류</Text>;
            }
        } else if (typeof data === 'object' && data !== null) {
            parsedData = data;
        } else {
            console.error('Invalid market size growth data type:', typeof data);
            return <Text>잘못된 데이터 형식</Text>;
        }

        return (
            <Box>
                <Box height="400px" width="100%" mb={2}>
                    <MarketGrowthChart data={parsedData} />
                </Box>
                <HStack spacing={8} justify="flex-start">
                    <Box>
                        <Text fontWeight="bold">시장 규모</Text>
                        <Text>{parsedData.marketSize}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold">성장률</Text>
                        <Text>{parsedData.growthRate}</Text>
                    </Box>
                </HStack>
            </Box>
        );
    };
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

    const renderSimilarServices = (data) => {
        console.log('Similar Services data:', data);
        let parsedData;
        try {
            parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (error) {
            console.error('Failed to parse similar services data:', error);
            return <Text>유사 서비스 데이터를 표시할 수 없습니다.</Text>;
        }

        if (!parsedData || typeof parsedData !== 'object') {
            return <Text>유효하지 않은 유사 서비스 데이터입니다.</Text>;
        }

        const parseAnalysis = (analysisStr) => {
            const companyRegex = /(\d+\.[\s\S]*?)(?=\d+\.|$)/g;
            const companies = [];
            let match;

            while ((match = companyRegex.exec(analysisStr)) !== null) {
                const [, content] = match;
                const lines = content.trim().split('\n');
                const name = lines[0].replace(/^\d+\.\s*/, '').trim();
                const details = {};
                let currentKey = '';

                lines.slice(1).forEach(line => {
                    if (line.startsWith('- ')) {
                        const [key, ...value] = line.slice(2).split(':');
                        currentKey = key.trim();
                        details[currentKey] = value.join(':').trim();
                    } else if (currentKey) {
                        details[currentKey] += ' ' + line.trim();
                    }
                });

                companies.push({ name, details });
            }

            return companies;
        };

        const analysisData = parseAnalysis(parsedData.analysis);

        const handleCompanyClick = (company) => {
            setSelectedCompany(company);
            setIsCompanyModalOpen(true);
        };

        return (
            <VStack align="stretch" spacing={4}>
                <Box>
                    <Text fontWeight="bold">유사 서비스</Text>
                    <UnorderedList>
                        {analysisData.map((company, index) => (
                            <ListItem key={index} cursor="pointer" onClick={() => handleCompanyClick(company)}>
                                <Text color="blue.500" textDecoration="underline">{company.name}</Text>
                            </ListItem>
                        ))}
                    </UnorderedList>
                </Box>
                <Divider />
                <Box>
                    <Text fontWeight="bold">전체 분석</Text>
                    <Text whiteSpace="pre-wrap">{parsedData.analysis}</Text>
                </Box>
                {renderCompanyModal()}
            </VStack>
        );
    };

    const renderCompanyModal = () => (
        <Modal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{selectedCompany?.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {selectedCompany && Object.entries(selectedCompany.details).map(([key, value]) => (
                        <Box key={key} mb={3}>
                            <Text fontWeight="bold">{key}:</Text>
                            <Text>{value}</Text>
                        </Box>
                    ))}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
    const renderTrendCustomerTechnology = (data) => {
        console.log('Trend Customer Technology data:', data);
        let parsedData;
        try {
            parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (error) {
            console.error('Failed to parse trend customer technology data:', error);
            return <Text>트렌드/고객/기술 데이터를 표시할 수 없습니다.</Text>;
        }

        if (!parsedData || typeof parsedData !== 'object') {
            return <Text>유효하지 않은 트렌드/고객/기술 데이터입니다.</Text>;
        }

        return (
            <VStack align="stretch" spacing={4}>
                {parsedData.trend && (
                    <Box>
                        <Text fontWeight="bold">트렌드</Text>
                        <Text>{parsedData.trend}</Text>
                    </Box>
                )}
                <Divider />
                {parsedData.mainCustomers && (
                    <Box>
                        <Text fontWeight="bold">주요 고객</Text>
                        <Text>{parsedData.mainCustomers}</Text>
                    </Box>
                )}
                <Divider />
                {parsedData.technologyTrend && (
                    <Box>
                        <Text fontWeight="bold">기술 동향</Text>
                        <Text>{parsedData.technologyTrend}</Text>
                    </Box>
                )}
            </VStack>
        );
    };

    const handleNewAnalysis = () => {
        setSelectedBusiness(null);
        setCustomData({
            category: '',
            scale: '',
            nation: '',
            customerType: '',
            businessType: '',
            businessContent: '',
            businessPlatform: '',
            businessScale: '',
            investmentStatus: ''
        });
        setMarketSizeGrowth(null);
        setSimilarServices(null);
        setTrendCustomerTechnology(null);
        setError(null);
        setCurrentStep(1);
    };

    const renderResults = () => (
        <VStack spacing={8} align="stretch">
            {marketSizeGrowth && (
                <Card>
                    <CardHeader>
                        <HStack>
                            <Icon as={FaChartLine} />
                            <Text fontSize="xl" fontWeight="bold">시장 규모 및 성장률</Text>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        {renderMarketSizeGrowth(marketSizeGrowth)}
                    </CardBody>
                </Card>
            )}
            {similarServices && (
                <Card>
                    <CardHeader>
                        <HStack>
                            <Icon as={FaUsers} />
                            <Text fontSize="xl" fontWeight="bold">유사 서비스 분석</Text>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        {renderSimilarServices(similarServices)}
                    </CardBody>
                </Card>
            )}
            {trendCustomerTechnology && (
                <Card>
                    <CardHeader>
                        <HStack>
                            <Icon as={FaLightbulb} />
                            <Text fontSize="xl" fontWeight="bold">트렌드, 고객 분포, 기술 동향</Text>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        {renderTrendCustomerTechnology(trendCustomerTechnology)}
                    </CardBody>
                </Card>
            )}
            <Button
                colorScheme="blue"
                size="lg"
                onClick={handleNewAnalysis}
                leftIcon={<Icon as={FaRedo} />}
            >
                새로운 분석 시작
            </Button>
        </VStack>
    );

    const renderResearchHistory = () => {
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? dateString : date.toLocaleString();
        };


        return (
            <Card>
                <CardHeader>
                    <Text fontSize="xl" fontWeight="bold">조회 이력</Text>
                </CardHeader>
                <CardBody>
                    {isLoading ? (
                        <Spinner />
                    ) : error ? (
                        <Text color="red.500">{error}</Text>
                    ) : researchHistory.length > 0 ? (
                        <>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>날짜</Th>
                                        <Th>시장 정보</Th>
                                        <Th>경쟁사 분석</Th>
                                        <Th>시장 동향</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {researchHistory.map((history, index) => (
                                        <Tr
                                            key={index}
                                            onClick={() => handleHistoryClick(history)}
                                            cursor="pointer"
                                            _hover={{ bg: "gray.100" }}
                                        >
                                            <Td>{formatDate(history.createAt)}</Td>
                                            <Td>{history.marketInformation ? '있음' : '없음'}</Td>
                                            <Td>{history.competitorAnalysis ? '있음' : '없음'}</Td>
                                            <Td>{history.marketTrends ? '있음' : '없음'}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                            {totalPages > 1 && (
                                <HStack justifyContent="center" mt={4}>
                                    <Button onClick={() => setCurrentPage(currentPage - 1)} isDisabled={currentPage === 0}>
                                        이전
                                    </Button>
                                    <Text>{currentPage + 1} / {totalPages}</Text>
                                    <Button onClick={() => setCurrentPage(currentPage + 1)} isDisabled={currentPage === totalPages - 1}>
                                        다음
                                    </Button>
                                </HStack>
                            )}
                        </>
                    ) : (
                        <VStack spacing={4} align="center">
                            <Text>조회 이력이 없습니다.</Text>
                            <Text>시장 분석을 실행하여 조회 이력을 생성해보세요.</Text>
                            <Button colorScheme="blue" onClick={() => setCurrentStep(1)}>
                                시장 분석 시작하기
                            </Button>
                        </VStack>
                    )}
                </CardBody>
            </Card>
        );
    };

    const renderHelpModal = () => (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>시장 조사 도움말</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>1. 사업을 선택하거나 새로운 사업 정보를 입력하세요.</Text>
                    <Text>2. 원하는 분석 유형을 선택하세요.</Text>
                    <Text>3. 분석 결과를 확인하고 인사이트를 얻으세요.</Text>
                    <Text>문의사항이 있으면 고객 지원팀에 연락해주세요.</Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <LoadingScreen isLoading={isLoading} />
            <Box id="market-research" width="70%" margin="auto" pt={24} pb={12} minHeight="1000px">
                <Box mt={8}/>
                <Flex justifyContent="space-between" alignItems="center" mb={8}>
                    <Heading as="h1" size="2xl" mb={8} wordBreak="break-word">시장 조사💹</Heading>
                    <Tooltip label="도움말">
                        <Icon as={FaQuestionCircle} onClick={onOpen} cursor="pointer" />
                    </Tooltip>
                </Flex>

                {renderStepIndicator()}

                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        <Tab>시장 분석</Tab>
                        <Tab>조회 이력</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <VStack spacing={8} align="stretch">
                                {currentStep === 1 && renderBusinessSelection()}
                                {currentStep === 2 && renderAnalysisTypeSelection()}
                                {currentStep === 3 && renderResults()}

                                {error && (
                                    <Alert status="error">
                                        <AlertIcon />
                                        {error}
                                    </Alert>
                                )}

                                {loading && <Spinner size="xl" />}
                            </VStack>
                        </TabPanel>
                        <TabPanel>
                            {renderResearchHistory()}
                        </TabPanel>
                    </TabPanels>
                </Tabs>

                {renderHelpModal()}
                {renderHistoryModal()}

            </Box>
        </motion.div>
    );
};

export default MarketResearch;