import React, { useState } from 'react';
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

function BusinessInfoForm({ onSubmit, showNextButton = true, onClose }) {
    const [businessInfo, setBusinessInfo] = useState({
        businessName: '',
        registrationNumber: '',
        scale: '',
        capital: '',
        description: '',
        type: '',
        location: '',
        foundingDate: '',
        country: '',
        investmentStatus: '',
        customerType: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBusinessInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSubmit(businessInfo);
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
                            name="registrationNumber"
                            value={businessInfo.registrationNumber}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>사업규모</FormLabel>
                        <Select
                            name="scale"
                            value={businessInfo.scale}
                            onChange={handleChange}
                        >
                            <option value="">선택해주세요</option>
                            <option value="small">소규모</option>
                            <option value="medium">중규모</option>
                            <option value="large">대규모</option>
                        </Select>
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>사업 자본</FormLabel>
                        <Input
                            name="capital"
                            value={businessInfo.capital}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
            </Grid>
            <FormControl isRequired>
                <FormLabel>사업내용</FormLabel>
                <Textarea
                    name="description"
                    value={businessInfo.description}
                    onChange={handleChange}
                />
            </FormControl>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>사업형태</FormLabel>
                        <Input
                            name="type"
                            value={businessInfo.type}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>사업위치</FormLabel>
                        <Input
                            name="location"
                            value={businessInfo.location}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>창업일자</FormLabel>
                        <Input
                            type="date"
                            name="foundingDate"
                            value={businessInfo.foundingDate}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>국가</FormLabel>
                        <Select
                            name="country"
                            value={businessInfo.country}
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
                    <FormControl isRequired>
                        <FormLabel>투자상태</FormLabel>
                        <Input
                            name="investmentStatus"
                            value={businessInfo.investmentStatus}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>고객유형</FormLabel>
                        <Input
                            name="customerType"
                            value={businessInfo.customerType}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>
            </Grid>
            {showNextButton ? (
                <Button
                    colorScheme="teal"
                    size="lg"
                    onClick={handleSubmit}
                    isDisabled={Object.values(businessInfo).some(value => value === '')}
                >
                    다음단계
                </Button>
            ) : (
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <Button colorScheme="teal" onClick={handleSubmit}>저장</Button>
                    <Button onClick={onClose}>닫기</Button>
                </Grid>
            )}
        </VStack>
    );
}

export default BusinessInfoForm;