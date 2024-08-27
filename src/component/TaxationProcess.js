import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Button, VStack, Text, Input, Select, useToast, Textarea, Progress, Flex } from '@chakra-ui/react';
import axios from "axios";
import api from "../apis/api";
import { useDropzone } from 'react-dropzone';

const TaxationChatbot = ({ onMessage, onComplete }) => {
    const [taxationStep, setTaxationStep] = useState(0);
    const [taxationAnswers, setTaxationAnswers] = useState({});
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState('');
    const [isDataSaved, setIsDataSaved] = useState(false);
    const [selectedBusinessContent, setSelectedBusinessContent] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [files, setFiles] = useState([]);
    const toast = useToast();

    const taxationQuestions = useMemo(() => [
        "현재 부양하고 있는 가족(배우자, 자녀, 부모 등)은 총 몇 명입니까?",
        "그 중 연간 소득이 100만 원을 초과하지 않는 가족은 몇 명입니까?",
        "부양하는 각 자녀의 나이는 어떻게 되나요? (예: 6세 이하, 초등학생, 중고등학생, 대학생. 없다면 없음이라고 적어주세요.)",
        "배우자의 연간소득이 100만원을 초과합니까? (없다면 없음이라고 적어주세요)",
        "부양가족 중 장애인으로 등록된 분이 몇 명 있습니까?(없다면 없음이라고 적어주세요)"
    ], []);

    useEffect(() => {
        fetchBusinesses();
    }, []);

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

    const handleBusinessSelect = (businessId) => {
        const selectedBusiness = businesses.find(b => b.id === parseInt(businessId, 10));
        if (!selectedBusiness) {
            toast({
                title: "사업 선택 오류",
                description: "선택된 사업을 찾을 수 없습니다.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setSelectedBusinessId(businessId);
        setSelectedBusinessContent(selectedBusiness.businessContent || "");
        setTaxationStep(1);
        onMessage('user', `사업 선택: ${selectedBusiness.businessName}`);
        onMessage('bot', taxationQuestions[1]);
    };

    const handleBusinessTypeInput = () => {
        if (!businessType.trim()) return;
        setTaxationStep(2);
    };

    const handleAnswer = () => {
        if (!currentAnswer.trim()) return;
        setTaxationAnswers(prev => ({ ...prev, [taxationStep - 2]: currentAnswer }));
        if (taxationStep < taxationQuestions.length + 1) {
            setTaxationStep(prev => prev + 1);
        } else {
            setTaxationStep(taxationQuestions.length + 2);
        }
        setCurrentAnswer('');
    };

    const onDrop = useCallback(acceptedFiles => {
        setFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleDataSubmit = async () => {
        if (!selectedBusinessId || Object.keys(taxationAnswers).length !== taxationQuestions.length || files.length === 0) {
            onMessage('bot', "모든 정보와 파일을 입력/첨부해 주세요.");
            return;
        }

        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });
            Object.keys(taxationAnswers).forEach(key => {
                formData.append(`answers`, taxationAnswers[key]);
            });
            formData.append('businessId', selectedBusinessId);
            formData.append('businessContent', selectedBusinessContent);
            formData.append('businessType', businessType);

            const response = await axios.post('http://localhost:8000/taxation', formData);

            if (response.data && response.data.message) {
                onMessage('bot', response.data.message);
            } else {
                onMessage('bot', "데이터가 성공적으로 저장되었습니다. 이제 세무 처리 관련 질문을 해주세요.");
            }

            setIsDataSaved(true);
        } catch (error) {
            console.error('Error in saving taxation data:', error);
            onMessage('bot', "데이터 저장 중 오류가 발생했습니다: " + (error.message || '알 수 없는 오류'));
        }
    };

    const handleTaxationQuery = async () => {
        if (!isDataSaved) {
            onMessage('bot', "먼저 모든 정보를 입력하고 저장해 주세요.");
            return;
        }

        if (!selectedBusinessId || !currentAnswer.trim()) {
            onMessage('bot', "사업 ID와 질문 내용을 확인해주세요.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('businessId', selectedBusinessId);
            formData.append('user_input', currentAnswer);

            const response = await axios.post('http://localhost:8000/taxation/chat', formData);

            if (response.data && response.data.message) {
                onMessage('bot', response.data.message);
            } else {
                onMessage('bot', "세무 처리 관련 응답을 받지 못했습니다.");
            }
        } catch (error) {
            console.error('Error in taxation chat:', error);
            onMessage('bot', "세무 처리 관련 질의 중 오류가 발생했습니다. 다시 시도해 주세요.");
        }

        setCurrentAnswer('');
    };

    const renderTaxationContent = () => {
        if (isDataSaved) {
            return (
                <VStack spacing={4}>
                    <Text>세무 처리 관련 질문을 입력해 주세요.</Text>
                    <Textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="질문을 입력하세요"
                        rows={3}
                    />
                    <Button onClick={handleTaxationQuery} colorScheme="blue">질문하기</Button>
                </VStack>
            );
        }

        return (
            <VStack spacing={4} align="stretch">
                <Progress value={(taxationStep / (taxationQuestions.length + 1)) * 100} size="sm" colorScheme="blue" />
                {taxationStep === 0 && (
                    <>
                        <Text>{taxationQuestions[0]}</Text>
                        <Select
                            placeholder="사업 선택"
                            onChange={(e) => handleBusinessSelect(e.target.value)}
                        >
                            {businesses.map((business) => (
                                <option key={business.id} value={business.id}>
                                    {business.businessName}
                                </option>
                            ))}
                        </Select>
                    </>
                )}
                {taxationStep === 1 && (
                    <>
                        <Text>사업자 유형을 입력해주세요. (예: 부가가치세 간이과세자)</Text>
                        <Input
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            placeholder="사업자 유형 입력"
                        />
                    </>
                )}
                {taxationStep >= 2 && taxationStep <= taxationQuestions.length + 1 && (
                    <>
                        <Text>{taxationQuestions[taxationStep - 2]}</Text>
                        <Input
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="답변을 입력하세요"
                        />
                    </>
                )}
                {taxationStep === taxationQuestions.length + 2 && (
                    <>
                        <Text>거래내역서와 소득금액증명원 파일을 첨부해 주세요.</Text>
                        <Box {...getRootProps()} p={10} border="2px dashed" borderColor={isDragActive ? "blue.500" : "gray.300"} borderRadius="md">
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <Text>파일을 여기에 놓아주세요...</Text>
                            ) : (
                                <Text>파일을 이 영역으로 드래그하거나 클릭하여 선택하세요</Text>
                            )}
                        </Box>
                        {files.length > 0 && (
                            <Text>선택된 파일: {files.map(file => file.name).join(', ')}</Text>
                        )}
                    </>
                )}
                <Flex justify="space-between">
                    {taxationStep > 0 && (
                        <Button onClick={() => setTaxationStep(prev => prev - 1)} colorScheme="gray">이전</Button>
                    )}
                    {taxationStep < taxationQuestions.length + 2 ? (
                        <Button onClick={taxationStep === 1 ? handleBusinessTypeInput : handleAnswer} colorScheme="blue">다음</Button>
                    ) : (
                        <Button onClick={handleDataSubmit} colorScheme="green">정보 저장</Button>
                    )}
                </Flex>
            </VStack>
        );
    };

    return (
        <Box>
            {renderTaxationContent()}
        </Box>
    );
};

export default TaxationChatbot;