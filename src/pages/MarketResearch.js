import React from 'react';
import { Box, VStack, HStack, Text, Button, Input, Textarea } from '@chakra-ui/react';

const MarketResearch = () => {
    return (
        <Box width="50%" margin="auto" mt={12} mb={12}>
            <Text fontSize="2xl" fontWeight="bold" mb={8} textAlign="center">액셀러레이팅</Text>

            <HStack spacing={8} mb={8}>
                <Button colorScheme="gray" variant="outline" flex={1}>비즈니스 모델</Button>
                <Button colorScheme="blue" flex={1}>시장조사</Button>
            </HStack>

            <HStack spacing={8} mb={8} align="start">
                <VStack flex={1} align="stretch" spacing={6}>
                    <Text fontWeight="bold">사업명</Text>
                    <Input placeholder="선택 또는 입력" />
                    <Textarea
                        placeholder="사업정보 넣기&#10;드롭다운서 나의 다른 사업&#10;으로 바꿀수있음"
                        height="150px"
                    />
                </VStack>
                <VStack flex={1} align="stretch" spacing={6}>
                    <Text fontWeight="bold">경쟁 기업</Text>
                    <Input placeholder="분석하기" />
                    <Box bg="gray.100" height="150px" />
                </VStack>
            </HStack>

            <Box bg="gray.100" p={6} mb={8}>
                <Text>선택한 기업 내용 띄워주기</Text>
                <Text>선택한 기업이 없을때 간이 작음</Text>
            </Box>

            <VStack spacing={6} align="stretch">
                {['트렌드', '규제 정보', '시장정보', '시장현황 전략정보'].map((item, index) => (
                    <Box key={index} bg="gray.100" p={6}>
                        <Text fontWeight="bold" mb={4}>{item}</Text>
                        <Button colorScheme="blue" size="sm">분석하기</Button>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};

export default MarketResearch;
