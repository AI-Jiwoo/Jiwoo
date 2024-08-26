import React, { useState, useCallback } from 'react';
import {
    Box, VStack, HStack, Heading, Input, Textarea, Button, Select, Checkbox,
    FormControl, FormLabel, FormHelperText, useToast, InputGroup, InputRightElement
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import Stepper from 'react-stepper-horizontal';

const countries = ["대한민국", "미국", "일본", "중국", "영국", "프랑스", "독일", "캐나다", "호주", "뉴질랜드"];

const FormField = ({ label, name, placeholder, isRequired = false, type = "text", options = null, helperText = "", value, onChange, isInvalid }) => {
    let inputElement;

    if (options) {
        inputElement = (
            <Select
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                size="sm"
            >
                <option value="">선택해주세요</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value || option}>{option.label || option}</option>
                ))}
            </Select>
        );
    } else if (options) {
        inputElement = (
            <Select
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                size="sm"
            >
                {options.map((option, index) => (
                    <option key={index} value={option.value || option}>{option.label || option}</option>
                ))}
            </Select>
        );
    } else if (type === 'textarea') {
        inputElement = (
            <Textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                size="sm"
            />
        );
    } else {
        inputElement = (
            <Input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                size="sm"
            />
        );
    }

    return (
        <FormControl isRequired={isRequired} isInvalid={isInvalid}>
            <FormLabel fontSize="sm">{label}</FormLabel>
            <InputGroup>
                {inputElement}
                {helperText && <InputRightElement children={<InfoIcon color="gray.500" />} />}
            </InputGroup>
            {helperText && <FormHelperText fontSize="xs">{helperText}</FormHelperText>}
        </FormControl>
    );
};

