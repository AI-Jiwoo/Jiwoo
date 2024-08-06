import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    Select,
    Grid,
    GridItem,
} from '@chakra-ui/react';

// 국가 목록 (예시)
const countries = [
    "대한민국", "미국", "일본", "중국", "영국", "프랑스", "독일", "캐나다", "호주", "뉴질랜드",
    "이탈리아", "스페인", "러시아", "브라질", "인도", "싱가포르", "말레이시아", "태국", "베트남", "인도네시아"
];

function BusinessInfoForm({ onSubmit, onClose }) {
    const [businessInfo, setBusinessInfo] = useState({
        businessName: '',
        businessNumber: '',
        businessScale: '',
        businessBudget: '',
        businessContent: '',
        businessPlatform: '',
        businessLocation: '',
        businessStartDate: '',
        nation: '',
        investmentStatus: '',
        customerType: '',
        startupStageId: '',
        category: '' // 새로운 카테고리 필드 추가
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [categories, setCategories] = useState([]); // 카테고리 목록 상태 추가

    const validateForm = () => {
        const requiredFields = [
            'businessName',
            'businessNumber',
            'businessScale',
            'businessContent',
            'businessLocation',
            'businessStartDate',
            'nation',
            'startupStageId',
            'category' // 카테고리를 필수 필드로 추가
        ];

        const isValid = requiredFields.every(field => businessInfo[field] !== '');
        setIsFormValid(isValid);
    };

    useEffect(() => {
        validateForm();
        console.log('Business Info:', businessInfo);
        console.log('Is Form Valid:', isFormValid);
    }, [businessInfo]);

    useEffect(() => {
        // 컴포넌트 마운트 시 카테고리 목록 가져오기
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/category/names');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBusinessInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        if (isFormValid) {
            onSubmit(businessInfo);
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>사업이름</FormLabel>
                        <Input
                            name="businessName"
                            value={businessInfo.businessName}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>사업자 등록 번호</FormLabel>
                        <Input
                            name="businessNumber"
                            value={businessInfo.businessNumber}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>사업규모</FormLabel>
                        <Select
                            name="businessScale"
                            value={businessInfo.businessScale}
                            onChange={handleChange}
                        >
                            <option value="">선택해주세요</option>
                            <option value="small">스타트업</option>
                            <option value="medium">중소기업</option>
                            <option value="large">중견기업</option>
                        </Select>
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl>
                        <FormLabel>사업 자본</FormLabel>
                        <Input
                            name="businessBudget"
                            value={businessInfo.businessBudget}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
            </Grid>
            <FormControl isRequired>
                <FormLabel>사업내용</FormLabel>
                <Textarea
                    name="businessContent"
                    value={businessInfo.businessContent}
                    onChange={handleChange}
                />
            </FormControl>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                    <FormControl>
                        <FormLabel>사업형태</FormLabel>
                        <Input
                            name="businessPlatform"
                            value={businessInfo.businessPlatform}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>사업위치</FormLabel>
                        <Input
                            name="businessLocation"
                            value={businessInfo.businessLocation}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>창업일자</FormLabel>
                        <Input
                            type="date"
                            name="businessStartDate"
                            value={businessInfo.businessStartDate}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>국가</FormLabel>
                        <Select
                            name="nation"
                            value={businessInfo.nation}
                            onChange={handleChange}
                        >
                            <option value="">선택해주세요</option>
                            {countries.map((country, index) => (
                                <option key={index} value={country}>{country}</option>
                            ))}
                        </Select>
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl>
                        <FormLabel>투자상태</FormLabel>
                        <Input
                            name="investmentStatus"
                            value={businessInfo.investmentStatus}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl>
                        <FormLabel>고객유형</FormLabel>
                        <Input
                            name="customerType"
                            value={businessInfo.customerType}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>창업 단계</FormLabel>
                        <Select
                            name="startupStageId"
                            value={businessInfo.startupStageId}
                            onChange={handleChange}
                        >
                            <option value="">선택해주세요</option>
                            <option value="1">1단계</option>
                            <option value="2">2단계</option>
                            <option value="3">3단계</option>
                            <option value="4">4단계</option>
                            <option value="5">5단계</option>
                        </Select>
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>카테고리</FormLabel>
                        <Select
                            name="category"
                            value={businessInfo.category}
                            onChange={handleChange}
                        >
                            <option value="">선택해주세요</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </Select>
                    </FormControl>
                </GridItem>
            </Grid>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <Button
                    colorScheme="teal"
                    onClick={handleSubmit}
                    isDisabled={!isFormValid}
                >
                    저장
                </Button>
                <Button onClick={onClose}>닫기</Button>
            </Grid>
        </VStack>
    );
}

export default BusinessInfoForm;