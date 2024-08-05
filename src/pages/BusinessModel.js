import React, { useState } from 'react';
import axios from 'axios';
import {
    VStack, HStack, Text, Button, Select, Input, Card, CardBody, CardHeader, Alert, AlertIcon,
    List, ListItem, FormControl, FormLabel, Box, Spinner
} from '@chakra-ui/react';

const BusinessModel = ({ businesses, selectedBusiness, customData, onBusinessSelect, onCustomDataChange }) => {
    const [similarServices, setSimilarServices] = useState([]);
    const [analyzedBusinessModel, setAnalyzedBusinessModel] = useState(null);
    const [businessProposal, setBusinessProposal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getSimilarServices = async () => {
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
        } : customData;

        try {
            const response = await axios.post('http://localhost:5000/business-model/similar-services', data, { headers });
            setSimilarServices(response.data);
        } catch (error) {
            console.error('Failed to get similar services:', error);
            setError(`유사 서비스 조회에 실패했습니다: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const analyzeBusinessModels = async () => {
        if (similarServices.length === 0) {
            setError('먼저 유사 서비스를 조회해주세요.');
            return;
        }

        setLoading(true);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await axios.post('http://localhost:5000/business-model/analyze', similarServices, { headers });
            setAnalyzedBusinessModel(response.data);
        } catch (error) {
            console.error('Failed to analyze business models:', error);
            setError(`비즈니스 모델 분석에 실패했습니다: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const proposeBusinessModel = async () => {
        if (!analyzedBusinessModel) {
            setError('먼저 비즈니스 모델을 분석해주세요.');
            return;
        }

        setLoading(true);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('access-token')}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await axios.post('http://localhost:5000/business-model/propose', JSON.stringify(analyzedBusinessModel), { headers });
            setBusinessProposal(response.data);
        } catch (error) {
            console.error('Failed to propose business model:', error);
            setError(`비즈니스 모델 제안에 실패했습니다: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack spacing={8} align="stretch">
            <Box>
                <Text fontWeight="bold" mb={2}>사업 선택 또는 정보 입력</Text>
                <Select placeholder="사업 선택" onChange={onBusinessSelect} value={selectedBusiness?.id || ''} mb={4}>
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
                            <Input name="category" value={customData.category} onChange={onCustomDataChange} placeholder="예: 인공지능(AI)" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업 규모</FormLabel>
                            <Input name="scale" value={customData.scale} onChange={onCustomDataChange} placeholder="예: 중소기업" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>국가</FormLabel>
                            <Input name="nation" value={customData.nation} onChange={onCustomDataChange} placeholder="예: 대한민국" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>고객유형</FormLabel>
                            <Input name="customerType" value={customData.customerType} onChange={onCustomDataChange} placeholder="예: B2B" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업유형</FormLabel>
                            <Input name="businessType" value={customData.businessType} onChange={onCustomDataChange} placeholder="예: 소프트웨어 개발" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>사업내용</FormLabel>
                            <Input name="businessContent" value={customData.businessContent} onChange={onCustomDataChange} placeholder="사업 내용을 간략히 설명해주세요" />
                        </FormControl>
                    </VStack>
                )}
            </Box>

            <HStack spacing={4}>
                <Button colorScheme="blue" onClick={getSimilarServices} isLoading={loading}>
                    유사 서비스 조회
                </Button>
                <Button colorScheme="green" onClick={analyzeBusinessModels} isLoading={loading} isDisabled={similarServices.length === 0}>
                    비즈니스 모델 분석
                </Button>
                <Button colorScheme="purple" onClick={proposeBusinessModel} isLoading={loading} isDisabled={!analyzedBusinessModel}>
                    비즈니스 모델 제안
                </Button>
            </HStack>

            {error && (
                <Alert status="error">
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            {loading && <Spinner />}

            {similarServices.length > 0 && (
                <Card>
                    <CardHeader>
                        <Text fontSize="xl" fontWeight="bold">유사 서비스</Text>
                    </CardHeader>
                    <CardBody>
                        <List spacing={3}>
                            {similarServices.map((service, index) => (
                                <ListItem key={index}>
                                    <Text fontWeight="bold">{service.businessName}</Text>
                                    <Text>{service.info.businessContent}</Text>
                                </ListItem>
                            ))}
                        </List>
                    </CardBody>
                </Card>
            )}

            {analyzedBusinessModel && (
                <Card>
                    <CardHeader>
                        <Text fontSize="xl" fontWeight="bold">비즈니스 모델 분석 결과</Text>
                    </CardHeader>
                    <CardBody>
                        <VStack align="stretch" spacing={4}>
                            <Box>
                                <Text fontWeight="bold">강점:</Text>
                                <Text>{analyzedBusinessModel.strengths}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">약점:</Text>
                                <Text>{analyzedBusinessModel.weaknesses}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">기회:</Text>
                                <Text>{analyzedBusinessModel.opportunities}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">위협:</Text>
                                <Text>{analyzedBusinessModel.threats}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">추천 전략:</Text>
                                <Text>{analyzedBusinessModel.recommendedStrategies}</Text>
                            </Box>
                        </VStack>
                    </CardBody>
                </Card>
            )}

            {businessProposal && (
                <Card>
                    <CardHeader>
                        <Text fontSize="xl" fontWeight="bold">비즈니스 모델 제안</Text>
                    </CardHeader>
                    <CardBody>
                        <VStack align="stretch" spacing={4}>
                            <Box>
                                <Text fontWeight="bold">제안된 비즈니스 모델:</Text>
                                <Text>{businessProposal.proposedModel}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">예상 수익 모델:</Text>
                                <Text>{businessProposal.revenueModel}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">주요 고객 세그먼트:</Text>
                                <Text>{businessProposal.customerSegments}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">핵심 자원 및 활동:</Text>
                                <Text>{businessProposal.keyResourcesAndActivities}</Text>
                            </Box>
                        </VStack>
                    </CardBody>
                </Card>
            )}
        </VStack>
    );
};

export default BusinessModel;