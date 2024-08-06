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
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Card,
    CardBody,
    CardHeader,
    Alert,
    AlertIcon,
    SimpleGrid,
    Divider,
    FormControl,
    FormLabel,
    Td,
    Tr,
    Tbody,
    Th,
    Thead,
    Table,
    ListItem,
    UnorderedList,
    GridItem,
    Grid, Flex
} from '@chakra-ui/react';
import BusinessModel from "./BusinessModel";
import { motion } from 'framer-motion';
import MarketGrowthChart from "../component/MarketGrowthChart";


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
        businessScale:'',
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
    const [categories, setCategories] = useState([]); // 카테고리 목록을 위한 새로운 state



    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    };


    useEffect(() => {
        if (selectedBusiness) {
            console.log('Selected business changed:', selectedBusiness);
        }
    }, [selectedBusiness?.id]);

    useEffect(() => {
        fetchBusinesses();
        fetchResearchHistory();
        fetchCategories(); // 카테고리 목록을 가져오는 함수 호출
    }, [currentPage]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/category/names', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setError('카테고리 목록을 불러오는데 실패했습니다: ' + (error.response?.data?.message || error.message));
        }
    };

    const fetchBusinesses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/business/user', {
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
            const response = await axios.get(`http://localhost:5000/market-research/history?page=${currentPage}&size=10&sort=createdAt,desc`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            console.log('Server response:', response.data);

            // 여기서 데이터가 비어있는지 확인
            if (response.data.data && response.data.data.length > 0) {
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

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    }

    const saveResearchHistory = async (type) => {
        const historyData = {
            businessId: selectedBusiness?.id || null,
            categoryName: customData.category || null,
            researchType: type,
            researchDate: new Date().toISOString()
        };

        try {
            await axios.post('http://localhost:5000/market-research/save-history', historyData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setResearchHistory(prevHistory => [historyData, ...prevHistory]);
        } catch (error) {
            console.error('Failed to save research history:', error);
        }
    };

    const handleBusinessSelect = (e) => {
        const selectedId = parseInt(e.target.value);
        const selected = businesses.find(b => b.id === selectedId);
        console.log('Selected business :', selected);
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
        loadSelectedBusinessData(selected);
    };

    const loadSelectedBusinessData = async (business) => {
        if(!business) return;

        console.log("loading data for business:", business.businessName);
    }

    useEffect(() => {
        console.log("Current selected business:", selectedBusiness);
    }, [selectedBusiness]);

    const parseAnalysisData = (data) => {
        const parsedData = JSON.parse(data);
        return {
            businessId : parsedData.businessId,
            similarServices : parsedData.similarServices,
            analysis : {
                strengths: parsedData.analysis.split('\n\n')[0].split('\n').slice(1),
                weaknesses: parsedData.analysis.split('\n\n')[1].split('\n').slice(1),
                characteristics: parsedData.analysis.split('\n\n')[2].split('\n').slice(1),
                strategies: parsedData.analysis.split('\n\n')[3].split('\n').slice(1)
            }
        };
    };

    const AnalysisResult = ({ data }) => {
        const parsedData = parseAnalysisData(data);

        return (
            <Box>
                <Text fontSize="xl" fontWeight="bold" mb={4}>분석 결과</Text>

                <Text fontWeight="bold" mb={2}>유사 서비스:</Text>
                <UnorderedList mb={4}>
                    {parsedData.similarServices.map((service, index) => (
                        <ListItem key={index}>{service}</ListItem>
                    ))}
                </UnorderedList>

                <Text fontWeight="bold" mb={2}>강점:</Text>
                <UnorderedList mb={4}>
                    {parsedData.analysis.strengths.map((strength, index) => (
                        <ListItem key={index}>{strength}</ListItem>
                    ))}
                </UnorderedList>

                <Text fontWeight="bold" mb={2}>약점:</Text>
                <UnorderedList mb={4}>
                    {parsedData.analysis.weaknesses.map((weakness, index) => (
                        <ListItem key={index}>{weakness}</ListItem>
                    ))}
                </UnorderedList>

                <Text fontWeight="bold" mb={2}>특징:</Text>
                <UnorderedList mb={4}>
                    {parsedData.analysis.characteristics.map((characteristic, index) => (
                        <ListItem key={index}>{characteristic}</ListItem>
                    ))}
                </UnorderedList>

                <Text fontWeight="bold" mb={2}>전략:</Text>
                <UnorderedList mb={4}>
                    {parsedData.analysis.strategies.map((strategy, index) => (
                        <ListItem key={index}>{strategy}</ListItem>
                    ))}
                </UnorderedList>
            </Box>
        );
    };

    const handleCustomDataChange = (e) => {
        const { name, value } = e.target;
        setCustomData(prev => ({ ...prev, [name]: value }));
    };

    const setDataSafely = (setter, data) => {
        if (typeof data === 'string') {
            setter(data);
        } else if (typeof data === 'object' && data !== null) {
            setter(JSON.stringify(data, null, 2));
        } else {
            setter('데이터를 표시할 수 없습니다.');
        }
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

        console.log('Sending data for analysis:', data);

        try {
            let response;
            const timestamp = new Date().getTime();
            switch (type) {
                case 'marketSize':
                    response = await axios.post(`http://localhost:5000/market-research/market-size-growth?t=${timestamp}`, data, { headers });
                    setDataSafely(setMarketSizeGrowth, response.data.data);
                    break;
                case 'similarServices':
                    response = await axios.post(`http://localhost:5000/market-research/similar-services-analysis?t=${timestamp}`, data, { headers });
                    setDataSafely(setSimilarServices, response.data.data);
                    break;
                case 'trendCustomerTechnology':
                    response = await axios.post(`http://localhost:5000/market-research/trend-customer-technology?t=${timestamp}`, data, { headers });
                    setDataSafely(setTrendCustomerTechnology, response.data.data);
                    break;
                case 'all':
                    const [marketSizeGrowthRes, similarServicesRes, trendCustomerTechnologyRes] = await Promise.all([
                        axios.post(`http://localhost:5000/market-research/market-size-growth?t=${timestamp}`, data, { headers }),
                        axios.post(`http://localhost:5000/market-research/similar-services-analysis?t=${timestamp}`, data, { headers }),
                        axios.post(`http://localhost:5000/market-research/trend-customer-technology?t=${timestamp}`, data, { headers })
                    ]);
                    setDataSafely(setMarketSizeGrowth, marketSizeGrowthRes.data.data);
                    setDataSafely(setSimilarServices, similarServicesRes.data.data);
                    setDataSafely(setTrendCustomerTechnology, trendCustomerTechnologyRes.data.data);
                    await saveResearchHistory(type);
                    break;
            }
        } catch (error) {
            console.error('Market analysis failed:', error);
            if (error.response) {
                console.error('Error data:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            setError(`시장 분석에 실패했습니다: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderMarketSizeGrowth = (data) => {
        const parsedData = JSON.parse(data);
        return (
            <Flex>
                <Box flex="3" pr={4}>
                    <Box height="400px" width="100%">
                        <MarketGrowthChart data={parsedData} />
                    </Box>
                </Box>
                <VStack flex="1" align="start" spacing={4} justifyContent="center">
                    <Box>
                        <Text fontWeight="bold">시장 규모</Text>
                        <Text>{parsedData.marketSize}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold">성장률</Text>
                        <Text>{parsedData.growthRate}</Text>
                    </Box>
                </VStack>
            </Flex>
        );
    };
    const renderTrendCustomerTechnology = (data) => {
        const parsedData = JSON.parse(data);
        return (
            <VStack align="stretch" spacing={4}>
                <Box>
                    <Text fontWeight="bold">트렌드</Text>
                    <Text>{parsedData.trend}</Text>
                </Box>
                <Divider />
                <Box>
                    <Text fontWeight="bold">주요 고객</Text>
                    <Text>{parsedData.mainCustomers}</Text>
                </Box>
                <Divider />
                <Box>
                    <Text fontWeight="bold">기술 동향</Text>
                    <Text>{parsedData.technologyTrend}</Text>
                </Box>
            </VStack>
        );
    };

    const renderResearchHistory = () => (
        <Card mt={8}>
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
                                    <Th>분석 유형</Th>
                                    <Th>사업명/카테고리</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {researchHistory.map((history, index) => (
                                    <Tr key={index}>
                                        <Td>{formatDate(history.researchDate)}</Td>
                                        <Td>{history.researchType || 'N/A'}</Td>
                                        <Td>{history.businessName || history.categoryName || 'N/A'}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        {totalPages > 1 && (
                            <HStack justifyContent="center" mt={4}>
                                <Button onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 0}>
                                    이전
                                </Button>
                                <Text>{currentPage + 1} / {totalPages}</Text>
                                <Button onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages - 1}>
                                    다음
                                </Button>
                            </HStack>
                        )}
                    </>
                ) : (
                    <VStack spacing={4} align="center">
                        <Text>조회 이력이 없습니다.</Text>
                        <Text>시장 분석을 실행하여 조회 이력을 생성해보세요.</Text>
                        <Button colorScheme="blue" onClick={() => {/* 시장 분석 페이지로 이동하는 로직 */}}>
                            시장 분석 시작하기
                        </Button>
                    </VStack>
                )}
            </CardBody>
        </Card>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
        >
        <Box width="80%" margin="auto" mt={12} mb={12} minHeight="1000px">
            <Text fontSize="2xl" fontWeight="bold" mb={8} textAlign="center">액셀러레이팅</Text>

            <Tabs isFitted variant="enclosed" colorScheme="blue" mb={8}>
                <TabList mb="1em">
                    <Tab>비즈니스 모델</Tab>
                    <Tab>시장조사</Tab>
                    <Tab>조회이력</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <BusinessModel
                            businesses={businesses}
                            selectedBusiness={selectedBusiness}
                            customData={customData}
                            onBusinessSelect={handleBusinessSelect}
                            onCustomDataChange={handleCustomDataChange}
                            />
                    </TabPanel>
                    <TabPanel>
                        <VStack spacing={8} align="stretch">
                            <Box>
                                <Text fontWeight="bold" mb={2}>사업 선택 또는 정보 입력</Text>
                                <Select placeholder="사업 선택" onChange={handleBusinessSelect} value={selectedBusiness?.id || ''} mb={4}>
                                    {businesses.map((business) => (
                                        <option key={business.id} value={business.id}>
                                            {business.businessName}
                                        </option>
                                    ))}
                                </Select>
                                {!selectedBusiness && (
                                    <VStack spacing={4} align="stretch">
                                        <FormControl>
                                            <FormLabel>사업 분야 (카테고리)</FormLabel>
                                            <Select
                                                name="category"
                                                value={customData.category}
                                                onChange={handleCustomDataChange}
                                                placeholder="카테고리 선택"
                                            >
                                                {categories.map((category, index) => (
                                                    <option key={index} value={category}>{category}</option>
                                                ))}
                                            </Select>                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>사업 규모</FormLabel>
                                            <Input name="scale" value={customData.scale} onChange={handleCustomDataChange} placeholder="예: 중소기업" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>국가</FormLabel>
                                            <Input name="nation" value={customData.nation} onChange={handleCustomDataChange} placeholder="예: 대한민국" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>고객유형</FormLabel>
                                            <Input name="customerType" value={customData.customerType} onChange={handleCustomDataChange} placeholder="예: B2B" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>사업유형</FormLabel>
                                            <Input name="businessType" value={customData.businessType} onChange={handleCustomDataChange} placeholder="예: 소프트웨어 개발" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>사업내용</FormLabel>
                                            <Input name="businessContent" value={customData.businessContent} onChange={handleCustomDataChange} placeholder="사업 내용을 간략히 설명해주세요" />
                                        </FormControl>
                                    </VStack>
                                )}
                            </Box>

                            {(selectedBusiness || customData.category) && (
                                <Card>
                                    <CardHeader>
                                        <Text fontWeight="bold">{selectedBusiness?.businessName || customData.category}</Text>
                                    </CardHeader>
                                    <CardBody>
                                        {selectedBusiness ? (
                                            <>
                                                <Text>사업자 번호: {selectedBusiness.businessNumber}</Text>
                                                <Text>사업 내용: {selectedBusiness.businessContent}</Text>
                                                <Text>사업 위치: {selectedBusiness.businessLocation}</Text>
                                                <Text>사업 시작일: {selectedBusiness.businessStartDate}</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Text>사업 분야: {customData.category || '카테고리 없음'}</Text>
                                                <Text>사업 규모: {customData.scale || 'null'}</Text>
                                                <Text>국가: {customData.nation || 'null'}</Text>
                                                <Text>고객유형: {customData.customerType || 'null'}</Text>
                                                <Text>사업유형: {customData.businessType || 'null'}</Text>
                                                <Text>사업내용: {customData.businessContent || 'null'}</Text>
                                            </>
                                        )}
                                        <HStack mt={4} spacing={4}>
                                            <Button colorScheme="blue" onClick={() => analyzeMarket('marketSize')} isLoading={loading}>
                                                시장 규모 분석
                                            </Button>
                                            <Button colorScheme="blue" onClick={() => analyzeMarket('similarServices')} isLoading={loading}>
                                                유사 서비스 분석
                                            </Button>
                                            <Button colorScheme="blue" onClick={() => analyzeMarket('trendCustomerTechnology')} isLoading={loading}>
                                                트렌드/고객/기술 분석
                                            </Button>
                                            <Button colorScheme="green" onClick={() => analyzeMarket('all')} isLoading={loading}>
                                                전체 분석
                                            </Button>
                                        </HStack>
                                    </CardBody>
                                </Card>
                            )}

                            {error && (
                                <Alert status="error">
                                    <AlertIcon />
                                    {error}
                                </Alert>
                            )}

                            {loading && <Spinner />}

                            {marketSizeGrowth && (
                                <Card>
                                    <CardHeader>
                                        <Text fontSize="xl" fontWeight="bold">시장 규모 및 성장률</Text>
                                    </CardHeader>
                                    <CardBody>
                                        {renderMarketSizeGrowth(marketSizeGrowth)}
                                    </CardBody>
                                </Card>
                            )}

                            {trendCustomerTechnology && (
                                <Card>
                                    <CardHeader>
                                        <Text fontSize="xl" fontWeight="bold">트렌드, 고객 분포, 기술 동향</Text>
                                    </CardHeader>
                                    <CardBody>
                                        {renderTrendCustomerTechnology(trendCustomerTechnology)}
                                    </CardBody>
                                </Card>
                            )}

                            {similarServices && (
                                <Card>
                                    <CardHeader>
                                        <Text fontSize="xl" fontWeight="bold">유사 서비스 분석</Text>
                                    </CardHeader>
                                    <CardBody>
                                        <AnalysisResult data={similarServices}/>
                                    </CardBody>
                                </Card>
                            )}
                        </VStack>

                    </TabPanel>
                    <TabPanel>
                        {renderResearchHistory()}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
        </motion.div>
    );
};

export default MarketResearch;