function BusinessInfoForm({ onSubmit, onClose, categories }) {
    const [businessInfo, setBusinessInfo] = useState({
        businessName: '', businessNumber: '', businessScale: '', businessBudget: '',
        businessContent: '', businessPlatform: '', businessLocation: '', businessStartDate: '',
        nation: '', investmentStatus: '', customerType: '', startupStageId: '', categoryIds: []
    });
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(0);
    const toast = useToast();

    const validateStep = useCallback(() => {
        const newErrors = {};
        if (step === 0) {
            if (!businessInfo.businessName) newErrors.businessName = "필수 항목입니다.";
            if (!businessInfo.businessNumber || !/^\d{3}-\d{2}-\d{5}$/.test(businessInfo.businessNumber)) {
                newErrors.businessNumber = "올바른 형식이 아닙니다 (000-00-00000).";
            }
            if (!businessInfo.businessScale) newErrors.businessScale = "필수 항목입니다.";
            if (!businessInfo.businessContent) newErrors.businessContent = "필수 항목입니다.";
        } else if (step === 1) {
            if (!businessInfo.businessLocation) newErrors.businessLocation = "필수 항목입니다.";
            if (!businessInfo.businessStartDate) newErrors.businessStartDate = "필수 항목입니다.";
            if (!businessInfo.nation) newErrors.nation = "필수 항목입니다.";
            if (!businessInfo.startupStageId) newErrors.startupStageId = "필수 항목입니다.";
        } else if (step === 2) {
            if (businessInfo.categoryIds.length === 0) newErrors.categoryIds = "최소 하나의 카테고리를 선택해주세요.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [businessInfo, step]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBusinessInfo(prev => ({ ...prev, [name]: value }));
    };
    const handleBusinessNumberChange = (e) => {
        const rawValue = e.target.value;
        const formattedValue = formatBusinessNumber(rawValue);
        setBusinessInfo(prev => ({ ...prev, businessNumber: formattedValue }));
    };

    const handleCategoryChange = (categoryId) => {
        setBusinessInfo(prev => {
            const newCategoryIds = prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId];
            return { ...prev, categoryIds: newCategoryIds };
        });
    };

    const formatBusinessNumber = (value) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < 2) {
                setStep(prevStep => prevStep + 1);
            }
        } else {
            toast({ title: "입력 정보를 확인해주세요.", status: "error", duration: 2000 });
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(prevStep => prevStep - 1);
        }
    };

    const handleSubmit = () => {
        if (validateStep()) {
            // ID 필드 제거
            const { id, ...businessInfoWithoutId } = businessInfo;

            // 사업자 등록번호 형식 변환
            const formattedBusinessNumber = businessInfoWithoutId.businessNumber.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');

            // categoryIds 처리
            const categoryIds = Array.isArray(businessInfoWithoutId.categoryIds)
                ? businessInfoWithoutId.categoryIds
                : [businessInfoWithoutId.categoryIds].filter(Boolean);

            const processedInfo = {
                ...businessInfoWithoutId,
                businessNumber: formattedBusinessNumber,
                categoryIds: categoryIds,
            };

            onSubmit(processedInfo);
        } else {
            toast({ title: "입력 정보를 확인해주세요.", status: "error", duration: 2000 });
        }
    };

    return (
        <Box maxWidth="600px" margin="auto" p={4}>
            <VStack spacing={4} align="stretch">
                <Heading size="md" textAlign="center">사업 정보 등록</Heading>
                <Stepper activeStep={step} steps={['기본 정보', '상세 정보', '카테고리']} />
                <Box p={4}>
                    {step === 0 && (
                        <VStack spacing={4}>
                            <FormField
                                label="사업명"
                                name="businessName"
                                placeholder="사업명 입력"
                                isRequired
                                value={businessInfo.businessName}
                                onChange={handleChange}
                                isInvalid={!!errors.businessName}
                            />
                            <FormField
                                label="사업자 등록번호"
                                name="businessNumber"
                                placeholder="000-00-00000"
                                isRequired
                                helperText="형식: 000-00-00000"
                                value={businessInfo.businessNumber}
                                onChange={handleBusinessNumberChange}
                                isInvalid={!!errors.businessNumber}
                            />
                            <FormField
                                label="사업 규모"
                                name="businessScale"
                                isRequired
                                options={[
                                    { value: "스타트업", label: "스타트업" },
                                    { value: "중소기업", label: "중소기업" },
                                    { value: "중견기업", label: "중견기업" }
                                ]}
                                value={businessInfo.businessScale}
                                onChange={handleChange}
                                isInvalid={!!errors.businessScale}
                            />
                            <FormField
                                label="사업 내용"
                                name="businessContent"
                                placeholder="사업 내용 간략히 설명"
                                isRequired
                                type="textarea"
                                value={businessInfo.businessContent}
                                onChange={handleChange}
                                isInvalid={!!errors.businessContent}
                            />
                        </VStack>
                    )}
                    {step === 1 && (
                        <VStack spacing={4}>
                            <FormField
                                label="사업 자본"
                                name="businessBudget"
                                type="number"
                                placeholder="사업 자본 입력"
                                helperText="단위: 원"
                                value={businessInfo.businessBudget}
                                onChange={handleChange}
                            />
                            <FormField
                                label="사업 형태"
                                name="businessPlatform"
                                placeholder="예: 식품 제조, 드론 서비스"
                                value={businessInfo.businessPlatform}
                                onChange={handleChange}
                            />
                            <FormField
                                label="사업 위치"
                                name="businessLocation"
                                placeholder="주 사업장 위치"
                                isRequired
                                value={businessInfo.businessLocation}
                                onChange={handleChange}
                                isInvalid={!!errors.businessLocation}
                            />
                            <FormField
                                label="창업 일자"
                                name="businessStartDate"
                                type="date"
                                isRequired
                                value={businessInfo.businessStartDate}
                                onChange={handleChange}
                                isInvalid={!!errors.businessStartDate}
                            />
                            <FormField
                                label="국가"
                                name="nation"
                                options={countries}
                                isRequired
                                value={businessInfo.nation}
                                onChange={handleChange}
                                isInvalid={!!errors.nation}
                            />
                            <FormField
                                label="투자 상태"
                                name="investmentStatus"
                                placeholder="예: 시드 투자 40억원 유치"
                                value={businessInfo.investmentStatus}
                                onChange={handleChange}
                            />
                            <FormField
                                label="고객 유형"
                                name="customerType"
                                placeholder="예: B2C, B2B, B2G"
                                value={businessInfo.customerType}
                                onChange={handleChange}
                            />
                            <FormField
                                label="창업 단계"
                                name="startupStageId"
                                isRequired
                                options={[
                                    { value: "1", label: "1단계: 아이디어 구상" },
                                    { value: "2", label: "2단계: 사업 계획 수립" },
                                    { value: "3", label: "3단계: 제품/서비스 개발" },
                                    { value: "4", label: "4단계: 초기 창업" },
                                    { value: "5", label: "5단계: 성장 및 확장" }
                                ]}
                                value={businessInfo.startupStageId}
                                onChange={handleChange}
                                isInvalid={!!errors.startupStageId}
                            />
                        </VStack>
                    )}
                    {step === 2 && (
                        <FormControl isRequired isInvalid={!!errors.categoryIds}>
                            <FormLabel>카테고리 (복수 선택 가능)</FormLabel>
                            <VStack align="start" spacing={2}>
                                {categories.map((category) => (
                                    <Checkbox
                                        key={category.id}
                                        isChecked={businessInfo.categoryIds.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                    >
                                        {category.name}
                                    </Checkbox>
                                ))}
                                {errors.categoryIds && <FormHelperText color="red.500">{errors.categoryIds}</FormHelperText>}
                            </VStack>
                        </FormControl>
                    )}
                </Box>
                <HStack justify="center" spacing={4}>
                    {step > 0 && (
                        <Button onClick={handleBack}>뒤로</Button>
                    )}
                    {step < 2 ? (
                        <Button colorScheme="blue" onClick={handleNext}>다음</Button>
                    ) : (
                        <Button colorScheme="blue" onClick={handleSubmit}>제출</Button>
                    )}
                    <Button variant="outline" onClick={onClose}>취소</Button>
                </HStack>
            </VStack>
        </Box>
    );
}

export default BusinessInfoForm;
