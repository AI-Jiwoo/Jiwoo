import React, {useCallback, useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {
    VStack, HStack, Text, Button, Select, Input, Card, CardBody, CardHeader, Alert, AlertIcon,
    List, ListItem, FormControl, FormLabel, Box, Spinner, Icon, SimpleGrid, Progress, Flex,
    useBreakpointValue, Heading, UnorderedList, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton
} from '@chakra-ui/react';
import { FaBusinessTime, FaChartLine, FaUsers, FaLightbulb, FaRedo, FaEye } from "react-icons/fa";

const BusinessModel = ({ customData, onBusinessSelect, onCustomDataChange }) => {
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [similarServices, setSimilarServices] = useState([]);
    const [analyzedBusinessModel, setAnalyzedBusinessModel] = useState(null);
    const [businessProposal, setBusinessProposal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const columnCount = useBreakpointValue({ base: 1, md: 2 });
    const businessModelRef = useRef(null);


    useEffect(() => {
        fetchBusinesses();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (businessModelRef.current) {
            businessModelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    useEffect(() => {
        console.log("Selected business updated:", selectedBusiness);
    }, [selectedBusiness]);

    const fetchBusinesses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/business/user', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setBusinesses(response.data.business || []);
        } catch (error) {
            handleError('사업 정보를 불러오는데 실패했습니다', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/category/names', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setCategories(response.data || []);
        } catch (error) {
            handleError('카테고리 목록을 불러오는데 실패했습니다', error);
        }
    };

    const getSimilarServices = async () => {
        if (!selectedBusiness && !customData?.category) {
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
        } : customData;

        try {
            const response = await axios.post('http://localhost:5000/business-model/similar-services', data, { headers });
            setSimilarServices(response.data);
            setCurrentStep(2);
        } catch (error) {
            handleError('유사 서비스 조회에 실패했습니다', error);
        } finally {
            setLoading(false);
        }
    };

    const analyzeBusinessModels = async () => {
        setLoading(true);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await axios.post('http://localhost:5000/business-model/analyze', similarServices, { headers });
            setAnalyzedBusinessModel(response.data);
            setCurrentStep(3);
        } catch (error) {
            handleError('비즈니스 모델 분석에 실패했습니다', error);
        } finally {
            setLoading(false);
        }
    };

    const proposeBusinessModel = async () => {
        setLoading(true);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await axios.post('http://localhost:5000/business-model/propose', JSON.stringify(analyzedBusinessModel), { headers });
            setBusinessProposal(response.data);
            setCurrentStep(4);
        } catch (error) {
            handleError('비즈니스 모델 제안에 실패했습니다', error);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (message, error) => {
        console.error(message, error);
        setError(`${message}: ${error.response?.data?.message || error.message}`);
    };

    const renderStepIndicator = () => (
        <Box mb={8}>
            <Progress value={(currentStep / 4) * 100} size="sm" colorScheme="blue" />
            <HStack justify="space-between" mt={2}>
                {['사업 선택', '유사 서비스', '모델 분석', '모델 제안'].map((step, index) => (
                    <Text key={index} fontWeight={currentStep >= index + 1 ? "bold" : "normal"} fontSize="sm">
                        {index + 1}. {step}
                    </Text>
                ))}
            </HStack>
        </Box>
    );

    const handleBusinessSelect = useCallback((event) => {
        const selectedId = parseInt(event.target.value, 10);
        const selected = businesses.find(b => b.id === selectedId);
        console.log("Business selected:", selected);
        if (selected) {
            setSelectedBusiness(selected);  // 직접 상태 업데이트
            if (typeof onBusinessSelect === 'function') {
                onBusinessSelect(selected);
            }
        }
    }, [businesses, onBusinessSelect]);

    const renderBusinessSelection = () => (
        <Card>
            <CardHeader>
                <HStack>
                    <Icon as={FaBusinessTime} />
                    <Heading size="md">사업 선택 또는 정보 입력</Heading>
                </HStack>
            </CardHeader>
            <CardBody>
                <Select
                    placeholder="사업 선택"
                    onChange={handleBusinessSelect}
                    value={selectedBusiness?.id || ''}
                    mb={4}
                >
                    {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                            {business.businessName}
                        </option>
                    ))}
                </Select>
                {!selectedBusiness && (
                    <SimpleGrid columns={columnCount} spacing={4}>
                        <FormControl>
                            <FormLabel>사업 분야 (카테고리)</FormLabel>
                            <Select
                                name="category"
                                value={customData?.category || ''}
                                onChange={onCustomDataChange}
                                placeholder="카테고리 선택"
                            >
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업 규모</FormLabel>
                            <Input
                                name="scale"
                                value={customData?.scale || ''}
                                onChange={onCustomDataChange}
                                placeholder="예: 중소기업"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>국가</FormLabel>
                            <Input
                                name="nation"
                                value={customData?.nation || ''}
                                onChange={onCustomDataChange}
                                placeholder="예: 대한민국"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>고객유형</FormLabel>
                            <Input
                                name="customerType"
                                value={customData?.customerType || ''}
                                onChange={onCustomDataChange}
                                placeholder="예: B2B"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업유형</FormLabel>
                            <Input
                                name="businessType"
                                value={customData?.businessType || ''}
                                onChange={onCustomDataChange}
                                placeholder="예: 소프트웨어 개발"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업내용</FormLabel>
                            <Input
                                name="businessContent"
                                value={customData?.businessContent || ''}
                                onChange={onCustomDataChange}
                                placeholder="사업 내용을 간략히 설명해주세요"
                            />
                        </FormControl>
                    </SimpleGrid>
                )}
                <Button
                    mt={4}
                    colorScheme="blue"
                    onClick={getSimilarServices}
                    isLoading={loading}
                >
                    다음 단계
                </Button>
            </CardBody>
        </Card>
    );

    const renderSimilarServices = () => (
        <Card>
            <CardHeader>
                <HStack>
                    <Icon as={FaUsers} />
                    <Heading size="md">유사 서비스</Heading>
                </HStack>
            </CardHeader>
            <CardBody>
                <List spacing={3}>
                    {similarServices.map((service, index) => (
                        <ListItem key={index}>
                            <Text>{service.name}</Text>
                        </ListItem>
                    ))}
                </List>
                <Button
                    mt={4}
                    colorScheme="blue"
                    onClick={analyzeBusinessModels}
                    isLoading={loading}
                >
                    비즈니스 모델 분석
                </Button>
            </CardBody>
        </Card>
    );

    const renderAnalyzedBusinessModel = () => (
        <Card>
            <CardHeader>
                <HStack>
                    <Icon as={FaChartLine} />
                    <Heading size="md">비즈니스 모델 분석 결과</Heading>
                </HStack>
            </CardHeader>
            <CardBody>
                <Text whiteSpace="pre-wrap">{analyzedBusinessModel?.analysis}</Text>
                <Button
                    mt={4}
                    colorScheme="blue"
                    onClick={proposeBusinessModel}
                    isLoading={loading}
                >
                    비즈니스 모델 제안
                </Button>
            </CardBody>
        </Card>
    );

    const renderBusinessProposal = () => (
        <Card>
            <CardHeader>
                <HStack>
                    <Icon as={FaLightbulb} />
                    <Heading size="md">비즈니스 모델 제안</Heading>
                </HStack>
            </CardHeader>
            <CardBody>
                <Text whiteSpace="pre-wrap">{businessProposal?.proposal}</Text>
            </CardBody>
        </Card>
    );

    const parseAnalysis = (analysisText) => {
        const companies = analysisText.split('\n\n');
        return companies.map(company => {
            const [name, ...details] = company.split('\n');
            const parsedDetails = details.reduce((acc, detail) => {
                const [key, value] = detail.split(': ');
                acc[key.slice(2)] = value;
                return acc;
            }, {});
            return { name: name.slice(3), ...parsedDetails };
        });
    };

    const parseProposal = (proposalText) => {
        const lines = proposalText.split('\n');
        const result = {};
        let currentKey = '';
        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                currentKey = key.trim();
                result[currentKey] = value.trim();
            } else if (line.startsWith('-') && currentKey) {
                if (!Array.isArray(result[currentKey])) {
                    result[currentKey] = [];
                }
                result[currentKey].push(line.slice(2));
            }
        });
        return result;
    };

    const renderFullResults = () => (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>전체 분석 결과</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {analyzedBusinessModel && (
                        <Box mb={8}>
                            <Heading size="md" mb={4}>비즈니스 모델 분석 결과</Heading>
                            {parseAnalysis(analyzedBusinessModel.analysis).map((company, index) => (
                                <Box key={index} mb={4}>
                                    <Heading size="sm">{company.name}</Heading>
                                    <Text><strong>수익구조:</strong> {company['수익구조']}</Text>
                                    <Text><strong>공통 전략:</strong> {company['공통 전략']}</Text>
                                    <Text><strong>독특한 접근 방식:</strong> {company['독특한 접근 방식']}</Text>
                                    <Text><strong>개선 가능한 영역:</strong> {company['개선 가능한 영역']}</Text>
                                </Box>
                            ))}
                        </Box>
                    )}
                    {businessProposal && (
                        <Box>
                            <Heading size="md" mb={4}>비즈니스 모델 제안</Heading>
                            {(() => {
                                const proposal = parseProposal(businessProposal.proposal);
                                return (
                                    <VStack align="start" spacing={4}>
                                        <Heading size="sm">{proposal['제안하는 비즈니스 모델은']}</Heading>
                                        {Object.entries(proposal).slice(1).map(([key, value]) => (
                                            <Box key={key}>
                                                <Text fontWeight="bold">{key}:</Text>
                                                {Array.isArray(value) ? (
                                                    <UnorderedList>
                                                        {value.map((item, index) => (
                                                            <ListItem key={index}>{item}</ListItem>
                                                        ))}
                                                    </UnorderedList>
                                                ) : (
                                                    <Text>{value}</Text>
                                                )}
                                            </Box>
                                        ))}
                                    </VStack>
                                );
                            })()}
                        </Box>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );

    const handleNewAnalysis = () => {
        setSelectedBusiness(null);
        setSimilarServices([]);
        setAnalyzedBusinessModel(null);
        setBusinessProposal(null);
        setCurrentStep(1);
        setError(null);
    };

    if (loading) {
        return (
            <Flex align="center" justify="center" height="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Box ref={businessModelRef} width="70%" margin="auto" pt={24} mb={12} minHeight="1000px">
            <Box mt={8}/>
            <Flex justifyContent="space-between" alignItems="center" mb={8}>
                <Heading as="h1" size="2xl" mb={8}>비즈니스 모델👨‍💼</Heading>
            </Flex>
            {renderStepIndicator()}
            <VStack spacing={8} align="stretch">
                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}
                {currentStep === 1 && renderBusinessSelection()}
                {currentStep === 2 && renderSimilarServices()}
                {currentStep === 3 && renderAnalyzedBusinessModel()}
                {currentStep === 4 && renderBusinessProposal()}
                {currentStep > 1 && (
                    <HStack justifyContent="space-between">
                        <Button
                            leftIcon={<Icon as={FaRedo} />}
                            onClick={handleNewAnalysis}
                        >
                            새로운 분석 시작
                        </Button>
                        <Button
                            rightIcon={<Icon as={FaEye} />}
                            onClick={() => setIsModalOpen(true)}
                            isDisabled={!analyzedBusinessModel || !businessProposal}
                        >
                            전체 결과 보기
                        </Button>
                    </HStack>
                )}
            </VStack>
            {renderFullResults()}
        </Box>
    );
};

export default BusinessModel;