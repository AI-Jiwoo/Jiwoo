import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    VStack,
    HStack,
    Text,
    Button,
    Select,
    Input,
    Card,
    CardBody,
    CardHeader,
    Alert,
    AlertIcon,
    List,
    ListItem,
    FormControl,
    FormLabel,
    Box,
    Spinner,
    Icon,
    SimpleGrid,
    Progress,
    Flex,
    useBreakpointValue,
    Heading,
    UnorderedList,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useToast
} from '@chakra-ui/react';
import {FaBusinessTime, FaChartLine, FaUsers, FaLightbulb, FaRedo, FaEye, FaCopy} from "react-icons/fa";
import api from "../apis/api";
import LoadingScreen from "../component/common/LoadingMotion";

const BusinessModel = () => {
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
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();
    const [customData, setCustomData] = useState({
        category: '',
        scale: '',
        nation: '',
        customerType: '',
        businessType: '',
        businessContent: ''
    });


    const businessModelMessages = [
        "비즈니스 모델을 분석 중입니다...",
        "수익 구조를 최적화하고 있어요.",
        "고객 세그먼트를 정의하고 있습니다.",
        "가치 제안을 구체화하고 있어요.",
        "핵심 자원과 활동을 파악 중입니다.",
        "JIWOO AI가 당신의 비즈니스 모델을 혁신하고 있어요!",
    ];

    const handleCopy = (text, section) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "복사 완료",
                description: `${section} 내용이 클립보드에 복사되었습니다.`,
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        }).catch(err => {
            console.error('복사 실패:', err);
            toast({
                title: "복사 실패",
                description: "내용을 복사하는데 실패했습니다.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        });
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                await fetchBusinesses();
                await fetchCategories();
            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
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
            const response = await api.get('/business/user', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
            });
            setBusinesses(response.data.business || []);
        } catch (error) {
            handleError('사업 정보를 불러오는데 실패했습니다', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/category/names', {
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
        setIsLoading(true);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json'
        };

        let data;
        if (selectedBusiness) {
            data = {
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
            };
        } else {
            data = {
                ...customData,
                businessName: customData.category,
            };
        }

        try {
            const response = await api.post('/business-model/similar-services', data, { headers });
            setSimilarServices(response.data);
            setCurrentStep(2);
        } catch (error) {
            handleError('유사 서비스 조회에 실패했습니다', error);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    const analyzeBusinessModels = async () => {
        setLoading(true);
        setIsLoading(true);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await api.post('/business-model/analyze', similarServices, { headers });
            setAnalyzedBusinessModel(response.data);
            setCurrentStep(3);
        } catch (error) {
            handleError('비즈니스 모델 분석에 실패했습니다', error);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    const proposeBusinessModel = async () => {
        setLoading(true);
        setIsLoading(true);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await api.post('/business-model/propose', JSON.stringify(analyzedBusinessModel), { headers });
            setBusinessProposal(response.data);
            setCurrentStep(4);
        } catch (error) {
            handleError('비즈니스 모델 제안에 실패했습니다', error);
        } finally {
            setLoading(false);
            setIsLoading(false);
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
            setSelectedBusiness(selected);
            setCustomData({
                category: selected.category || '',
                scale: selected.businessScale || '',
                nation: selected.businessLocation || '',
                customerType: selected.customerType || '',
                businessType: selected.businessType || '',
                businessContent: selected.businessContent || ''
            });
        } else {
            setSelectedBusiness(null);
            setCustomData({
                category: '',
                scale: '',
                nation: '',
                customerType: '',
                businessType: '',
                businessContent: ''
            });
        }
    }, [businesses]);

    const handleCustomDataChange = (event) => {
        const { name, value } = event.target;
        setCustomData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };



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
                                value={customData.category}
                                onChange={handleCustomDataChange}
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
                                value={customData.scale}
                                onChange={handleCustomDataChange}
                                placeholder="예: 중소기업"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>국가</FormLabel>
                            <Input
                                name="nation"
                                value={customData.nation}
                                onChange={handleCustomDataChange}
                                placeholder="예: 대한민국"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>고객유형</FormLabel>
                            <Input
                                name="customerType"
                                value={customData.customerType}
                                onChange={handleCustomDataChange}
                                placeholder="예: B2B"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업유형</FormLabel>
                            <Input
                                name="businessType"
                                value={customData.businessType}
                                onChange={handleCustomDataChange}
                                placeholder="예: 소프트웨어 개발"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업내용</FormLabel>
                            <Input
                                name="businessContent"
                                value={customData.businessContent}
                                onChange={handleCustomDataChange}
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
                {similarServices.length > 0 ? (
                    <List spacing={3}>
                        {similarServices.map((service, index) => (
                            <ListItem key={index}>
                                <Text>{service.businessName || service.name || '이름 없음'}</Text>
                                {service.analysis && (
                                    <Text fontSize="sm" color="gray.600" mt={1}>
                                        {service.analysis}
                                    </Text>
                                )}
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Text>유사 서비스가 없습니다.</Text>
                )}
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

    const renderFullResults = () => {
        const fullContent = `
유사 서비스:
${similarServices.map(service => `${service.businessName || service.name || '이름 없음'}\n${service.analysis || ''}`).join('\n\n')}

비즈니스 모델 분석 결과:
${analyzedBusinessModel?.analysis || ''}

비즈니스 모델 제안:
${businessProposal?.proposal || ''}
        `.trim();

        return (
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="full">
                <ModalOverlay />
                <ModalContent maxWidth="90vw" maxHeight="90vh">
                    <ModalHeader>전체 분석 결과</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody overflowY="auto" p={6}>
                        <VStack spacing={8} align="stretch">
                            <Box>
                                <Heading size="md" mb={4}>유사 서비스</Heading>
                                <List spacing={3}>
                                    {similarServices.map((service, index) => (
                                        <ListItem key={index}>
                                            <Text fontWeight="bold">{service.businessName || service.name || '이름 없음'}</Text>
                                            {service.analysis && (
                                                <Text mt={1}>{service.analysis}</Text>
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                                <Button leftIcon={<FaCopy />} mt={2} onClick={() => handleCopy(similarServices.map(service => `${service.businessName || service.name || '이름 없음'}\n${service.analysis || ''}`).join('\n\n'), '유사 서비스')}>
                                    유사 서비스 복사
                                </Button>
                            </Box>

                            {analyzedBusinessModel && (
                                <Box>
                                    <Heading size="md" mb={4}>비즈니스 모델 분석 결과</Heading>
                                    <Text whiteSpace="pre-wrap">{analyzedBusinessModel.analysis}</Text>
                                    <Button leftIcon={<FaCopy />} mt={2} onClick={() => handleCopy(analyzedBusinessModel.analysis, '비즈니스 모델 분석')}>
                                        분석 결과 복사
                                    </Button>
                                </Box>
                            )}

                            {businessProposal && (
                                <Box>
                                    <Heading size="md" mb={4}>비즈니스 모델 제안</Heading>
                                    <Text whiteSpace="pre-wrap">{businessProposal.proposal}</Text>
                                    <Button leftIcon={<FaCopy />} mt={2} onClick={() => handleCopy(businessProposal.proposal, '비즈니스 모델 제안')}>
                                        제안 내용 복사
                                    </Button>
                                </Box>
                            )}

                            <Button leftIcon={<FaCopy />} colorScheme="blue" mt={4} onClick={() => handleCopy(fullContent, '전체 내용')}>
                                전체 내용 복사
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    };

    const handleNewAnalysis = () => {
        setSelectedBusiness(null);
        setSimilarServices([]);
        setAnalyzedBusinessModel(null);
        setBusinessProposal(null);
        setCurrentStep(1);
        setError(null);
    };

    return (
        <Box ref={businessModelRef} width="70%" margin="auto" pt={24} mb={12} minHeight="1000px">
            <Box mt={8}/>
            <LoadingScreen isLoading={isLoading} messages={businessModelMessages} />
            {!isLoading && (
                <>
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
                </>
            )}
        </Box>
    );
};

export default BusinessModel;