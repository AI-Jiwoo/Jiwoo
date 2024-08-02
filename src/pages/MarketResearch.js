import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, VStack, HStack, Text, Button, Select, Spinner, Input,
    Tabs, TabList, TabPanels, Tab, TabPanel, Card, CardBody, CardHeader, Alert, AlertIcon,
    SimpleGrid, Divider, FormControl, FormLabel, Td, Tr, Tbody, Th, Thead, Table
} from '@chakra-ui/react';
import BusinessModel from "./BusinessModel";

const MarketResearch = () => {
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [customData, setCustomData] = useState({
        category: '',
        scale: '',
        nation: '',
        customerType: '',
        businessType: '',
        businessContent: ''
    });
    const [marketSizeGrowth, setMarketSizeGrowth] = useState(null);
    const [similarServices, setSimilarServices] = useState(null);
    const [trendCustomerTechnology, setTrendCustomerTechnology] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [researchHistory, setResearchHistory] = useState([]);


    useEffect(() => {
        fetchBusinesses();
    }, []);

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
        try {
            const response = await axios.get('http://localhost:5000/market-research/history', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setResearchHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch research history:', error);
        }
    };

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
        const selected = businesses.find(b => b.id === parseInt(e.target.value));
        setSelectedBusiness(selected);
        setCustomData({
            category: '',
            scale: '',
            nation: '',
            customerType: '',
            businessType: '',
            businessContent: ''
        });
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
            businessStartDate: selectedBusiness.businessStartDate
        } : customData;

        try {
            let response;
            switch (type) {
                case 'marketSize':
                    response = await axios.post('http://localhost:5000/market-research/market-size-growth', data, { headers });
                    setDataSafely(setMarketSizeGrowth, response.data.data);
                    break;
                case 'similarServices':
                    response = await axios.post('http://localhost:5000/market-research/similar-services-analysis', data, { headers });
                    setDataSafely(setSimilarServices, response.data.data);
                    break;
                case 'trendCustomerTechnology':
                    response = await axios.post('http://localhost:5000/market-research/trend-customer-technology', data, { headers });
                    setDataSafely(setTrendCustomerTechnology, response.data.data);
                    break;
                case 'all':
                    const [marketSizeGrowthRes, similarServicesRes, trendCustomerTechnologyRes] = await Promise.all([
                        axios.post('http://localhost:5000/market-research/market-size-growth', data, { headers }),
                        axios.post('http://localhost:5000/market-research/similar-services-analysis', data, { headers }),
                        axios.post('http://localhost:5000/market-research/trend-customer-technology', data, { headers })
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
            <SimpleGrid columns={2} spacing={4}>
                <Box>
                    <Text fontWeight="bold">시장 규모</Text>
                    <Text>{parsedData.marketSize}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">성장률</Text>
                    <Text>{parsedData.growthRate}</Text>
                </Box>
            </SimpleGrid>
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
                                <Td>{new Date(history.researchDate).toLocaleString()}</Td>
                                <Td>{history.researchType}</Td>
                                <Td>{history.businessName || history.categoryName}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </CardBody>
        </Card>
    );

    return (
        <Box width="80%" margin="auto" mt={12} mb={12}>
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
                                            <Input name="category" value={customData.category} onChange={handleCustomDataChange} placeholder="예: 인공지능(AI)" />
                                        </FormControl>
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
                                        <Text whiteSpace="pre-wrap">{similarServices}</Text>
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
    );
};

export default MarketResearch;